---
name: Task Runner
description: "Executes the agentic tool-call loop: receives tool invocation requests from the API client, dispatches them to the appropriate handler (filesystem, CLI, or task-control), returns results to the model, and loops until the agent signals completion."
---

## Overview

The task runner is the agent's hands. When the LLM decides to call a tool, the task runner executes it and feeds the result back into the conversation. It loops until the agent emits a `task_complete` or `task_failed` signal.

## Available Tools

### Filesystem tools (scoped to project root)

| Tool | Description |
|---|---|
| `read_file(path)` | Read a file's contents as a string |
| `write_file(path, content)` | Write or overwrite a file |
| `list_dir(path)` | List directory entries with kind (file/directory) |
| `move_file(src, dst)` | Move or rename a file or directory |
| `delete_file(path)` | Delete a file (not a directory) |

All paths are relative to the project root. Any path that escapes the project root (via `../`) is rejected with an error result.

### CLI tools (allowlisted commands only)

| Tool | Command executed |
|---|---|
| `run_validate()` | `archui validate .` |
| `run_git_status()` | `git status --porcelain` |
| `run_git_commit(message)` | `git add -A && git commit -m <message>` |
| `generate_uuid()` | `openssl rand -hex 4` |

No other shell commands are permitted. Attempts to call unlisted commands are rejected.

### Task-control tools

| Tool | Description |
|---|---|
| `task_complete(summary)` | Signal successful completion; end the loop |
| `task_failed(reason)` | Signal failure with an explanation; end the loop |
| `ask_user(question)` | Pause and surface a question to the user; resume when answered |

## Execution Loop

```
while true:
  response = api_client.stream(messages)
  if response has tool_calls:
    for each tool_call:
      result = dispatch(tool_call)
      messages.append(tool_result(result))
  if response stop_reason == "task_complete" or "task_failed":
    break
  if no tool calls and stop_reason == "end_turn":
    // agent finished without signalling — treat as complete
    break
```

## Safety Limits

- Maximum 200 tool calls per task — abort with `task_failed` if exceeded
- Maximum 10 consecutive `write_file` calls without a `run_validate` in between — warn the agent
- `git_commit` may only be called once per task (at the end, after validation passes)
