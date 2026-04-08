---
name: README Schema Test Playbook
description: "Playbook for verifying that README.md frontmatter is correctly parsed, validated for required and optional fields, and that the description field is properly treated as agent-facing context."
---

## Overview

This playbook verifies that the YAML frontmatter schema for module README.md files is correctly parsed and validated, including required field presence, optional field handling, and body parsing behavior.

---

## Playbook

### Group 1: Required fields enforcement

[init] A valid ArchUI project root exists with `.archui/index.yaml` and a passing root `README.md`. A module `schema-test/` is present with all five frontmatter fields populated.

[action] Remove the `uuid` field from `schema-test/README.md` frontmatter.
[eval] `archui validate` reports a missing required field error for `schema-test/`: `uuid` is absent.

[action] Restore `uuid`. Remove the `name` field.
[eval] `archui validate` reports a missing required field error for `schema-test/`: `name` is absent.

[action] Restore `name`. Remove the `description` field.
[eval] `archui validate` reports a missing required field error for `schema-test/`: `description` is absent.

[action] Restore `description`. Confirm all three required fields are present.
[eval] `archui validate` reports no errors for `schema-test/`.

[end] Remove `schema-test/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 2: Optional fields omission

[init] A valid ArchUI project root exists and passes validation. A module `minimal-module/` is present with only the three required fields (`uuid`, `name`, `description`) and no `submodules` or `links` fields.

[action] Run `archui validate` against the project.
[eval] `archui validate` passes with no errors. Omitting `submodules` and `links` is valid when no submodules or links exist.

[action] Add an explicit `submodules: []` to `minimal-module/README.md`.
[eval] `archui validate` still passes. An empty list is equivalent to omitting the field.

[action] Add an explicit `links: []` to `minimal-module/README.md`.
[eval] `archui validate` still passes. An empty links list is equivalent to omitting the field.

[action] Add an unrecognized field `custom-field: some-value` to `minimal-module/README.md` frontmatter.
[eval] `archui validate` passes. Unrecognized frontmatter fields are ignored (forward-compatibility).

[end] Remove `minimal-module/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 3: Frontmatter position and delimiter rules

[init] A valid ArchUI project root exists and passes validation. A module `delimiter-test/` is present with valid frontmatter beginning on line 1.

[action] Add a blank line before the opening `---` delimiter of `delimiter-test/README.md`, so the frontmatter no longer starts on line 1.
[eval] `archui validate` reports a frontmatter parse error on `delimiter-test/`: the frontmatter block must begin on line 1 of the file.

[action] Remove the leading blank line so frontmatter begins on line 1 again. Remove the closing `---` delimiter.
[eval] `archui validate` reports a frontmatter parse error on `delimiter-test/`: the closing `---` delimiter is missing.

[action] Restore the closing `---` delimiter.
[eval] `archui validate` passes for `delimiter-test/`.

[end] Remove `delimiter-test/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.

---

### Group 4: Description field semantics

[init] A valid ArchUI project root exists and passes validation. A module `desc-test/` is present with a `description` value that is a single sentence ending with a period.

[action] Load the agent context for the project (simulate what an LLM agent would receive — descriptions of all modules without opening full files).
[eval] The description of `desc-test/` appears in the agent context as a single sentence, exactly as written in the frontmatter. The Markdown body of the README is not included.

[action] Replace the `description` value in `desc-test/README.md` with a multi-paragraph string spanning multiple lines.
[eval] `archui validate` reports a warning or error that the `description` field must be a single sentence. The field must be self-contained and not rely on the body for context.

[action] Restore `description` to a single, accurate, declarative sentence.
[eval] `archui validate` passes for `desc-test/`.

[end] Remove `desc-test/` and its entry from `.archui/index.yaml`. Confirm `archui validate` passes.
