# Writing HARNESS.md

A HARNESS is a test playbook for its parent SPEC. It has exactly one link — to the parent SPEC with `relation: implements`. No other links are permitted.

## Required Sections

```markdown
---
name: Module Name Test Playbook
description: "Playbook for verifying that [parent module] correctly [key behavior summary]."
---

## Overview

[What this harness tests and how it verifies the parent SPEC — 2–3 sentences.]

## Playbook

### Group N: [Behavior being tested]

[init] Setup conditions — what must be true before the test.
[action] The action that triggers the behavior under test.
[eval] Observable outcomes that prove the behavior is correct.
[end] Cleanup or reset.
```

## Writing Rules

1. **Group structure**: Each group targets one coherent behavior. Use `[init]`, `[action]`, `[eval]`, `[end]` markers for each step.
2. **Observable outcomes**: Every `[eval]` must describe something verifiable — a visible state, a measurable value, or a file on disk. Never write "it should work correctly."
3. **Independence**: Each group must be runnable independently. Do not assume prior groups have passed.
4. **Coverage**: Cover the happy path first, then edge cases. Every requirement in the parent SPEC should have at least one corresponding group.
5. **No implementation details**: Describe *what to verify*, not *how to implement test code*. The harness is a specification, not a test script.

## Anti-Patterns

| Don't | Do |
|---|---|
| Write vague evals like "works as expected" | Describe specific observable outcomes |
| Couple groups so they must run in order | Make each group independent |
| Test implementation details | Test behavior described in the parent SPEC |
| Skip edge cases | Cover error handling and boundary conditions |
| Add links to modules other than the parent SPEC | Keep the single `implements` link only |

## index.yaml for a HARNESS

```yaml
schema_version: 1
uuid: <generated>
submodules: {}
links:
  - uuid: <parent-spec-uuid>
    relation: implements
```

No `submodules`. Exactly one link. Any deviation is a validation error.
