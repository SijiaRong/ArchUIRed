/**
 * File System Access API adapter (Chrome/Edge only).
 * Call `openDirectory()` to ask the user to pick a folder,
 * then use the returned `FsAdapter`.
 */
import type { DirEntry, FsAdapter } from '../types'

export async function openDirectory(): Promise<{ root: FileSystemDirectoryHandle; adapter: FsAdapter }> {
  const root = await (window as Window & typeof globalThis & {
    showDirectoryPicker(options?: { mode?: string }): Promise<FileSystemDirectoryHandle>
  }).showDirectoryPicker({ mode: 'readwrite' })
  return { root, adapter: createFsaAdapter(root, '') }
}

function createFsaAdapter(root: FileSystemDirectoryHandle, _prefix: string): FsAdapter {
  async function resolve(filePath: string): Promise<{ dir: FileSystemDirectoryHandle; name: string }> {
    const parts = filePath.replace(/^\//, '').split('/')
    const name = parts.pop()!
    let dir: FileSystemDirectoryHandle = root
    for (const segment of parts) {
      dir = await dir.getDirectoryHandle(segment, { create: false })
    }
    return { dir, name }
  }

  async function resolveDir(dirPath: string): Promise<FileSystemDirectoryHandle> {
    const parts = dirPath.replace(/^\//, '').split('/').filter(Boolean)
    let dir: FileSystemDirectoryHandle = root
    for (const segment of parts) {
      dir = await dir.getDirectoryHandle(segment, { create: false })
    }
    return dir
  }

  return {
    async readFile(filePath: string): Promise<string> {
      const { dir, name } = await resolve(filePath)
      const fh = await dir.getFileHandle(name)
      const file = await fh.getFile()
      return file.text()
    },

    async writeFile(filePath: string, content: string): Promise<void> {
      const parts = filePath.replace(/^\//, '').split('/')
      const name = parts.pop()!
      let dir: FileSystemDirectoryHandle = root
      for (const segment of parts) {
        dir = await dir.getDirectoryHandle(segment, { create: true })
      }
      const fh = await dir.getFileHandle(name, { create: true })
      const writable = await (fh as FileSystemFileHandle & {
        createWritable(): Promise<FileSystemWritableFileStream>
      }).createWritable()
      await writable.write(content)
      await writable.close()
    },

    async listDir(dirPath: string): Promise<DirEntry[]> {
      const dir = await resolveDir(dirPath)
      const entries: DirEntry[] = []
      for await (const [name, handle] of (dir as FileSystemDirectoryHandle & {
        [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>
      })) {
        entries.push({ name, type: handle.kind === 'directory' ? 'dir' : 'file' })
      }
      return entries
    },

    async exists(filePath: string): Promise<boolean> {
      try {
        const { dir, name } = await resolve(filePath)
        try {
          await dir.getFileHandle(name)
          return true
        } catch {
          await dir.getDirectoryHandle(name)
          return true
        }
      } catch {
        return false
      }
    },

    async mkdir(dirPath: string): Promise<void> {
      const parts = dirPath.replace(/^\//, '').split('/').filter(Boolean)
      let dir: FileSystemDirectoryHandle = root
      for (const segment of parts) {
        dir = await dir.getDirectoryHandle(segment, { create: true })
      }
    },

    async removeDir(dirPath: string): Promise<void> {
      const parts = dirPath.replace(/^\//, '').split('/').filter(Boolean)
      const name = parts.pop()!
      let dir: FileSystemDirectoryHandle = root
      for (const segment of parts) {
        dir = await dir.getDirectoryHandle(segment, { create: false })
      }
      await dir.removeEntry(name, { recursive: true })
    },
  }
}
