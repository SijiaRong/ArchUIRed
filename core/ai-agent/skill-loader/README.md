---
name: Skill Loader
description: "Reads one or more ArchUI skill documents (README.md files) from the project and assembles them into a system prompt for the AI agent, with optional progressive loading of referenced sub-skill documents."
---

## Overview

A skill is an ArchUI module README.md written as instructions for an AI agent rather than documentation for humans. The skill loader reads these documents and packages them as the system prompt sent to the LLM API.

## Loading Algorithm

Given a starting skill path (e.g. `core/import/conversion/module-splitter`):

1. Read the module's `README.md`.
2. If the README references other skill documents (via Markdown links to sibling modules), optionally load those too — controlled by a `depth` parameter (default: 1).
3. Assemble all loaded content into a single system prompt, with section headers identifying each skill by module path.

## System Prompt Structure

```
You are an ArchUI conversion agent. Follow the skills below exactly.

## Skill: core/import/conversion/module-splitter
<contents of module-splitter/README.md>

## Skill: core/import/conversion
<contents of conversion/README.md>

## Project Context
The project root is at ".". You have access to the following tools: ...
```

## Tool Injection

After skill content, the skill loader appends a tool manifest describing every tool the agent can call (see `task-runner`). This is appended as a separate system prompt section, not as part of the skill content.

## Constraints

- Skill documents are read-only during loading — the loader never modifies them.
- Maximum assembled system prompt size: 32k tokens. If skills exceed this, truncate body content (preserving frontmatter and headings) and warn.
