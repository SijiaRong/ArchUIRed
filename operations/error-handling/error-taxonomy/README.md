---
name: Error Taxonomy
description: "The six ArchUI error categories — VALIDATION_ERROR, PARSE_ERROR, BROKEN_LINK, INDEX_STALE, SYNC_FAILURE, FILESYSTEM_ERROR — with precise definitions and distinguishing examples."
---

## Overview

Every error emitted by an ArchUI component must be classified into exactly one of the six categories below. The category determines the recovery strategy (see `recovery-strategies/`). Misclassifying an error leads to applying the wrong recovery, which can silently corrupt the module graph.

## Error Categories

**`VALIDATION_ERROR`**
An ArchUI filesystem rule violation detected by the CLI validator. Examples: a README.md missing required frontmatter fields, a non-`resources/` subfolder present inside a module, a `submodules` list entry that has no corresponding directory.

**`PARSE_ERROR`**
The YAML frontmatter block in a README.md is syntactically malformed, or the README.md file cannot be read at all (binary, encoding error). A file that parses successfully but fails a content rule is a `VALIDATION_ERROR`, not a `PARSE_ERROR`.

**`BROKEN_LINK`**
A `links` entry references a UUID that does not appear in `index.yaml`. This means either the target module was deleted, never created, or the UUID was mistyped.

**`INDEX_STALE`**
The contents of `index.yaml` do not match the actual directory structure on disk. This is the expected state after any module is added, removed, or renamed without running `archui index`.

**`SYNC_FAILURE`**
An LLM-driven sync operation initiated by `gui/file-sync` did not complete successfully. Causes include: API timeout, network error, invalid API response, or the LLM returning output that fails schema validation.

**`FILESYSTEM_ERROR`**
An OS-level read or write operation failed. Examples: permission denied, disk full, file locked by another process, symlink loop.

## Classification Rules

- A file that is syntactically valid YAML but missing a required field → `VALIDATION_ERROR` (not `PARSE_ERROR`)
- A file that cannot be parsed at all → `PARSE_ERROR`
- A link referencing a UUID for a module that exists on disk but is absent from `index.yaml` → `BROKEN_LINK` (not `INDEX_STALE`); the stale index is a contributing cause but the observable error is the broken link
- A module folder that exists on disk but is not in `index.yaml` → `INDEX_STALE`
