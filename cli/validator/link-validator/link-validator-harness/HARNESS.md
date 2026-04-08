---
name: Link Validator Test Playbook
description: "Playbook for verifying that the link validator correctly detects missing uuid fields, dangling uuid references, and empty optional fields in link entries."
---

## Overview

This playbook verifies the link validator's ability to detect structural problems in frontmatter link entries. Tests are grouped by rule category and share init conditions wherever possible.

---

## Playbook

### Group 1: Missing uuid field in a link entry

[init] A valid ArchUI project root exists and passes full validation. A module `source/` is present with at least one well-formed link entry in its frontmatter.

[action] Add a second link entry to `source/README.md` that has `relation: references` and `description: Some context` but no `uuid` field. Run `archui validate --only links`.
[eval] An ERROR is reported: `[links/missing-uuid]  source/README.md  link entry at index N has no 'uuid' field` (where N is the zero-based position of the new entry).

[action] Remove the malformed entry and restore `source/README.md` to its original valid state. Run `archui validate --only links`.
[eval] No errors are reported for `source/`.

[end] No further cleanup needed.

---

### Group 2: Dangling uuid reference

[init] A valid ArchUI project root exists and passes full validation. `.archui/index.yaml` is up to date. A module `linker/` is present with no links.

[action] Add a link entry to `linker/README.md` referencing a uuid that does not exist in `.archui/index.yaml` (e.g., `uuid: deadbeef`). Run `archui validate --only links`.
[eval] An ERROR is reported: `[links/dangling-uuid]  linker/README.md  link uuid 'deadbeef' not found in index`.

[action] Create a new module `target/` with uuid `deadbeef` and add it to `.archui/index.yaml`. Run `archui validate --only links`.
[eval] No dangling-uuid error is reported for the `deadbeef` reference. The link resolves successfully.

[action] Delete `target/` from the filesystem and from `.archui/index.yaml` without updating `linker/README.md`. Run `archui validate --only links`.
[eval] The dangling-uuid error reappears for `linker/README.md`.

[end] Remove the link entry from `linker/README.md`. Confirm `archui validate --only links` passes.

---

### Group 3: Empty optional fields

[init] A valid ArchUI project root exists and passes validation. A module `annotated/` is present and its README.md links to at least one other module.

[action] Add a link entry to `annotated/README.md` where `relation` is set to an empty string (`relation: ""`). Run `archui validate --only links`.
[eval] An ERROR is reported: `[links/empty-relation]  annotated/README.md  link to '<uuid>' has empty 'relation' field`.

[action] Remove the `relation` field entirely from that link entry (making it optional-absent). Run `archui validate --only links`.
[eval] No error is reported for the absent `relation` field. Absent is valid; empty is not.

[action] Add a `description` field set to an empty string (`description: ""`) to the same link entry. Run `archui validate --only links`.
[eval] An ERROR is reported: `[links/empty-description]  annotated/README.md  link to '<uuid>' has empty 'description' field`.

[action] Remove the `description` field entirely from that link entry. Run `archui validate --only links`.
[eval] No error is reported. Absent description is valid.

[end] Restore `annotated/README.md` to its original valid state. Confirm `archui validate --only links` passes.

---

### Group 4: Custom relation strings are accepted

[init] A valid ArchUI project root exists and passes validation. A module `custom-linker/` is present.

[action] Add a link entry to `custom-linker/README.md` using a non-vocabulary relation string such as `relation: supersedes`, referencing a valid uuid from the index.
[eval] `archui validate --only links` reports no errors. Custom relation strings are permitted.

[action] Add another link entry using a relation string that is in the recommended vocabulary (`relation: depends-on`), also referencing a valid uuid.
[eval] `archui validate --only links` reports no errors. Standard vocabulary strings are also accepted.

[end] Remove the added link entries from `custom-linker/README.md`. Confirm `archui validate --only links` passes.
