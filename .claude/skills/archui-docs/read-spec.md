# Reading a SPEC.md

When you encounter a SPEC module, follow this order to build context efficiently.

## Minimum Read (always required)

1. **Read `SPEC.md`** — captures name, description, and body prose
2. **Read `.archui/index.yaml`** — captures uuid, submodules map, and links list

Both files together form the complete module context. Never act on a SPEC after reading only one of them.

## What to Extract

| Field | Source | What it tells you |
|---|---|---|
| `name` | SPEC.md frontmatter | Human-readable identifier |
| `description` | SPEC.md frontmatter | One-sentence purpose (always loaded in agent context) |
| `uuid` | index.yaml | Stable identity for cross-module links |
| `submodules` | index.yaml | Child modules (including HARNESS, optionally MEMORY) |
| `links` | index.yaml | Dependencies on other modules |
| `## Overview` | SPEC.md body | Why this module exists |
| `## Design` | SPEC.md body | How it is built |

## Reading the HARNESS

Every SPEC has exactly one HARNESS submodule. Read it when you need to:

- Understand what behaviors the SPEC is expected to exhibit
- Verify an implementation against the spec
- Write new tests

The HARNESS is in `<spec-folder>/<name>-harness/HARNESS.md`. See [read-module.md](read-module.md) for the general reading strategy.

## Reading the MEMORY (if present)

A MEMORY submodule records accumulated runtime observations. Read it when:

- You are debugging a known-flaky behavior
- You are revisiting a module after time has passed
- You want to avoid repeating past mistakes

The MEMORY is in `<spec-folder>/<name>-memory/MEMORY.md`.

## Skimming at Scale

When scanning many SPECs (e.g., finding which module owns a feature):

```
For each SPEC:
  → Read first 5 lines only (captures frontmatter — name + description)
  → Read .archui/index.yaml (captures structure)
  → Decide if the full body is needed
```

Never load all SPEC bodies at once. Start with descriptions, expand selectively.
