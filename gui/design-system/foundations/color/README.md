---
name: Color Tokens
description: "Semantic color tokens covering surfaces, text, edges, status indicators, and interactive states, defined in both Light and Dark modes in the Figma Color variable collection."
---

## Overview

The color system is entirely semantic — no raw hex values appear in platform code. Every color is named by its role in the UI, not its appearance. This allows Light and Dark mode to be a single switch in the variable collection rather than a code-level concern.

Token groups cover surfaces, text, borders, edges (keyed by relation type), status indicators, interactive states, and an eight-color port palette used for submodule port labels. All token values for both modes are in `resources/token-table.md`.

The Figma variable collection is named **Color** with **Light** and **Dark** modes. Variable names in Figma use the same slash-separated path as the token names.
