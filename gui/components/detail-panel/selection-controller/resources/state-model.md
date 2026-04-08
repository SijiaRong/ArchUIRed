# Selection Controller — State Model Reference

## State Type

```typescript
selectedUuid: string | null
```

- `null` — no module is selected; canvas is in the idle state.
- `string` — exactly one module is selected, identified by its UUID. At most one module can be selected at any time; selecting a new module replaces the previous selection.

---

## Ways Selection Is Set

A single click on any of the following targets sets `selectedUuid` to the UUID of the corresponding module:

| Click Target | Result |
|---|---|
| Primary card body or header (not the drill-in button) | `selectedUuid` = that primary card's module UUID |
| External reference card | `selectedUuid` = the external module's UUID |
| Port row inside the primary card | `selectedUuid` = the submodule shown by that port row |
| Detail panel submodule row | `selectedUuid` = the clicked submodule's UUID (also triggers navigation) |
| Detail panel link row (Link to or Linked by) | `selectedUuid` = the linked/linking module's UUID (also triggers navigation) |

**Note on double-click**: Double-clicking a card triggers drill-in navigation and does **not** set `selectedUuid`. Selection is not changed by drill-in initiation; the canvas level transition itself will reset selection (see "Interaction with Navigation" below).

---

## Ways Selection Is Cleared

| Trigger | Mechanism |
|---------|-----------|
| Click on empty canvas space (no node/edge/handle under cursor) | React Flow `onPaneClick` fires → `selectedUuid = null` |
| Drill-in navigation (double-click on card) | Canvas level transition resets `selectedUuid = null` |
| Breadcrumb click (navigate up or to ancestor) | Canvas level transition resets `selectedUuid = null` |

There is no Escape key handler for deselection in the initial implementation (may be added in a future iteration).

---

## Effects Table

When `selectedUuid` changes, the following components respond:

| Component | Response |
|---|---|
| Primary card (`module-node/default`) | If its UUID matches `selectedUuid`: apply `module-node/selected` visual state (accent border + glow). If it does not match: render in default state. |
| External reference card | If its UUID matches `selectedUuid`: apply selected visual state (same border/glow pattern). |
| Port row (inside primary card) | If the port's submodule UUID matches `selectedUuid`: highlight that row (accent color on row background or left border). |
| Detail panel | `selectedUuid` non-null → panel slides in (`translateX(0)`) and displays the selected module's data. `selectedUuid` null → panel slides out (`translateX(100%)`). |

---

## Canvas Click Deselection Handler

The React Flow `onPaneClick` event fires when the user clicks on the canvas background with no node or edge under the cursor.

```typescript
onPaneClick={() => selectModule(null)}
```

React Flow guarantees that `onPaneClick` does **not** fire when clicking on a node or edge — the node's own `onClick` handler fires instead and stops propagation to the pane. This means `onPaneClick` is safe to use for deselection without additional guard conditions.

---

## Interaction with Navigation

Navigation events (drill-in, breadcrumb, or detail panel row click) interact with selection as follows:

1. **Navigate** to the new canvas level (update `navStack`).
2. **Set `selectedUuid`**:
   - If navigation was triggered by clicking a specific target (detail panel row click): set `selectedUuid` = target module UUID after the new level renders.
   - If navigation was triggered by drill-in or breadcrumb click (no specific module target): set `selectedUuid` = `null`.
3. **After the new level renders**: if a target UUID was specified, scroll/centre the selected module's card into the viewport.

| Navigation Trigger | Post-navigation `selectedUuid` |
|---|---|
| Drill-in (double-click card) | `null` |
| Breadcrumb click | `null` |
| Detail panel submodule row click | UUID of the clicked submodule |
| Detail panel link row click (Link to / Linked by) | UUID of the target/source module |

---

## Integration Pattern

The selection state should be accessible to both canvas components (which write it) and the detail panel (which reads it). Two valid patterns:

### React Context (lightweight, co-located)

```typescript
// Defined at the canvas screen level
const SelectionContext = React.createContext<{
  selectedUuid: string | null;
  selectModule: (uuid: string | null) => void;
}>({ selectedUuid: null, selectModule: () => {} });

// Canvas writes:
const { selectModule } = useContext(SelectionContext);
// Detail panel reads:
const { selectedUuid } = useContext(SelectionContext);
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

Both patterns expose the same contract: a readable `selectedUuid` value and a `selectModule(uuid | null)` setter. The detail panel reads `selectedUuid` to determine visibility and content; the canvas writes via `selectModule`.
