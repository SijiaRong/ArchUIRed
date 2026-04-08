---
name: Session State
description: "Documents how agent state persists across sessions using git and the filesystem, including checkpoint commits, scratch files, and the protocol for resuming interrupted tasks."
---

## Overview

ArchUI has no agent-specific database. All agent state is stored in the git-tracked filesystem. An agent communicates what it did, what it left unfinished, and what the next agent should do entirely through git commits and files in `resources/` folders. A new agent session can reconstruct full context by reading the recent git log and any present `resources/` scratch files.

## Details

### State Is the Filesystem

There is no external store for agent memory. When an agent session ends — whether cleanly or due to interruption — the only record of its work is:

1. **Git commits** it made during the session.
2. **Uncommitted filesystem changes** (visible in `git status` and `git diff`).
3. **Scratch files** it wrote to `resources/` folders.

This means agents must commit frequently and with descriptive messages. A commit message like `"update ios-development-release/build-config: add signing certificate rotation steps (refs: 4e1a7b3c)"` gives a resuming agent immediate orientation. A message like `"wip"` does not.

### Checkpoint Commits

Long-running tasks must be broken into **checkpoints**. Each checkpoint is a git commit. The rule is: if the work were interrupted after this commit, could a new agent resume from here without re-doing completed steps? If yes, it is a good checkpoint.

Checkpoint commit message format (recommended):

```
<module-path>: <what changed>

Checkpoint <N> of <M>: <what is done vs. what remains>
Affected UUIDs: <comma-separated list>
```

Example:
```
ios-development-release/build-config: add Xcode 16 build settings

Checkpoint 2 of 3: build settings and signing updated; distribution profile still pending.
Affected UUIDs: 4e1a7b3c
```

This format lets a resuming agent run `git log --oneline -10` and immediately know where things stand.

### Resuming an Interrupted Task

A new agent session resumes an interrupted task by:

1. Running `git log --oneline -20` to see what the previous session committed.
2. Running `git diff HEAD` to see any uncommitted changes left behind.
3. Checking for `resources/agent-notes.md` or `resources/handoff-notes.md` in the relevant module folder.
4. Reading the most recent checkpoint commit message for scope and remaining work.

The agent does not need to re-read the entire module tree. The git log and scratch files are the resumption contract.

### Scratch Files in `resources/`

The `resources/` folder in any module is the only permitted location for agent scratch files. Common uses:

- `resources/agent-notes.md` — working notes for an active task (thinking, open questions, partial findings).
- `resources/handoff-notes.md` — handoff artifact for the next agent (see `context-switching/`).
- `resources/checklist.md` — a step-by-step task list the agent is working through, updated as steps complete.

**Lifecycle rule**: scratch files must not outlive their task. When the task is done, either:
- Delete the scratch file and commit the deletion, or
- Promote its content into the module README (if the content is worth keeping as documentation) and then delete the scratch file.

A `resources/agent-notes.md` that persists after a task is complete is a sign that the task was not properly closed out.

### Long-Running Task Pattern

For tasks that span multiple sessions or multiple agents:

1. **Decompose** the task into checkpoints at the start. Write the checkpoint list to `resources/checklist.md` in the target module.
2. **Commit each checkpoint** as it completes, with a message that includes which checklist item it satisfies.
3. **Update the checklist** in the same commit (mark the step done).
4. **Final commit**: delete `resources/checklist.md` (and any other scratch files) and note task completion in the commit message.

This pattern makes the task's progress visible in `git log` and recoverable at any checkpoint. It also makes it easy for an architect agent to monitor progress across multiple parallel platform agents by reading their respective `resources/checklist.md` files without loading their full module trees.
