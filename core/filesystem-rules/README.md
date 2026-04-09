---
name: Filesystem Rules
description: "Specifies the on-disk conventions that define a valid ArchUI project, including folder structure, required files, nesting rules, root-level hidden folder whitelist, and typed identity documents (SKILL.md, SPEC.md, MEMORY.md, HARNESS.md)."
---

## Overview

The filesystem rules are the lowest-level contract in ArchUI. They define what a valid ArchUI project looks like on disk, independent of any tooling. If the filesystem conforms to these rules, the project is structurally valid — the CLI and GUI can operate on it without error.

These rules are intentionally minimal. They constrain structure, not content.

## Rules

### Rule 1: Every module is a folder

A module is the atomic unit of organization in ArchUI. Modules cannot be files. There is no such thing as a "file module" — if something needs to be a module, it needs its own folder.

### Rule 2: Every module folder must contain a typed identity document

Every module folder must contain exactly one identity document at its direct root (not in a subfolder). The identity document determines the node type of the module.

| File | Node type | Typical `resources/` | Description |
|---|---|---|---|
| `README.md` | Generic | Optional | Untyped module. Used when no stronger type applies. |
| `SKILL.md` | Skill / knowledge | No | A reusable skill or knowledge unit. Compatible with traditional skill file format. |
| `SPEC.md` | Implementation spec | Yes | An implementation specification. Typically accompanied by generated `resources/`. |
| `MEMORY.md` | Memory | No | A persistent memory record. Typically not accompanied by `resources/`. |
| `HARNESS.md` | Test harness | Yes | A test harness tied exclusively to one SPEC module. Typically accompanied by `resources/`. |

**Precedence when multiple identity documents are present:** `SPEC.md` > `HARNESS.md` > `MEMORY.md` > `SKILL.md` > `README.md`. Only the highest-priority file is used as the identity document; lower-priority files are treated as supplementary content.

A folder with none of these files is not a module — it is a validation error.

```
spec-module/
└── SPEC.md          ✓ identity document (spec node)

skill-module/
└── SKILL.md         ✓ identity document (skill node)

harness-module/
└── HARNESS.md       ✓ identity document (harness node)

memory-module/
└── MEMORY.md        ✓ identity document (memory node)

legacy-module/
└── README.md        ✓ identity document (generic node)
```

### Rule 3: The identity document must have valid YAML frontmatter with `name` and `description`

The identity document (`README.md` or `SKILL.md`) must begin with a YAML frontmatter block delimited by `---`. The frontmatter must contain `name` and `description`. All structural metadata (`uuid`, `submodules`, `links`) belongs in `.archui/index.yaml`.

```markdown
---
name: My Module
description: A one-sentence summary of what this module does.
---
```

### Rule 4: Every module folder must contain a `.archui/index.yaml`

The `.archui/index.yaml` file holds all structural metadata for the module. Required field: `uuid`. Optional fields: `submodules` (map), `links` (array).

The `.archui/` directory may also contain a `commands/` subfolder for module command definitions. Each file in `commands/` is a `.md` file with `name`, `description`, and an optional `icon` frontmatter field, plus an agent-instruction body. Command files are not ArchUI modules — they do not require `.archui/index.yaml`.

```yaml
schema_version: 1
uuid: 9e2b5d7c
submodules:
  child-a: a1b2c3d4
links:
  - uuid: e5f6g7h8
    relation: depends-on
```

### Rule 5: The project root must contain `.archui/layout.yaml`

The `.archui/layout.yaml` file stores canvas card positions for the GUI. It is a single file at the project root (not per-module). Top-level keys are parent module UUIDs; values are maps of child UUID → `{x, y}`. This file is a display hint only — it has no effect on the module graph, link resolution, or filesystem structure. The CLI validator checks for its existence.

### Rule 6: All subfolders must be declared submodules or `resources/`

The only two categories of subfolder permitted inside a module are:

1. **Declared submodules** — folders listed as keys in the `.archui/index.yaml` `submodules` map. Each declared submodule must itself be a valid module.
2. **The `resources/` directory** — a single special folder for storing binary assets, templates, attachments, or any non-module content. The `resources/` folder does not require an identity document.

Any subfolder that is neither a declared submodule nor `resources/` is a validation error.

### Rule 7: Root-level hidden folder whitelist

At the **project root only**, the following hidden folders are whitelisted — they are treated as potential ArchUI modules and are traversed during project loading:

| Folder | Tool |
|---|---|
| `.claude` | Claude Code (Anthropic) |
| `.cursor` | Cursor IDE |
| `.aider` | Aider |
| `.windsurf` | Windsurf |
| `.github` | GitHub Actions / workflows |
| `.vscode` | VS Code |

Whitelisted hidden folders follow the same rules as regular modules: they must have an identity document and `.archui/index.yaml` to be registered as modules. If they lack these files, they are silently skipped (not a validation error).

**Non-root hidden folders are never traversed.** The whitelist applies only at depth 0 (the project root). Hidden folders inside any submodule remain invisible to ArchUI tooling.

### Rule 8: Structure is infinitely nestable

There is no depth limit on module nesting. The same rules apply uniformly at every level, with the exception of the root-level hidden folder whitelist (Rule 7).

### Rule 9: Module folder names are path identifiers

Folder names form the human-readable path to a module (e.g., `core/filesystem-rules`). They should be lowercase, hyphen-separated, and descriptive. Folder names can change without breaking cross-module links (links use UUIDs).

### Rule 10: SPEC modules must contain exactly one HARNESS submodule; MEMORY is optional

A module whose identity document is `SPEC.md` must declare, as a direct submodule, exactly one HARNESS node. A MEMORY submodule is optional — a SPEC may have zero or one MEMORY node, but not more than one. These submodules must appear in the `submodules` map in `.archui/index.yaml`.

```
my-feature/
├── SPEC.md
├── .archui/index.yaml          # submodules: { harness: <uuid>, memory: <uuid> }
├── harness/
│   ├── HARNESS.md
│   └── .archui/index.yaml
└── memory/                      # optional
    ├── MEMORY.md
    └── .archui/index.yaml
```

Absence of the HARNESS submodule is a validation error. Absence of the MEMORY submodule is allowed. Having more than one MEMORY submodule is a validation warning.

### Rule 11: HARNESS modules must link exclusively to their parent SPEC

A module whose identity document is `HARNESS.md` must have exactly one entry in its `links` array, and that entry must reference the UUID of its direct parent SPEC module. No other links are permitted on a HARNESS node.

```yaml
# harness/.archui/index.yaml
uuid: a1b2c3d4
links:
  - uuid: e5f6a7b8      # must be the parent SPEC's uuid
    relation: implements
```

### Rule 12: MEMORY modules should link only to their parent SPEC

A MEMORY module is expected to link only to the SPEC module it was created under. Additional outbound links from a MEMORY node are a validation warning (not an error), but are architecturally discouraged.

## What is NOT a rule

- **No constraint on identity document body content.** The prose below the frontmatter is free-form Markdown.
- **No constraint on `resources/` contents.** Place any files or nested folders inside `resources/` — they are opaque to ArchUI tooling.
- **No central index file.** The global UUID→path map is derived by walking the tree.
- **No constraint on `layout.yaml` content.** The validator checks for the file's existence but does not validate its contents — stale UUIDs are silently ignored.
- **No enforcement on `resources/` presence by node type.** The table in Rule 2 describes typical usage; the validator does not require or forbid `resources/` based on node type.

## Validation

The CLI `validate` command traverses the project tree and checks every folder against these rules. Errors are reported with the offending path and the rule violated.
