---
name: ArchUI Root Test Playbook
description: "Playbook for verifying the top-level ArchUI project structure, module navigation, and cross-cutting documentation contracts."
---

## Playbook

### Group 1: Root Module Structure

[init] A valid ArchUI project root exists with README.md, .archui/index.yaml, and all top-level submodule folders present.

[action] Run archui validate from the project root.
[eval] Validation passes with no errors; all listed submodules (core, gui, cli, ios-development-release, android-development-release, web-electron-development-release, agent-orchestration, release-coordination, operations) are found on disk.

[action] Open the root README.md and confirm the uuid, name, description, submodules, and links fields are all present in the YAML frontmatter.
[eval] All five required frontmatter fields are present and non-empty; description is a single sentence.

[end] No cleanup required; the project root is unmodified.

### Group 2: Submodule Navigation

[init] A valid ArchUI project root exists. An architect agent is initialized starting at the root module.

[action] The architect agent loads only the root README.md description field (one sentence) as its initial context.
[eval] The agent has enough information to identify the system purpose and enumerate the top-level submodule names.

[action] The architect agent loads the full body of the root README.md.
[eval] The agent can now navigate to any top-level submodule by name or UUID link.

[action] The architect agent reads the description field of each listed submodule without loading full README bodies.
[eval] Each submodule description loads successfully and is a single sentence; no full bodies are loaded.

[end] No filesystem changes required; agent session can be terminated.

### Group 3: UUID-Stable Cross-Module Links

[init] A valid ArchUI project root exists. The root README.md has no links entries.

[action] Add a link entry to the root README.md referencing a known module UUID that exists in .archui/index.yaml.
[eval] archui validate reports no errors; the link is resolved successfully.

[action] Rename one of the top-level module folders (e.g., rename cli/ to cli-validator/), update index.yaml to reflect the new path, and run archui validate.
[eval] archui validate passes; the link in the root README.md still resolves correctly because it references the UUID, not the old folder path.

[end] Revert the folder rename and restore index.yaml to its original state. Confirm archui validate passes.

### Group 4: Filesystem as Source of Truth

[init] A valid ArchUI project root exists with the GUI and agent runtime both inactive.

[action] Directly edit a module's README.md using a text editor (not the GUI) to update the description field.
[eval] The changed description is immediately visible when the file is read; no synchronization step is required for agent reads.

[action] Run archui validate after the direct file edit.
[eval] Validation passes if the edit conforms to ArchUI rules; no intermediate sync or rebuild step is needed to reflect the change.

[end] Revert the README.md edit. Confirm archui validate passes.
