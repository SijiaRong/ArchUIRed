---
name: Web Dev
description: "Defines the React web app architecture and local development workflow: canvas component structure, filesystem adapter selection, coding conventions that distributed-generated source files must follow, and Vite dev server setup."
---

## Overview

Web Dev covers the React app architecture and the local development workflow. Source code for the web app is generated in a distributed manner — each GUI spec module (e.g. `gui/components/module-node/default`) generates its own component files in its `resources/`. The `web-build` module assembles these into a compilable project. This module defines the canvas architecture and the conventions all generated files must follow.

## Local Dev Setup

**Prerequisites:** Node 20+, npm 10+.

```bash
# from web-development-release/web-dev/resources/
npm install
npm run dev          # Vite dev server at http://localhost:5173 (FSA mode)
npm run dev:full     # Vite + web-server together (server adapter mode)
```

Environment variables (`.env.local`):

```
VITE_FS_MODE=fsa           # "fsa" | "server"
VITE_SERVER_URL=http://localhost:3001
VITE_FIGMA_MCP_ENDPOINT=   # optional: Figma MCP server URL
```

## Canvas Architecture

The canvas is built on **React Flow**. Each ArchUI module maps to a custom React Flow node component.

```
CanvasPage
└── ReactFlow (controlled)
    ├── ModuleNode (custom node)
    │   ├── NodeHeader (name + description)
    │   ├── PortSection (submodule port handles)
    │   ├── NodeActions (edit, drill-in)
    │   └── CommandBar (see gui/components/module-node/command-bar)
    └── LinkEdge (custom edge)
        └── EdgeLabel (relation type)
```

**Drill-down navigation:** clicking a module sets it as the new canvas root. A level title and breadcrumb trail allow navigating back up.

**State management:** canvas state lives in a Zustand store. Module data is loaded via `loadProject.ts`, which reads both README.md and `.archui/index.yaml` per module.

## Filesystem Adapters

See `filesystem-adapters/` for the three runtime implementations (FSA, server, mem). All adapters implement the same `FsAdapter` interface:

```typescript
interface FsAdapter {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  listDir(path: string): Promise<DirEntry[]>
  readonly canWrite: boolean
}
```

## Source File Conventions

Every module generating React source files must follow these conventions so `web-build` can assemble them:

- **One component per file** — named exports only, co-located `*.module.css`
- **TypeScript strict mode** — no `any`, explicit return types on all exported functions
- **CSS modules only** — no CSS-in-JS; use design-system CSS variables from `gui/design-system`
- **No direct I/O** — always use the `FsAdapter` abstraction, never `window.fs` or `fs` directly
- **Serialisable props** — React Flow nodes receive only serialisable props; interactions through Zustand

## Figma Token Sync

Design tokens live in Figma. Pull the latest tokens into `resources/src/design-tokens.css`:

```bash
npm run sync:figma
```
