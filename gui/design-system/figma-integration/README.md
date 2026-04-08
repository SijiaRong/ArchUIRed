---
name: Figma Integration
description: "MCP-based integration layer connecting all platform agents to the canonical Figma design file — defines the Figma file structure, component naming conventions, MCP tool call patterns, and credential management rules."
---

## Overview

This module defines how all platform implementation agents connect to the canonical Figma design file via the Figma MCP. It is the operational layer between the design system spec and the per-platform code generators. Agents read this module when they need to fetch design data from Figma — not to understand what the design says (see `design-system`), but to understand how to call the MCP and where to find specific resources.

MCP access tokens and Personal Access Tokens are never stored in this repository. If an agent cannot reach the Figma MCP, it should halt and instruct the human to verify the Cursor MCP configuration.

The Figma file is structured into five pages: Foundations (tokens), Components (reusable UI), Canvas Layouts (full-screen compositions), Platform Notes (native deviations), and Spec Redlines (annotated measurements). Components follow a `Category/ComponentName/Variant` naming convention for unambiguous MCP resolution.

Full MCP call patterns, component name list, credential table, token regeneration workflow, and agent checklist are in `resources/mcp-reference.md`.
