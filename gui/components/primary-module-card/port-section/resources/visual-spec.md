# Primary Module Card Port Section — Visual Specification

```
├─────────────────────────────────────────────────┤  ← port divider (1px, border/subtle)
│◀ Sub-A (in)                                      │  ← target port row: icon + label + handle
│                                    Sub-B (out) ▶│  ← source port row: handle + label + icon (colored)
│                                    Sub-C (out) ▶│  ← second source row
└─────────────────────────────────────────────────┘
```

- **Port divider:** 1px horizontal rule separating description section from port section
- **Port row height:** 28px
- **Target port row:** `◀` icon at left edge; label text `text/secondary` 12px; target handle on left edge of primary card
- **Source port row:** label text colored with the assigned port color; `▶` icon at right edge; source handle on right edge of primary card
- **Port colors:** assigned per external reference card from a fixed 8-color palette

## Handle IDs

- Target handle: `port-{submoduleUuid}-in`
- Source handle: `port-{submoduleUuid}-out`

## Visibility Rules

A port row is added for submodule S when:
- **Source port (▶):** S has a `links` entry whose target UUID resolves to a module outside the primary card (an external reference card)
- **Target port (◀):** A module outside the primary card has a `links` entry targeting S's UUID

A submodule may have both a target and a source port row simultaneously.

Links where both endpoints are on the same primary card (sibling-to-sibling, parent-to-child) are not rendered — this is a rendering-only rule, the link data is valid.

## Figma Node

- **Component:** `Node/PrimaryModuleCard/Default` (with port section variant applied)
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
