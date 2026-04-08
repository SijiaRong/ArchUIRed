---
name: Filesystem Adapters
description: "The three interchangeable FsAdapter implementations that abstract filesystem access across all runtime contexts — FSA (Chrome/Edge local files), server (all browsers via Express backend), and mem (in-memory for tests) — all conforming to the same FsAdapter interface."
---

## Overview

All filesystem access in the ArchUI web app goes through a single `FsAdapter` interface:

```typescript
interface FsAdapter {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  listDir(path: string): Promise<DirEntry[]>
  readonly canWrite: boolean
}
```

Three adapters implement this interface, covering every supported runtime context:

| Adapter | Context | Browser support |
|---|---|---|
| **fsa-adapter** | Local files via browser File System Access API | Chrome, Edge |
| **server-adapter** | Remote files via Express backend HTTP API | All browsers |
| **mem-adapter** | In-memory virtual filesystem | Tests only |

## Runtime Selection

`src/components/ui/OpenFolder.tsx` detects FSA support at mount time:

```typescript
if (!hasFsaSupport()) {
  // Safari, Firefox, mobile — auto-connect to server adapter
  const adapter = new ServerAdapter()
  const data = await walkProject(adapter)
  setAdapter(adapter, data)
}
```

The user is never exposed to adapter selection — the right one is chosen automatically.
