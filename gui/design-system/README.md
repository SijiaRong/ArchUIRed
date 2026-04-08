---
name: Design System
description: "The Figma-driven visual design specification for all ArchUI GUI platforms, defining colors, typography, spacing, and component shapes consumed via MCP by platform implementation agents."
---

## Overview

ArchUI's design system is Figma-first. The Figma design file is the canonical source of truth for every visual decision: color tokens, typography scale, spacing grid, component geometry, and interaction states. Platform implementations (Web, Electron, iOS, Android) do not define their own visual styles — they translate Figma specs into platform-native code.

For MCP call patterns, Figma file structure, component naming conventions, and credential management, see the `figma-integration` submodule.

## Token Vocabulary

All platforms implement the same semantic token categories. Token names are stable — raw values are never used in code. The four categories are color (`color/*`), spacing (`spacing/*`), typography (`typography/*`), and elevation. Each is fully specified in the `foundations` submodule.

## Design Change Workflow

Design changes are made in Figma first. An agent then loads `figma-integration` for MCP call patterns, fetches the updated `Foundations` page, and regenerates token mapping files for all affected platforms. Regenerated files are committed and validated by platform CI. For structural component changes, relevant platform files are updated with agent assistance using the Figma MCP component spec. Never hand-edit generated token files.

## Submodules

- **foundations** — The complete token vocabulary: semantic color (Light + Dark), typography scale, spacing grid, and elevation/shadow tokens.
- **figma-integration** — MCP connection layer: Figma file key, MCP server config, call patterns, credential rules, and token regeneration workflow.
