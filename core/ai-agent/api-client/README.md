---
name: API Client
description: "Wraps the LLM provider HTTP API with a unified interface: sends system prompt + message history, streams token responses, parses tool-call payloads, and normalises differences between Anthropic and OpenAI-compatible APIs."
---

## Interface

```typescript
interface AgentApiClient {
  stream(params: {
    system: string           // assembled skill system prompt
    messages: Message[]      // conversation history
    tools: ToolDefinition[]  // available tools
    onToken: (token: string) => void       // streaming text
    onToolCall: (call: ToolCall) => void   // tool invocation request
    onDone: (stopReason: string) => void   // end of turn
  }): Promise<void>
}
```

## Provider Normalisation

The client normalises differences between providers so `task-runner` and `streaming-output` work identically regardless of the backend:

| Concept | Anthropic | OpenAI-compatible |
|---|---|---|
| System prompt | `system` field | `messages[0].role = "system"` |
| Tool definitions | `tools` array with `input_schema` | `tools` array with `parameters` |
| Tool call response | `tool_use` content block | `tool_calls` in delta |
| Stop reason | `end_turn` / `tool_use` | `stop` / `tool_calls` |

## Streaming

Responses are streamed token-by-token. The client fires `onToken` for each text token and `onToolCall` when a complete tool call payload has been assembled from the stream. This allows the UI to show real-time output without waiting for the full response.

## Error Handling

| Error | Behaviour |
|---|---|
| 401 Unauthorized | Surface "Invalid API key" in the UI; abort |
| 429 Rate limited | Retry with exponential backoff (max 3 retries) |
| 5xx Server error | Retry once; if still failing, surface error and abort |
| Network timeout | Abort and surface "Connection failed" |

## Context Window Management

Before each API call, estimate token count of system prompt + message history. If approaching the model's context limit (>80%), summarise older messages by replacing them with a `[summary]` assistant message describing what was accomplished. Never truncate the most recent user message or tool results.
