---
name: Frontmatter Validator Test Playbook
description: "Playbook for verifying that the frontmatter validator correctly detects missing blocks, parse errors, absent or empty required fields, and submodule declaration drift."
---

## Overview

This playbook verifies the frontmatter validator's ability to detect YAML block issues and schema violations in README files. Tests are grouped by violation category and share init conditions wherever possible.

---

## Playbook

### Group 1: Missing or unparseable YAML frontmatter block

[init] A valid ArchUI project root exists and passes full validation. A module `sample/` is present with a correct README.md.

[action] Replace `sample/README.md`'s content with a Markdown file that has no `---` delimiters at all (plain Markdown body, no frontmatter).
[eval] `archui validate --only frontmatter` reports `ERROR  [frontmatter/missing-block]  sample/README.md  no YAML frontmatter block found`.

[action] Replace the content with a README that begins with `---` but contains a YAML syntax error inside the block (e.g., a key with a colon but no value, or unbalanced quotes).
[eval] `archui validate --only frontmatter` reports `ERROR  [frontmatter/parse-error]  sample/README.md  YAML syntax error` referencing the line or location of the error.

[action] Restore `sample/README.md` to its original valid content.
[eval] `archui validate --only frontmatter` reports no errors for `sample/`.

[end] No further cleanup needed.

---

### Group 2: Missing and empty required fields

[init] A valid ArchUI project root exists and passes validation. A module `target/` is present with a correct README.md containing all required fields.

[action] Remove the `uuid` field entirely from `target/README.md`'s frontmatter and run `archui validate --only frontmatter`.
[eval] An ERROR is reported: `[frontmatter/missing-field]  target/README.md  required field 'uuid' is absent`.

[action] Restore the `uuid` field but set `name` to an empty string (`name: ""`). Run `archui validate --only frontmatter`.
[eval] An ERROR is reported: `[frontmatter/empty-field]  target/README.md  field 'name' is present but empty`.

[action] Set `name` to `null` explicitly (`name: null`). Run `archui validate --only frontmatter`.
[eval] An ERROR is reported for `target/README.md` indicating `name` is present but empty (null counts as empty).

[action] Set `description` to an empty string and run `archui validate --only frontmatter`.
[eval] An ERROR is reported for the empty `description` field.

[action] Restore all three required fields to valid non-empty values. Run `archui validate --only frontmatter`.
[eval] No errors are reported for `target/`.

[end] No further cleanup needed.

---

### Group 3: Submodule declaration drift

[init] A valid ArchUI project root exists and passes validation. A module `parent/` is present with `submodules: [child-a]` in its frontmatter, and `parent/child-a/` exists with a valid README.md.

[action] Add a new subfolder `parent/child-b/` with a valid README.md, but do not add `child-b` to `parent/README.md`'s `submodules` list. Run `archui validate --only frontmatter`.
[eval] An ERROR is reported: `[frontmatter/undeclared-subfolder]  parent/README.md  subfolder 'child-b' exists but is not listed in submodules`.

[action] Add `child-b` to `parent/README.md`'s `submodules` list and remove `parent/child-a/` from the filesystem (without updating the `submodules` list). Run `archui validate --only frontmatter`.
[eval] An ERROR is reported: `[frontmatter/submodule-not-found]  parent/README.md  submodules lists 'child-a' but folder does not exist`.

[action] Remove `child-a` from the `submodules` list so it now only contains `child-b`. Run `archui validate --only frontmatter`.
[eval] No errors are reported for `parent/`.

[end] Remove `parent/child-b/`. Revert `parent/README.md`'s `submodules` to `[]`. Confirm `archui validate --only frontmatter` passes.

---

### Group 4: Optional fields — submodules and links absent

[init] A valid ArchUI project root exists and passes validation.

[action] Create a module `minimal/` whose README.md frontmatter contains only `uuid`, `name`, and `description` — with no `submodules` or `links` fields at all.
[eval] `archui validate --only frontmatter` treats the absent `submodules` and `links` as empty lists and reports no errors for `minimal/`.

[action] Add `submodules: []` and `links: []` explicitly to `minimal/README.md`. Run `archui validate --only frontmatter`.
[eval] No errors are reported. Explicit empty lists are equivalent to absent fields.

[end] Remove `minimal/`. Confirm `archui validate --only frontmatter` passes.
