---
name: Context Switching Test Playbook
description: "Playbook for verifying that agents cross module boundaries via UUID links, respect the cost model, and produce correct handoff artifacts when transferring work to a specialist agent."
---

## Playbook

### Group 1: Crossing Module Boundaries via UUID Links

[init] A valid ArchUI project exists. A platform agent is working in ios-development-release/ and needs to verify a filesystem constraint.

[action] The agent reads the links field of the relevant ios submodule and finds a link to core/filesystem-rules by UUID.
[eval] The agent identifies the UUID and the path it resolves to via index.yaml, without navigating the filesystem directory tree directly.

[action] The agent loads only core/filesystem-rules/README.md — one file.
[eval] The constraint is found and read. No other files in core/ are loaded.

[action] The agent returns to its ios-development-release/ scope and continues its task.
[eval] The agent's active context is back within the ios-development-release/ subtree; the core/ file read is complete and not revisited.

[end] Terminate the agent session. No filesystem changes are made.

### Group 2: Cost Model Compliance

[init] A valid ArchUI project exists with a core module containing multiple submodules.

[action] An agent needs information from one submodule of core/ and loads the full core/ subtree (all READMEs under core/) to find it.
[eval] This is a violation of the cost model — loading a whole subtree when only one file is needed is the incorrect pattern described in context-switching.

[action] The same task is attempted correctly: the agent loads only descriptions of core/ submodules to find the relevant one, then loads only that submodule's full README.
[eval] Two loads occurred: one description scan and one full README. This satisfies the cost model.

[action] The agent then needs a second piece of information from a different core/ submodule and follows the same pattern: load description first, then full body if confirmed relevant.
[eval] Each boundary crossing loads the minimum content required. Total context added is two submodule descriptions and one full README body (the relevant one).

[end] Terminate the agent session. No filesystem changes are made.

### Group 3: Handoff Artifact Production

[init] A valid ArchUI project exists. An iOS agent has finished modifying ios-development-release/ and discovered that a change also requires updating core/readme-schema, which is outside its scope.

[action] The iOS agent commits its completed iOS work before writing the handoff artifact.
[eval] A git commit exists with a descriptive message referencing the affected module UUID. The iOS work is fully committed before the handoff is written.

[action] The iOS agent writes a handoff artifact to ios-development-release/resources/handoff-notes.md with: what was done, affected module UUIDs, remaining work (core/readme-schema UUID), and open questions.
[eval] The file exists at resources/handoff-notes.md within the platform module. It contains all four required sections. archui validate still passes.

[action] An architect agent is initialized and reads the handoff artifact as the first step before reading the full git log.
[eval] The architect agent can identify the target module (core/readme-schema) and the scope of the remaining work from the artifact alone, without reconstructing context from git history.

[action] The architect agent completes the core/readme-schema change, deletes the handoff artifact, and commits both changes.
[eval] The handoff artifact is removed. The final commit includes the core change and the artifact deletion. archui validate passes.

[end] Confirm ios-development-release/resources/handoff-notes.md does not exist. Confirm archui validate passes.

### Group 4: Cross-Platform Change Pattern

[init] A valid ArchUI project exists. The architect agent has made a change to core/ that affects all three platform modules.

[action] The architect agent creates three separate tasks, each scoped to one platform module UUID, rather than spawning one agent to modify all three platforms.
[eval] Three independent platform agents are created. Each agent's initial context contains only its platform module subtree.

[action] Each platform agent loads the core/ change by following the UUID link from its module to core/, loading only the description first.
[eval] Each platform agent performs an independent cheap-load of the core description before deciding whether to expand to the full body.

[action] One platform agent (e.g., Android) is blocked and cannot complete its task in the current window. It writes a handoff artifact and signals completion.
[eval] The blocked platform's handoff artifact captures the remaining work. The other two platform agents complete their tasks independently without waiting.

[end] Verify all three platform modules reflect the core change once unblocked. Confirm archui validate passes.
