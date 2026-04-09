import { create } from 'zustand'
import type { ArchModule, FsAdapter, ModuleLink, ProjectIndexEntry } from '../types'
import serverAdapter from '../filesystem/serverAdapter'
import { createMemAdapter } from '../filesystem/memAdapter'
import { loadModule, discoverRoot, buildProjectIndex } from '../filesystem/loadProject'

type FsMode = 'server' | 'fsa' | 'mem'

interface CanvasState {
  // Project
  rootPath: string | null
  adapter: FsAdapter
  fsMode: FsMode

  // Navigation
  breadcrumb: Array<{ path: string; name: string }>
  currentModule: ArchModule | null
  projectIndex: Record<string, ProjectIndexEntry>
  loading: boolean
  error: string | null

  // Actions
  setAdapter(adapter: FsAdapter, rootPath: string, fsMode: FsMode): Promise<void>
  navigate(modulePath: string): Promise<void>
  navigateUp(): Promise<void>
  reload(): Promise<void>
  setError(msg: string | null): void

  // Mutations (pass-through; callers use writeOps directly then call reload)
  refreshAfterWrite(): Promise<void>
}

function pickAdapter(mode: FsMode): FsAdapter {
  if (mode === 'mem') return createMemAdapter()
  return serverAdapter
}

const initialMode = (import.meta.env.VITE_FS_MODE ?? 'fsa') as FsMode

export const useCanvasStore = create<CanvasState>((set, get) => ({
  rootPath: null,
  adapter: pickAdapter(initialMode),
  fsMode: initialMode,
  breadcrumb: [],
  currentModule: null,
  projectIndex: {},
  loading: false,
  error: null,

  async setAdapter(adapter, rootPath, fsMode) {
    set({ adapter, rootPath, fsMode, breadcrumb: [], currentModule: null, projectIndex: {}, error: null })
    // Load the root module directly
    set({ loading: true })
    try {
      const [mod, projectIndex] = await Promise.all([
        loadModule(adapter, rootPath),
        buildProjectIndex(adapter, rootPath),
      ])
      set({
        currentModule: mod,
        projectIndex,
        breadcrumb: [{ path: rootPath, name: mod.name }],
        loading: false,
      })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  async navigate(modulePath) {
    const { adapter, breadcrumb } = get()
    set({ loading: true, error: null })
    try {
      const mod = await loadModule(adapter, modulePath)
      // If already in breadcrumb, slice back to it
      const existingIdx = breadcrumb.findIndex(b => b.path === modulePath)
      const newBreadcrumb = existingIdx !== -1
        ? breadcrumb.slice(0, existingIdx + 1)
        : [...breadcrumb, { path: modulePath, name: mod.name }]
      set({ currentModule: mod, breadcrumb: newBreadcrumb, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  async navigateUp() {
    const { breadcrumb } = get()
    if (breadcrumb.length <= 1) return
    const parent = breadcrumb[breadcrumb.length - 2]
    await get().navigate(parent.path)
  },

  async reload() {
    const { currentModule, adapter, rootPath } = get()
    if (!currentModule) return
    set({ loading: true })
    try {
      const [mod, projectIndex] = await Promise.all([
        loadModule(adapter, currentModule.path),
        rootPath ? buildProjectIndex(adapter, rootPath) : Promise.resolve({}),
      ])
      const { breadcrumb } = get()
      const newBreadcrumb = breadcrumb.map(b =>
        b.path === mod.path ? { ...b, name: mod.name } : b
      )
      set({ currentModule: mod, projectIndex, breadcrumb: newBreadcrumb, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  setError(msg) {
    set({ error: msg })
  },

  async refreshAfterWrite() {
    await get().reload()
  },
}))

/** Resolve all cross-module links to names using the current module's children uuid map */
export function resolveLinkName(
  link: ModuleLink,
  children: ArchModule['children'],
): string {
  const child = children.find(c => c.uuid === link.uuid)
  return child?.name ?? link.uuid
}

/** Auto-detect root path when using server mode */
export async function detectServerRoot(): Promise<string | null> {
  try {
    const res = await fetch('/api/fs/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '.' }),
    })
    if (res.ok) {
      const data = await res.json() as { entries: Array<{ name: string; type: string }> }
      // Heuristic: root has .archui/ and README.md
      const hasArchui = data.entries.some(e => e.name === '.archui' && e.type === 'dir')
      const hasReadme = data.entries.some(e => e.name === 'README.md' && e.type === 'file')
      if (hasArchui && hasReadme) return '.'
    }
  } catch { /* ignore */ }
  return null
}

export { discoverRoot }
