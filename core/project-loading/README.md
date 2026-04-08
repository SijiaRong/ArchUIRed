---
name: Project Loading
description: "Defines the cross-platform algorithm for loading an ArchUI project tree: traversal rules including the root-level hidden folder whitelist and SKILL.md fallback, valid root definition, global index construction, and error cases."
---

## Overview

Loading an ArchUI project means walking a directory tree and assembling a complete in-memory representation: all modules, a global `uuid → path` index, and canvas layout positions. This algorithm is platform-agnostic — it applies equally to the web app (via any FsAdapter), the CLI, iOS, and Android. The only platform-specific part is the underlying file I/O mechanism.

## Root Path Convention

The project root is always represented as `"."` (dot). All module paths are relative to this root:

| Path | Meaning |
|---|---|
| `"."` | the root module itself |
| `"core"` | a direct child of root |
| `"core/uuid-system"` | a nested module |

On each platform, `"."` maps to whatever root the user has opened:
- **Browser FSA**: the directory the user picked via `showDirectoryPicker()`
- **Server adapter**: `ARCHUI_ROOT` on the host machine
- **CLI**: the path argument passed to `archui validate [path]`
- **iOS/Android**: the selected local directory

## Traversal Algorithm

Starting at `"."`, apply recursively:

1. **List the directory entries** at the current path.
2. **For each subdirectory entry**, decide whether to recurse:
   - Always skip: `resources/`, `node_modules/`
   - If the entry name starts with `.` (hidden): skip **unless** it is at depth 0 (the project root) AND its name is in the root-level whitelist (see below)
   - Otherwise: recurse into it
3. **Resolve the identity document** for the current directory:
   - If `README.md` exists → use it as the identity document
   - Else if `SKILL.md` exists → use it as the identity document
   - Else → no identity document; skip this directory (silently, with a warning)
4. **If an identity document exists**, also read `.archui/index.yaml`:
   - Parse the identity document → extract `name` and `description`
   - Parse `.archui/index.yaml` → extract `uuid`, `submodules`, `links`, `layout`
   - If both are valid and `uuid` is non-empty → register as a module
   - If `.archui/index.yaml` is missing or `uuid` is empty → skip silently with a warning
5. **Do not abort the walk** on a single module failure. Continue traversing siblings.

## Root-Level Hidden Folder Whitelist

At depth 0 (direct children of `"."`), the following hidden folders are traversed:

```
.claude     .cursor     .aider     .windsurf     .github     .vscode
```

These folders follow the same module rules as regular folders. If they have a valid identity document and `.archui/index.yaml`, they are registered as modules. If they lack these files, they are silently skipped — their absence is not a validation error.

Hidden folders at any depth greater than 0 are never traversed, regardless of their name.

## Identity Document Priority

| Situation | Identity document used |
|---|---|
| Only `README.md` exists | `README.md` |
| Only `SKILL.md` exists | `SKILL.md` |
| Both exist | `README.md` (primary); `SKILL.md` is supplementary |
| Neither exists | No identity document — directory is skipped |

When rendering module information, always prefer `README.md` content when both files are present.

## Valid Project Root

A project root is valid if and only if the directory at `"."` is itself a registered module after the walk — i.e., it has a parseable identity document (with `name` and `description`) and a `.archui/index.yaml` (with a non-empty `uuid`).

If the root is not a valid module, loading must fail with a clear error surfaced to the user. Do not silently succeed with an empty project.

## Global Index Construction

After the walk, build the global `uuid → path` index by iterating all registered modules:

```
globalIndex[module.uuid] = module.path
```

This index is derived data — never read from a file, never persisted by the loader. It is rebuilt on every load.

## Layout

Each module's `.archui/index.yaml` may contain a `layout` field: a map of `child-uuid → {x, y}`. Collect these into a global layout map keyed by parent `uuid`:

```
globalLayout[parentUuid][childUuid] = { x, y }
```

## Error Cases

| Condition | Required behavior |
|---|---|
| Root `"."` has no identity document | Fail with explicit error: not a valid ArchUI project root |
| Root `"."` has no `.archui/index.yaml` | Fail explicitly |
| Root identity document or `.archui/index.yaml` is malformed | Fail explicitly; include parse error in the message |
| A non-root module is missing a file | Skip silently, emit a warning; do not abort the walk |
| A UUID appears in two modules | Emit a warning; last writer wins for the global index |

## Relationship to Adapters

The loader calls only three operations on the adapter: `readFile(path)`, `writeFile(path, content)`, and `listDir(path)`. The adapter is responsible for translating these path-relative calls into whatever I/O the platform requires. The loader has no knowledge of how files are physically accessed.
