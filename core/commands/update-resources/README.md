---
name: Update Resources Skill
description: "AI skill defining the bottom-up resources generation algorithm: reversibility check, implements-graph traversal, sub-agent scoping rules, and spec-repair-first failure handling."
---

## Purpose

This is an AI-readable skill. When an `update-resources` command is triggered on any module, the executing agent loads this document and follows the algorithm below.

---

## Phase 0 — Reversibility Check (MANDATORY, runs before any file is written)

Before generating any resources, verify that the architecture is computationally reversible — i.e., that every module in the target subtree has sufficient spec to fully regenerate its resources from scratch.

**For each module in the target subtree, check:**

1. Does the README.md body contain enough information to understand what to build? (More than just `name` and `description`)
2. For modules with `implements` links: does the source spec describe behaviour, interface, or structure in enough detail to implement from?
3. Are all external dependencies (libraries, APIs, protocols) either named in the spec or derivable from linked modules?

**If any module fails the check:**

- List every failing module and what spec is missing
- Stop. Do not write any resources.
- Report to the user:
  > "Cannot generate resources: the following modules have insufficient spec to guarantee reversibility: [list]. Please add more detail to these modules' README.md files before running Update Resources."

**Only proceed to Phase 1 when all modules pass.**

---

## Phase 1 — Build the Implements Graph

Starting from the triggered module (the "root" for this run):

1. Read the root module's `.archui/index.yaml` to get its `links` and `submodules`.
2. Collect all modules in the subtree (root + all descendants via `submodules`).
3. For each module in the subtree, identify its `implements` links (links where `relation: implements`).
4. Build a directed graph: `A implements B` means A must be built before B can be built (A is a dependency of B).
5. Topologically sort the graph. Leaf nodes (no outgoing `implements` edges) are built first.

**Scope boundary:** only traverse within the root module's subtree. Do not follow `implements` links to modules outside the subtree.

---

## Phase 2 — Bottom-Up Resources Generation

Process modules in topological order (leaves first, root last).

For each module, spawn a **scoped sub-agent** with the following constraints:

### Sub-agent READ permissions
- ✅ This module's README.md and SKILL.md
- ✅ README.md / SKILL.md of any module with a `links` relationship (any relation)
- ✅ `resources/` of modules that this module `implements` (the modules below it in the graph)
- ❌ `resources/` of any other module (parent, sibling, unrelated)
- ❌ Any file outside the project root

### Sub-agent WRITE permissions
- ✅ `this-module/resources/` — the only directory the sub-agent may write
- ❌ Any README.md or `.archui/index.yaml` file (spec is immutable during resources generation)
- ❌ Any other module's `resources/`

### Sub-agent task instruction

> You are generating resources for module `{{module.path}}`.
>
> Read this module's README.md to understand what to build. Read the README.md of all linked modules for context. Read the `resources/` of any module that this module implements for reference implementations.
>
> Write all output to `{{module.path}}/resources/`. Do not touch any other directory.
>
> When done, run `archui validate .` to confirm spec is still valid.

### Sub-agent completion criteria
- All required resources exist in `{{module.path}}/resources/`
- `archui validate .` exits 0
- No files were written outside `{{module.path}}/resources/`

---

## Phase 3 — Failure Handling

If a sub-agent fails (resources cannot be generated as specified):

**The sub-agent must NOT:**
- Fix the problem by reading a parent module's resources
- Write to any module other than its own

**The sub-agent MUST:**
1. Report the specific problem: what is missing or contradictory in the spec?
2. Suggest a spec fix: which module's README.md needs more detail, or which links/submodules need to be added or removed

**The orchestrating agent then:**
1. Updates the failing module's spec (README.md and/or `.archui/index.yaml`) — this is a spec change, not a resources change
2. Runs `archui validate .` after spec changes
3. Re-triggers the sub-agent for the repaired module
4. If the same module fails 3 times: stop and report to the user with the full failure log

---

## Phase 4 — Propagation

After all leaf modules complete successfully, move to their parent modules. Apply Phase 2 for each parent, which now has the leaf modules' resources available to read.

Continue up the tree until the root module's resources are generated.

---

## Invariants (enforced throughout)

| Invariant | Rule |
|---|---|
| Spec immutability | No README.md or `.archui/index.yaml` may be modified during resources generation. Spec changes require stopping and re-running. |
| Scope isolation | Each sub-agent's writes are confined to one module's `resources/` |
| Reversibility | At the end, deleting all `resources/` and re-running this command must produce an identical result |
| No upward reads | A sub-agent never reads a parent's `resources/` |
| Validate before done | `archui validate .` must pass before any phase is marked complete |
