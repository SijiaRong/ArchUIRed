---
name: Schema
description: Canonical Zod-based type definitions, runtime validators, writing guidelines, and parsing rules for all ArchUI data structures, exportable as JSON Schema for editor tooling.
---

## Overview

This module is the single canonical source of truth for ArchUI's data model. It defines every field in every ArchUI data file as Zod schemas with runtime validation, and derives JSON Schema artifacts for use by editors and external tooling.

The CLI validator and the GUI both depend on this package rather than maintaining independent type definitions. This ensures that what the validator checks is exactly what the GUI reads and writes.

## Node Types

ArchUI modules are distinguished by their identity document filename. Each type carries specific structural semantics enforced by the CLI validator.

| Identity document | Node type | Typical `resources/` | Key constraints |
|---|---|---|---|
| `README.md` | Generic | Optional | None beyond base rules |
| `SKILL.md` | Skill / knowledge | No | None beyond base rules |
| `SPEC.md` | Implementation spec | Yes | Must contain exactly one HARNESS submodule; MEMORY submodule is optional (at most one) |
| `MEMORY.md` | Memory | No | Should link only to parent SPEC |
| `HARNESS.md` | Test harness | Yes | Must have exactly one link, pointing to parent SPEC |

When multiple identity documents coexist in the same folder, the validator uses this precedence order: `SPEC.md` > `HARNESS.md` > `MEMORY.md` > `SKILL.md` > `README.md`.

## Data Structures Defined

### Identity document frontmatter (`IdentityFrontmatter`)

All identity document types (`README.md`, `SKILL.md`, `SPEC.md`, `MEMORY.md`, `HARNESS.md`) share the same required frontmatter schema:

```typescript
{
  name: string        // REQUIRED: human-readable module title
  description: string // REQUIRED: one-sentence summary, always loaded into agent context
}
```

No other fields are permitted in any identity document frontmatter. Presence of any additional field (e.g., `uuid`, `submodules`) is a validation error.

#### Writing guidelines

**`name`** — Should be a concise, title-cased human-readable name. Does not need to match the folder name exactly, though it typically does. The name is used in GUI displays, CLI output, and as the heading for the module in rendered documentation.

**`description`** — Must be a single, declarative, self-contained sentence. The description field has special status in ArchUI: it is **always loaded into agent context by default**. When an LLM agent is working within an ArchUI project, it receives the description of every module without needing to open individual files. This means descriptions must be self-contained and informative at a glance.

Write descriptions as declarative statements of what the module *is* or *does*, not what it *contains*:

```yaml
# Good — declarative, informative out of context
description: Defines the YAML frontmatter schema for all ArchUI identity documents, including required fields and their semantics.

# Poor — vague, not self-contained
description: Contains schema information for identity documents.
```

### Prohibited frontmatter fields

The following fields must **not** appear in any identity document frontmatter. They belong exclusively in `.archui/index.yaml`.

| Field | Where it belongs |
|---|---|
| `uuid` | `.archui/index.yaml` |
| `submodules` | `.archui/index.yaml` |
| `links` | `.archui/index.yaml` |
| `layout` | `.archui/index.yaml` |

Placing any of these in identity document frontmatter is a validation error caught by `frontmatter-validator`.

### `.archui/index.yaml` (`IndexYaml`)

```typescript
{
  schema_version: number | string  // REQUIRED: current schema version
  uuid: string                     // REQUIRED: 8 lowercase hex characters
  submodules?: Record<string, string>  // folder-name → child uuid
  links?: ModuleLink[]
  layout?: Record<string, { x: number | string; y: number | string }>
}
```

### Cross-module link entry (`ModuleLink`)

```typescript
{
  uuid: string        // REQUIRED: target module UUID
  relation?: string   // OPTIONAL: see relation vocabulary
  description?: string
}
```

## Identity Document Body

Below the closing `---` of the frontmatter is free-form Markdown. ArchUI tooling does not parse or validate the body. It is intended for:

- **Human readers** — detailed explanations, examples, decision rationale, usage instructions.
- **LLM agents** — richer context beyond the one-sentence `description`. Agents can read the body when they need to understand a module in depth.

There is no required structure for the body. Headings like `## Overview`, `## Details`, `## Usage`, and `## Examples` are conventional but not enforced.

## Frontmatter Parsing Notes

- The frontmatter block must begin on line 1 of the file with `---`.
- The closing `---` must appear before any Markdown body content.
- YAML parsing uses the `failsafe` schema to avoid type coercion — all values are treated as strings. Quote values that look like numbers or scientific notation (e.g., UUIDs like `785e2416`).
- Fields not listed in the identity document schema are flagged as unexpected by the validator.

## Published Package

The schema is published as `@archui/schema`. Both `cli/` and `web-development-release/web-dev/` declare it as a dependency.

## JSON Schema Artifacts

Running `npm run build` in this module's `resources/` generates:

- `resources/dist/index-yaml.schema.json` — JSON Schema for `.archui/index.yaml`
- `resources/dist/identity-frontmatter.schema.json` — JSON Schema for identity document frontmatter

These can be wired into VS Code settings (`yaml.schemas`, `markdownlint`) to provide inline validation and autocompletion.

## See Also

- `core/filesystem-rules` — the full set of rules governing module folder layout
- `core/uuid-system` — how UUIDs are assigned and stored in `.archui/index.yaml`
- `core/link-system` — the link schema defined in `.archui/index.yaml`
