---
name: Core Test Playbook
description: "Playbook for verifying that core module conformance rules — required frontmatter, submodule declarations, and link structure — are correctly enforced across an ArchUI project."
---

## Overview

This playbook verifies the core conformance requirements for an ArchUI project: valid frontmatter in every module, consistent submodule declarations, and well-formed cross-module links.

---

## Playbook

### Group 1: Required frontmatter fields

[init] A valid ArchUI project root exists with `.archui/index.yaml` and a passing root `README.md`. A module `sample-module/` is present with fully valid frontmatter.

[action] Remove the `uuid` field from `sample-module/README.md` frontmatter, leaving `name` and `description` intact.
[eval] `archui validate` reports an ERROR on `sample-module/` citing a missing required field: `uuid`.

[action] Remove the `name` field instead (restore `uuid` first), so only `name` is missing.
[eval] `archui validate` reports an ERROR on `sample-module/` citing a missing required field: `name`.

[action] Remove the `description` field instead (restore `name` first), so only `description` is missing.
[eval] `archui validate` reports an ERROR on `sample-module/` citing a missing required field: `description`.

[action] Restore all three required fields (`uuid`, `name`, `description`) to valid values.
[eval] `archui validate` reports no errors for `sample-module/`.

[end] Remove `sample-module/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 2: Submodule declaration consistency

[init] A valid ArchUI project root exists and passes validation. A module `parent/` is present with `submodules: [child-a, child-b]` and both `parent/child-a/` and `parent/child-b/` exist with valid `README.md` files.

[action] Delete `parent/child-a/` from the filesystem without updating `parent/README.md`.
[eval] `archui validate` reports an ERROR on `parent/`: declared submodule `child-a` is not found on disk.

[action] Remove `child-a` from `parent/README.md`'s `submodules` list.
[eval] `archui validate` reports no errors for `parent/` (only `child-b` remains declared and present).

[action] Create a new subfolder `parent/child-c/` with a valid `README.md`, but do not add `child-c` to `parent/README.md`'s `submodules` list.
[eval] `archui validate` reports an ERROR: `parent/child-c/` is present on disk but not declared as a submodule in `parent/README.md`.

[action] Add `child-c` to `parent/README.md`'s `submodules` list and add its UUID entry to `.archui/index.yaml`.
[eval] `archui validate` passes for `parent/` and all its submodules.

[end] Remove `parent/` and all its contents. Remove their entries from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 3: Link structural validity

[init] A valid ArchUI project root exists and passes validation. A module `linked-module/` is present with a `links` entry pointing to a valid UUID in `.archui/index.yaml`.

[action] Change the `uuid` value in `linked-module/README.md`'s links entry to a UUID that does not exist in `.archui/index.yaml`.
[eval] `archui validate` reports a broken link error on `linked-module/`, identifying the unresolved UUID and the source module path.

[action] Restore the link UUID to the original valid value.
[eval] `archui validate` reports no errors for `linked-module/`.

[action] Add a second link entry in `linked-module/README.md` that has no `uuid` field at all — only a `relation` field.
[eval] `archui validate` reports a malformed link error on `linked-module/`: the `uuid` field is required per link entry.

[action] Remove the malformed link entry.
[eval] `archui validate` passes with no errors.

[end] Remove `linked-module/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 4: resources/ folder exemption

[init] A valid ArchUI project root exists and passes validation. A module `content-module/` is present with `submodules: []`.

[action] Create a subfolder `content-module/resources/` with some files inside it (no README.md).
[eval] `archui validate` reports no errors. The `resources/` subfolder is recognized as the special exempt folder and is not required to contain a README.md or be declared in `submodules`.

[action] Create a second subfolder `content-module/assets/` (not named `resources/`) with some files but no README.md.
[eval] `archui validate` reports an ERROR on `content-module/`: `assets/` is an undeclared non-module subfolder.

[action] Remove `content-module/assets/`.
[eval] `archui validate` passes with no errors for `content-module/`.

[end] Remove `content-module/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.
