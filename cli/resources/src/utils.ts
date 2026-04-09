import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import type { IndexYaml } from './types.js'

export function buildGlobalUuidSet(root: string): Set<string> {
  const uuids = new Set<string>()

  function walk(dir: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name === 'index.yaml' && dir.endsWith('.archui')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')
          const parsed = parseYaml(content) as Record<string, unknown>
          if (parsed?.uuid && typeof parsed.uuid === 'string') {
            uuids.add(parsed.uuid)
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  walk(root)
  return uuids
}

export function findModuleByUuid(root: string, targetUuid: string): string | null {
  let result: string | null = null

  function walk(dir: string) {
    if (result) return
    const indexPath = path.join(dir, '.archui', 'index.yaml')
    if (fs.existsSync(indexPath)) {
      try {
        const content = fs.readFileSync(indexPath, 'utf8')
        const parsed = parseYaml(content) as Record<string, unknown>
        if (parsed?.uuid === targetUuid) {
          result = dir
          return
        }
      } catch {
        // ignore
      }
    }

    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'resources' || entry.name === '.archui') continue
      walk(path.join(dir, entry.name))
    }
  }

  walk(root)
  return result
}

export function resolveTarget(root: string, target: string): string | null {
  const UUID_RE = /^[0-9a-f]{8}$/

  if (UUID_RE.test(target)) {
    const found = findModuleByUuid(root, target)
    if (!found) {
      console.error(`Error: no module with UUID "${target}" found under ${root}`)
      return null
    }
    return found
  }

  const resolved = path.resolve(target)
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    console.error(`Error: path does not exist or is not a directory: ${resolved}`)
    return null
  }
  return resolved
}
