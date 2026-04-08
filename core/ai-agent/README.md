---
name: AI Agent
description: "Defines the embedded AI agent system: an external LLM API (Claude or compatible) invoked from within ArchUI to execute multi-step tasks such as project import conversion, guided by skill documents and with real-time streaming output."
---

## Overview

The AI Agent module defines how ArchUI invokes an external LLM to execute tasks that require semantic understanding — primarily project import/conversion, but extensible to any task driven by an ArchUI skill document.

The agent is "external" in that the model runs on a remote API (Claude, OpenAI, or compatible). It is "embedded" in that the ArchUI GUI hosts the interaction: skill loading, tool execution, filesystem I/O, and streaming progress display all happen inside the running ArchUI application.

## Architecture

```
ArchUI GUI
│
├── settings          ─── API key, model selection, base URL
│
├── skill-loader      ─── reads skill README.md files into the system prompt
│
├── api-client        ─── sends messages to LLM API (Claude / OpenAI-compatible)
│   └── streaming-output ─── streams token-by-token progress to the UI
│
└── task-runner       ─── executes tool calls from the LLM:
                           readFile, writeFile, listDir, runCLI
```

## Supported Models

The agent is designed to work with any model that supports:
- System prompts
- Tool use / function calling
- Streaming responses

Reference implementation targets Claude (via `api.anthropic.com`). Other providers (OpenAI, local Ollama, etc.) can be supported by implementing the same `AgentApiClient` interface.

## Task Execution Model

1. **User triggers a task** (e.g. "Convert this project to ArchUI").
2. **Skill loader** reads the relevant skill document(s) into a system prompt.
3. **Task runner** provides the agent with a set of tools: filesystem access (`readFile`, `writeFile`, `listDir`), CLI execution (`runCLI` — for `archui validate`), and task completion signalling.
4. **Api client** sends the initial message and streams the response.
5. The agent calls tools in a loop until it signals task completion.
6. **Streaming output** displays each step to the user in real time.

## Security Model

- The agent's filesystem tools are scoped to the open project root — no reads or writes outside the project directory.
- `runCLI` only allows a fixed allowlist of commands (e.g. `archui validate`, `git status`, `git commit`). Arbitrary shell execution is not permitted.
- The API key is stored in local settings (never sent to any server other than the configured LLM API endpoint).
