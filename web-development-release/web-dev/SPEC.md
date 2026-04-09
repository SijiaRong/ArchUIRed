---
name: Web Dev
description: "Defines the React web app architecture and local development workflow: canvas component structure, filesystem adapter selection, coding conventions that distributed-generated source files must follow, and Vite dev server setup."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

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
├── Topbar (48px — logo, breadcrumb, toolbar buttons, theme toggle)
├── ReactFlow (controlled, fills remaining height)
│   ├── ModuleNode (custom node — each child of currentModule)
│   │   ├── Header (36px: status dot, name, drill-in icon)
│   │   ├── UUID row
│   │   ├── Body (52px: description text)
│   │   └── Port rows (28px each — one per outgoing link; label = target module name)
│   └── LinkEdge (custom edge — relation-based color, dash, arrowhead, label pill)
│       └── Only drawn between sibling nodes; cross-level links omitted from canvas
├── DetailPanel (320px — slides in from right when a card is selected)
│   ├── Header: module name (port-palette accent), UUID, description
│   ├── SUBMODULES section (child's own submodules with names)
│   ├── LINK TO section (all outgoing links — sibling and cross-level)
│   └── LINKED BY section (sibling modules that link to this one)
└── StatusBar (36px — idle/selected badge + interaction hints)
```

**Canvas data model:** Each child of `currentModule` renders as one `ModuleNode`. Edges are built from each child's own `links` array but only drawn when the target is also a sibling (another child of `currentModule`). Cross-hierarchy links — where the target is outside the current level — are silently omitted from the React Flow edge list. They remain fully accessible in the detail panel.

**No external stub cards:** There are no small stub cards for cross-level links. The canvas only shows sibling module cards.

**Port row labels:** Each port row shows the **name** of the target module (resolved from the sibling list; UUID fallback for cross-level links).

**Detail panel:** Appears when a node is single-clicked (selected). Shows the selected module's name, UUID, description, submodule list, outgoing links, and incoming links from siblings. Slides in/out via CSS transform (200ms). Closes when clicking empty canvas space or navigating.

**Detail panel — SUBMODULES row expand behavior:**
- Rows where the submodule has a `description` show a `›` arrow on the left. Clicking the row toggles expansion: the arrow rotates 90° (pointing down) and the description text is revealed below the row name.
- Rows where the submodule has no description show no arrow and are non-interactive (no pointer cursor). The row name is indented by the arrow width so all names remain left-aligned across both row types.

**Drill-down navigation:** double-clicking a node navigates into it, making it the new `currentModule`. Selection is cleared on navigation. A breadcrumb trail in the topbar allows navigating back up.

**State management:** canvas state lives in a Zustand store (`store/canvas.ts`). Module data is loaded via `loadProject.ts`, which tries `SPEC.md → HARNESS.md → MEMORY.md → SKILL.md → README.md` for identity documents, and loads one level of grandchildren (for the detail panel submodule list) per level.

**Overlap detection:** on every module load, if the saved layout positions cause any two cards to overlap (AABB check using actual card height = 116 + n_ports × 28 px), the layout is discarded and re-computed, then saved back to `.archui/layout.yaml`.

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

## Typography Contract

The shared SPA uses a four-lane typography model so the brand wordmark can carry more personality while structural headings stay clean and sans-serif:

- `--font-wordmark` - the `ArchUI` brand wordmark. This lane is self-hosted and maps to `Syne`.
- `--font-heading-sans` - system headlines such as landing hero text, canvas intro titles, node names, and detail-panel primary headings. This lane is self-hosted and maps to `Sora`.
- `--font-sans` - ordinary UI English. This lane is self-hosted and maps to `Lexend`.
- `--font-mono` - UUIDs and identifier-like text. This lane is unchanged.

`--font-display` remains as an alias to `--font-heading-sans` for compatibility, but new component work should choose between `--font-wordmark`, `--font-heading-sans`, `--font-sans`, and `--font-mono` explicitly. Do not hardcode `Segoe UI`, `Aptos`, or other generic system UI fonts in component CSS.

## Figma Token Sync

Design tokens live in Figma, but the web app never hand-edits token values. The committed Figma export snapshot is `gui/design-system/foundations/web-token-export.yaml`, and `sync:figma` renders it into `resources/src/design-tokens.generated.css`:

```bash
npm run sync:figma
```

## Design Doc Sync Contract

Screen copy, panel labels, and default workspace layout constants also come from document-layer exports, not from React components. The committed sources are:

- `gui/screens/landing/web-copy.yaml`
- `gui/screens/canvas/web-copy.yaml`
- `gui/components/detail-panel/web-copy.yaml`
- `gui/components/primary-module-card/web-copy.yaml`
- `gui/components/link-renderer/web-semantics.yaml`
- `gui/design-system/visual-orchestration/web-layout.yaml`
- `gui/design-system/visual-orchestration/web-brand.yaml`

Generate their web-facing artifacts with:

```bash
npm run sync:design-docs
```

The shared SPA consumes only:

- `resources/src/design-tokens.generated.css`
- `resources/src/generated/workspace-content.generated.ts`
- `resources/src/generated/workspace-layout.generated.ts`
- `resources/src/generated/brand-assets.generated.ts`

Use `npm run verify:design-sync` in CI or before review to ensure the generated artifacts match the checked-in document sources. Component code may keep runtime algorithms, navigation wiring, and data loading logic, but it must not hardcode visual token values, workspace copy, or default orchestration constants.

Brand assets follow the same rule. The landing/header `A` mark is defined in `web-brand.yaml`, previewed in Figma, emitted as a repo-owned SVG asset, and surfaced to React through generated brand metadata and asset registries. Components must not hardcode ad hoc logo paths or redraw the mark inline.

## Visual Orchestration Contract

The web frontend does not translate reference UIs directly into React components. Any redesign driven by browser inspection, Playwright capture, or external inspiration must first be normalized in `gui/design-system/visual-orchestration`, then reflected in Figma, and only then implemented in the shared SPA.

This contract is especially important for Web and Electron because they share the same presentation layer. Canvas density, panel hierarchy, node emphasis, and edge readability changes should be implemented once in the shared React source and allowed to flow into Electron automatically unless the redesign touches native-shell behavior.
