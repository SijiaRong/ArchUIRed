/**
 * In-memory filesystem adapter for unit tests.
 * Initialise with a flat map of path → content strings.
 */
import type { DirEntry, FsAdapter } from '../types'

export function createMemAdapter(initial: Record<string, string> = {}): FsAdapter {
  const files = new Map<string, string>(Object.entries(initial))

  function normalise(p: string): string {
    return p.replace(/\/+$/, '') || '/'
  }

  return {
    async readFile(path: string): Promise<string> {
      const p = normalise(path)
      if (!files.has(p)) throw new Error(`ENOENT: ${p}`)
      return files.get(p)!
    },

    async writeFile(path: string, content: string): Promise<void> {
      files.set(normalise(path), content)
    },

    async listDir(path: string): Promise<DirEntry[]> {
      const dir = normalise(path)
      const prefix = dir === '/' ? '/' : dir + '/'
      const seen = new Set<string>()
      const entries: DirEntry[] = []

      for (const key of files.keys()) {
        if (!key.startsWith(prefix)) continue
        const rest = key.slice(prefix.length)
        const segment = rest.split('/')[0]
        if (!segment || seen.has(segment)) continue
        seen.add(segment)
        const isDir = rest.includes('/')
        entries.push({ name: segment, type: isDir ? 'dir' : 'file' })
      }

      return entries
    },

    async exists(path: string): Promise<boolean> {
      const p = normalise(path)
      if (files.has(p)) return true
      const prefix = p + '/'
      for (const key of files.keys()) {
        if (key.startsWith(prefix)) return true
      }
      return false
    },

    async mkdir(_path: string): Promise<void> {
      // no-op: directories are implicit in the mem adapter
    },

    async removeDir(dirPath: string): Promise<void> {
      const p = normalise(dirPath)
      const prefix = p + '/'
      for (const key of [...files.keys()]) {
        if (key === p || key.startsWith(prefix)) {
          files.delete(key)
        }
      }
    },
  }
}
