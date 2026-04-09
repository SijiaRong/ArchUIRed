---
name: Agent Invocation
description: Encapsulates the interface for spawning an AI agent CLI process from within the ArchUI CLI and handling its streaming output.
---

## Overview

This module defines the contract for invoking a supported AI agent (Claude or Codex) as a child process from within the ArchUI CLI. It abstracts away backend-specific spawn arguments, streaming protocols, and error handling so that upstream commands (`init-command`, `run-command`) can call a single function.

## Core Interface

```typescript
invokeAgent(options: AgentInvocationOptions): Promise<number>
```

Returns the agent process exit code. On spawn failure, logs the error and returns `1`.

### AgentInvocationOptions

| Field | Type | Required | Description |
|---|---|---|---|
| `agent` | `'claude' \| 'codex'` | yes | Which agent backend to spawn |
| `prompt` | `string` | yes | The prompt string passed to the agent |
| `cwd` | `string` | yes | Working directory for the spawned process |
| `addDir` | `string` | no | Additional directory to grant the agent access to (Claude only) |
| `model` | `string` | no | Model name override (backend-specific) |

## Backend Behaviours

### Claude

- Spawned with `--dangerously-skip-permissions --verbose --output-format stream-json`
- `--add-dir <addDir>` appended when `addDir` is provided
- `-p <prompt>` passes the prompt
- stdout is a **NDJSON stream**: each newline-delimited JSON object is one event
- stderr is inherited transparently

**Event parsing rules:**

| Event shape | Action |
|---|---|
| `type === 'assistant'`, block `type === 'text'` | Stop spinner, write text to stdout |
| `type === 'assistant'`, block `type === 'tool_use'` | Update spinner message with a friendly tool name derived from `block.name` |
| `type === 'result'` | Stop spinner, print final summary (include `cost_usd` if present) |
| Malformed (non-JSON) line | Write to stdout verbatim with a trailing newline |

### Codex

- Spawned with `--full-auto <prompt>`
- `stdio` is set to `'inherit'` — all streams pass through transparently
- No stream parsing or progress feedback is performed; the agent controls its own output

## Progress Feedback

Long-running agent invocations display a terminal spinner with elapsed time so the user knows the process is alive during silent periods (e.g. tool calls that produce no assistant text).

### Spinner behaviour

- **Animation**: Braille-dot frames cycling at ~80 ms intervals on the current terminal line
- **Elapsed timer**: Wall-clock time since agent spawn, formatted as `Xm Ys`, appended to the spinner message
- **Cursor**: Hidden on start (`\x1B[?25l`), restored on stop (`\x1B[?25h`)
- **Line management**: The spinner overwrites itself on the same line via `\r`; when real output arrives the line is cleared (`\r\x1B[2K`) before writing

### Tool name mapping

When the agent calls a tool, the spinner message updates to a user-friendly label:

| Tool name pattern | Display label |
|---|---|
| `Read`, `ReadFile` | Reading files |
| `Write`, `WriteFile`, `CreateFile` | Writing files |
| `Shell`, `Bash`, `Execute` | Running command |
| `Grep`, `Search`, `Glob` | Searching |
| `Edit`, `StrReplace` | Editing files |
| Any other name | Calling `<name>` |

### Non-TTY fallback

If `process.stdout.isTTY` is false, the spinner is disabled entirely. No ANSI escape codes are emitted. Plain-text status lines are still printed for tool_use and result events.

## Error Handling

- If `child.on('error')` fires (e.g. binary not found), the error message is logged to stderr, the spinner is stopped, and the function resolves with exit code `1`
- Normal process exit is captured via `child.on('close')`, the spinner is stopped, and the exit code is returned as the resolved value
