---
name: "Canvas — Drilled State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Canvas — Drilled State module."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

This playbook verifies the drill-in canvas re-render, breadcrumb trail updates, back navigation via Escape key and breadcrumb click, and the entry highlight flash animation for the previously-focused module.

---

## Playbook

### Group 1 — Drill-In Re-Renders Canvas

[init]
- Open a module canvas with at least one submodule that has its own external links. State is idle. Note the current primary card (Module A) and `navStack`.

[action]
- Double-click a submodule port row (e.g. "Sub-Alpha" port row) on the primary card.

[eval]
- Canvas entry animation plays: Module A's card expands to fill the viewport (scale(K) where K ≤ 8, opacity 1 → 0, 0–100ms). New canvas fades in (opacity 0 → 1, 100–200ms).
- After 200ms: Sub-Alpha is now the primary card. Its own submodule port rows are shown. External reference cards for Sub-Alpha's links are placed around it. Module A may appear as an external reference card if Sub-Alpha links back to it.
- `navStack` now contains one additional entry (Sub-Alpha's UUID appended). State is idle at the new level.

[end]

---

### Group 2 — Breadcrumb Trail Updates

[init]
- Start at the root canvas. Breadcrumb shows: `ArchUI`.

[action]
- Drill into a level-1 module (e.g. "GUI"). Breadcrumb should now show `ArchUI › GUI`.
- Drill into a level-2 module (e.g. "Canvas"). Breadcrumb should now show `ArchUI › GUI › Canvas`.

[eval]
- After each drill, the breadcrumb gains exactly one crumb on the right. The rightmost crumb is always the current primary module name, rendered in `color/text/primary` with `font-weight: 500`, non-interactive. All ancestor crumbs are interactive (clickable, `color/text/link`).

[action]
- Drill into a third level. Observe overflow behavior if the breadcrumb is too wide to fit.

[eval]
- If the breadcrumb overflows: root crumb (ArchUI) and current crumb remain visible. Intermediate crumbs collapse into a `…` button. Clicking `…` reveals a dropdown listing the hidden crumbs in order (top = closest to root).

[end]

---

### Group 3 — Back Navigation via Escape Key

[init]
- Drill into two levels (navStack length = 3: root, level-1, level-2). State is idle at level-2. No card is selected.

[action]
- Press Escape.

[eval]
- Canvas navigates back one level (level-1). `navStack` pops the last entry. The previously drilled module (level-2) appears as an external reference card (if it is linked from the level-1 primary) and receives a 500ms pulse highlight animation. Breadcrumb removes the rightmost crumb.

[action]
- Press Escape again.

[eval]
- Canvas navigates back to root (navStack length = 1). Same pulse highlight on the level-1 module card. Breadcrumb shows root only.

[action]
- Press Escape a third time (at root level, navStack.length = 1).

[eval]
- No navigation occurs. Guard `navStack.length > 1` fails. Escape is silently ignored.

[end]

---

### Group 4 — Back Navigation via Breadcrumb Crumb Click

[init]
- Drill three levels deep: ArchUI › GUI › Canvas › Sub-Alpha. Breadcrumb shows all four crumbs. State is idle at Sub-Alpha level.

[action]
- Click the "GUI" breadcrumb crumb (two levels above current).

[eval]
- Canvas immediately jumps to the GUI level (no animation — instant re-render). `navStack` is truncated to depth 2 (ArchUI, GUI). Breadcrumb now shows `ArchUI › GUI`. Canvas shows GUI as the primary card with its external reference cards.

[action]
- Click the "GUI" crumb again (now the current/rightmost crumb).

[eval]
- No navigation occurs. Clicking the current crumb is a no-op (guard fails: crumb depth == current depth).

[end]

---

### Group 5 — Entry Highlight Flash Animation

[init]
- Open a module canvas where the primary card (Module A) has a submodule (Sub-Alpha) that links back to Module A or to a sibling. Drill into Sub-Alpha (entering drilled state).

[action]
- Observe the canvas for 1.5 seconds after the drill-in animation completes.

[eval]
- After the 200ms drill animation, the Phase 2 fade-in completes. If Module A is visible as an external reference card at the Sub-Alpha level, it immediately plays the entry flash: border and background pulse to `color/border/focus` (blue tint), hold for ~600ms, then fade back to default over 200ms. Total duration: 1 second.
- If Module A is NOT visible as an external reference card at the Sub-Alpha level (no link from Sub-Alpha to Module A), no flash animation occurs.

[action]
- Drill into another submodule that does not link back to its parent.

[eval]
- No entry flash animation plays. Canvas settles to idle without any card highlight.

[end]
