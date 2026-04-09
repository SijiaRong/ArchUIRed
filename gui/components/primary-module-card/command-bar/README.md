---
name: Command Bar
description: "The section at the bottom of the primary card that renders a module's commands as clickable buttons — one button per .archui/commands/*.md file, shown only when at least one command exists."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

The command bar is the bottom section of the primary card. It is only rendered when the current module has one or more command files in `.archui/commands/`. It is never shown on external reference cards.

## Layout

```
┌─────────────────────────────────────────┐
│  [Header: name, UUID]                   │
│  [Description + module handles]         │
│  [Port section]                         │
├─────────────────────────────────────────┤  ← divider (only when commands exist)
│  ↺ Convert   📋 Summarise   ✓ Validate  │  ← command bar
└─────────────────────────────────────────┘
```

- Commands are rendered as a horizontal row of compact buttons.
- If there are more commands than fit in one row, they wrap to a second row.
- Each button shows the command's `icon` (if present) followed by `name`.
- Hovering a button shows the command's `description` as a native tooltip.
- A thin divider separates the command bar from the port section above it.

## Button States

| State | Visual |
|---|---|
| Default | Outlined button, `surface/overlay` background |
| Hover | `surface/raised` background, slight elevation increase |
| Active (agent running) | Filled with `accent/primary`, spinner icon replaces the command icon |
| Disabled | 40% opacity; disabled when any agent task is already running |

Only one command can run at a time. While an agent task is running (triggered by any command on any module), all command buttons across the canvas are disabled.

## Loading Behaviour

Command file contents are loaded lazily:
- On project load, only the **filename list** is fetched per module (a single `listDir` call on `.archui/commands/`).
- The file **contents** (including `name`, `description`, `icon`) are read only when the module becomes the primary card (i.e. when this command bar would be rendered).
- This ensures initial project load performance is not degraded by command file reads.

## Empty State

If a module has no `.archui/commands/` directory or the directory is empty, the command bar section is entirely hidden — no divider, no empty space, no placeholder.

## Interaction

Clicking an enabled command button:
1. Marks the button as "Active" (spinner state).
2. Reads the full command file body.
3. Passes it to `core/ai-agent/skill-loader` as the task skill.
4. Opens the agent streaming panel (inline below the command bar, or as a slide-over panel).
5. On task completion or failure, restores the button to its default state and re-enables all buttons.
