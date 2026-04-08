---
name: Integration Tests Test Playbook
description: "Playbook for verifying that each of the seven canonical ArchUI filesystem operation test cases is correctly specified, uses canonical shared fixtures, and is fully implemented on all platforms."
---

## Overview

This playbook verifies that the seven canonical ArchUI integration test cases are correctly specified and properly implemented on every platform, using the shared fixtures from `core/testing-qa/resources/fixtures/`.

---

## Playbook

### Group 1: Frontmatter parsing (Cases 1 and 2)

[init] The shared fixture `fixtures/valid-module/README.md` exists with all five frontmatter fields populated. The shared fixture `fixtures/invalid-missing-fields/README.md` exists with `uuid` present but `name` and `description` absent.

[action] Run Case 1 on a platform: pass `fixtures/valid-module/README.md` to the platform's frontmatter parser.
[eval] The parser returns a data structure with all five fields matching the fixture values exactly. No exception is thrown. The `links` objects have only the fields present in YAML — absent optional fields are not present as `null` values.

[action] Run Case 2 on the same platform: pass `fixtures/invalid-missing-fields/README.md` to the parser.
[eval] The parser raises a structured error that identifies the missing fields (`name`, `description`) and the module path. It does not return a partial parsed object.

[action] Run Case 1 and Case 2 on a second platform using the same shared fixtures.
[eval] Both cases produce results identical to the first platform. Parsing behavior is consistent across platforms.

[end] No filesystem changes are needed. Confirm shared fixtures remain unmodified (read-only).

---

### Group 2: Module tree walk (Case 3)

[init] The shared fixture `fixtures/multi-level-tree/` exists with three levels of nesting as specified.

[action] Run Case 3 on a platform: point the tree-walker at the fixture root and collect all discovered module paths.
[eval] All six module paths are returned in depth-first order. The `resources/` subfolder is not included in the result. No modules are skipped.

[action] Run Case 3 on a second platform using the same fixture.
[eval] The same set of six paths is returned in the same depth-first order. Tree-walk behavior is consistent across platforms.

[action] Temporarily add a `resources/` subfolder with some files to one of the intermediate fixture modules. Re-run Case 3.
[eval] The `resources/` subfolder is still excluded from the results. The module count remains six. The test confirms `resources/` exemption applies at any nesting level.

[end] Remove the temporarily added `resources/` folder. Confirm the fixture is restored to its original state.

---

### Group 3: UUID resolution and broken link detection (Cases 4 and 5)

[init] The shared fixtures `fixtures/valid-module/` and `fixtures/broken-link/` exist. `valid-module/` has a correct `index.yaml`. `broken-link/` has one module referencing a non-existent UUID.

[action] Run Case 4 on a platform: load `index.yaml` from `fixtures/valid-module/`, resolve a known UUID.
[eval] The resolver returns the exact path string as recorded in `index.yaml`, relative to the project root. No filesystem I/O beyond reading `index.yaml` occurs.

[action] Run Case 5 on a platform: run `archui validate` against `fixtures/broken-link/`.
[eval] Validation reports a non-zero exit code, identifies the source module path and the unresolved UUID. No additional spurious errors are reported.

[action] Run Cases 4 and 5 on a second platform using the same fixtures.
[eval] Results match the first platform exactly. UUID resolution and broken link detection are consistent.

[end] No filesystem changes are needed. Confirm shared fixtures remain unmodified.

---

### Group 4: Index update and rename stability (Cases 6 and 7)

[init] A temporary directory is available. The shared fixtures `fixtures/valid-module/` and `fixtures/multi-level-tree/` are available as read-only references.

[action] Run Case 6: copy `fixtures/valid-module/` to a temporary directory. Create `new-submodule/` with UUID `aabbccdd`. Run `archui index --fix`. Read the updated `index.yaml`. Run `archui validate`.
[eval] `index.yaml` contains the entry `aabbccdd → new-submodule/`. `archui validate` exits with code 0. No existing index entries were modified.

[action] Run Case 7: copy `fixtures/multi-level-tree/` to a temporary directory. Rename a level-1 module folder. Run `archui index --fix`. Run `archui validate`. Resolve the renamed module's UUID.
[eval] The UUID maps to the new folder name in `index.yaml`. `archui validate` exits with code 0. No links in other modules report broken references.

[action] Run Cases 6 and 7 on a second platform using copies of the same fixtures.
[eval] Results match the first platform. Index update and rename behaviors are consistent across platforms.

[end] Delete all temporary directories. Confirm shared fixtures remain unmodified.
