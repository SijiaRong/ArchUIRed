# Writing README.md

A README is the generic fallback identity document — used when no stronger type (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`) applies. Typically used for organizational grouping modules that have no `resources/`.

## Required Sections

```markdown
---
name: Module Name
description: One-sentence purpose statement.
---

## Overview

[What this module represents, why it exists — 2–4 sentences.]

## Sub-modules

[For each direct child in .archui/index.yaml submodules, one sentence
describing its role. Omit if no submodules.]

## Dependencies

[For each link in .archui/index.yaml links, one sentence explaining
the relationship. Omit if no links.]
```

## Choosing README vs. Other Types

| Situation | Use |
|---|---|
| Organizational grouping, no implementation | `README.md` |
| Has `resources/` folder with implementation | `SPEC.md` |
| Is a test playbook for a SPEC | `HARNESS.md` |
| Records runtime observations | `MEMORY.md` |
| Teaches agents how to do something | `SKILL.md` |

If you're unsure, default to `README.md`. You can promote it later.

## Promoting README to SPEC

If a module with `README.md` gains a `resources/` directory, promote it:

1. `git mv README.md SPEC.md`
2. Preserve all frontmatter and body content
3. Add `## Design` section describing the implementation approach
4. Create a harness submodule: `<name>-harness/` with `HARNESS.md`
5. Register the harness in this module's `.archui/index.yaml` submodules
6. Run the validator

## Anti-Patterns

| Don't | Do |
|---|---|
| Use README.md when `resources/` exists | Promote to SPEC.md |
| Leave body empty | Write at least an Overview |
| List child folder names without explanation | Write one sentence per submodule role |
