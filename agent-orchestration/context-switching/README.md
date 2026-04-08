---
name: Context Switching
description: "Documents how agents cross module boundaries safely, the cost model for context loading, and the handoff protocol when a task requires a different specialist agent."
---

## Overview

Agents do not operate in isolation. A platform agent will sometimes need to check a core rule. An iOS agent may produce work that triggers an architect-level review. This module defines how those boundary crossings happen efficiently and how work is handed off between agents without losing state.

## Details

### Crossing Module Boundaries by UUID Link

When an agent needs information from outside its starting module, it follows the `links` field in the frontmatter rather than navigating the filesystem directly. Each link carries a UUID, an optional relation, and a description.

**Correct pattern — iOS agent checking a core rule:**

1. The agent is working in `ios-development-release/` and needs to verify a filesystem constraint.
2. It reads the `links` field of the relevant submodule and finds a link to `core/filesystem-rules` (uuid: `9e2b5d7c`).
3. It loads `core/filesystem-rules/README.md` — just that one file — not the entire `core/` subtree.
4. After reading the rule, it returns to its platform scope.

**Incorrect pattern:** navigating up to `core/` and reading all submodules to find the rule. This loads far more context than needed and risks pulling in unrelated constraints.

### Cost Model

| Operation | Cost | When to use |
|---|---|---|
| Load a module's `description` field (one sentence) | Cheap | Always; use this to decide if a module is relevant |
| Load a module's full README body | Moderate | When the task requires understanding that module's rules or content |
| Load a whole subtree (all READMEs under a module) | Expensive | Only when explicitly required; architect-level audits only |

The cost model applies across boundaries. Loading `core/filesystem-rules` description is cheap. Loading all of `core/` is expensive. An agent that needs to check one rule loads one file.

### Handoff Protocol

When a task requires a different specialist agent, the current agent produces a **handoff artifact** before stopping. This is a short plain-text summary (can be committed as `resources/handoff-notes.md` in the relevant module) containing:

1. **What was done**: which modules were modified, what changed, and why.
2. **Affected module UUIDs**: a list of UUIDs for every module that was read or written during the session.
3. **Remaining work**: what the next agent needs to do, expressed as specific module paths or UUIDs.
4. **Open questions**: anything unresolved that the receiving agent should be aware of.

The receiving agent reads this artifact as part of its initialization, before reading the git log. It gives the new agent a targeted starting point rather than requiring it to reconstruct context from scratch.

**Example:** An iOS agent modifies `ios-development-release/` and discovers that a change also requires updating `core/readme-schema`. It cannot make that change itself (outside its scope). It commits its iOS work, writes a handoff artifact naming `core/readme-schema` (uuid: `1d3c7a9e`) as the next target, and signals completion. An architect agent picks up the handoff, reads the artifact, loads `core/readme-schema`, and applies the cross-cutting change.

### Cross-Platform Changes

If a change to `core/` affects all platform modules (iOS, Android, web/Electron), the correct pattern is:

- The architect agent makes the `core/` change.
- It creates one task per platform (see `session-state/` for task mechanics), each task scoped to a single platform module UUID.
- Each platform agent runs independently, scoped to its own module, and only loads `core/` by description or targeted UUID link as needed.

**Do not** have a single agent load all platform modules simultaneously to apply a cross-cutting change. The context cost is too high and the blast radius of an error is too large. Independent scoped agents with clear task definitions are cheaper and safer.
