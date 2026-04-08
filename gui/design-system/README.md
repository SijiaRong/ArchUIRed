---
name: Design System
description: "The Figma-driven visual design specification for all ArchUI GUI platforms, defining colors, typography, spacing, and component shapes consumed via MCP by platform implementation agents."
---

## Overview

ArchUI's design system is Figma-first. The Figma design file is the canonical source of truth for every visual decision: color tokens, typography scale, spacing grid, component geometry, and interaction states. Platform implementations (Web, Electron, iOS, Android) do not define their own visual styles — they translate Figma specs into platform-native code.

For MCP call patterns, Figma file structure, component naming conventions, and credential management, see the `figma-integration` submodule.

## Token Vocabulary

All platforms implement the same semantic token categories. Token names are stable — raw values are never used in code. The four categories are color (`color/*`), spacing (`spacing/*`), typography (`typography/*`), and elevation. Each is fully specified in the `foundations` submodule.

For the current workspace refresh, typography is split into four semantic lanes that must stay aligned between Figma and code:

- `Wordmark` - the `ArchUI` brand wordmark and any future brand-lockup treatment. On web this maps to `Syne`.
- `Heading Sans` - large workspace headlines and node titles that should stay clean, structural, and sans-serif. On web this maps to `Sora`.
- `UI Sans` - ordinary interface English such as buttons, labels, form text, breadcrumbs, and panel body copy. On web this maps to `Lexend`.
- `Mono` - UUIDs, identifiers, and code-like reference strings. This lane remains unchanged.

## Design Change Workflow

Design changes are made in Figma first. An agent then loads `figma-integration` for MCP call patterns, fetches the updated `Foundations` page, writes the checked-in export snapshot (`gui/design-system/foundations/web-token-export.yaml` for the web wave), and regenerates platform mapping files from that snapshot. Regenerated files are committed and validated by platform CI. For structural component changes, relevant platform files are updated with agent assistance using the Figma MCP component spec. Never hand-edit generated token files.

Reference UIs discovered through browser inspection or reverse-engineering do not bypass this flow. Their output is first normalized into `visual-orchestration`, then translated into Figma updates, then reflected in document-layer exports for screens and components, and only then propagated into platform code.

## Workspace Composition

`visual-orchestration` captures the workspace-level rules that sit above raw tokens: canvas density, node hierarchy, panel layout, edge readability, and motion. It is the module that turns external visual references into ArchUI-native decisions while preserving Figma as the canonical source of truth.

## Submodules

- **foundations** — The complete token vocabulary: semantic color (Light + Dark), typography scale, spacing grid, and elevation/shadow tokens.
- **figma-integration** — MCP connection layer: Figma file key, MCP server config, call patterns, credential rules, and token regeneration workflow.
