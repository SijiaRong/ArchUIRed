---
name: Commands
description: "Defines the module command system: how commands are declared as .md files inside .archui/commands/, their file format, how they are discovered by the GUI, and how clicking a command button triggers the AI agent."
---

## Overview

Any module can expose one or more commands. A command is a named, clickable action that triggers the AI agent with a specific skill instruction. Commands are declared as Markdown files inside the module's `.archui/commands/` directory and rendered as buttons on the module's primary card in the GUI.

## File Location

```
my-module/
├── .archui/
│   ├── index.yaml
│   └── commands/
│       ├── convert.md        ← command "Convert to ArchUI"
│       ├── summarise.md      ← command "Summarise"
│       └── validate.md       ← command "Validate"
├── README.md
└── resources/
```

- Commands live inside `.archui/commands/` — a new permitted subfolder of `.archui/`.
- Each command is a single `.md` file. The filename (without extension) is the command's stable identifier.
- There is no limit on the number of commands per module.
- Command files are not ArchUI modules — they do not need their own `.archui/index.yaml`.

## Command File Format

```yaml
---
name: Convert to ArchUI          # REQUIRED — button label shown in the GUI
description: Convert this module's resources into ArchUI submodule format.
                                  # REQUIRED — tooltip shown on hover
icon: ↺                           # OPTIONAL — emoji or icon name for the button
---

## Agent Instructions

When this command is triggered on module {{module.path}}:

1. Read the contents of `{{module.path}}/resources/`.
2. Analyse the structure and propose a module breakdown.
3. Apply the `core/import/conversion/module-splitter` skill.
...
```

### Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Button label (keep short, ≤ 20 chars) |
| `description` | Yes | Tooltip text shown on hover |
| `icon` | No | Emoji or icon identifier |

### Body

The body is an AI skill instruction — prose written for the agent, not for humans. It describes what the agent should do when the command is triggered on this module. The body may reference:
- `{{module.path}}` — the path of the module this command belongs to
- `{{module.name}}` — the module name
- Other ArchUI skill documents (by path) to include as sub-skills

## Discovery

The GUI discovers commands by listing `.archui/commands/*.md` for each module when loading the project. Commands are loaded lazily — file contents are not read until the user selects a module (i.e., until the primary card is rendered). This keeps initial project load fast.

## Execution

When the user clicks a command button:
1. The command file body is passed to `core/ai-agent/skill-loader` as the task skill.
2. `core/ai-agent/task-runner` starts the agent loop with the module's path as context.
3. `core/ai-agent/streaming-output` renders the live progress in the detail panel or a modal.

The agent has full filesystem access scoped to the project root and access to all standard task-runner tools (`read_file`, `write_file`, `run_validate`, etc.).

## Relationship to Built-in Commands

Commands defined in `.archui/commands/` are **module-specific** and authored by the project maintainer. They complement (but do not replace) any built-in GUI actions (drill-in, edit, link). Built-in actions are not commands.
