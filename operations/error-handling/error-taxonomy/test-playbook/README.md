---
name: Error Taxonomy Test Playbook
description: Playbook for verifying that each of the six error categories is correctly identified and distinguished from adjacent categories in edge cases.
---

## Playbook

### Group 1: Distinguishing VALIDATION_ERROR from PARSE_ERROR

[init] A valid ArchUI project is open. The CLI validator is available.

[action] Remove the required `uuid` field from a module's README.md frontmatter while keeping the YAML syntax valid.
[eval] archui validate reports a VALIDATION_ERROR (not a PARSE_ERROR) for that file, citing the missing required field. The file was parseable; the error is a content rule violation.

[action] Introduce a YAML syntax error into a module's README.md frontmatter (e.g., unbalanced quotes or incorrect indentation).
[eval] archui validate reports a PARSE_ERROR for that file, including the line and column number from the YAML parser. No VALIDATION_ERROR is reported for this file since the frontmatter could not be parsed.

[action] Restore both files to valid state and run archui validate.
[eval] No errors are reported.

[end] Project passes validation cleanly.

---

### Group 2: Distinguishing BROKEN_LINK from INDEX_STALE

[init] A valid ArchUI project. Module A has a link entry referencing module B's UUID.

[action] Delete module B's folder from disk without updating index.yaml or module A's links.
[eval] archui validate reports a BROKEN_LINK error referencing module B's UUID from module A's README.md. Running archui index --fix does not resolve this — the directory genuinely does not exist. The user must remove the link or recreate the module.

[action] Restore module B's folder. Now rename it (changing its path) without updating index.yaml.
[eval] archui validate reports an INDEX_STALE error (the index path for B's UUID is wrong). The link from A still resolves to the correct UUID; after archui index --fix rebuilds the index, the BROKEN_LINK is gone and validation passes.

[end] Restore all files to valid state. archui validate passes.
