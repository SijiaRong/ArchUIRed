---
name: Index Sync
description: "Checks that every module's .archui/index.yaml is consistent with the live filesystem: no duplicate UUIDs across the project, submodules map matches actual subfolders, and every declared submodule folder exists on disk."
---

## Overview

Each module has its own `.archui/index.yaml` containing its UUID, submodule declarations, and links. The index-sync validator checks that these per-module files are consistent with each other and with the actual filesystem layout. It is the last validator to run, after structure and frontmatter have been confirmed valid.

## What index-sync validates

### No duplicate UUIDs

Every `uuid` in every `.archui/index.yaml` across the entire project must be unique. If two modules claim the same UUID, the link system breaks — references to that UUID become ambiguous. Duplicate UUIDs are a fatal error.

### Submodules map matches actual subfolders

The `submodules` field in `.archui/index.yaml` is a map of `folder-name → child-uuid`. This map must be consistent with the filesystem in both directions:

- **`archui/submodule-not-found`** — a key in the `submodules` map names a folder or uuid that does not exist on disk or in the project.
- **`archui/undeclared-subfolder`** — a subfolder exists on disk (and is not `resources/`) but is not listed in the parent's `submodules` map.

### `.archui/index.yaml` must be parseable

If `.archui/index.yaml` exists but cannot be parsed as valid YAML, or if the required `uuid` field is missing or empty, that is a violation.

## Per-module Format

The `.archui/index.yaml` format this validator checks:

```yaml
schema_version: 1
uuid: 4a6f8e3b           # REQUIRED — stable 8-hex identifier
submodules:              # OPTIONAL — folder-name → child-uuid map
  child-folder: a1b2c3d4
links:                   # OPTIONAL — cross-module references
  - uuid: 9e2b5d7c
    relation: depends-on
layout:                  # OPTIONAL — canvas positions (managed by GUI)
  a1b2c3d4: {x: 100, y: 200}
```

## Rebuilding

When `.archui/index.yaml` files are out of sync, running `archui index --fix` walks the entire tree, validates UUID uniqueness, and reports any conflicts. The filesystem is always the source of truth — the per-module files are never auto-regenerated from a central store.

If duplicate UUIDs are found, the fix is aborted and conflicts are reported. Duplicate UUIDs cannot be auto-resolved mechanically.

## Error Output

```
ERROR  [archui/missing-file]          core/uuid-system/              .archui/index.yaml not found
ERROR  [archui/parse-error]           core/link-system/              .archui/index.yaml YAML syntax error
ERROR  [archui/missing-field]         cli/validator/                 .archui/index.yaml missing required field 'uuid'
ERROR  [archui/duplicate-uuid]        core/uuid-system/              uuid '4a6f8e3b' also used by core/filesystem-rules
ERROR  [archui/submodule-not-found]   core/.archui/index.yaml        submodules map references 'missing-child' which does not exist
ERROR  [archui/undeclared-subfolder]  core/README.md                 subfolder 'orphan' exists but is not in .archui/index.yaml submodules
```
