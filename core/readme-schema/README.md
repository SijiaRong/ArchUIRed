---
name: README Schema
description: "Defines the YAML frontmatter schema for ArchUI module README.md files: only name and description are permitted here; all structural metadata lives in .archui/index.yaml."
---

## Overview

Every module in an ArchUI project is represented by a `README.md` file with YAML frontmatter. The frontmatter contains only human-readable identity fields. All structural metadata — UUID, submodule declarations, cross-module links, and canvas layout — lives in the module's `.archui/index.yaml`, not in the README.

This separation means README.md is stable and human-friendly, while `.archui/index.yaml` is the machine-maintained structural layer.

## Full Schema

```yaml
---
name: <string>          # REQUIRED — human-readable module name
description: <string>   # REQUIRED — one sentence, always loaded into agent context
---
```

Only `name` and `description` belong in README.md frontmatter. Any other field (`uuid`, `submodules`, `links`, `layout`) is a validation error.

## Required Fields

### `name`

**Type:** string
**Constraints:** Should be a concise, title-cased human-readable name. Does not need to match the folder name exactly, though it typically does.

The name is used in GUI displays, CLI output, and as the heading for the module in rendered documentation.

```yaml
name: README Schema
```

### `description`

**Type:** string (one sentence)
**Constraints:** Should be a single sentence. Should stand alone — readable without any surrounding context.

The description field has special status in ArchUI: it is **always loaded into agent context by default**. When an LLM agent is working within an ArchUI project, it receives the description of every module without needing to open individual files. This means descriptions must be self-contained and informative at a glance.

Write descriptions as declarative statements of what the module *is* or *does*, not what it *contains*:

```yaml
# Good — declarative, informative out of context
description: Defines the YAML frontmatter schema for all ArchUI module README.md files, including required fields and their semantics.

# Poor — vague, not self-contained
description: Contains schema information for README files.
```

## What Does NOT Belong in README.md

| Field | Where it lives |
|---|---|
| `uuid` | `.archui/index.yaml` |
| `submodules` | `.archui/index.yaml` |
| `links` | `.archui/index.yaml` |
| `layout` | `.archui/index.yaml` |

Placing any of these in README.md frontmatter is a validation error caught by `frontmatter-validator`.

## The README.md Body

Below the closing `---` of the frontmatter is free-form Markdown. ArchUI tooling does not parse or validate the body. It is intended for:

- **Human readers** — detailed explanations, examples, decision rationale, usage instructions.
- **LLM agents** — richer context beyond the one-sentence `description`. Agents can read the body when they need to understand a module in depth.

There is no required structure for the body. Headings like `## Overview`, `## Details`, `## Usage`, and `## Examples` are conventional but not enforced.

## Frontmatter Parsing Notes

- The frontmatter block must begin on line 1 of the file with `---`.
- The closing `---` must appear before any Markdown body content.
- YAML parsing uses the `failsafe` schema to avoid type coercion — all values are treated as strings. Quote values that look like numbers or scientific notation (e.g., UUIDs like `785e2416`).
- Fields not listed in this schema are flagged as unexpected by the validator.

## See Also

- `core/filesystem-rules` — the full set of rules governing module folder layout
- `core/uuid-system` — how UUIDs are assigned and stored in `.archui/index.yaml`
- `core/link-system` — the link schema defined in `.archui/index.yaml`
