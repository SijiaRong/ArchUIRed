# Canvas Idle — State Transitions

All transitions are out of the idle state. Guards are preconditions that must be true for the transition to fire; if a guard fails the interaction is silently ignored.

---

## Transition Table

| # | Trigger | Guard | Target State | Actions |
|---|---------|-------|--------------|---------|
| 1 | Single-click a primary card or external reference card | — | **node-selected** | Set `selectedUuid` to the clicked card's module UUID. Detail panel slides in from the right (translateX 320px → 0, 180ms ease-out). Canvas area width transitions to `100vw − 320px`. |
| 2 | Double-click a submodule port row on the primary card | Submodule exists in project index (`index.yaml` submodules map contains the port's UUID) | **drilled** | Push drilled module UUID onto `navStack`. Canvas entry animation begins (200ms): primary card expands to fill viewport (scale + fade-out), then new canvas fades in. Breadcrumb appends one crumb. |
| 3 | Double-click an external reference card | Module found in project index | **idle** (re-rendered at external module's parent canvas) | Update `navStack` to the path of the external module's parent. Canvas re-renders with the external module's parent as primary card. The external card is briefly highlighted (1s pulse animation) to orient the user. |
| 4 | Cmd+K → select a result from the command palette | Result module found in project index | **idle** (re-rendered at result's canvas) | Compute ancestry path from project root to the selected module. Set `navStack` to that path. Canvas re-renders with the module's parent as primary card; the target module's external card (or primary card if it is the focused module) is centred and highlighted. |
| 5 | Drag an external reference card (mouse-up / touch-end) | — | **idle** (no state change, same level) | Update the card's position in the in-memory layout. Write the new `{ x, y }` for the card's UUID to `.archui/layout.yaml` under the current parent canvas's UUID entry (single write on mouse-up, not per frame). |
| 6 | Press `Cmd/Ctrl+V` | Clipboard matches `archui://copy?...` | **idle** (current level, after paste completes) | Invoke file-sync layer to duplicate source module into current canvas level. Run clean --apply + validate. If errors, open agent streaming panel with repair prompt "修复当前项目的archui结构，使得其能通过archui validate测试，修复所有报错。". Re-render canvas with new node at default position. |
| 7 | Right-click empty canvas → "Paste Module" | Clipboard matches `archui://copy?...` | **idle** (same) | Same actions as transition 6. |

---

## Notes

- **Transition 1** is the primary entry to `node-selected`. The detail panel animation runs simultaneously with any canvas repositioning needed to keep the selected card visible.
- **Transition 2** requires the port row to be for a submodule that is registered in `index.yaml`. If the submodule folder exists on disk but is not in `index.yaml`, the double-click is silently ignored and no transition fires.
- **Transition 3** navigates sideways (no state name change) — the canvas re-renders at a new level. If the external module has no parent (it is a root-level module), `navStack` is set to `[projectRoot]`.
- **Transition 4** (Cmd+K) does not immediately change state: the command palette overlay opens first, then on result selection the navigation fires. If the user dismisses the palette without selecting (Escape), no transition occurs and state remains idle.
- **Transition 5** is a pure data write with no visual state change. The card's new position is reflected immediately in the render (no round-trip delay).
