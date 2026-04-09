---
name: Canvas Screen
description: "The main workspace screen — an infinite canvas that renders one focused module as a large primary card containing its submodule ports, surrounded by small external reference cards and directional link edges; modeled as a state machine with three named states."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

The canvas screen is the primary workspace. It renders a zoomable, pannable infinite canvas with a single rendering level that contains exactly three element types:

1. **One primary card** — the currently focused module, rendered as a large card containing its name, UUID, description section (with module-level connection handles when the module itself has external links), and a port section listing submodules that have external links (with source/target port handles).
2. **Small external reference cards** — modules that are linked to or from the focused module or its submodules but do not belong to the current hierarchy. Each shows its full name and a dimmed UUID.
3. **Directional link edges** — in two categories: direct edges between the primary card's module-level handles and external cards, and port edges between submodule port handles and external cards. All edges have clear arrowheads pointing toward the passive (target) end.

A link's two endpoints must always connect two different cards — when both ends resolve to the same card, the link is not drawn at this level (the link data remains valid and becomes visible after drilling in). Cards must never overlap regardless of type.

The screen is modeled as a state machine with three states: idle (canvas visible, no selection), node-selected (detail panel slides in from the right), and drilled (canvas re-renders at the drilled-into module's level). State transitions are driven by node clicks, double-clicks, and breadcrumb navigation. Screen layout diagrams and the full state transition diagram are in `resources/layout-and-states.md`. The committed web copy export is `web-copy.yaml`; default canvas orchestration values are exported separately from `gui/design-system/visual-orchestration/web-layout.yaml`.
