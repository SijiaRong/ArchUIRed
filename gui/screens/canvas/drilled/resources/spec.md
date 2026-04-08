# Canvas Screen — Drilled State Spec

## Definition

The drilled state is entered when the user drills into a module (via double-clicking a submodule port row on the primary card, or navigating to a new module). It is the transient state during the canvas transition. It immediately settles into idle (or node-selected if a target card is auto-selected, e.g. after navigating via an external reference card).

## Entry Animation (200ms total)

```
Phase 1 (0–100ms):  Primary card expands to fill viewport.
                    transform: scale(1) → scale(fills viewport), opacity: 1 → 0.
Phase 2 (100–200ms): New canvas fades in with the new primary card and its external cards.
                    opacity: 0 → 1.
```

Implementation note: the "card expands to fill viewport" effect can be approximated with
a scale transform anchored at the card's center. The exact scale factor = viewport diagonal
/ card diagonal, clamped to a max of 8× to avoid GPU thrashing.

## Layout After Drill-In Settles

Identical to idle state layout (see idle/resources/spec.md). No structural difference.

The breadcrumb now shows one additional crumb for the newly drilled module.

## Canvas Initialization

When entering a new module canvas after drill-in:
1. Load external card positions from `.archui/layout.yaml` for this module.
2. If no positions exist: run auto-layout (columns, see idle spec).
3. Write auto-generated positions to `layout.yaml`.
4. Viewport is centered on the primary card (same as idle auto-fit behavior).

## Settling Rules

After the entry animation completes:
- If triggered by double-click on submodule port row: settle to **idle** (no card selected).
- If triggered by double-clicking an external reference card: settle to **node-selected** with the target card pre-selected and the detail panel open.

## Back Navigation

Pressing Escape/Backspace, clicking the back button, or clicking a parent breadcrumb crumb
returns to the parent canvas in idle state. The previously focused primary card is highlighted
briefly (pulse animation, 500ms) to help re-orient the user.

## Spacing Constants

All spacing constants for this state are inherited from the idle state spec.
No unique spacing constants apply to drilled state — it is structurally idle.
