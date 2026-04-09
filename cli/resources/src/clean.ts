import fs from 'fs'
import path from 'path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import type { IndexYaml } from './types.js'
import { buildGlobalUuidSet, resolveTarget } from './utils.js'

// ---------------------------------------------------------------------------
// Layout yaml cleaning
// ---------------------------------------------------------------------------

/**
 * Layout.yaml has two formats:
 *
 * Format A (leaf/simple):
 *   layout:
 *     <uuid>: { x, y }
 *
 * Format B (root/complex) — top-level keys are canvas UUIDs, values are maps of node-uuid → {x, y}
 *   <uuid>:
 *     <uuid>: { x, y }
 *     stub-<uuid>: { x, y }
 *     ...
 *
 * We clean dangling UUIDs from all node keys (not canvas-level keys, since those are
 * references to the canvas themselves and may be external state).
 * We check actual 8-hex-char UUIDs only (skip stub-* and other prefixed keys).
 */
function cleanLayoutYaml(
  filePath: string,
  globalUuids: Set<string>,
  apply: boolean
): number {
  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return 0
  }

  let parsed: unknown
  try {
    parsed = parseYaml(content)
  } catch {
    return 0
  }

  if (!parsed || typeof parsed !== 'object') return 0

  const UUID_RE = /^[0-9a-f]{8}$/
  let danglingCount = 0

  const obj = parsed as Record<string, unknown>

  // Detect format A: has a top-level 'layout' key
  if ('layout' in obj && obj.layout && typeof obj.layout === 'object') {
    const layout = obj.layout as Record<string, unknown>
    const toRemove: string[] = []
    for (const key of Object.keys(layout)) {
      if (UUID_RE.test(key) && !globalUuids.has(key)) {
        toRemove.push(key)
      }
    }
    danglingCount = toRemove.length
    if (apply && danglingCount > 0) {
      for (const key of toRemove) {
        delete layout[key]
      }
      fs.writeFileSync(filePath, stringifyYaml(obj), 'utf8')
    }
  } else {
    // Format B: top-level keys are canvas UUIDs, values are maps of node positions
    for (const canvasKey of Object.keys(obj)) {
      const canvasNodes = obj[canvasKey]
      if (!canvasNodes || typeof canvasNodes !== 'object') continue
      const nodes = canvasNodes as Record<string, unknown>
      const toRemove: string[] = []
      for (const nodeKey of Object.keys(nodes)) {
        // Only check pure 8-hex UUIDs (skip stub-*, etc.)
        if (UUID_RE.test(nodeKey) && !globalUuids.has(nodeKey)) {
          toRemove.push(nodeKey)
        }
      }
      danglingCount += toRemove.length
      if (apply && toRemove.length > 0) {
        for (const key of toRemove) {
          delete nodes[key]
        }
      }
    }
    if (apply && danglingCount > 0) {
      fs.writeFileSync(filePath, stringifyYaml(obj), 'utf8')
    }
  }

  return danglingCount
}

// ---------------------------------------------------------------------------
// Index yaml cleaning
// ---------------------------------------------------------------------------

function cleanIndexYaml(
  filePath: string,
  folderAbs: string,
  globalUuids: Set<string>,
  apply: boolean
): { danglingLinks: number; danglingSubmodules: number } {
  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return { danglingLinks: 0, danglingSubmodules: 0 }
  }

  let parsed: IndexYaml
  try {
    parsed = (parseYaml(content) as IndexYaml) ?? {}
  } catch {
    return { danglingLinks: 0, danglingSubmodules: 0 }
  }

  // Find dangling links (uuid not in global set)
  const originalLinks = parsed.links ?? []
  const cleanLinks = originalLinks.filter(link => !link.uuid || globalUuids.has(link.uuid))
  const danglingLinks = originalLinks.length - cleanLinks.length

  // Find dangling submodules (folder doesn't exist on disk)
  const originalSubmodules = parsed.submodules ?? {}
  const cleanSubmodules: Record<string, string> = {}
  let danglingSubmodules = 0
  for (const [folderName, uuid] of Object.entries(originalSubmodules)) {
    const childAbs = path.join(folderAbs, folderName)
    if (fs.existsSync(childAbs) && fs.statSync(childAbs).isDirectory()) {
      cleanSubmodules[folderName] = uuid
    } else {
      danglingSubmodules++
    }
  }

  if (apply && (danglingLinks > 0 || danglingSubmodules > 0)) {
    parsed.links = cleanLinks
    parsed.submodules = cleanSubmodules
    fs.writeFileSync(filePath, stringifyYaml(parsed), 'utf8')
  }

  return { danglingLinks, danglingSubmodules }
}

// ---------------------------------------------------------------------------
// Recursive folder processor
// ---------------------------------------------------------------------------

interface CleanStats {
  totalDangling: number
  affectedFiles: number
}

function processFolder(
  folderAbs: string,
  globalUuids: Set<string>,
  apply: boolean,
  stats: CleanStats
): void {
  const indexPath = path.join(folderAbs, '.archui', 'index.yaml')
  const layoutPath = path.join(folderAbs, '.archui', 'layout.yaml')

  // Process index.yaml
  if (fs.existsSync(indexPath)) {
    const { danglingLinks, danglingSubmodules } = cleanIndexYaml(indexPath, folderAbs, globalUuids, apply)
    const total = danglingLinks + danglingSubmodules

    if (total > 0) {
      stats.totalDangling += total
      stats.affectedFiles++
      const parts: string[] = []
      if (danglingLinks > 0) parts.push(`${danglingLinks} dangling link${danglingLinks === 1 ? '' : 's'}`)
      if (danglingSubmodules > 0) parts.push(`${danglingSubmodules} missing submodule${danglingSubmodules === 1 ? '' : 's'}`)
      const label = apply ? '' : '[dry-run] '
      const verb = apply ? 'removed' : 'would remove'
      console.log(`${label}${indexPath}: ${verb} ${parts.join(', ')}`)
    }
  }

  // Process layout.yaml
  if (fs.existsSync(layoutPath)) {
    const danglingNodes = cleanLayoutYaml(layoutPath, globalUuids, apply)

    if (danglingNodes > 0) {
      stats.totalDangling += danglingNodes
      stats.affectedFiles++
      const label = apply ? '' : '[dry-run] '
      const verb = apply ? 'removed' : 'would remove'
      console.log(`${label}${layoutPath}: ${verb} ${danglingNodes} dangling node entr${danglingNodes === 1 ? 'y' : 'ies'}`)
    }
  }

  // Recurse into subdirectories (skip resources, .archui, hidden dirs)
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(folderAbs, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'resources' || entry.name === '.archui' || entry.name.startsWith('.')) continue
    if (entry.name === 'node_modules') continue
    processFolder(path.join(folderAbs, entry.name), globalUuids, apply, stats)
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function runClean(root: string, target: string, apply: boolean): void {
  const absRoot = path.resolve(root)
  const absTarget = resolveTarget(absRoot, target)

  if (!absTarget) {
    process.exit(1)
  }

  // Build global UUID set from the project root
  const globalUuids = buildGlobalUuidSet(absRoot)

  const stats: CleanStats = { totalDangling: 0, affectedFiles: 0 }

  processFolder(absTarget, globalUuids, apply, stats)

  if (stats.totalDangling === 0) {
    console.log(`Clean: no dangling references found in ${absTarget}.`)
  } else if (apply) {
    console.log(`Clean complete. Removed ${stats.totalDangling} dangling reference${stats.totalDangling === 1 ? '' : 's'} across ${stats.affectedFiles} file${stats.affectedFiles === 1 ? '' : 's'}.`)
  } else {
    console.log(`Dry-run complete. Found ${stats.totalDangling} dangling reference${stats.totalDangling === 1 ? '' : 's'} across ${stats.affectedFiles} file${stats.affectedFiles === 1 ? '' : 's'}. Run with --apply to remove them.`)
  }
}
