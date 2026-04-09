# Quality Checklist

Run this checklist before considering any identity document complete.

## All Document Types

- [ ] Frontmatter has exactly `name` and `description` — nothing else
- [ ] `description` is one declarative sentence in present tense
- [ ] Body has at minimum a `## Overview` section
- [ ] No source code, config snippets, or file listings in the body
- [ ] No "TODO", "TBD", or "See code" placeholders
- [ ] Cross-references use relative paths with section anchors
- [ ] If body exceeds 300 lines, a table of contents is present
- [ ] Every section adds information not implied by the module name
- [ ] Third-person present tense throughout

## SPEC.md Specific

- [ ] `## Design` section is present and describes the implementation approach
- [ ] A HARNESS submodule exists and is registered in `.archui/index.yaml`
- [ ] `## Sub-modules` lists every child in `index.yaml` submodules
- [ ] `## Dependencies` lists every link in `index.yaml` links
- [ ] No source code reproduced from `resources/`

## HARNESS.md Specific

- [ ] Every playbook group uses `[init]` / `[action]` / `[eval]` / `[end]` markers
- [ ] Every `[eval]` describes a specific observable outcome (not "works as expected")
- [ ] Each group is runnable independently
- [ ] Happy path is covered; edge cases are covered
- [ ] `index.yaml` has exactly one link to the parent SPEC with `relation: implements`

## MEMORY.md Specific

- [ ] All observations are timestamped
- [ ] No observation has been deleted or rewritten (append-only)
- [ ] Each observation is actionable, not just a log entry
- [ ] `index.yaml` links only to the parent SPEC

## README.md Specific

- [ ] The module does not have a `resources/` folder (if it does, promote to SPEC.md)
- [ ] Submodules section is present if children exist in `index.yaml`

## After Completing a Document

```bash
node cli/resources/dist/index.js validate .
```

Fix all `ERROR` outputs. Note `WARN` outputs but may continue if advisory only.
