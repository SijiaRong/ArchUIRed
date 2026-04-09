import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { parse as parseYaml } from 'yaml'
import type { IndexYaml } from './types.js'

const IDENTITY_DOCS = ['README.md', 'SKILL.md', 'HARNESS.md', 'SPEC.md', 'MEMORY.md']

function extractFrontmatterName(content: string): string | null {
  if (!content.startsWith('---')) return null
  const end = content.indexOf('\n---', 3)
  if (end === -1) return null
  try {
    const fm = parseYaml(content.slice(3, end).trim()) as Record<string, unknown>
    if (fm && typeof fm['name'] === 'string' && fm['name'].trim()) {
      return fm['name'].trim()
    }
    return null
  } catch {
    return null
  }
}

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

function readModuleName(folderAbs: string, uuid: string): string {
  for (const docName of IDENTITY_DOCS) {
    const docPath = path.join(folderAbs, docName)
    if (!fs.existsSync(docPath)) continue
    try {
      const content = fs.readFileSync(docPath, 'utf8')
      const name = extractFrontmatterName(content)
      if (name) return name
    } catch {
      // fall through
    }
    break
  }
  return uuid
}

function copyToClipboard(text: string): void {
  const platform = process.platform
  if (platform === 'darwin') {
    execSync(`echo -n ${JSON.stringify(text)} | pbcopy`)
  } else if (platform === 'linux') {
    try {
      execSync(`echo -n ${JSON.stringify(text)} | xclip -selection clipboard`)
    } catch {
      execSync(`echo -n ${JSON.stringify(text)} | xsel --clipboard --input`)
    }
  } else if (platform === 'win32') {
    // cmd /c set /p reads from stdin but doesn't append newline when using pipe
    execSync(`cmd /c "echo|set /p=${text.replace(/"/g, '\\"')}| clip"`)
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }
}

export function runCopy(root: string, uuid: string): void {
  const rootAbs = path.resolve(root)
  const uuidMap = buildUuidMap(rootAbs)

  const folderAbs = uuidMap.get(uuid)
  if (!folderAbs) {
    console.error(`Error: module with uuid ${uuid} not found in project`)
    process.exit(1)
  }

  const name = readModuleName(folderAbs, uuid)
  const content = `archui://copy?path=${folderAbs}&uuid=${uuid}`

  try {
    copyToClipboard(content)
  } catch (err) {
    console.error(`Error: failed to write to clipboard: ${(err as Error).message}`)
    process.exit(1)
  }

  console.log(`Copied module ${name} (${uuid}) to clipboard.`)
}
