---
name: Link Visibility Rules
description: "Defines which links are rendered on each canvas level — module-level direct edges from the description section handles, submodule port edges from port rows, the same-card rendering rule, and handle visibility conditions."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Scope Rule

Each canvas level renders exactly one primary card (the focused module). Link visibility is determined by two independent scans: one for the focused module's own links (module-level), and one for each submodule's links (submodule-level).

## Module-Level Resolution (focused module's own `links` array)

The focused module's own `links` array is scanned. For each entry:

1. **External link** — target UUID resolves to a module outside the primary card (not the focused module itself and not one of its direct submodules). An external reference card is created for the target. A **direct edge** is drawn from the module source handle (▶, right edge of description section) to the external card.
2. **Self-submodule link** — target UUID matches one of the focused module's own direct submodules. Both endpoints would be on the primary card → **not drawn** at this level (same-card rendering rule). The link data is valid; it becomes visible when drilled in.
3. **Unresolvable** — target UUID is not found in the index. The external reference card shows a warning icon and "Unknown module" label.

Reverse lookup: for every module in the project that is NOT on the primary card, if its `links` array targets the focused module's UUID → create an external reference card and draw a direct edge from the external card to the module target handle (◀, left edge of description section).

## Submodule-Level Resolution (per submodule's `links` array)

For each direct submodule of the focused module, each entry in its `links` array is resolved:

1. **External link** — target UUID resolves to a module outside the primary card. An external reference card is created for the target. A **port edge** is drawn from the submodule's source port (▶) to the external card.
2. **Sibling link** — target UUID matches another direct submodule of the same parent. Both endpoints would be on the primary card → **not drawn** at this level (same-card rendering rule). The link data is valid; it becomes visible when drilled in.
3. **Parent link** — target UUID matches the focused module itself. Both endpoints would be on the primary card → **not drawn** at this level (same-card rendering rule). The link data is valid; it becomes visible when drilled in.
4. **Unresolvable** — target UUID is not found in the index. Warning-state external reference card.

Reverse lookup: for every module in the project that is NOT on the primary card, if its `links` array targets a direct submodule → create an external reference card and draw a port edge from the external card to the submodule's target port (◀).

## Same-Card Rendering Rule

When both endpoints of a link resolve to handles on the same card, the link is **not drawn** at this canvas level. This is purely a rendering decision — the underlying link data is fully valid. Submodules may freely link to siblings, to their parent, or vice versa; such links are normal and expected in the data model. Specifically, a link is not drawn at this level if:

- Source is the focused module and target is one of its direct submodules (both on primary card).
- Source is a submodule and target is another submodule of the same parent (both on primary card).
- Source is a submodule and target is the focused module itself (both on primary card).

These links become visible as cross-card edges when the user drills into the appropriate module.

## Handle Visibility Conditions

- **Module target handle (◀, description section left)** — shown only when at least one incoming direct edge exists (an external module links to the focused module).
- **Module source handle (▶, description section right)** — shown only when at least one outgoing direct edge exists (the focused module links to an external module).
- **Submodule target port (◀)** — shown only when at least one incoming port edge exists for that submodule.
- **Submodule source port (▶)** — shown only when at least one outgoing port edge exists for that submodule.

If no handles exist in a direction, the description section or port row is rendered without handles on that side.

## What Appears in the Port Section

A submodule appears in the primary card's port section if and only if it has at least one outgoing external link OR at least one incoming external link (where "external" means the other end is NOT on the same primary card).

## What Is NOT Rendered

- **Same-card links** — any link where both endpoints resolve to handles on the same primary card (module-to-submodule, submodule-to-sibling, submodule-to-parent). These links are valid data — they are simply not drawn at this canvas level.
- **Deep submodule links** — links from grandchildren or deeper descendants are not surfaced. Visible only after drilling into the appropriate parent.
- **External-to-external links** — links between two external reference cards are never rendered. Each external card exists only to show its relationship to the primary card.

## Non-Overlap Constraint

All cards on the canvas — the primary card and all external reference cards — must be placed without overlapping.

## Design Rationale

Module-level handles on the description section make the focused module's own external dependencies visible without conflating them with submodule connections. The same-card rendering rule ensures every drawn edge visually crosses card boundaries, keeping the canvas clean and semantically clear. Links that are not drawn (because both ends are on the same card) are still valid in the data model — drilling in reveals them as cross-card edges at the next level.
