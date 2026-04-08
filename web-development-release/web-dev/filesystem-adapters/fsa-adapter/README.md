---
name: FSA Adapter
description: FsAdapter implementation using the browser's File System Access API — the user grants a one-time directory permission and all reads/writes go directly through the browser handle with no server required; only available in Chrome and Edge.
---

## Overview

The FSA adapter uses `window.showDirectoryPicker()` to acquire a `FileSystemDirectoryHandle` for the ArchUI project root. All subsequent reads and writes go through this handle — no network requests, no server process, no extra setup.

**Browser support:** Chrome 86+, Edge 86+. Not available in Safari, Firefox, or any mobile browser.

## Implementation

`src/filesystem/fsa.ts`

```typescript
export class FsaAdapter implements FsAdapter {
  readonly canWrite = true

  async readFile(path: string): Promise<string> {
    // Walk FileSystemDirectoryHandle tree to the target file
    const fileHandle = await this.getFileHandle(path)
    const file = await fileHandle.getFile()
    return file.text()
  }

  async writeFile(path: string, content: string): Promise<void> {
    const fileHandle = await this.getFileHandle(path, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  async listDir(path: string): Promise<DirEntry[]> {
    const dir = await this.getDirHandle(path)
    const entries: DirEntry[] = []
    for await (const handle of dir.values()) {
      entries.push({ name: handle.name, kind: handle.kind })
    }
    return entries
  }
}

export async function openDirectory(): Promise<FsaAdapter> {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
  return FsaAdapter.create(handle)
}
```

## UX Flow

1. User clicks **Open Project Folder** (shown only when FSA is available).
2. Browser native directory picker appears.
3. User selects the ArchUI project root and grants permission.
4. `FsaAdapter` is instantiated with the handle and injected into the canvas store.
5. Permission persists for the browser session; no prompt on subsequent reads/writes.

## Limitations

- Only one project can be open at a time per tab.
- `FileSystemDirectoryHandle` cannot be serialised — recent projects in `localStorage` store the name only, not the handle. Reopening a recent project re-triggers the picker.
- Write operations require `mode: 'readwrite'` granted at the initial `showDirectoryPicker` call; no separate permission prompt per write.
