import fs from 'fs'
import path from 'path'
import { execSync, spawnSync } from 'child_process'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { runClean } from './clean.js'
import { runValidate } from './validate.js'
import type { IndexYaml } from './types.js'

const CLIPBOARD_URI_RE = /^archui:\/\/copy\?path=(.+)&uuid=([0-9a-f]{8})$/

// ---------------------------------------------------------------------------
// Clipboard reading
// ---------------------------------------------------------------------------

function readFromClipboard(): string {
  const platform = process.platform
  if (platform === 'darwin') {
    return execSync('pbpaste', { encoding: 'utf8' })
  } else if (platform === 'linux') {
    try {
      return execSync('xclip -selection clipboard -o', { encoding: 'utf8' })
    } catch {
      return execSync('xsel --clipboard --output', { encoding: 'utf8' })
    }
  } else if (platform === 'win32') {
    return execSync('powershell -command "Get-Clipboard"', { encoding: 'utf8' })
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

// ---------------------------------------------------------------------------
// UUID map building (same logic as copy.ts)
// ---------------------------------------------------------------------------

function buildUuidMap(
  rootAbs: string,
  map: Map<string, string> = new Map()
): Map<string, string> {
  const indexPath = path.join(rootAbs, '.archui', 'index.yaml')
  if (!fs.existsSync(indexPath)) return map

  let index: IndexYaml = {}
  try {
    index = (parseYaml(fs.readFileSync(indexPath, 'utf8')) as IndexYaml) ?? {}
  } catch {
    return map
  }

  if (index.uuid) {
    map.set(index.uuid, rootAbs)
  }

  for (const folderName of Object.keys(index.submodules ?? {})) {
    const childAbs = path.join(rootAbs, folderName)
    if (fs.existsSync(childAbs) && fs.statSync(childAbs).isDirectory()) {
      buildUuidMap(childAbs, map)
    }
  }

  return map
}

// ---------------------------------------------------------------------------
// Destination path with collision avoidance
// ---------------------------------------------------------------------------

function resolveDestPath(targetDir: string, baseName: string): string {
  const candidate = path.join(targetDir, baseName)
  if (!fs.existsSync(candidate)) return candidate

  const withCopy = path.join(targetDir, `${baseName}-copy`)
  if (!fs.existsSync(withCopy)) return withCopy

  let n = 2
  while (true) {
    const withN = path.join(targetDir, `${baseName}-copy-${n}`)
    if (!fs.existsSync(withN)) return withN
    n++
  }
}

// ---------------------------------------------------------------------------
// Layout position helper
// ---------------------------------------------------------------------------

const NODE_WIDTH = 220
const NODE_HEIGHT = 120
const PADDING = 40

function findNonOverlappingPosition(
  existingLayout: Record<string, { x?: string | number; y?: string | number }>
): { x: number; y: number } {
  const rects = Object.values(existingLayout).map(pos => ({
    x: typeof pos.x === 'number' ? pos.x : parseFloat(String(pos.x ?? '0')) || 0,
    y: typeof pos.y === 'number' ? pos.y : parseFloat(String(pos.y ?? '0')) || 0,
  }))

  if (rects.length === 0) return { x: 0, y: 0 }

  const maxX = Math.max(...rects.map(r => r.x))
  const candidate = { x: maxX + NODE_WIDTH + PADDING, y: 0 }

  for (let attempt = 0; attempt < 50; attempt++) {
    const hasOverlap = rects.some(r =>
      Math.abs(candidate.x - r.x) < NODE_WIDTH + PADDING &&
      Math.abs(candidate.y - r.y) < NODE_HEIGHT + PADDING
    )
    if (!hasOverlap) return candidate
    candidate.x += NODE_WIDTH + PADDING
  }

  return candidate
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runPaste(root: string, into: string | undefined): Promise<void> {
  // Step 1: Read clipboard
  let clipboardContent: string
  try {
    clipboardContent = readFromClipboard().trim()
  } catch (err) {
    console.error(`Error: failed to read clipboard: ${(err as Error).message}`)
    process.exit(1)
  }

  // Step 2: Parse clipboard URI
  const match = CLIPBOARD_URI_RE.exec(clipboardContent)
  if (!match) {
    console.error('Error: clipboard does not contain a valid archui:// module URI')
    process.exit(1)
  }

  const sourcePath = match[1]
  const sourceUuid = match[2]

  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: source path no longer exists on disk: ${sourcePath}`)
    process.exit(1)
  }

  // Step 3: Determine target directory
  const absRoot = path.resolve(root)
  let targetDir: string

  if (into !== undefined) {
    const UUID_RE = /^[0-9a-f]{8}$/
    if (UUID_RE.test(into)) {
      const uuidMap = buildUuidMap(absRoot)
      const found = uuidMap.get(into)
      if (!found) {
        console.error(`Error: no module with UUID "${into}" found under ${absRoot}`)
        process.exit(1)
      }
      targetDir = found
    } else {
      targetDir = path.resolve(into)
    }

    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      console.error(`Error: target directory does not exist: ${targetDir}`)
      process.exit(1)
    }
  } else {
    targetDir = absRoot
  }

  // Step 4: Copy folder
  const baseName = path.basename(sourcePath)
  const destPath = resolveDestPath(targetDir, baseName)

  try {
    fs.cpSync(sourcePath, destPath, { recursive: true })
  } catch (err) {
    console.error(`Error: failed to copy module: ${(err as Error).message}`)
    process.exit(1)
  }

  console.log(`Copied module to ${destPath}`)

  // Step 4b: Read the copied module's UUID
  const copiedIndexPath = path.join(destPath, '.archui', 'index.yaml')
  let copiedUuid = ''
  if (fs.existsSync(copiedIndexPath)) {
    try {
      const copiedIndex = parseYaml(fs.readFileSync(copiedIndexPath, 'utf8')) as IndexYaml
      copiedUuid = copiedIndex?.uuid ?? ''
    } catch { /* ignore */ }
  }

  // Step 4c: Register in parent's index.yaml submodules
  if (copiedUuid) {
    const destFolderName = path.basename(destPath)
    const parentIndexPath = path.join(targetDir, '.archui', 'index.yaml')
    if (fs.existsSync(parentIndexPath)) {
      try {
        const parentIndex = parseYaml(fs.readFileSync(parentIndexPath, 'utf8')) as IndexYaml
        parentIndex.submodules = { ...(parentIndex.submodules ?? {}), [destFolderName]: copiedUuid }
        fs.writeFileSync(parentIndexPath, stringifyYaml(parentIndex), 'utf8')
        console.log(`Registered "${destFolderName}" (${copiedUuid}) in parent submodules`)
      } catch (err) {
        console.warn(`Warning: failed to register in parent index.yaml: ${(err as Error).message}`)
      }
    }

    // Step 4d: Add layout entry with non-overlapping position
    const parentLayoutPath = path.join(targetDir, '.archui', 'layout.yaml')
    try {
      let layoutData: Record<string, unknown> = {}
      if (fs.existsSync(parentLayoutPath)) {
        layoutData = (parseYaml(fs.readFileSync(parentLayoutPath, 'utf8')) as Record<string, unknown>) ?? {}
      }
      const existingLayout = (layoutData.layout ?? {}) as Record<string, { x?: string | number; y?: string | number }>
      const pos = findNonOverlappingPosition(existingLayout)
      ;(layoutData.layout as Record<string, unknown>)[copiedUuid] = { x: String(pos.x), y: String(pos.y) }
      fs.writeFileSync(parentLayoutPath, stringifyYaml(layoutData), 'utf8')
      console.log(`Added layout entry for ${copiedUuid} at (${pos.x}, ${pos.y})`)
    } catch (err) {
      console.warn(`Warning: failed to add layout entry: ${(err as Error).message}`)
    }
  }

  // Step 5: Run clean --apply
  console.log('Running clean on copied module...')
  runClean(absRoot, destPath, true)

  // Step 6: Run validate
  const { exitCode } = runValidate(absRoot)

  if (exitCode === 0) {
    console.log('Validation passed. Paste complete.')
    return
  }

  // Step 7: Agent repair
  console.log('Validation found errors after paste. Triggering agent repair...')
  console.log('修复当前项目的archui结构，使得其能通过archui validate测试，修复所有报错。')

  // Find the dist/index.js path relative to this process
  const distIndex = path.resolve(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'archui', 'dist', 'index.js')
  // Prefer resolving via the running script's location
  const selfScript = process.argv[1]
  const selfDir = selfScript ? path.dirname(selfScript) : null
  const runScript = selfDir ? path.join(selfDir, 'index.js') : distIndex

  const result = spawnSync(
    process.execPath,
    [
      runScript,
      'run',
      '--prompt',
      '修复当前项目的archui结构，使得其能通过archui validate测试，修复所有报错。',
    ],
    { stdio: 'inherit', cwd: absRoot }
  )

  if (result.status !== null && result.status !== 0) {
    process.exit(result.status)
  }
}
