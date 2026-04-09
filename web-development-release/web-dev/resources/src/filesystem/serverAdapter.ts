import type { DirEntry, FsAdapter } from '../types'

const BASE = import.meta.env.VITE_FS_MODE === 'server'
  ? (import.meta.env.VITE_SERVER_URL ?? '')
  : '' // same-origin when proxied via vite dev server

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

const serverAdapter: FsAdapter = {
  async readFile(path: string): Promise<string> {
    const { content } = await post<{ content: string }>('/api/fs/read', { path })
    return content
  },

  async writeFile(path: string, content: string): Promise<void> {
    await post('/api/fs/write', { path, content })
  },

  async listDir(path: string): Promise<DirEntry[]> {
    const { entries } = await post<{ entries: DirEntry[] }>('/api/fs/list', { path })
    return entries
  },

  async exists(path: string): Promise<boolean> {
    try {
      await post('/api/fs/list', { path })
      return true
    } catch {
      return false
    }
  },

  async mkdir(path: string): Promise<void> {
    await post('/api/fs/mkdir', { path })
  },

  async copyDir(src: string, dest: string): Promise<void> {
    const res = await fetch(`${BASE}/api/fs/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src, dest }),
    })
    if (!res.ok) throw new Error(`copy failed: ${res.status}`)
  },

  async removeDir(path: string): Promise<void> {
    await post('/api/fs/remove', { path })
  },
}

export default serverAdapter
