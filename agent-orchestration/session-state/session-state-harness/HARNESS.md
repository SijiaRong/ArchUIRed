---
name: Session State Test Playbook
description: "Playbook for verifying that agent state persists correctly via git commits and resources/ files, and that interrupted tasks can be resumed from checkpoint commits."
---

## Playbook

### Group 1: Checkpoint Commits

[init] A valid ArchUI project exists. An agent is working on a multi-step task in ios-development-release/ and has completed the first two of three steps.

[action] The agent commits its work after completing step one with a message in the recommended format: module path, what changed, checkpoint number, affected UUIDs.
[eval] The commit message includes the module path prefix, a human-readable description of the change, "Checkpoint 1 of 3", and the list of affected UUIDs.

[action] The agent commits work after step two following the same format, updating the checkpoint count.
[eval] The commit message reads "Checkpoint 2 of 3" with the remaining step noted. git log --oneline shows both checkpoint commits with enough information to understand progress.

[action] A new agent session reads git log --oneline -10 to assess where the previous session left off.
[eval] The new agent can determine: what was completed in the first two checkpoints, what step remains, and which module UUIDs were affected — all from the commit messages alone.

[end] Complete the remaining step (or mark as abandoned) and verify the final commit message notes task completion.

### Group 2: Resuming an Interrupted Task

[init] A valid ArchUI project exists. A previous agent session was interrupted mid-task, leaving uncommitted filesystem changes in addition to two checkpoint commits.

[action] A new agent session runs git log --oneline -20 to survey the previous session's commits.
[eval] The new agent identifies the most recent checkpoint commit and understands what was completed.

[action] The new agent runs git diff HEAD to inspect uncommitted changes left by the previous session.
[eval] Uncommitted changes are visible; the agent can assess whether they represent valid partial work or should be discarded.

[action] The new agent checks for resources/agent-notes.md or resources/handoff-notes.md in the relevant module folder.
[eval] If a scratch file exists, it provides additional context about the interrupted task. If none exists, the git log is the sole resumption source.

[action] The new agent resumes from the last clean checkpoint without re-doing completed steps.
[eval] Only the remaining work (from the last checkpoint onward) is re-executed. Previously completed steps are not repeated.

[end] Complete the task, clean up scratch files, and verify git log shows the full checkpoint sequence ending with a task-completion commit.

### Group 3: Scratch File Lifecycle

[init] A valid ArchUI project exists. An agent has started a task and created resources/agent-notes.md in the target module's resources/ folder.

[action] The agent writes working notes to resources/agent-notes.md throughout the session.
[eval] The file exists only in resources/ — not in the module root or any submodule folder. archui validate passes (resources/ is the permitted non-module subfolder).

[action] The agent attempts to create a scratch file at the module root (e.g., target-module/agent-notes.md, outside resources/).
[eval] archui validate reports a VALIDATION_ERROR: a file or non-module subfolder exists outside the permitted resources/ location.

[action] The agent completes the task and either deletes resources/agent-notes.md or promotes its content into the module README, then commits the deletion.
[eval] resources/agent-notes.md no longer exists after the final commit. archui validate passes. The content is either preserved in the README or discarded intentionally.

[end] Confirm no orphaned scratch files remain in resources/. Confirm archui validate passes.

### Group 4: Long-Running Task Pattern

[init] A valid ArchUI project exists. An architect agent is beginning a large task that will span multiple sessions and involve multiple platform agents running in parallel.

[action] The architect agent decomposes the task into checkpoints and writes the checkpoint list to resources/checklist.md in the target module.
[eval] The checklist file exists at resources/checklist.md. Each checkpoint step is listed with a clear description.

[action] Each platform agent completes its checkpoint and updates resources/checklist.md in the same commit that satisfies that checkpoint.
[eval] git log shows paired commits: code change + checklist update. The checklist file reflects current progress at every commit.

[action] The architect agent monitors progress by reading each platform's resources/checklist.md without loading their full module trees.
[eval] Progress is visible from checklist files alone. No full platform module subtrees need to be loaded to assess status.

[action] All checkpoints are completed. The final commit deletes resources/checklist.md and includes a task-completion note in the message.
[eval] resources/checklist.md no longer exists. The final commit message notes that all checkpoints are satisfied. archui validate passes.

[end] Confirm resources/checklist.md does not exist in any module that had one. Confirm archui validate passes on the full project.
