# Selection Controller — State Model Reference

## State Type

```typescript
selectedUuid: string | null
```

- `null` — no module is selected; canvas is in the idle state.
- `string` — exactly one module is selected, identified by its UUID. At most one module can be selected at any time; selecting a new module atomically replaces the previous selection — there is no intermediate state where two modules are simultaneously selected.

---

## State Machine Diagram

```
                      ┌─────────────────────────────────────────────────┐
                      │                                                 │
                      ▼                                                 │
               ┌─────────────┐    single-click card / port / ext-card  │
               │    IDLE     │──────────────────────────────────────────┤
               │ uuid = null │                                          │
               └─────────────┘                                          │
                      │                                                 │
                      │  single-click card / port / ext-card            │
                      ▼                                                 │
               ┌─────────────┐    click empty canvas (onPaneClick)     │
               │  SELECTED   │──────────────────────────────────────────┘
               │ uuid = <id> │
               └──────┬──────┘
                      │           click different card / port / ext-card
                      └──────────────────────────────────────────────────┐
                                                                         │
               ┌─────────────┐                                          │
               │  SELECTED   │◀─────────────────────────────────────────┘
               │ uuid = <id2>│   (atomic replace — no intermediate state)
               └──────┬──────┘
                      │
                      │  drill-in (double-click) or breadcrumb click
                      ▼
               ┌──────────────────┐
               │ NAVIGATING       │  (transient — resolves immediately)
               │ uuid = null      │──► canvas re-renders at new level
               └──────────────────┘   selectedUuid set per navigation type
                                       (see Navigation table below)
```

---

## State Table

| State | `selectedUuid` | Description |
|-------|---------------|-------------|
| IDLE | `null` | No module selected. Canvas pane is in rest state. Detail panel is hidden (translated off-screen). |
| SELECTED | `<uuid>` | Exactly one module is selected. Primary card with matching UUID shows accent border + glow. Detail panel is visible and populated. |

There is no `MULTI_SELECTED` state — the spec defines single-value selection only.

---

## Transitions

### Transitions into SELECTED

| Trigger | Source state | Guard | `selectedUuid` after | Side effects |
|---------|-------------|-------|---------------------|--------------|
| Single click on primary card body/header (not drill-in button) | IDLE or SELECTED | Click target is a node, not the drill-in `▷` button | UUID of clicked card | Primary card enters selected visual state; detail panel slides in or updates content. |
| Single click on external reference card | IDLE or SELECTED | None | UUID of the external module | External reference card enters selected visual state; detail panel slides in or updates. |
| Single click on port row | IDLE or SELECTED | Port row is visible inside a primary card | UUID of the submodule shown by the port | Port row highlights; detail panel slides in or updates. |
| Detail panel submodule row click | SELECTED | Panel is open | UUID of the clicked submodule | Navigation triggered (see Navigation table); after new level renders, UUID set, card centred. |
| Detail panel link row click (Link to or Linked by) | SELECTED | Panel is open | UUID of the linked / linking module | Navigation triggered; after new level renders, UUID set, card centred. |

### Transitions into IDLE

| Trigger | Source state | Guard | `selectedUuid` after | Side effects |
|---------|-------------|-------|---------------------|--------------|
| Click on empty canvas (`onPaneClick`) | SELECTED | React Flow guarantees no node/edge under cursor | `null` | Primary card returns to default visual state; detail panel slides out. |
| Drill-in navigation (double-click on card) | IDLE or SELECTED | Canvas level transition begins | `null` (reset during transition) | Canvas re-renders at new level; detail panel is hidden. |
| Breadcrumb click (navigate up or to ancestor) | IDLE or SELECTED | Canvas level transition begins | `null` (reset during transition) | Canvas re-renders at the breadcrumb target level; detail panel is hidden. |

---

## Guards and Non-Transitions

| User action | Does it change `selectedUuid`? | Reason |
|-------------|-------------------------------|--------|
| Double-click on a card | No — drill-in begins, then `null` is set during level transition | Double-click is captured as a navigation event, not a selection event. |
| Click the drill-in `▷` button | No — same as double-click | Button triggers drill-in; selection is incidental. |
| Hover over a card or row | No | Hover is a display-only interaction. |
| Canvas pan or zoom | No | React Flow pan/zoom does not emit `onPaneClick`. |
| Keyboard input (text editing, shortcuts) | No — unless Escape is added later | No Escape handler in the initial implementation. |

---

## Side Effects Table

When `selectedUuid` changes to a **non-null** value:

| Component | Effect |
|-----------|--------|
| Primary card (`module-node/default`) whose UUID matches | Apply `module-node/selected` CSS: accent border using `color/border/focus`, glow via box-shadow. All other primary cards revert to default style. |
| External reference card whose UUID matches | Apply selected visual state (same border/glow pattern). |
| Port row whose submodule UUID matches | Highlight that row (accent color on row background or left border stripe). |
| Detail panel | `selectedUuid` non-null → `translateX(0)`, transition `200ms ease-out`. Panel fetches and renders the selected module's data. |

When `selectedUuid` changes to **null**:

| Component | Effect |
|-----------|--------|
| All primary cards | Remove selected visual state; render in default state. |
| All external reference cards | Remove selected visual state. |
| All port rows | Remove highlight. |
| Detail panel | `translateX(100%)`, transition `200ms ease-in`. Panel remains mounted in DOM. |

---

## Canvas Click Deselection Handler

```typescript
// React Flow prop on the canvas component
onPaneClick={() => selectModule(null)}
```

React Flow guarantees that `onPaneClick` does **not** fire when clicking on a node, edge, or handle — the node's own `onClick` handler fires instead and stops propagation to the pane. No additional guard conditions are required in the `onPaneClick` handler.

---

## Interaction with Navigation

Navigation events always reset or set `selectedUuid` as part of the canvas level transition.

| Navigation trigger | When `selectedUuid` is set | Value |
|-------------------|--------------------------|-------|
| Drill-in (double-click card) | During level transition | `null` |
| Breadcrumb click | During level transition | `null` |
| Detail panel submodule row click | After new canvas level renders | UUID of the clicked submodule |
| Detail panel link row click (Link to) | After new canvas level renders | UUID of the target module |
| Detail panel link row click (Linked by) | After new canvas level renders | UUID of the linking module |

Step sequence for a detail panel row click that requires navigation:

1. Determine the target UUID from the row.
2. Look up the target module's parent path in the project index.
3. If the target is not visible at the current level: update `navStack` to end at the parent.
4. Wait for the canvas to re-render (next animation frame or React commit).
5. Set `selectedUuid` = target UUID.
6. Centre the target's card using `fitView({ nodes: [targetId] })` or `setCenter`.

If the target is already visible at the current level, skip steps 2–4.

---

## Integration Patterns

### React Context (preferred for co-located canvas state)

```typescript
// Defined at the canvas screen level
const SelectionContext = React.createContext<{
  selectedUuid: string | null;
  selectModule: (uuid: string | null) => void;
}>({ selectedUuid: null, selectModule: () => {} });

// Canvas writes:
const { selectModule } = useContext(SelectionContext);
// on card click: selectModule(moduleUuid)
// on pane click: selectModule(null)

// Detail panel reads:
const { selectedUuid } = useContext(SelectionContext);
// visible = selectedUuid !== null
```

### Zustand Store (if global state management is already in use)

```typescript
interface SelectionStore {
  selectedUuid: string | null;
  selectModule: (uuid: string | null) => void;
}

const useSelectionStore = create<SelectionStore>((set) => ({
  selectedUuid: null,
  selectModule: (uuid) => set({ selectedUuid: uuid }),
}));
```

Both patterns expose the same contract: a readable `selectedUuid` value and a `selectModule(uuid | null)` setter. The implementation choice does not affect the selection model described here.
