import { parse as parseYaml } from 'yaml'
import type { ArchModule, ChildModule, FsAdapter, IndexYaml, LayoutFile, ProjectIndexEntry } from '../types'
import { parseReadme } from './parseReadme'

function join(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'
}

function normalizeSubmodules(submodules: IndexYaml['submodules']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(submodules ?? {}).map(([folderName, uuid]) => [folderName, String(uuid)]),
  )
}

function normalizeLinks(links: IndexYaml['links']): ChildModule['links'] {
  return (links ?? []).map(link => ({
    ...link,
    uuid: String(link.uuid),
  }))
}

/**
 * Load a single ArchUI module from the filesystem.
 * Reads README.md and .archui/index.yaml; enumerates direct children.
 */
export async function loadModule(adapter: FsAdapter, modulePath: string): Promise<ArchModule> {
  const readmePath = join(modulePath, 'README.md')
  const indexPath  = join(modulePath, '.archui/index.yaml')

  // README
  const readmeContent = await adapter.readFile(readmePath).catch(() => '')
  const meta = parseReadme(readmeContent) ?? { name: modulePath.split('/').pop() ?? modulePath, description: '' }

  // index.yaml
  const indexContent = await adapter.readFile(indexPath).catch(() => '')
  let index: IndexYaml = { schema_version: '1', uuid: '' }
  try {
    index = parseYaml(indexContent) as IndexYaml
  } catch { /* ignore */ }

  const submodules = normalizeSubmodules(index.submodules)
  const links = normalizeLinks(index.links)

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
      const childReadme = await adapter.readFile(join(childPath, 'README.md')).catch(() => '')
      const childIndexContent = await adapter.readFile(join(childPath, '.archui/index.yaml')).catch(() => '')
      const childMeta = parseReadme(childReadme) ?? { name: folderName, description: '' }
      let childIndex: IndexYaml = { schema_version: '1', uuid }
      try {
        childIndex = parseYaml(childIndexContent) as IndexYaml
      } catch {
        // fall back to the parent-declared uuid when the child index is unreadable
      }
      return {
        folderName,
        uuid,
        path: childPath,
        name: childMeta.name,
        description: childMeta.description,
        submoduleCount: Object.keys(normalizeSubmodules(childIndex.submodules)).length,
        links: normalizeLinks(childIndex.links),
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

async function scanModule(
  adapter: FsAdapter,
  modulePath: string,
  parentPath: string | null,
): Promise<ProjectIndexEntry[]> {
  const readmeContent = await adapter.readFile(join(modulePath, 'README.md')).catch(() => '')
  const indexContent  = await adapter.readFile(join(modulePath, '.archui/index.yaml')).catch(() => '')

  const meta = parseReadme(readmeContent) ?? {
    name: modulePath.split('/').pop() ?? modulePath,
    description: '',
  }

  let index: IndexYaml = { schema_version: '1', uuid: '' }
  try {
    index = parseYaml(indexContent) as IndexYaml
  } catch {
    // leave the entry skeletal when the index cannot be parsed
  }

  const entry: ProjectIndexEntry = {
    uuid: String(index.uuid ?? ''),
    path: modulePath,
    parentPath,
    name: meta.name,
    description: meta.description,
    submodules: normalizeSubmodules(index.submodules),
    links: normalizeLinks(index.links),
  }

  const descendants = await Promise.all(
    Object.keys(entry.submodules).map(folderName =>
      scanModule(adapter, join(modulePath, folderName), modulePath),
    ),
  )

  return [entry, ...descendants.flat()]
}

export async function buildProjectIndex(
  adapter: FsAdapter,
  rootPath: string,
): Promise<Record<string, ProjectIndexEntry>> {
  const entries = await scanModule(adapter, rootPath, null)
  return Object.fromEntries(
    entries
      .filter(entry => entry.uuid)
      .map(entry => [entry.uuid, entry] satisfies [string, ProjectIndexEntry]),
  )
}

/**
 * Auto-discover top-level modules in the root directory.
 * Returns folder names that contain both README.md and .archui/index.yaml.
 */
export async function discoverRoot(adapter: FsAdapter, rootPath: string): Promise<string[]> {
  const entries = await adapter.listDir(rootPath)
  const candidates = entries.filter(e => e.type === 'dir' && !e.name.startsWith('.') && e.name !== 'resources')

  const results: string[] = []
  for (const e of candidates) {
    const hasReadme = await adapter.exists(join(rootPath, e.name, 'README.md'))
    const hasIndex  = await adapter.exists(join(rootPath, e.name, '.archui/index.yaml'))
    if (hasReadme && hasIndex) results.push(e.name)
  }
  return results
}
