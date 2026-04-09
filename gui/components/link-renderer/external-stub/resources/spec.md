# Link Renderer — External Reference Card Spec

## Current Model

External stubs have been **replaced by external reference cards** in the primary-card rendering model. Every cross-boundary link now materializes as a full external reference card on the canvas. This document describes the external reference card behavior as it replaces the previous external stub design.

> The `external-stub` module is retained as a reserved placeholder in case a future design iteration reintroduces a more compact stub representation.

## When an External Reference Card Appears

An external reference card is rendered for each unique external module that participates in a link on the current canvas:

- The focused module links to an external module (outgoing direct edge).
- An external module links to the focused module (incoming direct edge).
- A submodule of the focused module links to an external module (outgoing port edge).
- An external module links to a submodule of the focused module (incoming port edge).

One external reference card is created per unique external module UUID. If the same external module appears in multiple links (e.g., two different submodules both depend on it), only one external reference card is placed — and multiple edges connect to it.

## Data Shown

Each external reference card displays two pieces of information:

| Field | Source | Visual treatment |
|-------|--------|-----------------|
| Module name | `name` field from the external module's identity document | `text/primary`, 13px semi-bold |
| UUID | `uuid` field from the external module's `.archui/index.yaml` | `text/tertiary`, 10px mono, visually dimmed |

No description, no submodule list, and no handles beyond connection anchors.

## Draggability

External reference cards are **freely draggable** on the canvas. The user may reposition them to reduce edge crossings or improve readability. Position is persisted in the canvas layout state (not in `.archui/index.yaml`).

## Click Behaviors

| Interaction | Result |
|-------------|--------|
| Single click | Selects the card. Connected edges highlight. No navigation. |
| Double-click | Navigates to the external module — sets it as the new focused module and rebuilds the canvas around it. |
| Drag | Repositions the card on the canvas. Connected edges follow. |

## Connection Anchors

External reference cards expose two connection anchors used by the link renderer:

- **Left-edge anchor**: vertical center of the card left edge. Used as the target for outgoing edges from the current canvas.
- **Right-edge anchor**: vertical center of the card right edge. Used as the source for incoming edges to the current canvas.

These anchors are not labeled. They are not rendered when no edges connect to them.

## Design System

All visual properties use tokens from `gui/design-system/`. Key tokens:

- Background: `surface/default`
- Border: 1px `color/border/subtle`
- Corner radius: 8px
- Shadow: none (flat — contrast with the primary card which has elevation shadow)
- Name: `text/primary`, 13px semi-bold
- UUID: `text/tertiary`, 10px mono

Full token reference: `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`.
