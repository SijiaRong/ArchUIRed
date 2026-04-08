# ArchUI Identity Document Authoring & Reading

Load this skill when **creating, modifying, or reading** any ArchUI identity document (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, `README.md`). It teaches document structure, quality standards, and efficient reading strategies.

This skill complements `archui-spec` (structural workflow) — `archui-spec` covers *how to create/move/link modules*; this skill covers *how to write and read the prose inside them*.

---

## Quick Dispatch

| Task | Jump to |
|---|---|
| Creating or enriching a **SPEC.md** | [Writing SPEC.md](#writing-specmd) |
| Creating or enriching a **HARNESS.md** | [Writing HARNESS.md](#writing-harnessmd) |
| Creating or enriching a **MEMORY.md** | [Writing MEMORY.md](#writing-memorymd) |
| Creating or enriching a **README.md** | [Writing README.md](#writing-readmemd) |
| Writing a good `description` field | [Description Field](#description-field) |
| Reading a module you haven't seen before | [Reading Strategy](#reading-strategy) |
| Reading a large module tree | [Tree Scanning](#tree-scanning) |
| Checking documentation quality | [Quality Checklist](#quality-checklist) |

---

## Frontmatter Rules (all document types)

Every identity document uses the same frontmatter schema — **two fields only**:

```yaml
---
name: Human-Readable Module Name
description: One declarative sentence describing the module's purpose.
---
```

**Forbidden in frontmatter:** `uuid`, `submodules`, `links`, `layout`, or any other field.

### Description Field

The `description` is always loaded into agent context. It must be:

- **One sentence** — multi-sentence triggers a validation warning
- **Declarative** — states what the module *does*, not what it *contains*
- **Self-contained** — understandable without reading the body
- **Present tense** — "Validates filesystem structure" not "Will validate..."

| Quality | Example |
|---|---|
| Bad | "This is the CLI module." |
| Bad | "Contains index.ts, validate.ts, and init.ts." |
| Good | "Validates ArchUI filesystem structure and reports conformance errors after agent or human edits." |

---

## Writing SPEC.md

A SPEC defines an implementation specification — a module with `resources/` that implements something. Every SPEC must have exactly one HARNESS submodule.

### Required Sections

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

### Optional Sections (add when relevant)

- **Commands** — If the module exposes executable agent commands via `.archui/commands/`
- **Constraints** — Hard rules or invariants the implementation must respect
- **API** — Public interfaces, protocol definitions, or contract specifications

### SPEC Anti-Patterns

| Don't | Do |
|---|---|
| Reproduce source code in the body | Describe the design at an architectural level |
| List every file in `resources/` | Summarize the implementation approach |
| Write multi-page prose | Keep each section 3–6 sentences |
| Leave body empty (stub) | Always write at least Overview + Design |
| Write "TODO" or "See code" | Omit a section entirely rather than stub it |

---

## Writing HARNESS.md

A HARNESS is a test playbook for its parent SPEC. It has exactly one link (to the parent SPEC with `relation: implements`). No other links are permitted.

### Required Sections

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

### Harness Writing Rules

1. **Group structure**: Each test group targets one coherent behavior. Use `[init]`, `[action]`, `[eval]`, `[end]` markers for each step.
2. **Observable outcomes**: Every `[eval]` must describe something verifiable — a visible state, a measurable value, or a file on disk. Never write "it should work correctly."
3. **Independence**: Each group must be runnable independently. Do not assume prior groups have passed.
4. **Coverage**: Cover the happy path first, then edge cases. Every requirement in the parent SPEC should have at least one corresponding test group.
5. **No implementation details**: Describe *what to verify*, not *how to implement the test code*. The harness is a specification, not a test script.

### Harness Anti-Patterns

| Don't | Do |
|---|---|
| Write vague evals like "works as expected" | Describe specific observable outcomes |
| Couple groups so they must run in order | Make each group independent |
| Test implementation details | Test behavior described in the parent SPEC |
| Skip edge cases | Cover error handling and boundary conditions |

---

## Writing MEMORY.md

A MEMORY records accumulated knowledge and runtime observations for its parent SPEC. Links only to the parent SPEC. Additional outbound links are a warning.

### Required Sections

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

### Memory Writing Rules

1. **Append-only**: New observations are added at the bottom. Never delete or rewrite existing entries.
2. **Timestamped**: Each observation should include a date or context marker.
3. **Actionable**: Observations should inform future decisions. "The BLE handshake times out after 30s under load" is useful; "tested BLE" is not.
4. **Scoped**: Only record observations relevant to the parent SPEC module. Cross-cutting observations belong in the parent module's memory.

---

## Writing README.md

A README is the generic fallback identity document — used when no stronger type (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`) applies. Typically used for organizational grouping modules that have no `resources/`.

### Required Sections

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

### When to Promote README to SPEC

If a module with `README.md` gains a `resources/` directory, it should be promoted to `SPEC.md`:

1. Rename: `git mv README.md SPEC.md`
2. Preserve all frontmatter and body content
3. Create a harness submodule: `<name>-harness/` with `HARNESS.md`
4. The harness gets one link to the parent SPEC with `relation: implements`

---

## Progressive Disclosure Rules

These rules prevent documents from becoming unwieldy.

### Table of Contents Trigger

If any identity document body exceeds **300 lines**, prepend a table of contents immediately after the frontmatter:

```markdown
---
name: ...
description: ...
---

## Table of Contents

| Section | Lines | Description |
|---------|-------|-------------|
| [Overview](#overview) | 5–20 | Purpose and scope |
| [Design](#design) | 21–150 | Architecture and decisions |
| ...
```

### Cross-Referencing

When one document needs information from another:

- **Do**: Write a 1–2 sentence summary + link to the authoritative source
- **Don't**: Copy content between documents

```markdown
## BLE Protocol

This module implements the simplified handshake described in the
[BLE Protocol SPEC](../ble-protocol/SPEC.md#handshake). Key differences
from the base protocol: [summarize what's unique here].
```

### Section Depth

- Limit heading depth to H3 (`###`) inside identity documents
- Use tables and lists instead of deeper nesting
- If a section needs H4 or deeper, it is a candidate for splitting into a submodule

---

## Content Quality Rules

These apply to **all** document types.

1. **Third-person present tense**: "This module validates…" not "I will validate…" or "We validate…"
2. **Every sentence adds information**: If a sentence only restates the module name, delete it
3. **No source code in identity documents**: Code belongs in `resources/`. Describe the *design*, not the *contents*
4. **No file listings**: Do not enumerate files in `resources/`. Summarize the implementation approach
5. **Omit rather than stub**: An absent section is better than "TODO" or "See code"
6. **Concise by default**: 3–6 sentences per section unless complexity demands more
7. **Consistent terminology**: Use terms from the parent module or core spec. Do not invent synonyms

---

## Reading Strategy

When reading ArchUI modules, follow the **overview-first** approach to minimize context pollution.

### Reading a Single Module

1. Read the identity document (`SPEC.md` / `README.md` / etc.)
2. Read `.archui/index.yaml` in the same directory — **always**, no exceptions
3. You now have: name, description, uuid, submodules list, links list, and body prose

### Reading a Module Tree (multiple modules)

Use progressive reading to avoid loading unnecessary context:

**Step 1 — Scan descriptions only**

Read the `description` field from each module's identity document frontmatter. This gives you a one-sentence summary of every module without loading any body content.

```
For each module in the tree:
  → Read first 5 lines of identity doc (captures frontmatter)
  → Read .archui/index.yaml (captures structure)
```

**Step 2 — Select relevant modules**

From the descriptions, identify the 2–3 modules most relevant to your task.

**Step 3 — Read selected modules fully**

Only now read the full body of the modules you selected.

### Tree Scanning

When exploring a large module tree for the first time:

| What you need | What to read | Context cost |
|---|---|---|
| Module inventory | `description` fields only | ~1 line per module |
| Structure map | `description` + `.archui/index.yaml` | ~5 lines per module |
| Specific module detail | Full identity document + index.yaml | ~50–300 lines |
| Cross-module relationships | `links` from all index.yaml files | ~3 lines per link |

**Never read all identity documents fully at once.** Start narrow, expand as needed.

### Navigating Links

When you encounter a link in `.archui/index.yaml`:

1. Note the target UUID and relation type
2. Find the target module: search for that UUID in other `.archui/index.yaml` files
3. Read the target's description first — decide if you need the full document
4. Only read the full target document if it's directly relevant to your task

---

## Quality Checklist

Before considering a document complete, verify:

- [ ] Frontmatter has exactly `name` and `description` — nothing else
- [ ] `description` is one declarative sentence in present tense
- [ ] Body has at minimum an `## Overview` section
- [ ] No source code, config snippets, or file listings in the body
- [ ] No "TODO", "TBD", or "See code" placeholders
- [ ] Cross-references use relative paths with section anchors
- [ ] If body exceeds 300 lines, a table of contents is present
- [ ] Every section adds information not implied by the module name
- [ ] Third-person present tense throughout
- [ ] HARNESS has `[init]`/`[action]`/`[eval]`/`[end]` structure in playbook groups
- [ ] MEMORY observations are timestamped and append-only
