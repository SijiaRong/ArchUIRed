---
name: Filesystem Rules
description: "Specifies the on-disk conventions that define a valid ArchUI project, including folder structure, required files, nesting rules, root-level hidden folder whitelist, and SKILL.md as an alternative identity document."
---

## Overview

The filesystem rules are the lowest-level contract in ArchUI. They define what a valid ArchUI project looks like on disk, independent of any tooling. If the filesystem conforms to these rules, the project is structurally valid — the CLI and GUI can operate on it without error.

These rules are intentionally minimal. They constrain structure, not content.

## Rules

### Rule 1: Every module is a folder

A module is the atomic unit of organization in ArchUI. Modules cannot be files. There is no such thing as a "file module" — if something needs to be a module, it needs its own folder.

### Rule 2: Every module folder must contain an identity document

The identity document is either `README.md` or `SKILL.md`. It must exist at the direct root of the folder, not in a subfolder.

- If both exist, `README.md` takes precedence as the identity document. `SKILL.md` is treated as supplementary content.
- If only `SKILL.md` exists, it is used as the identity document in place of `README.md`.
- A folder with neither file is not a module — it is an error.

```
my-module/
└── README.md        ✓ required (or SKILL.md if README.md is absent)
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

The `.archui/index.yaml` file holds all structural metadata for the module. Required field: `uuid`. Optional fields: `submodules` (map), `links` (array), `layout` (map).

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

### Rule 5: All subfolders must be declared submodules or `resources/`

The only two categories of subfolder permitted inside a module are:

1. **Declared submodules** — folders listed as keys in the `.archui/index.yaml` `submodules` map. Each declared submodule must itself be a valid module.
2. **The `resources/` directory** — a single special folder for storing binary assets, templates, attachments, or any non-module content. The `resources/` folder does not require an identity document.

Any subfolder that is neither a declared submodule nor `resources/` is a validation error.

### Rule 6: Root-level hidden folder whitelist

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

### Rule 7: Structure is infinitely nestable

There is no depth limit on module nesting. The same rules apply uniformly at every level, with the exception of the root-level hidden folder whitelist (Rule 6).

### Rule 8: Module folder names are path identifiers

Folder names form the human-readable path to a module (e.g., `core/filesystem-rules`). They should be lowercase, hyphen-separated, and descriptive. Folder names can change without breaking cross-module links (links use UUIDs).

## What is NOT a rule

- **No constraint on identity document body content.** The prose below the frontmatter is free-form Markdown.
- **No constraint on `resources/` contents.** Place any files or nested folders inside `resources/` — they are opaque to ArchUI tooling.
- **No central index file.** The global UUID→path map is derived by walking the tree.

## Validation

The CLI `validate` command traverses the project tree and checks every folder against these rules. Errors are reported with the offending path and the rule violated.
