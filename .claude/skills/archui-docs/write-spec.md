# Writing SPEC.md

A SPEC defines an implementation specification — a module with `resources/` that implements something. Every SPEC must have exactly one HARNESS submodule.

## Required Sections

```markdown
---
name: Module Name
description: One-sentence purpose statement.
---

## Overview

[What this module does, why it exists, what problem it solves — 2–4 sentences.
Must add information beyond the description field.]

## Design

[Key design decisions, constraints, architectural choices.
Describe the approach without reproducing source code.
Include state machines, data flow, or protocol descriptions if applicable.
3–6 sentences, or structured subsections for complex modules.]

## Sub-modules

[For each direct child in .archui/index.yaml submodules, one sentence
describing its role. Omit this section if no submodules exist.]

## Dependencies

[For each link in .archui/index.yaml links, one sentence explaining
the relationship. Omit this section if no links exist.]
```

## Optional Sections

Add these when relevant:

- **Commands** — If the module exposes executable agent commands via `.archui/commands/`
- **Constraints** — Hard rules or invariants the implementation must respect
- **API** — Public interfaces, protocol definitions, or contract specifications

## Anti-Patterns

| Don't | Do |
|---|---|
| Reproduce source code in the body | Describe the design at an architectural level |
| List every file in `resources/` | Summarize the implementation approach |
| Write multi-page prose | Keep each section 3–6 sentences |
| Leave body empty (stub) | Always write at least Overview + Design |
| Write "TODO" or "See code" | Omit a section entirely rather than stub it |

## After Writing

Run the validator. A SPEC without a HARNESS submodule triggers `spec/missing-harness`.

```bash
node cli/resources/dist/index.js validate .
```
