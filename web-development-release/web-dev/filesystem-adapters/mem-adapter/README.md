---
name: Mem Adapter
description: "In-memory FsAdapter for tests — holds a virtual filesystem as a Map of path strings to file contents, supports seeding with fixture data, and can be put in read-only mode; never used in production."
---

## Overview

The mem adapter provides a fully in-memory implementation of `FsAdapter` for Playwright and unit tests. It holds a `Map<string, string>` of path → content and a `Set<string>` of known directories. No filesystem, no server, no browser permissions needed.

**Used in:** `tests/fixture.ts`, Playwright e2e tests via `testHook`.

## Implementation

`src/filesystem/memAdapter.ts`

```typescript
export class MemAdapter implements FsAdapter {
  readonly canWrite: boolean
  private files = new Map<string, string>()
  private dirs = new Set<string>()

  constructor({ writable = true } = {}) {
    this.canWrite = writable
  }

  seed(path: string, content: string): void {
    this.files.set(path, content)
    // Register all parent dirs
    const parts = path.split('/')
    for (let i = 1; i < parts.length; i++) {
      this.dirs.add(parts.slice(0, i).join('/'))
    }
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (content === undefined) throw new Error(`File not found: ${path}`)
    return content
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.canWrite) throw new Error('Adapter is read-only')
    this.seed(path, content)
  }

  async listDir(path: string): Promise<DirEntry[]> {
    const prefix = path === '.' || path === '' ? '' : path + '/'
    const entries: DirEntry[] = []
    const seen = new Set<string>()
    for (const filePath of this.files.keys()) {
      if (!filePath.startsWith(prefix)) continue
      const rest = filePath.slice(prefix.length)
      const top = rest.split('/')[0]
      if (!top || seen.has(top)) continue
      seen.add(top)
      entries.push({
        name: top,
        kind: rest.includes('/') ? 'directory' : 'file',
      })
    }
    return entries
  }
}
```

## Test Usage

```typescript
// tests/fixture.ts
export function buildFixture(): MemAdapter {
  const adapter = new MemAdapter({ writable: true })
  adapter.seed('README.md', rootReadme)
  adapter.seed('gui/README.md', guiReadme)
  adapter.seed('gui/screens/README.md', screensReadme)
  // ...
  return adapter
}
```

The test hook (`src/testHook.ts`) exposes `window.__archui_setAdapter` so Playwright tests can inject a `MemAdapter` before the app initialises, bypassing all real filesystem access.
