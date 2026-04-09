# Canvas Drilled — State Transitions

All transitions are out of the drilled state (after the entry animation settles). The drilled label only persists during the 200ms entry animation; these transitions apply once the canvas has settled.

---

## Transition Table

| # | Trigger | Guard | Target State | Actions |
|---|---------|-------|--------------|---------|
| 1 | Press Escape or Backspace (no card selected, no text input focused) | `navStack.length > 1` (not already at root) | **drilled** at parent level (or **idle** if parent is root) | Pop one entry from `navStack`. Canvas re-renders at the parent level: parent module becomes primary card. Previously-focused module card (the one just drilled out of) receives a 500ms pulse highlight animation to re-orient the user. |
| 2 | Click a parent breadcrumb crumb | Crumb index < current navStack depth (crumb is a real ancestor, not the current level) | **drilled** at the crumb's level (or **idle** if crumb is root) | Truncate `navStack` to the crumb's depth (remove all entries deeper than the crumb). Canvas jumps immediately to that level (no slide animation — instant re-render). Breadcrumb updates to match new depth. |
| 3 | Single-click a card (primary or external reference card) | — | **node-selected** | Set `selectedUuid` to the clicked card's UUID. Detail panel slides in from the right (translateX 320px → 0, 180ms ease-out). Canvas area narrows to `100vw − 320px`. |
| 4 | Double-click a submodule port row on the primary card | Submodule exists in project index | **drilled** (one level deeper) | Push the submodule UUID onto `navStack`. Canvas entry animation begins (200ms). Breadcrumb appends one more crumb. |

---

## Notes

- **Transition 1 (Escape/Backspace):** The guard `navStack.length > 1` prevents popping below the root level. If the user is already at the root canvas (navStack contains only the project root), Escape and Backspace produce no transition — they are silently ignored.
- **Transition 2 (breadcrumb click):** Clicking the current (rightmost) crumb is a no-op — the guard fails because the crumb index equals the current depth. Only clicking a crumb that is an ancestor fires the transition.
- **Transition 3 (select):** Entering node-selected from drilled is identical to entering it from idle. All node-selected spec rules apply (detail panel, selected card highlight, panel interactions).
- **Transition 4 (deeper drill):** This transition fires from the settled idle sub-state of drilled. Each drill-in is identical in mechanism — `navStack` grows by one, the entry animation plays, and the cycle repeats.
- **Escape priority:** If a card is selected (`selectedUuid` is not null), Escape fires the node-selected → idle transition first (clears selection). Back navigation via Escape only fires when `selectedUuid` is null.
