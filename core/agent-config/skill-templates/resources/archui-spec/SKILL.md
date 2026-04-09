---
name: archui-spec
description: ArchUI module structure workflow. Use when creating, moving, renaming, or deleting modules — enforces folder rules, UUID management, .archui/*.yaml structure, and validation.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# ArchUI Filesystem Structure

This skill governs **module structure**: what folders and files must exist, how `.archui/` directories are organized, UUID management, and module type constraints.

For writing the *content* inside identity documents or `.archui/` metadata files, load the companion skill: `archui-docs`.

---

## Dispatch Table

| Situation | Load |
|---|---|
| Need to write or read `index.yaml` / `layout.yaml` field values | Load `archui-docs` skill ([write-index.md](../archui-docs/write-index.md) / [write-layout.md](../archui-docs/write-layout.md)) |
| Need to write identity document prose (SPEC, README, etc.) | Load `archui-docs` skill |
| Using the CLI (validate, init, clean, copy, paste) | [cli-usage.md](cli-usage.md) |

---

## Module Commands

Every module can expose executable commands. Commands are `.md` files located at:

```
<module-path>/.archui/commands/<command-name>.md
```

To discover what actions a module supports, list its `.archui/commands/` directory. Each file has a `name` (button label), `description` (what it does), and a body (skill instructions for the AI agent). When the user asks to run a command on a module, read the corresponding command file and follow its instructions.

---

## Folder Rules

1. **Every module is a folder.** No standalone files qualify as modules.
2. **Every module folder must contain exactly one identity document**: `SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, or `README.md` (generic fallback).
3. **Every module folder must contain `.archui/index.yaml`** with structural metadata (`schema_version`, `uuid`, `submodules`, `links`).
4. **Every module folder must contain `.archui/layout.yaml`** with canvas node positions.
5. **The only allowed non-module subfolder is `resources/`.** All other subfolders must be registered modules.
6. **Structure is infinitely nestable** — the same rules apply at every depth.

## Module Type Constraints

| Module type | Identity document | Submodule rules | Link rules |
|---|---|---|---|
| **SPEC** | `SPEC.md` | Must have exactly 1 HARNESS child. At most 1 MEMORY child. | No restrictions. |
| **HARNESS** | `HARNESS.md` | No submodules allowed (`submodules: {}`). | Exactly 1 link to parent SPEC with `relation: implements`. |
| **MEMORY** | `MEMORY.md` | No submodules allowed (`submodules: {}`). | Should link only to parent SPEC. Extra links trigger a `WARN`. |
| **README** | `README.md` | No restrictions. | No restrictions. |
| **SKILL** | `SKILL.md` | No restrictions. | No restrictions. |

## UUID Rules

- **Format**: 8 lowercase hex characters (e.g., `93ab33c4`). Never RFC 4122 format.
- **Permanence**: A UUID never changes after creation — not on rename, not on move, not on content edit.
- **Generation**: `openssl rand -hex 4`
- **Uniqueness check**: `grep -r "<generated-uuid>" . --include="*.yaml"` — must return no results.
- **YAML quoting**: Quote UUIDs that resemble scientific notation (e.g., `"785e2416"`).

## Submodules Consistency

The `submodules` map in `.archui/index.yaml` must match the actual subfolders on disk bidirectionally:

- Every subfolder (except `resources/` and hidden dirs) must be declared in `submodules`.
- Every entry in `submodules` must have a matching folder on disk.

---

## Workflow Steps

### Step 1 — Determine scope

Read the affected modules and their parent modules to understand current state:
- What modules are changing (added / renamed / moved / deleted)?
- What modules link TO or FROM the affected modules?
- Does the task involve `resources/`? Do not read or modify `resources/` without explicit user authorization.
- Does the task involve writing document prose or `.archui/` file content? Load `archui-docs` for that.

### Step 2 — Create or update folder structure

For each new module:
1. Create the folder.
2. Create the identity document (frontmatter with `name` and `description` only).
3. Generate a UUID: `openssl rand -hex 4` — verify uniqueness.
4. Create `.archui/index.yaml` — load `archui-docs` ([write-index.md](../archui-docs/write-index.md)) for the field format.
5. Create `.archui/layout.yaml` — load `archui-docs` ([write-layout.md](../archui-docs/write-layout.md)) for the field format.
6. Register the new folder in the **parent** module's `.archui/index.yaml` submodules map.
7. Add a layout entry in the **parent** module's `.archui/layout.yaml`.

### Step 3 — Validate (mandatory)

Run the CLI validator after every structural change. No exceptions. See [cli-usage.md](cli-usage.md) for the full command reference.

```bash
node cli/resources/dist/index.js validate .
```

Fix all `ERROR` outputs before proceeding. `WARN` outputs are advisory.

### Step 4 — Commit

Spec changes and resources changes must be in **separate commits**.

| Commit type | Files | Prefix |
|---|---|---|
| Spec | identity docs + `.archui/` files | `spec:` |
| Resources | `**/resources/**` | `web:` / `ios:` / `android:` / `cli:` |

Check before committing: `git diff --cached --name-only`. If output contains both spec files and resources files, split into two commits. Spec commit first, then resources.
