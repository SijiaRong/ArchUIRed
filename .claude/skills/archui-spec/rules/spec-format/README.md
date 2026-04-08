# Spec File Format Rules

## Identity document format (README.md or SKILL.md)

The identity document is `README.md` if present, otherwise `SKILL.md`. Both use the same format. Only two frontmatter fields are allowed. Nothing else.

```yaml
---
name: Human-readable module name
description: One-sentence summary — always loaded into agent context, keep it sharp
---

Body markdown here.
```

**Forbidden in identity documents:** `uuid`, `submodules`, `links`, `layout`, any other structural field.

**Priority:** When both `README.md` and `SKILL.md` exist, `README.md` is the identity document. `SKILL.md` is supplementary (e.g. agent-workflow instructions) and is not parsed for module identity.

## Default names for whitelisted hidden folders

When creating an identity document for a root-level whitelisted hidden folder, use these default names:

| Folder | Default `name` |
|---|---|
| `.archui` | ArchUI Settings |
| `.claude` | Claude Settings |
| `.cursor` | Cursor Settings |
| `.github` | GitHub Settings |
| `.vscode` | VS Code Settings |
| `.aider` | Aider Settings |
| `.windsurf` | Windsurf Settings |

**Body rules:**
- Natural language prose only
- No code snippets, scripts, config files — those belong in `resources/`
- Keep it as short as the concept allows

## .archui/index.yaml format

```yaml
schema_version: 1
uuid: <stable 8-hex UUID — never change after creation>
submodules:             # folder-name → child uuid (must match actual subfolders)
  folder-name-a: <uuid-a>
  folder-name-b: <uuid-b>
links:
  - uuid: <target module UUID>
    relation: depends-on   # depends-on | implements | extends | references | related-to | custom
    description: Optional clarification
layout:                 # managed by GUI — do not edit manually
  <child-uuid>: {x: 0, y: 0}
```

**Rules:**
- `uuid` is permanent — never change it, even on rename/move
- `submodules` is a **map** (`folder-name → uuid`), not an array
- `submodules` keys must match actual subfolders on disk (bidirectional)
- `links` targets are UUIDs, not paths
- `layout` is set by the GUI canvas — never edit manually

## Module design principles

**Split aggressively.** If a module covers more than one coherent concept, split it. Prefer many small focused modules over fewer large ones. Every split must be reversible — child modules together must fully reconstruct the parent's meaning.

## .archui/ data handling

**Use the CLI to query or modify `.archui/` data; do not load raw `.archui/index.yaml` files into context.** Use `archui validate .` to check consistency. Read `.archui/index.yaml` only when you need the exact UUID of a specific module and cannot get it another way.
