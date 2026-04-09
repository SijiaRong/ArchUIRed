# Canvas Node-Selected — State Transitions

All transitions are out of the node-selected state. Guards are preconditions; if a guard fails, the interaction is ignored.

---

## Transition Table

| # | Trigger | Guard | Target State | Actions |
|---|---------|-------|--------------|---------|
| 1 | Click empty canvas area (no card hit) | — | **idle** | Clear `selectedUuid` (set to null). Detail panel slides out (translateX 0 → 320px, 120ms ease-in). Canvas area widens back to 100vw simultaneously. |
| 2 | Press Escape | — | **idle** | Same as transition 1: clear `selectedUuid`, slide out panel, canvas widens. |
| 3 | Single-click a different card | — | **node-selected** (same state, new selection) | Atomically replace `selectedUuid` with the new card's UUID. Panel content swaps instantly (no slide-out/in animation — content updates in place). Canvas may pan to keep the new selection visible. |
| 4 | Double-click a submodule port row | Submodule exists in project index | **drilled** | Clear `selectedUuid`. Close detail panel (instant — no slide animation during drill). Push drilled module UUID onto `navStack`. Canvas entry animation begins (200ms). Breadcrumb appends one crumb. |
| 5 | Click submodule row in the detail panel | Submodule found in project index | **idle** (at the submodule's parent canvas) | Navigate so the submodule's parent becomes the primary card. Set `selectedUuid` to the submodule's UUID (target card is pre-selected and centred). Detail panel updates to show the submodule's data. Net result: arrives in node-selected at the new level with the target card selected. |
| 6 | Click a Link to / Linked by row in the detail panel | Target module found in project index | **idle** (at the target's canvas level) | Navigate to the canvas where the target module is visible. If the target is an external reference card at that level, select it (`selectedUuid` = target UUID). If the target is the primary card, select it. Breadcrumb updates. |
| 7 | Press `Cmd/Ctrl+C` | `selectedUuid` is non-null | **node-selected** (no state change) | Write `archui://copy?path=<abs-path>&uuid=<8hex>` to the system clipboard. Show toast "Copied to clipboard". |
| 8 | Press `Cmd/Ctrl+V` | Clipboard content matches `archui://copy?...` | **idle** (current level, after paste completes) | Invoke file-sync layer to duplicate source module folder into current canvas level directory. Run clean + validate. If errors occur, open agent streaming panel with prompt "修复当前项目的archui结构，使得其能通过archui validate测试，修复所有报错。". Re-render canvas with new node. |

---

## Notes

- **Transition 3 (re-select):** Panel content updates in-place — the title, UUID, description, submodule list, and link sections all update for the new module. There is no slide-out/in animation for panel content on a same-state re-select.
- **Transition 4 (drill):** The panel is dismissed without animation when drilling in — the drill entry animation takes precedence visually. The 200ms drill animation plays immediately.
- **Transition 5 (panel submodule row):** After navigation, the canvas arrives at idle for the new level, then immediately selects the target card (enters node-selected). From the user's perspective this feels instantaneous — they click a submodule name and the canvas navigates to it already selected.
- **Transitions 1 and 2** are the two primary deselection paths. Both have identical outcomes. The Escape key is handled at the canvas root level (not inside the panel) so it fires even when focus is outside the panel.
