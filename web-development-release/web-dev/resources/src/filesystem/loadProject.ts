import { parse as parseYaml } from 'yaml'
import type { ArchModule, ChildModule, FsAdapter, IndexYaml, LayoutFile, ModuleLink, SubmoduleSummary } from '../types'
import { parseReadme } from './parseReadme'

function join(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'
}

/** Identity document filenames in priority order (SPEC.md first for typed modules) */
const IDENTITY_DOCS = ['SPEC.md', 'HARNESS.md', 'MEMORY.md', 'SKILL.md', 'README.md']

/**
 * Load name + description from the first identity document found in the folder.
 * Falls back to folder name if none exist.
 */
async function loadIdentityDoc(
  adapter: FsAdapter,
  modulePath: string,
): Promise<{ name: string; description: string }> {
  for (const doc of IDENTITY_DOCS) {
    try {
      const content = await adapter.readFile(join(modulePath, doc))
      const meta = parseReadme(content)
      if (meta) return meta
    } catch { /* try next */ }
  }
  return { name: modulePath.split('/').pop() ?? modulePath, description: '' }
}

/**
 * Load a single ArchUI module from the filesystem.
 * Reads identity document and .archui/index.yaml; enumerates direct children.
 * Also loads each child's submodule names one level deeper (for the detail panel).
 */
export async function loadModule(adapter: FsAdapter, modulePath: string): Promise<ArchModule> {
  const indexPath = join(modulePath, '.archui/index.yaml')

  // Identity document (SPEC.md / README.md / etc.)
  const meta = await loadIdentityDoc(adapter, modulePath)

  // index.yaml
  const indexContent = await adapter.readFile(indexPath).catch(() => '')
  let index: IndexYaml = { schema_version: '1', uuid: '' }
  try {
    index = parseYaml(indexContent) as IndexYaml
  } catch { /* ignore */ }

  const submodules = index.submodules ?? {}
  const links      = index.links ?? []

  // Read centralized layout
  let globalLayout: LayoutFile = {}
  try {
    const layoutContent = await adapter.readFile('.archui/layout.yaml')
    const parsed = parseYaml(layoutContent) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      globalLayout = parsed as LayoutFile
    }
  } catch {
    // .archui/layout.yaml missing or unreadable — use empty layout
  }
  const layout = globalLayout[index.uuid] ?? {}

  // Load child summaries (one level deep)
  const children: ChildModule[] = await Promise.all(
    Object.entries(submodules).map(async ([folderName, uuid]) => {
      const childPath = join(modulePath, folderName)
      const childMeta = await loadIdentityDoc(adapter, childPath)

      // Load child's own index.yaml for links + submodules map
      let childLinks: ModuleLink[] = []
      let childSubmoduleMap: Record<string, string> = {}
      try {
        const childIndexRaw = await adapter.readFile(join(childPath, '.archui/index.yaml')).catch(() => '')
        const childIndex = parseYaml(childIndexRaw) as IndexYaml
        childLinks = childIndex?.links ?? []
        childSubmoduleMap = childIndex?.submodules ?? {}
      } catch { /* ignore */ }

      // Load grandchild names for detail-panel submodule list
      const childSubmodules: SubmoduleSummary[] = await Promise.all(
        Object.entries(childSubmoduleMap).map(async ([gcFolder, gcUuid]) => {
          const gcPath = join(childPath, gcFolder)
          const gcMeta = await loadIdentityDoc(adapter, gcPath)
          return { uuid: gcUuid, folderName: gcFolder, name: gcMeta.name, description: gcMeta.description }
        })
      )

      return {
        folderName,
        uuid,
        path: childPath,
        name: childMeta.name,
        description: childMeta.description,
        links: childLinks,
        submodules: childSubmodules,
      }
    })
  )

  return {
    path: modulePath,
    name: meta.name,
    description: meta.description,
    uuid: index.uuid,
    submodules,
    links,
    layout,
    children,
  }
}

/**
 * Auto-discover top-level modules in the root directory.
 * Returns folder names that contain both an identity document and .archui/index.yaml.
 */
export async function discoverRoot(adapter: FsAdapter, rootPath: string): Promise<string[]> {
  const entries = await adapter.listDir(rootPath)
  const candidates = entries.filter(e => e.type === 'dir' && !e.name.startsWith('.') && e.name !== 'resources')

  const results: string[] = []
  for (const e of candidates) {
    const hasIndex = await adapter.exists(join(rootPath, e.name, '.archui/index.yaml'))
    if (!hasIndex) continue
    // Check for at least one identity document
    const hasIdentity = await Promise.any(
      IDENTITY_DOCS.map(doc => adapter.exists(join(rootPath, e.name, doc)).then(v => { if (!v) throw new Error(); return true }))
    ).catch(() => false)
    if (hasIdentity) results.push(e.name)
  }
  return results
}
