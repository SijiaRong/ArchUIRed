# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArchUI is a dual-interface knowledge management system — see README.md for full details.

Key points:
- **Filesystem is the source of truth.** No database. All knowledge lives as folders and typed identity documents (`README.md`, `SKILL.md`, `SPEC.md`, `MEMORY.md`, `HARNESS.md`).
- **GUI** is a node-based visual canvas (in the style of [ComfyUI](https://github.com/comfyanonymous/ComfyUI)) (cross-platform: Web, Electron, iOS native, Android native).
- **CLI** is a validator — it checks filesystem conformance after agent modifications.
- **LLM sync** is triggered on-demand via `git diff`, not on every human edit.

## Development Model: Docs-Driven, Agent-Executed

ArchUI is built using its own system. All development workflows — including per-platform development and release — are defined as ArchUI modules. There are no hardcoded platform targets; adding a new platform means adding a new module.

Platform modules (e.g., `ios-development-release/`) scope the context for platform-specific agents. An iOS programming agent loads only the iOS module tree; it has no reason to touch Android or web modules.

Workflow:
1. **Humans and architect agents** modify spec/architecture modules.
2. **Platform programming agents** are scoped to their module and implement natively (no shared codebase across platforms).
3. **Testing agents** verify each platform against the spec.

UI consistency across platforms is maintained via **Figma MCP** as the shared design source of truth.

## ArchUI Filesystem Rules

The CLI validates these rules. Every valid ArchUI project must follow them:

1. Every module is a **folder**.
2. Every folder must contain exactly one typed identity document: `SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, or `README.md` (generic fallback). All use the same frontmatter: `name` and `description` only.
3. Every folder must contain a `.archui/index.yaml` with structural metadata (`uuid`, `submodules`, `links`).
4. Identity documents contain **only** `name` and `description` — no uuid, no submodules, no links. These belong in `.archui/index.yaml`.
5. The `description` frontmatter field is the short summary always loaded into agent context.
6. Cross-module links use **UUID**, not file paths. UUIDs are stable across renames/moves.
7. Each link entry (in `.archui/index.yaml`) has a `uuid` (required) and optional `relation` and `description` fields.
8. `relation` has a recommended vocabulary (`depends-on`, `implements`, `extends`, `references`, `related-to`) but custom strings are valid.
9. `submodules` in `.archui/index.yaml` is a **map** of `folder-name → child-uuid`. It must match actual subfolders on disk (bidirectional).
10. The only allowed non-module subfolder is `resources/`.
11. Structure is infinitely nestable — the same rules apply at every level.
12. **SPEC modules** must contain exactly one HARNESS submodule. MEMORY submodule is optional (at most one).
13. **HARNESS modules** must have exactly one link (to their parent SPEC). No other links permitted.
14. **MEMORY modules** should link only to their parent SPEC (warning if violated, not error).

## Repository Structure

```
archui/
├── .archui/
│   └── index.yaml              # root module metadata (uuid, submodules map, links)
├── README.md                   # name + description only
├── ios-development-release/    # iOS platform module
│   ├── .archui/index.yaml
│   ├── README.md
│   └── ios-development/
│       ├── .archui/index.yaml
│       └── README.md
├── android-development-release/
│   └── ...
└── cli/
    ├── .archui/index.yaml
    └── README.md
```

Platform modules are only loaded when that platform is being worked on.

## Development Workflow

- Modify specs under `specs/` (humans or architect agents).
- Platform programming agents pick up changes via `git diff` and implement per-platform.
- Testing agents verify each platform against the spec.
- **After EVERY agent modification to ArchUI module files, you MUST run the CLI validator and fix all errors before considering the task done:**

```bash
node cli/resources/dist/index.js validate .
```
