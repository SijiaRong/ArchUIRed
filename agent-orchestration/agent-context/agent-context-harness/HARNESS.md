---
name: Agent Context Test Playbook
description: "Playbook for verifying the agent initialization sequence, context budget rules, and on-demand loading behavior defined in the agent-context module."
---

## Playbook

### Group 1: Minimum Viable Context

[init] A valid ArchUI project exists with at least three levels of module nesting. An agent session is being initialized.

[action] The agent loads only the root README.md description field and the target module description field.
[eval] Exactly two sentences are in the agent's initial context — one from the root module and one from the target module. No full README bodies have been loaded.

[action] The agent is asked whether the target module is relevant to a described task, using only the two loaded descriptions.
[eval] The agent can make a relevance determination without loading any additional content, demonstrating that descriptions alone are sufficient for initial routing decisions.

[end] Terminate the agent session. No filesystem changes are made.

### Group 2: On-Demand Context Expansion

[init] A valid ArchUI project exists. An agent has loaded the root and target module descriptions.

[action] The agent needs to understand detailed rules of the target module and loads its full README body.
[eval] The full body is now available; the agent does not re-load the description separately — it is already present in the frontmatter of the same file.

[action] The agent finds the target module has three submodules and loads each submodule's description field to decide which to expand.
[eval] Three one-sentence descriptions are loaded. The agent selects one submodule as relevant and loads only that submodule's full README body.

[action] The agent completes its task using only the loaded content and does not load the remaining two submodule bodies.
[eval] Context contains: root description, target module full README, one submodule full README, two submodule descriptions. No eager loading of the full subtree occurred.

[end] Terminate the agent session. No filesystem changes are made.

### Group 3: Context Budget Decision Tree

[init] A valid ArchUI project exists with a large module tree (50+ modules). An agent is asked to find which module handles error classification.

[action] The agent loads only module descriptions at the top level to survey available modules.
[eval] Top-level descriptions are loaded cheaply; the agent identifies a candidate module (operations or error-handling) without loading any full README bodies.

[action] The agent loads the description of the candidate module (error-handling) and determines it is the correct one.
[eval] The description is sufficient to confirm relevance; no full body is loaded yet.

[action] The agent loads the full body of error-handling/README.md only after confirming it is the right module.
[eval] The full body is loaded and contains the error classification taxonomy. No other sibling modules were loaded.

[end] Terminate the agent session. No filesystem changes are made.

### Group 4: Architect vs. Platform Agent Scope

[init] A valid ArchUI project exists with platform modules for iOS, Android, and Web/Electron.

[action] A platform agent is initialized against ios-development-release/ and encounters a UUID link to core/filesystem-rules.
[eval] The platform agent loads only the description of core/filesystem-rules first, not the full core/ subtree.

[action] The platform agent determines the full body of core/filesystem-rules is needed and loads it.
[eval] Only core/filesystem-rules/README.md is loaded; other core/ submodules remain unloaded.

[action] An architect agent is initialized at the root and needs to audit all platform modules.
[eval] The architect agent is permitted to load all platform module descriptions and expand any as needed; this is an explicitly-required whole-subtree operation.

[end] Terminate all agent sessions. No filesystem changes are made.
