# Frontmatter Rules

All identity documents (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, `README.md`) use the same frontmatter schema — **two fields only**.

## Schema

```yaml
---
name: Human-Readable Module Name
description: One declarative sentence describing the module's purpose.
---
```

**Forbidden fields:** `uuid`, `submodules`, `links`, `layout`, and any other structural field.
Structural data belongs exclusively in `.archui/index.yaml`.

## `description` Field Rules

The `description` is always loaded into agent context. It must be:

- **One sentence** — multi-sentence descriptions trigger a validation warning
- **Declarative** — states what the module *does*, not what it *contains*
- **Self-contained** — understandable without reading the body
- **Present tense** — "Validates filesystem structure" not "Will validate..."

### Examples

| Quality | Example |
|---|---|
| Bad | "This is the CLI module." |
| Bad | "Contains index.ts, validate.ts, and init.ts." |
| Bad | "Validates structure. Also reports errors." *(two sentences)* |
| Good | "Validates ArchUI filesystem structure and reports conformance errors after agent or human edits." |

## Why No Other Fields

Mixing structural data into identity documents causes two problems:

1. **Validator failures** — The CLI rejects any frontmatter field other than `name` and `description`
2. **Context pollution** — Structural fields in the body confuse agents that load identity documents as prose context

If you find a field like `uuid:` or `links:` in a frontmatter block, remove it and move the data to `.archui/index.yaml`.
