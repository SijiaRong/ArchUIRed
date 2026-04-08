---
name: Server Adapter
description: "FsAdapter implementation that calls the Express web-server's /api/fs/* REST endpoints — works in all browsers including Safari and mobile, requires the web-server to be running with an ARCHUI_ROOT configured; auto-selected when FSA is unavailable."
---

## Overview

The server adapter communicates with the Express backend over HTTP. The browser makes `POST` requests to `/api/fs/*` on the same origin; the server reads and writes files on the host machine inside the configured `ARCHUI_ROOT`.

**Browser support:** All browsers — Chrome, Edge, Safari, Firefox, mobile Safari, mobile Chrome.

**Requirement:** The `web-server` must be running and reachable at the same origin as the SPA.

## Implementation

`src/filesystem/serverAdapter.ts`

```typescript
export class ServerAdapter implements FsAdapter {
  readonly canWrite = true

  async readFile(path: string): Promise<string> {
    const res = await fetch('/api/fs/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
    if (!res.ok) throw new Error(`Read failed: ${res.status}`)
    return ((await res.json()) as { content: string }).content
  }

  async writeFile(path: string, content: string): Promise<void> {
    const res = await fetch('/api/fs/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    })
    if (!res.ok) throw new Error(`Write failed: ${res.status}`)
  }

  async listDir(path: string): Promise<DirEntry[]> {
    const res = await fetch('/api/fs/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
    if (!res.ok) throw new Error(`List failed: ${res.status}`)
    return ((await res.json()) as { entries: DirEntry[] }).entries
  }
}

export function hasFsaSupport(): boolean {
  return typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function'
}
```

## Auto-Selection

`OpenFolder.tsx` checks `hasFsaSupport()` on mount. If FSA is unavailable, `ServerAdapter` is instantiated and `walkProject` is called immediately — the user sees a brief "Connecting to server…" state then lands directly on the canvas, with no directory picker or manual action.

## API Contract

All endpoints expect a JSON body and return JSON. The server validates that all paths stay within `ARCHUI_ROOT` before any I/O.

| Endpoint | Request | Response |
|---|---|---|
| `POST /api/fs/read` | `{ path: string }` | `{ content: string }` |
| `POST /api/fs/write` | `{ path: string, content: string }` | `{ ok: true }` |
| `POST /api/fs/list` | `{ path: string }` | `{ entries: DirEntry[] }` |

## Deployment

In the deployed configuration at actionl.ink:

- nginx proxies `location /api/` → `http://127.0.0.1:3002`
- Express server (`server.cjs`) runs as a systemd service (`archui-server`)
- `ARCHUI_ROOT=/opt/archui-project` — the ArchUI repo itself is the served project
