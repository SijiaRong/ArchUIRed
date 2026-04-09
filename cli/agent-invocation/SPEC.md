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
- Only events where `type === 'assistant'` and `message.content` is an array are forwarded
- Within those events, only `block.type === 'text'` blocks are written to `process.stdout`
- Malformed (non-JSON) lines are written to `process.stdout` verbatim with a trailing newline
- stderr is inherited transparently

### Codex

- Spawned with `--full-auto <prompt>`
- `stdio` is set to `'inherit'` — all streams pass through transparently
- No stream parsing is performed

## Error Handling

- If `child.on('error')` fires (e.g. binary not found), the error message is logged to stderr and the function resolves with exit code `1`
- Normal process exit is captured via `child.on('close')` and returned as the resolved value
