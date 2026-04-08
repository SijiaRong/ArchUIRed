---
name: Validator
description: The validator orchestrates all ArchUI sub-validators and reports a unified pass/fail result with per-violation error messages for every conformance rule.
---

## Overview

The validator is the single entry point for full conformance checking. Running `archui validate [path]` causes the validator to invoke each sub-validator in sequence, collect all violations, and print a unified report. Exit code 0 means every check passed. Any non-zero exit code means at least one violation was found; the count of violations is reflected in the exit code up to a maximum of 127.

```
archui validate [path]
```

If `[path]` is omitted, the validator operates on the current working directory. The path is expected to be the root of an ArchUI module tree — typically the repository root.

## Execution Order

The validator runs sub-validators in dependency order to produce the most useful error output:

1. **structure-validator** — checks folder/file layout first, because frontmatter and link checks are meaningless if README files are missing.
2. **frontmatter-validator** — checks YAML frontmatter once structure is confirmed sound.
3. **link-validator** — checks link entries after frontmatter is confirmed parseable and the uuid index is available.
4. **index-sync** — checks `.archui/index.yaml` consistency last, after all module metadata has been validated.

If structure-validator finds critical errors (missing README files), later validators may be skipped for the affected subtrees to avoid cascading false positives.

## Output Format

Each violation is printed on its own line:

```
ERROR  [rule-id]  path/to/README.md  <human-readable explanation>
```

A summary line is printed at the end:

```
Validation complete: 3 violation(s) found.
```

or

```
Validation complete: all checks passed.
```

## Running Sub-Validators Independently

Each sub-validator in this module can be run on its own, which is useful when only a specific class of rules has changed:

```
archui validate --only structure [path]
archui validate --only frontmatter [path]
archui validate --only links [path]
archui validate --only index [path]
```
