---
name: Frontmatter Validator
description: "Checks that every README.md contains valid YAML frontmatter with exactly the required fields name and description, and that no structural fields (uuid, submodules, links) are present."
---

## Overview

The frontmatter validator reads the YAML block at the top of every README.md and checks that it satisfies the ArchUI README schema. It runs after the structure validator has confirmed that README files are present. By the time this validator runs, it can assume every module folder has a file to parse.

Structural metadata (`uuid`, `submodules`, `links`) now lives in `.archui/index.yaml`, not in README.md. The frontmatter validator enforces this separation — presence of those fields in README.md is an error.

## Rules Enforced

**YAML block must be present and parseable.**
Every README.md must begin with a `---` delimiter followed by valid YAML. A README with no frontmatter block, or whose frontmatter contains a YAML syntax error, is a violation.

**Required fields: `name` and `description`.**
Both fields must be present and non-empty. An absent field and a field present but set to an empty string or `null` are both violations.

**Structural fields must NOT be present.**
If `uuid`, `submodules`, or `links` appear in README.md frontmatter, that is a violation. These fields belong exclusively in `.archui/index.yaml`.

**`description` is not length-constrained.**
The validator does not enforce a maximum or minimum character count on the description. The convention that it be a single sentence is a style guideline, not a machine-checked rule.

## What This Validator Does NOT Check

- Whether `uuid` is valid or registered — that is `index-sync`'s responsibility, reading from `.archui/index.yaml`.
- Whether `submodules` match actual subfolders — that is `index-sync`'s responsibility.
- Whether link entries reference valid targets — that is `link-validator`'s responsibility.
- The content or structure of the Markdown body below the frontmatter.

## Error Output

```
ERROR  [frontmatter/missing-block]     gui/file-sync/README.md     no YAML frontmatter block found
ERROR  [frontmatter/parse-error]       core/link-system/README.md  YAML syntax error on line 4
ERROR  [frontmatter/missing-field]     cli/validator/README.md     required field 'name' is absent
ERROR  [frontmatter/empty-field]       cli/README.md               field 'description' is present but empty
ERROR  [frontmatter/disallowed-field]  core/uuid-system/README.md  field 'uuid' does not belong in README.md — move to .archui/index.yaml
```
