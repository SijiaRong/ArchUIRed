---
name: Link System Test Playbook
description: "Playbook for verifying cross-module link declaration, relation vocabulary handling, optional field behavior, and broken link detection by the validator."
---

## Overview

This playbook verifies that cross-module links are correctly declared, that optional fields behave as specified, that the recommended relation vocabulary is accepted alongside custom strings, and that broken links are reliably detected.

---

## Playbook

### Group 1: Required uuid field per link

[init] A valid ArchUI project root exists with `.archui/index.yaml` and passing modules `module-a/` and `module-b/`. `module-a/` has a valid link entry pointing to `module-b/`'s UUID.

[action] Remove the `uuid` field from the link entry in `module-a/README.md`, leaving only a `relation` field.
[eval] `archui validate` reports a malformed link error on `module-a/`: each link entry must have a `uuid` field.

[action] Restore the `uuid` field to the link entry.
[eval] `archui validate` passes for `module-a/`.

[action] Change the `uuid` value in the link entry to a non-hex string (e.g., `not-a-uuid`).
[eval] `archui validate` reports a malformed link error on `module-a/`: the link uuid is not a valid 8-character lowercase hex string.

[action] Restore the `uuid` value to `module-b/`'s correct UUID.
[eval] `archui validate` passes for `module-a/`.

[end] Remove `module-a/` and `module-b/` and their entries from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 2: Optional relation and description fields

[init] A valid ArchUI project root exists and passes validation. Module `linker/` is present with a link to module `target/`'s UUID. Both modules are in `.archui/index.yaml`.

[action] Confirm the link entry in `linker/README.md` has `uuid` only — no `relation` or `description` fields.
[eval] `archui validate` passes. A bare link with only `uuid` is valid.

[action] Add a `relation: depends-on` field to the link entry.
[eval] `archui validate` passes. A link with `uuid` and `relation` is valid.

[action] Add a `description` field explaining why the link exists.
[eval] `archui validate` passes. A link with all three fields (`uuid`, `relation`, `description`) is valid.

[action] Remove `relation` but keep `description`.
[eval] `archui validate` passes. A link with `uuid` and `description` (no `relation`) is valid.

[action] Set `relation` to an empty string `""`.
[eval] `archui validate` reports an error: `relation`, when present, must be a non-empty string.

[action] Remove the `relation` field entirely.
[eval] `archui validate` passes.

[end] Remove `linker/` and `target/` and their entries from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 3: Relation vocabulary — standard and custom

[init] A valid ArchUI project root exists and passes validation. Module `vocab-test/` is present with a link to another module. Both are in `.archui/index.yaml`.

[action] Set the link's `relation` to each of the five recommended values in turn: `depends-on`, `implements`, `extends`, `references`, `related-to`. Run `archui validate` after each change.
[eval] `archui validate` passes for all five recommended relation values.

[action] Set the link's `relation` to a custom string not in the recommended vocabulary (e.g., `renders-output-of`).
[eval] `archui validate` passes. Custom relation strings are always valid.

[action] Set the link's `relation` to a camelCase string (e.g., `dependsOn`).
[eval] `archui validate` passes. The validator does not restrict relation string format beyond requiring it to be non-empty.

[end] Remove `vocab-test/` and its linked target from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 4: Broken link detection

[init] A valid ArchUI project root exists and passes validation. Module `broken-linker/` has a link whose `uuid` value is `deadbeef` — a UUID that does not exist in `.archui/index.yaml` and corresponds to no module on disk.

[action] Run `archui validate`.
[eval] `archui validate` reports a broken link error identifying `broken-linker/` as the source module and `deadbeef` as the unresolved UUID. Exit code is non-zero.

[action] Add a new module `new-target/` with UUID `deadbeef` to the filesystem and to `.archui/index.yaml`.
[eval] `archui validate` passes — the previously broken link now resolves to `new-target/`.

[action] Delete `new-target/` from the filesystem and from `.archui/index.yaml`.
[eval] `archui validate` again reports the broken link error for `deadbeef`.

[end] Fix or remove the link entry in `broken-linker/README.md`. Remove `broken-linker/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.
