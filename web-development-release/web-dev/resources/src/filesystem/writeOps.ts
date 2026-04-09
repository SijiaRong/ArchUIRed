import { stringify as stringifyYaml, parse as parseYaml } from 'yaml'
import type { FsAdapter, IndexYaml, LayoutFile, ModuleLink } from '../types'
import { serializeReadme } from './parseReadme'

function join(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'
}

function nanoid8(): string {
  return Math.random().toString(16).slice(2, 10).padEnd(8, '0')
}

/**
 * Create a new ArchUI module folder with README.md and .archui/index.yaml.
 */
export async function createModule(
  adapter: FsAdapter,
  parentPath: string,
  folderName: string,
  name: string,
  description: string,
): Promise<string> {
  const modulePath = join(parentPath, folderName)
  const uuid       = nanoid8()

  // FSA needs a microtask yield after mkdir before writeFile works reliably
  const tick = () => new Promise(r => setTimeout(r, 50))

  await adapter.mkdir(modulePath)
  await tick()

  await adapter.writeFile(join(modulePath, 'README.md'), serializeReadme({ name, description }))

  const index: IndexYaml = { schema_version: '1', uuid, submodules: {}, links: [] }
  const indexContent = stringifyYaml(index)
  const archiuDir = join(modulePath, '.archui')

  await adapter.mkdir(archiuDir)
  await tick()

  await adapter.writeFile(join(archiuDir, 'index.yaml'), indexContent)
  await adapter.writeFile(join(archiuDir, 'layout.yaml'), stringifyYaml({ layout: {} }))

  // Register in parent's index.yaml
  const parentIndexPath = join(parentPath, '.archui/index.yaml')
  const parentIndexContent = await adapter.readFile(parentIndexPath).catch(() => '')
  let parentIndex: IndexYaml = { schema_version: '1', uuid: '' }
  try { parentIndex = parseYaml(parentIndexContent) as IndexYaml } catch { /* empty */ }

  parentIndex.submodules = { ...(parentIndex.submodules ?? {}), [folderName]: uuid }
  await adapter.writeFile(parentIndexPath, stringifyYaml(parentIndex))

  // Update parent layout.yaml to include new child position
  const parentLayoutPath = join(parentPath, '.archui/layout.yaml')
  const parentLayoutContent = await adapter.readFile(parentLayoutPath).catch(() => '')
  let parentLayout: Record<string, unknown> = {}
  try { parentLayout = (parseYaml(parentLayoutContent) as Record<string, unknown>) ?? {} } catch { /* empty */ }
  if (!parentLayout.layout) parentLayout.layout = {}
  const layout = parentLayout.layout as Record<string, unknown>
  const childCount = Object.keys(parentIndex.submodules ?? {}).length
  const pos = findNonOverlappingPosition(
    { x: 700 + ((childCount - 1) % 2) * 260, y: 120 + Math.floor((childCount - 1) / 2) * 190 },
    layout as Record<string, { x?: string | number; y?: string | number }>,
  )
  layout[uuid] = { x: String(pos.x), y: String(pos.y) }
  await adapter.writeFile(parentLayoutPath, stringifyYaml(parentLayout))

  return uuid
}

/**
 * Add a link from one module to another in the source module's index.yaml.
 */
export async function addLink(
  adapter: FsAdapter,
  modulePath: string,
  link: ModuleLink,
): Promise<void> {
  const indexPath = join(modulePath, '.archui/index.yaml')
  const content = await adapter.readFile(indexPath)
  const index = parseYaml(content) as IndexYaml
  index.links = [...(index.links ?? []), link]
  await adapter.writeFile(indexPath, stringifyYaml(index))
}

/**
 * Remove a link by target uuid from a module's index.yaml.
 */
export async function removeLink(
  adapter: FsAdapter,
  modulePath: string,
  targetUuid: string,
): Promise<void> {
  const indexPath = join(modulePath, '.archui/index.yaml')
  const content = await adapter.readFile(indexPath)
  const index = parseYaml(content) as IndexYaml
  index.links = (index.links ?? []).filter(l => l.uuid !== targetUuid)
  await adapter.writeFile(indexPath, stringifyYaml(index))
}

/**
 * Persist canvas layout positions into the centralized .archui/layout.yaml.
 * Merges the given module's positions into the existing layout file.
 */
export async function saveLayout(
  adapter: FsAdapter,
  moduleUuid: string,
  layout: Record<string, { x: number; y: number }>,
): Promise<void> {
  let existing: LayoutFile = {}
  try {
    const content = await adapter.readFile('.archui/layout.yaml')
    const parsed = parseYaml(content) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      existing = parsed as LayoutFile
    }
  } catch { /* file may not exist yet */ }
  existing[moduleUuid] = layout
  await adapter.writeFile('.archui/layout.yaml', stringifyYaml(existing))
}

/**
 * Copy a module folder to a new location under destParentPath.
 * Resolves name conflicts by appending `-copy` / `-copy-N`.
 * Returns the destination path of the new copy.
 */
export async function copyModule(
  adapter: FsAdapter,
  sourcePath: string,
  destParentPath: string,
  position?: { x: number; y: number },
): Promise<string> {
  const baseName = sourcePath.split('/').filter(Boolean).pop()!

  let destName = baseName
  const existing = await adapter.listDir(destParentPath)
  const existingNames = new Set(existing.map(e => e.name))
  if (existingNames.has(destName)) {
    destName = `${baseName}-copy`
    let counter = 2
    while (existingNames.has(destName)) {
      destName = `${baseName}-copy-${counter}`
      counter++
    }
  }

  const destPath = `${destParentPath}/${destName}`

  if (adapter.copyDir) {
    await adapter.copyDir(sourcePath, destPath)
  } else {
    await recursiveCopy(adapter, sourcePath, destPath)
  }

  const copiedIndexContent = await adapter.readFile(join(destPath, '.archui/index.yaml')).catch(() => '')
  let copiedUuid = ''
  try {
    const copiedIndex = parseYaml(copiedIndexContent) as IndexYaml
    copiedUuid = copiedIndex?.uuid ?? ''
  } catch { /* ignore */ }

  if (copiedUuid) {
    const parentIndexPath = join(destParentPath, '.archui/index.yaml')
    const parentIndexContent = await adapter.readFile(parentIndexPath).catch(() => '')
    let parentIndex: IndexYaml = { schema_version: '1', uuid: '' }
    try { parentIndex = parseYaml(parentIndexContent) as IndexYaml } catch { /* empty */ }
    parentIndex.submodules = { ...(parentIndex.submodules ?? {}), [destName]: copiedUuid }
    await adapter.writeFile(parentIndexPath, stringifyYaml(parentIndex))

    const parentLayoutPath = join(destParentPath, '.archui/layout.yaml')
    const layoutContent = await adapter.readFile(parentLayoutPath).catch(() => '')
    let layoutData: Record<string, unknown> = {}
    try { layoutData = (parseYaml(layoutContent) as Record<string, unknown>) ?? {} } catch { /* empty */ }
    if (!layoutData.layout) layoutData.layout = {}
    const existingLayout = layoutData.layout as Record<string, { x?: string | number; y?: string | number }>
    const pos = position
      ? findNonOverlappingPosition(position, existingLayout)
      : findNonOverlappingPosition({ x: 0, y: 0 }, existingLayout)
    ;(layoutData.layout as Record<string, unknown>)[copiedUuid] = { x: String(pos.x), y: String(pos.y) }
    await adapter.writeFile(parentLayoutPath, stringifyYaml(layoutData))
  }

  return destPath
}

/**
 * Delete a child module: remove its folder, unregister from parent index.yaml
 * and layout.yaml. Caller is responsible for project-wide dangling link cleanup.
 */
export async function deleteModule(
  adapter: FsAdapter,
  parentPath: string,
  folderName: string,
  uuid: string,
): Promise<void> {
  if (!adapter.removeDir) {
    throw new Error('Filesystem adapter does not support removeDir')
  }

  const modulePath = join(parentPath, folderName)
  await adapter.removeDir(modulePath)

  const parentIndexPath = join(parentPath, '.archui/index.yaml')
  const parentIndexContent = await adapter.readFile(parentIndexPath).catch(() => '')
  let parentIndex: IndexYaml = { schema_version: '1', uuid: '' }
  try { parentIndex = parseYaml(parentIndexContent) as IndexYaml } catch { /* empty */ }

  if (parentIndex.submodules) {
    delete parentIndex.submodules[folderName]
  }
  await adapter.writeFile(parentIndexPath, stringifyYaml(parentIndex))

  const parentLayoutPath = join(parentPath, '.archui/layout.yaml')
  try {
    const layoutContent = await adapter.readFile(parentLayoutPath).catch(() => '')
    if (layoutContent) {
      const layoutData = (parseYaml(layoutContent) as Record<string, unknown>) ?? {}
      if (layoutData.layout && typeof layoutData.layout === 'object') {
        const layout = layoutData.layout as Record<string, unknown>
        delete layout[uuid]
        await adapter.writeFile(parentLayoutPath, stringifyYaml(layoutData))
      }
    }
  } catch { /* layout parse/write error */ }
}

/**
 * Replace a module with another: delete old, copy new into same location,
 * rebind all incoming links (oldUuid → newUuid), and transfer layout position.
 *
 * This follows the CLI paste logic but adds UUID rebinding which the CLI
 * delegates to runClean + agent repair.
 */
export async function replaceModule(
  adapter: FsAdapter,
  rootPath: string,
  oldModulePath: string,
  oldUuid: string,
  newSourcePath: string,
): Promise<{ newUuid: string }> {
  if (!adapter.removeDir) {
    throw new Error('Filesystem adapter does not support removeDir')
  }

  const pathParts = oldModulePath.split('/').filter(Boolean)
  const folderName = pathParts.pop()!
  const parentPath = pathParts.join('/') || '.'

  // 1. Read old module's layout position (to transfer to new module)
  const parentLayoutPath = join(parentPath, '.archui/layout.yaml')
  let oldPosition: { x: number; y: number } | null = null
  try {
    const layoutContent = await adapter.readFile(parentLayoutPath)
    const layoutData = parseYaml(layoutContent) as Record<string, unknown>
    if (layoutData.layout && typeof layoutData.layout === 'object') {
      const layout = layoutData.layout as Record<string, { x?: string | number; y?: string | number }>
      const pos = layout[oldUuid]
      if (pos) {
        oldPosition = {
          x: typeof pos.x === 'number' ? pos.x : parseFloat(String(pos.x ?? '0')) || 0,
          y: typeof pos.y === 'number' ? pos.y : parseFloat(String(pos.y ?? '0')) || 0,
        }
      }
    }
  } catch { /* no layout */ }

  // 2. Delete old module folder
  await adapter.removeDir(oldModulePath)

  // 3. Copy new module into old location (same folder name)
  const destPath = join(parentPath, folderName)
  if (adapter.copyDir) {
    await adapter.copyDir(newSourcePath, destPath)
  } else {
    await recursiveCopy(adapter, newSourcePath, destPath)
  }

  // 4. Read new module's UUID
  const newIndexContent = await adapter.readFile(join(destPath, '.archui/index.yaml')).catch(() => '')
  let newUuid = ''
  try {
    const newIndex = parseYaml(newIndexContent) as IndexYaml
    newUuid = newIndex?.uuid ?? ''
  } catch { /* ignore */ }

  if (!newUuid) {
    throw new Error('Replacement module has no valid UUID in .archui/index.yaml')
  }

  // 5. Update parent's index.yaml: swap oldUuid for newUuid
  const parentIndexPath = join(parentPath, '.archui/index.yaml')
  const parentIndexContent = await adapter.readFile(parentIndexPath).catch(() => '')
  let parentIndex: IndexYaml = { schema_version: '1', uuid: '' }
  try { parentIndex = parseYaml(parentIndexContent) as IndexYaml } catch { /* empty */ }
  if (parentIndex.submodules) {
    parentIndex.submodules[folderName] = newUuid
  }
  await adapter.writeFile(parentIndexPath, stringifyYaml(parentIndex))

  // 6. Transfer layout position: remove oldUuid entry, add newUuid at same position
  try {
    const layoutContent = await adapter.readFile(parentLayoutPath)
    const layoutData = parseYaml(layoutContent) as Record<string, unknown>
    if (layoutData.layout && typeof layoutData.layout === 'object') {
      const layout = layoutData.layout as Record<string, unknown>
      delete layout[oldUuid]
      if (oldPosition) {
        layout[newUuid] = { x: String(oldPosition.x), y: String(oldPosition.y) }
      }
      await adapter.writeFile(parentLayoutPath, stringifyYaml(layoutData))
    }
  } catch { /* layout error */ }

  // 7. Rebind all incoming links across the project: oldUuid → newUuid
  await rebindLinks(adapter, rootPath, oldUuid, newUuid)

  return { newUuid }
}

/**
 * Traverse the entire project and rewrite any link targeting oldUuid to point to newUuid.
 */
async function rebindLinks(
  adapter: FsAdapter,
  dirPath: string,
  oldUuid: string,
  newUuid: string,
): Promise<void> {
  const indexPath = join(dirPath, '.archui/index.yaml')
  try {
    const content = await adapter.readFile(indexPath)
    const index = parseYaml(content) as IndexYaml
    const links = index.links ?? []
    let changed = false
    for (const link of links) {
      if (link.uuid === oldUuid) {
        link.uuid = newUuid
        changed = true
      }
    }
    if (changed) {
      index.links = links
      await adapter.writeFile(indexPath, stringifyYaml(index))
    }
  } catch { /* no index.yaml at this level, skip */ }

  // Recurse into subfolders
  try {
    const entries = await adapter.listDir(dirPath)
    for (const entry of entries) {
      if (entry.type === 'dir' && entry.name !== 'resources' && !entry.name.startsWith('.')) {
        await rebindLinks(adapter, join(dirPath, entry.name), oldUuid, newUuid)
      }
    }
  } catch { /* list error */ }
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 120
const PADDING = 40

function findNonOverlappingPosition(
  preferred: { x: number; y: number },
  existingLayout: Record<string, { x?: string | number; y?: string | number }>,
): { x: number; y: number } {
  const rects = Object.values(existingLayout).map(pos => ({
    x: typeof pos.x === 'number' ? pos.x : parseFloat(String(pos.x ?? '0')) || 0,
    y: typeof pos.y === 'number' ? pos.y : parseFloat(String(pos.y ?? '0')) || 0,
  }))

  const candidate = { ...preferred }
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

async function recursiveCopy(
  adapter: FsAdapter,
  src: string,
  dest: string,
): Promise<void> {
  await adapter.mkdir(dest)
  const entries = await adapter.listDir(src)
  for (const entry of entries) {
    const srcChild = `${src}/${entry.name}`
    const destChild = `${dest}/${entry.name}`
    if (entry.type === 'dir') {
      await recursiveCopy(adapter, srcChild, destChild)
    } else {
      const content = await adapter.readFile(srcChild)
      await adapter.writeFile(destChild, content)
    }
  }
}
