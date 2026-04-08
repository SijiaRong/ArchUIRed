---
name: Agent Orchestration Test Playbook
description: "Playbook for verifying agent scoping, initialization contracts, handoff protocols, and state persistence rules defined in the agent-orchestration module."
---

## Playbook

### Group 1: Agent Initialization Contract

[init] A valid ArchUI project exists. An agent is configured to start at the agent-orchestration/ module.

[action] The agent loads the root README.md description field only.
[eval] The agent receives exactly one sentence; no other content from the root module is loaded.

[action] The agent loads the target module (agent-orchestration/) description field.
[eval] The agent receives exactly one sentence from agent-orchestration/README.md frontmatter.

[action] The agent loads the full body of agent-orchestration/README.md.
[eval] The full README body is available, including submodule names and link entries.

[action] The agent reads only the description fields of the three submodules (agent-context, context-switching, session-state) without loading their full bodies.
[eval] Three one-sentence descriptions are loaded; no full submodule README bodies are in context.

[end] Terminate the agent session. No filesystem changes are made.

### Group 2: Agent Type Scoping

[init] A valid ArchUI project exists with multiple platform modules and a core module.

[action] A platform agent is initialized against ios-development-release/. It attempts to read android-development-release/README.md directly (not via a UUID link from its own module).
[eval] The action violates the agent scoping contract; a correctly-scoped platform agent must not navigate outside its starting module except through explicit UUID links.

[action] The same platform agent follows a UUID link in its module's frontmatter to load core/filesystem-rules/README.md.
[eval] Only that single file is loaded; no other files in core/ are read. The agent returns to its platform scope after reading.

[action] An architect agent is initialized at the repository root and loads descriptions of all top-level modules.
[eval] All top-level module descriptions load correctly; the architect agent may navigate any module boundary freely.

[end] Terminate all agent sessions. No filesystem changes are made.

### Group 3: Handoff Protocol

[init] A valid ArchUI project exists. An agent working in agent-orchestration/ has completed a task and needs to hand off to a different specialist.

[action] The agent writes a handoff artifact to agent-orchestration/resources/handoff-notes.md containing what changed, affected module UUIDs, remaining work, and open questions.
[eval] The file is created in resources/, which is the only valid location for scratch files. archui validate still passes (resources/ is a permitted non-module subfolder).

[action] A new agent is initialized and reads the handoff artifact before reading git log.
[eval] The new agent can identify the scope of remaining work and which module UUIDs are involved without re-reading the full module tree.

[action] The new agent completes the remaining work and deletes the handoff artifact, committing the deletion.
[eval] resources/handoff-notes.md is removed; git log shows the final commit includes the deletion. archui validate passes.

[end] Confirm resources/handoff-notes.md does not exist. Confirm archui validate passes.

### Group 4: Cross-Platform Change Coordination

[init] A valid ArchUI project exists with iOS, Android, and Web/Electron platform modules. A core/ change has been made that affects all platforms.

[action] The architect agent creates one task per platform, each scoped to a single platform module UUID, rather than loading all platform modules simultaneously.
[eval] Each platform agent operates independently, loading only its own module subtree. No single agent context contains more than one platform module's full README tree.

[action] Each platform agent loads the core/ change by description first, then expands to the full README only if needed for its task.
[eval] The cost model is respected: cheap description load precedes any full-body load across module boundaries.

[end] Verify each platform module's README is updated correctly. Confirm archui validate passes on the full project.
