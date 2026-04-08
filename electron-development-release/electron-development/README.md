---
name: Electron Development
description: "Covers wrapping the ArchUI React web app in Electron for desktop deployment, including the main/renderer process split, IPC design for native filesystem access, preload script security, and auto-update integration."
---

## Overview

The Electron desktop app is not a separate application — it is the same React web app from `web-development` loaded inside an Electron `BrowserWindow`. Electron's value is entirely in what it adds: **unrestricted native filesystem access** via Node.js `fs` in the main process, elimination of the File System Access API's browser limitations, and the ability to spawn CLI subprocesses (git, LLM sync) directly.

The renderer process (React app) is treated as an untrusted browser context. It never has direct Node.js access. All privileged operations are requested through a narrow IPC surface exposed via the preload script's `contextBridge`.

## Process Architecture

```
┌─────────────────────────────────────────┐
│  Main Process (Node.js)                 │
│  electron/main.ts                       │
│  ─ BrowserWindow management             │
│  ─ fs read/write/list (IPC handlers)    │
│  ─ git / CLI subprocess spawning        │
│  ─ auto-updater (electron-updater)      │
└──────────────┬──────────────────────────┘
               │ IPC (ipcMain / ipcRenderer)
               │ exposed via contextBridge
┌──────────────▼──────────────────────────┐
│  Preload Script                         │
│  electron/preload.ts                    │
│  ─ exposes window.archFS (safe surface) │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Renderer Process (Chromium)            │
│  src/  (identical React web app)        │
│  ─ filesystem/index.ts detects Electron │
│    and uses ipc.ts adapter              │
└─────────────────────────────────────────┘
```

## IPC Design

The preload script exposes a single `window.archFS` namespace via `contextBridge.exposeInMainWorld`. This is the **only** way the renderer touches the filesystem. No `nodeIntegration: true` — that setting is explicitly disabled.

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('archFS', {
  readFile:  (path: string) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
  listDir:   (path: string) => ipcRenderer.invoke('fs:listDir', path),
  syncRun:   ()             => ipcRenderer.invoke('sync:run'),
  onSyncProgress: (cb: (msg: string) => void) =>
    ipcRenderer.on('sync:progress', (_e, msg) => cb(msg)),
});
```

```typescript
// electron/main.ts — IPC handlers
ipcMain.handle('fs:readFile', async (_e, filePath: string) => {
  validatePath(filePath, repoRoot); // path traversal guard
  return fs.promises.readFile(filePath, 'utf-8');
});

ipcMain.handle('fs:writeFile', async (_e, filePath: string, content: string) => {
  validatePath(filePath, repoRoot);
  await fs.promises.writeFile(filePath, content, 'utf-8');
});

ipcMain.handle('fs:listDir', async (_e, dirPath: string) => {
  validatePath(dirPath, repoRoot);
  return fs.promises.readdir(dirPath);
});

ipcMain.handle('sync:run', async (event) => {
  const child = spawn('npx', ['archui', 'sync'], { cwd: repoRoot });
  child.stdout.on('data', (d) => event.sender.send('sync:progress', d.toString()));
  return new Promise((resolve) => child.on('close', resolve));
});
```

**Path traversal guard** (`validatePath`): every IPC handler rejects any `filePath` that resolves outside `repoRoot` using `path.resolve` + `startsWith`.

## Renderer Adapter Detection

`src/filesystem/index.ts` detects the Electron context at runtime:

```typescript
export const fs: FsAdapter =
  typeof window !== 'undefined' && (window as any).archFS
    ? ipcAdapter((window as any).archFS)          // Electron
    : import.meta.env.VITE_FS_MODE === 'fsa'
      ? fsaAdapter()                               // Browser FSA
      : serverAdapter(import.meta.env.VITE_SERVER_URL ?? '');  // Web server
```

## BrowserWindow Configuration

```typescript
const win = new BrowserWindow({
  width: 1400,
  height: 900,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // required for contextBridge
    nodeIntegration: false,   // never enabled
    sandbox: true,            // renderer runs in Chromium sandbox
  },
});
```

## Auto-Update Integration

Auto-update uses `electron-updater`. The main process checks for updates on startup and sends update events to the renderer via IPC.

```typescript
autoUpdater.checkForUpdatesAndNotify();
autoUpdater.on('update-available', () => win.webContents.send('updater:available'));
autoUpdater.on('update-downloaded', () => win.webContents.send('updater:ready'));
ipcMain.handle('updater:install', () => autoUpdater.quitAndInstall());
```

## Pre-Build Validation

Before compiling or deploying, always run the ArchUI CLI validator to ensure the module tree conforms to the filesystem rules:

```bash
archui validate .
```

If validation reports any `ERROR`, fix all issues before proceeding with the build. Do not compile or package the Electron app against a structurally invalid module tree.

## Dev Workflow

```bash
npm run electron:dev
# Runs: concurrently "vite" "wait-on http://localhost:5173 && electron ."
```

TypeScript for the main process uses `tsconfig.electron.json` targeting `commonjs` / Node 20. The renderer uses the standard `tsconfig.json` targeting ESNext.
