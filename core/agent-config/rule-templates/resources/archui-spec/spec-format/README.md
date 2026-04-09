# Module Structure Rules

This document covers **structural rules**: module folder layout, node type definitions, and `.archui/index.yaml` format.

For identity document prose format (frontmatter schema, description rules, body writing guidelines), see the `archui-docs` skill → `frontmatter-rules.md`.

## Node types and identity documents

Every module folder contains exactly one typed identity document. The filename determines the node type:

| File | Node type | Structural constraints |
|---|---|---|
| `SPEC.md` | Spec | Must have exactly one HARNESS as a **direct** submodule; MEMORY submodule is optional (at most one). |
| `HARNESS.md` | Harness | Exactly one link → direct parent SPEC. No other links permitted. |
| `MEMORY.md` | Memory | Links only to parent SPEC. Additional outbound links are a validation **warning** (not an error). |
| `SKILL.md` | Skill | No `resources/` typically. No structural constraints beyond standard module rules. |
| `README.md` | Generic | Untyped fallback when no stronger type applies. No additional constraints. |

**Precedence when multiple files exist:** `SPEC.md` > `HARNESS.md` > `MEMORY.md` > `SKILL.md` > `README.md`. Only the highest-priority file acts as the identity document.

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

## .archui/index.yaml format

```yaml
schema_version: 1          # REQUIRED
uuid: <stable 8-hex UUID — never change after creation>   # REQUIRED
submodules:                # folder-name → child uuid (must match actual subfolders)
  folder-name-a: <uuid-a>
  folder-name-b: <uuid-b>
links:
  - uuid: <target module UUID>
    relation: depends-on   # depends-on | implements | extends | references | related-to | custom
    description: Optional clarification
```

**Rules:**
- `schema_version` and `uuid` are REQUIRED fields
- `uuid` is permanent — never change it, even on rename/move
- `submodules` is a **map** (`folder-name → uuid`), not an array
- `submodules` keys must match actual subfolders on disk (bidirectional)
- `links` targets are UUIDs, not paths

**HARNESS link structure** (exactly one link, no others permitted):
```yaml
links:
  - uuid: <parent SPEC uuid>
    relation: implements
```

**layout.yaml:** The CLI checks for this file's existence but does not validate its contents. Stale UUIDs in `layout.yaml` are silently ignored.

## Module design principles

**Split aggressively.** If a module covers more than one coherent concept, split it. Prefer many small focused modules over fewer large ones. Every split must be reversible — child modules together must fully reconstruct the parent's meaning.
