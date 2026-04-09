# Writing MEMORY.md

A MEMORY records accumulated knowledge and runtime observations for its parent SPEC. It links only to the parent SPEC. Additional outbound links are a validation warning.

## Required Sections

```markdown
---
name: Module Name Memory
description: "Runtime memory and accumulated observations for the [parent module] module."
---

## Overview

[What accumulated knowledge this memory records — 2–3 sentences.]

## Observations

[Timestamped entries of runtime discoveries, bug patterns, performance notes,
or design trade-off learnings. Append-only — never delete observations.]
```

## Writing Rules

1. **Append-only**: New observations are added at the bottom. Never delete or rewrite existing entries.
2. **Timestamped**: Each observation must include a date or context marker (e.g., `2025-11-03`, `after v1.2 release`).
3. **Actionable**: Observations should inform future decisions. "BLE handshake times out after 30s under load" is useful; "tested BLE" is not.
4. **Scoped**: Only record observations relevant to the parent SPEC. Cross-cutting observations belong in the parent module's memory, not a leaf module's.

## Observation Format

Each observation entry should follow this pattern:

```markdown
### [date or context marker]

[What was discovered, and what it means for future work.]
[Optional: what to do (or avoid) as a result.]
```

## index.yaml for a MEMORY

```yaml
schema_version: 1
uuid: <generated>
submodules: {}
links:
  - uuid: <parent-spec-uuid>
    relation: related-to
```

Additional links beyond the parent SPEC trigger a `WARN` during validation.

## When to Create a MEMORY

Create a MEMORY submodule when:
- You are about to record a non-obvious finding that future agents should know
- The parent SPEC has recurring bugs or behavioral surprises worth logging
- The module's behavior differs from its specification in edge cases that can't be fixed yet
