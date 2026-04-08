# Primary Module Card — Port Section Spec

## When Port Section Appears

The port section is appended below the description section (separated by a horizontal divider) when at least one of the focused module's direct submodules has an external link — that is, a link to or from a module outside the primary card.

An "external link" means:
- **Source port (▶)**: submodule S has a `links` entry whose target UUID resolves to a module outside the primary card (not the focused module itself and not a sibling submodule).
- **Target port (◀)**: a module outside the primary card has a `links` entry targeting S's UUID.

## Visual Layout

```
┌─────────────────────────────────────────────────┐
│  Module Name                                    │  header
│  a1b2c3d4                                       │  uuid
├─────────────────────────────────────────────────┤
│◀ Description text                          ▶│  description section (with module-level handles)
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  port divider: 1px dashed border-neutral
│◀ Sub-A                                          │  target port row (handle on left edge)
│                                    Sub-B (out) ▶│  source port row (handle on right edge)
│◀ Sub-C                            Sub-C (out) ▶│  sub with both in+out
└─────────────────────────────────────────────────┘
```

## Port Row Dimensions

```
port-row height: 24px
port-row padding: 0 12px
port-label font: 11px, token(text-tertiary)
port-indicator (◀ or ▶): 10px, positioned 4px inside card edge
```

## Handle Positioning

Each port row has a named handle centered vertically on the row:
- Target port handle: left edge, handle ID = `port-{submoduleUuid}-in`
- Source port handle: right edge, handle ID = `port-{submoduleUuid}-out`

Handle size: 8px circle (same as module-level handles on the description section).

## Source Port Color Assignment

Source port labels are color-coded by the external target module. Colors come from a fixed palette of 8:

```
[#3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #EC4899, #06B6D4, #84CC16]
```

Color is assigned by index of the external reference card on the canvas.
Target port labels use token(text-tertiary) — no color assignment.

## Maximum Port Rows

No hard cap, but UX guidance: if the primary card has more than 6 port rows, show the first 5 with a "+N more" collapsed indicator. Expanding shows all rows.
