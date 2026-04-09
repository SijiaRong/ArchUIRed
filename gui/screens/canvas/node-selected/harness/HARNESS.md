---
name: "Canvas — Node Selected State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Canvas — Node Selected State module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the detail panel slide-in/out animation, Escape key deselection, atomic card re-selection, click-empty-canvas deselection, and panel navigation interactions.

---

## Playbook

### Group 1 — Detail Panel Slide-In and Slide-Out

[init]
- Open a module canvas. State is idle. Confirm detail panel is off-screen (translateX(320px)).

[action]
- Single-click the primary card.

[eval]
- State transitions to node-selected. The detail panel slides in from the right: translateX(320px → 0), 180ms ease-out. Canvas area narrows from 100vw to 100vw − 320px simultaneously (same 180ms ease-out). The primary card shows a 2px blue border and elevated glow shadow. `selectedUuid` is set to the primary card's module UUID.

[action]
- Press Escape.

[eval]
- State returns to idle. Panel slides out: translateX(0 → 320px), 120ms ease-in. Canvas area widens back to 100vw simultaneously (120ms ease-in). Selected card border and shadow return to default. `selectedUuid` is null.

[action]
- Single-click an external reference card.

[eval]
- State is node-selected again. Panel content shows the external module's name, UUID, description, submodules (if any), Link to, and Linked by sections. Panel is positioned fixed at the right edge.

[action]
- Click empty canvas area.

[eval]
- State returns to idle. Panel slides out (120ms ease-in). Canvas widens. `selectedUuid` is null.

[end]

---

### Group 2 — Escape Key Clears Selection

[init]
- Open a module canvas. Single-click a card to enter node-selected. Confirm `selectedUuid` is set.

[action]
- Press Escape.

[eval]
- State is idle. `selectedUuid` is null. Detail panel is hidden. Canvas is full width. No card shows the selected highlight treatment.

[action]
- Single-click a card again. Press Escape a second time.

[eval]
- First Escape: state returns to idle again (same result). Second Escape while in idle: no effect — Escape in idle with no selection fires back navigation only if `navStack.length > 1`. If at root, nothing happens.

[end]

---

### Group 3 — Atomic Card Re-Selection

[init]
- Open a module canvas with at least two external reference cards. Single-click one external card (Card A) to enter node-selected. Confirm detail panel shows Card A's data.

[action]
- Single-click a different card (Card B) without first deselecting.

[eval]
- State remains node-selected. `selectedUuid` atomically updates from Card A's UUID to Card B's UUID. Panel content updates in-place (no slide-out/in animation — content swaps instantly). Card A returns to default visual state. Card B now shows the selected highlight (2px blue border, glow shadow).

[action]
- Single-click Card A again.

[eval]
- `selectedUuid` updates back to Card A's UUID. Panel content swaps to Card A's data. Card B de-selects. All changes are instant (no animation on re-select).

[end]

---

### Group 4 — Panel Submodule Row Navigation

[init]
- Open a canvas and select a card (primary or external) that has at least one submodule. The detail panel shows a SUBMODULES section.

[action]
- Click one of the submodule rows in the panel (e.g. "Sub-Alpha").

[eval]
- Canvas navigates so the submodule's parent module is the primary card (or remains the primary card if it already is). The target submodule (Sub-Alpha) is selected: `selectedUuid` = Sub-Alpha's UUID. Detail panel updates to show Sub-Alpha's data. Breadcrumb may update if the navigation changed the canvas level.

[action]
- Confirm the canvas has centred the selected submodule card in the viewport (panned to ensure it is visible).

[eval]
- The selected submodule card is fully visible within the canvas area (not occluded by the detail panel).

[end]

---

### Group 5 — Drill From Node-Selected State

[init]
- Open a module canvas. Single-click the primary card to enter node-selected.

[action]
- Double-click a submodule port row on the primary card.

[eval]
- `selectedUuid` is cleared immediately (no lingering selection). Detail panel is dismissed (no slide animation — drill takes visual priority). Canvas entry animation begins: primary card expands and fades (0–100ms), new canvas fades in (100–200ms). After 200ms, state settles to idle at the new level. Breadcrumb appends the drilled module's crumb.

[end]
