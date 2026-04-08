---
name: Core
description: "Defines the foundational rules, data structures, and conventions that all ArchUI modules must conform to."
---

## Overview

The `core` module is the authoritative specification for the ArchUI knowledge management system. It does not contain application code — it contains the rules that make ArchUI what it is. Every other module in an ArchUI project ultimately derives its validity from conformance to the rules defined here.

ArchUI's central premise is that **the filesystem is the source of truth**. There is no separate database, no hidden index that diverges from what you see on disk. The folder hierarchy is the module hierarchy. The README.md files are the structured metadata. Cross-module relationships are encoded in YAML, not inferred from code.

## Submodules

- **filesystem-rules** — What constitutes a valid ArchUI project on disk: folder conventions, required files, permitted directory names.
- **uuid-system** — How modules are identified by UUID, how the UUID-to-path index works, and why UUIDs are preferred over paths for linking.
- **readme-schema** — The YAML frontmatter schema for all README.md files: required fields, optional fields, and their semantics.
- **link-system** — The cross-module link schema: how to declare relationships, what relation vocabulary is available, and what the CLI validates.
- **testing-qa** — Project-wide testing philosophy, cross-platform integration test specification, and the agent self-check protocol.
- **migration** — Schema versioning, backward compatibility policy, and runbooks for migrating existing projects when the ArchUI spec changes.

## Design Principles

**Filesystem-first.** Every piece of structural information is represented as a file or folder. Tooling (CLI, GUI) reads from and writes to the filesystem; it never becomes the source of truth itself.

**Human-readable by default.** All metadata lives in YAML frontmatter at the top of README.md files. A developer with no tooling installed can read, understand, and edit any module by hand.

**LLM-friendly by design.** The `description` field in every module's frontmatter is a single sentence that is always loaded into agent context. This means an LLM navigating a large ArchUI project can understand the purpose of every module without reading full file contents.

**Rename-safe cross-references.** Modules link to each other by UUID, not by path. Renaming or moving a module does not break any links — only the UUID index needs updating, which the tooling handles automatically.

## Conformance

A module is considered **core-conformant** if:
1. It is a folder with a README.md at its root.
2. The README.md has valid YAML frontmatter with at minimum `uuid`, `name`, and `description`.
3. All subfolders are either registered submodules (listed in `submodules`) or the special `resources/` directory.
4. All `links` entries reference valid UUIDs with well-formed relation fields.

The CLI's `validate` command checks conformance against these rules. See `core/filesystem-rules` and `core/readme-schema` for detailed specifications.
