---
name: Streaming Output
description: "Defines the real-time progress display for agent tasks: the event model, UI rendering contract, and the structured log of tool calls and results shown alongside streamed text."
---

## Overview

Agent tasks can take minutes and involve dozens of tool calls. Streaming output keeps the user informed of progress in real time rather than showing a spinner until completion.

## Event Model

The task runner and API client emit a stream of typed events:

| Event | Payload | Displayed as |
|---|---|---|
| `text_token` | `{ token: string }` | Appended to the current text bubble |
| `tool_call_start` | `{ tool: string, args: object }` | Collapsible "Calling tool…" row |
| `tool_call_result` | `{ tool: string, result: string, ok: boolean }` | ✓ or ✗ row under the tool call |
| `task_complete` | `{ summary: string }` | Green "Done" banner with summary |
| `task_failed` | `{ reason: string }` | Red "Failed" banner with reason |
| `user_question` | `{ question: string }` | Inline question with text input |

## UI Rendering Contract

The streaming output component receives the event stream and renders:

1. **A scrolling log** — each event appended in order. Text tokens are merged into the current assistant bubble. Tool calls are shown as collapsible rows (collapsed by default for non-error results).
2. **A status indicator** — spinner while running, ✓ on complete, ✗ on failure.
3. **An abort button** — visible while the task is running. Clicking it sends a cancellation signal to the task runner, which stops the loop after the current tool call completes and emits `task_failed("Cancelled by user")`.

## Persistence

The complete event log for each task is stored in `sessionStorage` keyed by task ID. This allows the user to scroll back through the full history of a task even after it completes. Logs are not persisted to disk.
