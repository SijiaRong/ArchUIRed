---
name: Agent Orchestration
description: "Formalizes how AI agents are scoped, initialized, and coordinated within ArchUI, defining the contract for context boundaries, agent initialization, and task handoff."
---

## Overview

ArchUI agents are scoped by which modules they load. This module defines the rules for how an agent is initialized, what it loads, how it hands off work to other agents, and how it persists state across sessions. An agent that understands these rules can operate correctly without human intervention during a task.

The key insight is that the `description` field in each module's README frontmatter is the primary context unit — one sentence, always small enough to load immediately. Full README bodies and subtrees are loaded only on demand.

## Details

### Agent Types

**Architect agent** — starts at the repository root, loads the root README and navigates the full module tree as needed. Used for cross-cutting changes (e.g., updating `core` rules that affect all platforms).

**Platform agent** — starts at a specific platform module (e.g., `ios-development-release`) and stays scoped to that subtree. Only crosses module boundaries via explicit UUID links when a dependency check is required.

**Specialist agent** — scoped to a single module or small cluster of modules for a focused task (e.g., updating `agent-orchestration/session-state` only).

### Initialization Contract

1. Load the root `README.md` description (one sentence, always in context).
2. Load the target module's `README.md` description.
3. Load the full README body of the target module.
4. Navigate submodules on demand as the task requires.

Full details are in `agent-context/`.

### Handoff Protocol

When a task requires a different specialist, the handing-off agent produces a handoff artifact: a plain-text summary of what changed and which module UUIDs were affected. The receiving agent uses this to initialize its context without re-reading the full history. Full details are in `context-switching/`.

### State Persistence

ArchUI has no agent-specific database. All state is git-tracked on the filesystem. Agents communicate work-in-progress via git commits. Full details are in `session-state/`.
