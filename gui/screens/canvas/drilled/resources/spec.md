# Canvas Screen — Drilled State Spec

## Definition

The drilled state is the canvas state immediately after a drill-in action. Structurally the canvas is identical to idle — same layout, same card types, same coordinate system — except:

1. The drilled-into module is now the **primary card**.
2. The **breadcrumb trail** has grown by one crumb (the drilled module's name).
3. No card is pre-selected (settled to idle after entry animation).
4. The canvas for the new level is initialized from `layout.yaml` (or auto-layout if no saved positions exist).

Drilled is a transient label: after the 200ms entry animation completes the state settles to idle (or to node-selected if a target card was auto-selected by the navigation action).

---

## Entry Animation (200ms total)

```
Phase 1 (0 – 100ms)
  The previously selected (drilled) card expands to fill the viewport.
  transform: scale(1.0) → scale(K)    where K = viewport_diagonal / card_diagonal,
                                       clamped to a maximum of 8× to avoid GPU thrashing.
  opacity:   1.0 → 0.0
  transform-origin: card centre

Phase 2 (100 – 200ms)
  The new canvas fades in at the new module level.
  opacity:   0.0 → 1.0
  New primary card, external cards, and edges all appear together.
```

The breadcrumb crumb for the new level is appended at the start of Phase 2 (as the new canvas fades in).

---

## Canvas Initialization at New Level

When Phase 2 begins:

1. Look up the drilled module UUID as a key in `.archui/layout.yaml`.
2. **If an entry exists:** restore saved node positions and viewport (`zoom`, `pan`).
3. **If no entry exists:** run the auto-layout algorithm (see `idle/resources/spec.md` — primary card centred, incoming column left, outgoing column right, 200px gap, 40px vertical spacing). Write the computed positions to `layout.yaml`. Viewport resets to zoom 1.0, pan centred on primary card.
4. **Partial entry:** If some external card UUIDs are missing from `layout.yaml.nodes`, use auto-layout for those cards only; keep saved positions for all known cards.

---

## Entry Highlight (Re-orientation Flash)

When drilling in from a selected card (transition from node-selected → drilled), the previously focused module becomes an external reference card at the new level if it is linked from the new primary card. To help re-orient the user, this card displays a brief highlight flash:

- **Animation:** Card border and background pulse to `color/border/focus` (blue) and `color/interactive/selected-bg`, then fade back to default values.
- **Duration:** 1 second total — 200ms ramp in, 600ms hold, 200ms fade out.
- **Trigger:** Fires once, immediately when the Phase 2 fade-in completes.
- **Condition:** Only fires if the previously-focused module is visible as a card at the new level. If it is not visible (not linked from the new primary), no flash occurs.

---

## Back Navigation

The following inputs return to the parent canvas level:

| Input | Condition | Behaviour |
|---|---|---|
| Escape key | No card currently selected | Pop `navStack`. Canvas re-renders at the parent level. Previously-focused module card pulse animation (500ms) to orient user. |
| Backspace key | No card currently selected, no text input focused | Same as Escape. |
| Click back arrow (`‹`) in topbar | — | Same as Escape. |
| Click a parent breadcrumb crumb | Crumb level < current depth | Truncate `navStack` to the crumb's depth. Canvas jumps to that level immediately (no animation). |

If a card is currently selected when Escape is pressed, the first Escape press clears the selection (transitions to idle at the current drilled level). A second Escape then fires back navigation.

---

## Layout After Settling

After the entry animation:

- Canvas is structurally identical to idle. All idle spec rules apply (zoom range, pan behavior, auto-layout algorithm, interaction table).
- Breadcrumb shows the full ancestry path to the current primary module.
- `navStack` contains all ancestors from the project root to the current primary module UUID.

---

## Spacing Constants

All spacing constants are inherited from the idle state spec. The drilled state introduces no new spacing values.

| Constant | Value | Source |
|---|---|---|
| Primary card width | 240px | `dimension/node-width` |
| External card column gap | 200px | idle spec |
| External card vertical spacing | 40px | idle spec |
| Canvas logical size | 4096 × 4096 | idle spec |
| Default zoom | 1.0× | idle spec |
