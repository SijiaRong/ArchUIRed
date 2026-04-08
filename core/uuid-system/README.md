---
name: UUID System
description: "Specifies how modules are identified by UUID stored in per-module .archui/index.yaml, how the global UUID-to-path index is derived, and why UUIDs are used for cross-module links instead of file paths."
---

## Overview

Every module in an ArchUI project has a globally unique identifier — a UUID stored in its `.archui/index.yaml`. When one module links to another, it does so by UUID, not by file path. This makes the link graph stable across the most common maintenance operations: renaming a folder, moving a module to a different parent, or reorganizing the project hierarchy.

## UUID Format

ArchUI uses shortened UUIDs — 8 hexadecimal characters (32 bits). This is a deliberate tradeoff:

- **Shorter** than full UUIDs (8 chars vs 36 chars), improving readability in YAML and CLI output.
- **Sufficient collision resistance** for the scale of a single ArchUI project (thousands of modules).
- **Easy to generate** with standard tools (`openssl rand -hex 4`).

UUIDs are lowercase hexadecimal. They are assigned at module creation time and never change — not on rename, move, or any content edit.

```yaml
# .archui/index.yaml
schema_version: 1
uuid: 4a6f8e3b
```

## Per-Module Ownership

Each module owns its UUID by storing it in its own `.archui/index.yaml`. There is no central registry file that must be kept in sync. The UUID is co-located with the module it identifies, making the structure self-contained:

```
core/uuid-system/
├── .archui/
│   └── index.yaml    ← uuid: 4a6f8e3b lives here
└── README.md
```

## The Global UUID Index

The CLI builds a global `uuid → path` index on demand by walking the tree and collecting the `uuid` field from every `.archui/index.yaml`. This index is used by the link validator to resolve cross-module references.

The index is **derived data** — it is never persisted as an authoritative file. Running `archui validate` or `archui index --fix` always rebuilds it fresh from the filesystem.

```
# Conceptual index derived at validation time:
4a6f8e3b → core/uuid-system
9e2b5d7c → core/filesystem-rules
1d3c7a9e → core/readme-schema
8b2e4f6d → core/link-system
...
```

## Why UUIDs, Not Paths

Path-based cross-references are fragile. In a living knowledge base, modules get renamed when understanding deepens, reorganized when scope changes, and merged or split as projects evolve. If links used paths, every rename would require finding and updating every reference across the entire project.

UUIDs decouple the identity of a module from its location. A module at `core/uuid-system` today might be moved to `foundation/identity/uuid-system` tomorrow. Its UUID (`4a6f8e3b`) stays the same. Every module that links to it continues to work without modification. Only the folder path changes — the UUID in `.archui/index.yaml` is untouched.

## UUID Uniqueness

UUIDs must be unique within a single ArchUI project. There is no global UUID registry. The `index-sync` validator checks for duplicate UUIDs across the entire project tree at validation time.

If two ArchUI projects are merged, UUID collisions must be detected and resolved before merging. The CLI `merge` command handles collision detection and prompts for resolution.

## Generating UUIDs

When creating a new module, generate a UUID with:

```bash
openssl rand -hex 4
```

Before using a generated value, verify it is not already in any existing `.archui/index.yaml` in the project. The CLI `archui new <module-name>` command generates and assigns the UUID automatically.

## YAML Parsing Note

Some valid 8-hex strings look like numbers to a YAML parser (e.g., `785e2416` parses as scientific notation; `54534937` as an integer). Always quote UUIDs in `.archui/index.yaml` if they could be misread:

```yaml
uuid: "785e2416"   # quoted to prevent scientific-notation interpretation
```

The CLI and web app parse `.archui/index.yaml` with the YAML `failsafe` schema, which treats all scalar values as strings — but quoting is still recommended for safety when authoring by hand.
