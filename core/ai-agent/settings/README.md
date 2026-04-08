---
name: Agent Settings
description: "Stores and validates the user-facing AI agent configuration: API provider, API key, model selection, and base URL — all persisted in local storage, never transmitted beyond the configured LLM endpoint."
---

## Configuration Fields

| Field | Description | Default |
|---|---|---|
| `provider` | `"anthropic"` \| `"openai"` \| `"custom"` | `"anthropic"` |
| `apiKey` | The API key for the selected provider | (empty — user must set) |
| `model` | Model ID (e.g. `claude-opus-4-5`, `gpt-4o`) | Provider-specific default |
| `baseUrl` | Override the API base URL (for custom/local providers) | Provider default |
| `maxTokens` | Max tokens per agent response | `8192` |

## Storage

Settings are persisted in `localStorage` under the key `archui_agent_settings`. The API key is stored in plaintext in localStorage — this is acceptable for a local-first desktop/browser tool where the user controls the machine. For team deployments, the API key should be injected via an environment variable on the server.

## Validation

Before any agent task runs, validate:
- `apiKey` is non-empty
- `model` is non-empty
- If `provider` is `"custom"`, `baseUrl` must be non-empty

If validation fails, surface a settings dialog before proceeding.

## Provider Defaults

| Provider | Default model | Default base URL |
|---|---|---|
| `anthropic` | `claude-opus-4-5` | `https://api.anthropic.com` |
| `openai` | `gpt-4o` | `https://api.openai.com` |
| `custom` | (user-set) | (user-set) |
