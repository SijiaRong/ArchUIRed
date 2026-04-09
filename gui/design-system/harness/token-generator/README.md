---
name: Token Generator
description: "Fetches the canonical Figma Foundations token values via MCP and renders platform-specific token mapping files — CSS custom properties for Web, Swift Color extensions for iOS, and Compose theme definitions for Android."
---

## Overview

The token generator is the single codepath that produces design-token mapping files for all platforms. No platform agent writes token values by hand. The generator calls `get_design_context` on the Figma Foundations page via the figma-integration MCP layer, parses the structured token JSON, and renders it into each platform's native format.

Generated files carry a header guard comment (`AUTO-GENERATED — do not edit manually. Regenerate via the token-generator.`) and are committed alongside implementation code. When a designer updates a token in Figma, an agent runs the generator to regenerate all platform files in a single pass, then commits the result.

## Web Output

The generator produces `design-tokens.generated.css` containing CSS custom properties organized by token category (surface, text, border, edge, status, interactive, port, spacing, typography, dimension, elevation). Both Light and Dark mode values are included. The generator maps every Figma token name to a CSS variable using the pattern `--<category>-<token-path>` with slashes replaced by hyphens.

## Generation Rules

1. Every token defined in `foundations/` must appear in the output — missing tokens are a generation error.
2. No value may appear in the output that is not present in the Figma source — invented tokens are a generation error.
3. The output file must be deterministic — identical Figma state produces byte-identical output.
