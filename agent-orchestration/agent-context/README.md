---
name: Agent Context
description: "Defines the initialization contract for an ArchUI agent, specifying what is always loaded, what is loaded on demand, and how context budget is managed."
---

## Overview

Every ArchUI agent session begins with a defined initialization sequence. The goal is to minimize context footprint while giving the agent enough information to navigate to any module it needs. The `description` field — one sentence per module — is the primary tool for this. An agent can survey an entire module tree using only descriptions before deciding which full READMEs to load.

## Details

### What Is Always Loaded

- **Root README.md description**: The one-sentence `description` field from the repository root README. This is always in context because it orients the agent to the overall system purpose.
- **Target module description**: The one-sentence `description` of the module the agent was initialized against (its starting point).

These two sentences are the minimum viable context for any agent session. They are cheap enough to load unconditionally.

### What Is Loaded On Demand

- **Full README body**: The Markdown body below the frontmatter for any module the agent opens. This is moderate cost — load it when the agent needs to understand a module's rules or content in detail.
- **Submodule descriptions**: When an agent navigates into a module's submodules, it loads each submodule's `description` first (cheap), then expands to full bodies only as needed.
- **Whole subtrees**: Loading all READMEs under a module at once is expensive. Avoid this unless the task explicitly requires it (e.g., an architect agent auditing all platform modules).

### Context Budget Principle

Always load the minimum context needed to complete the next step, then expand. The decision tree is:

1. Does the description tell me enough to decide whether this module is relevant? → If yes, stop there.
2. Does the full README body answer my question? → If yes, stop there.
3. Do I need to recurse into submodules? → Load each submodule description first; expand only the relevant ones.

An agent that loads everything eagerly will hit context limits on large module trees. An agent that loads only descriptions navigates the whole tree cheaply.

### How to Scope an Agent

Pass the agent a **starting module path** (e.g., `ios-development-release/`). The agent:

1. Reads `ios-development-release/README.md` fully (frontmatter + body).
2. For each UUID in the `links` field, loads only the linked module's `description` — not its full body — to understand dependencies.
3. For each name in `submodules`, loads only the submodule's `description` to build a map of what's available.
4. Expands any submodule or linked module to full body only when the task requires it.

This means the agent starts with a clear picture of what is in scope and what is adjacent, without loading anything it may not need.

### Architect vs. Platform Agents

| Property | Architect Agent | Platform Agent |
|---|---|---|
| Starting module | Repository root | Platform module (e.g., `ios-development-release`) |
| Scope | Full module tree | Platform subtree only |
| Cross-boundary access | Navigates freely | Via UUID links only, loading descriptions first |
| Typical tasks | Core rule changes, cross-platform specs | Feature work, release prep within one platform |

An architect agent that needs to check a platform's state loads that platform module's description first, then expands if needed — it does not load all platform modules simultaneously.
