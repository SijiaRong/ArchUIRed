---
name: Structure Validator Test Playbook
description: "Playbook for verifying that the structure validator correctly detects missing README files, unexpected module-level files, invalid folder names, and improper nesting inside resources/."
---

## Overview

This playbook verifies the structure validator's ability to detect violations of physical filesystem layout rules. Tests are grouped by violation type and share init conditions wherever possible.

---

## Playbook

### Group 1: Missing README.md

[init] A valid ArchUI project root exists and passes structure validation. No extra modules are present.

[action] Create a folder `orphan/` at the project root with no README.md inside it.
[eval] `archui validate --only structure` reports `ERROR  [structure/missing-readme]  orphan/  folder has no README.md`. Exit code is non-zero.

[action] Add a valid README.md to `orphan/` with correct frontmatter.
[eval] `archui validate --only structure` reports no errors for `orphan/`. Exit code is 0.

[action] Create a two-level structure: `parent/child/` where `parent/` has a valid README but `child/` has no README. Add `child` to `parent/README.md`'s `submodules` list.
[eval] `archui validate --only structure` reports a missing-readme error for `parent/child/`. No error is reported for `parent/` itself.

[end] Remove `orphan/` and `parent/` entirely. Confirm structure validation passes.

---

### Group 2: Unexpected files at module level

[init] A valid ArchUI project root exists and passes structure validation. A module `sample/` is present with a valid README.md.

[action] Place a loose file `sample/notes.md` inside the module folder (not README.md, not inside resources/).
[eval] `archui validate --only structure` reports `ERROR  [structure/unexpected-file]  sample/notes.md  unexpected file at module level`.

[action] Move `sample/notes.md` into a `sample/resources/` subfolder, creating `sample/resources/notes.md`.
[eval] `archui validate --only structure` reports no errors for `sample/`. The resources/ folder is exempt from the unexpected-file rule.

[action] Add a `sample/config.json` file at module level.
[eval] `archui validate --only structure` reports an unexpected-file error for `sample/config.json`.

[end] Remove `sample/config.json` and the `sample/resources/` folder. Confirm structure validation passes.

---

### Group 3: Invalid folder names

[init] A valid ArchUI project root exists and passes structure validation.

[action] Create a folder `My Module/` (contains uppercase and a space) at the project root with a valid README.md inside.
[eval] `archui validate --only structure` reports `ERROR  [structure/invalid-folder-name]  My Module/  folder name contains uppercase or spaces`.

[action] Rename the folder to `my-module/` (all lowercase, hyphen-separated).
[eval] `archui validate --only structure` reports no name-related errors for `my-module/`.

[action] Create a folder `myModule/` (camelCase, no spaces) with a valid README.md inside.
[eval] `archui validate --only structure` reports an invalid-folder-name error for `myModule/` because it contains uppercase letters.

[end] Remove `my-module/` and `myModule/`. Confirm structure validation passes.

---

### Group 4: Unexpected ArchUI modules inside resources/

[init] A valid ArchUI project root exists and passes structure validation. A module `container/` is present with a `container/resources/` subfolder containing only a non-README file (`diagram.png`).

[action] Create a subfolder `container/resources/sub-module/` with a valid `README.md` inside it (making it look like an ArchUI module).
[eval] `archui validate --only structure` reports an error on `container/resources/sub-module/` indicating that a folder with a README inside `resources/` is not permitted there; it should be a proper submodule instead.

[action] Move `container/resources/sub-module/` to `container/sub-module/` (proper submodule location) and add `sub-module` to `container/README.md`'s `submodules` list.
[eval] `archui validate --only structure` reports no errors for `container/`.

[end] Remove `container/sub-module/` and revert `container/README.md`'s `submodules` list. Confirm structure validation passes.
