---
name: Typography Tokens
description: "Named text styles defining font family, size, weight, and line-height for every text role in the ArchUI GUI, implemented as Figma local text styles and mapped to platform-native type APIs."
---

## Overview

All text rendering in the ArchUI GUI uses one of the named typography tokens. No ad-hoc font sizes or weights are permitted in platform code. The tokens are defined as Figma local text styles and must be reproduced exactly in each platform's type system.

Nine tokens cover every text role: node name and description, port labels, edge relation labels, breadcrumb (default and current), UI labels, meta text, and uppercase section headings. The base font family is Inter across all platforms, with a system-ui fallback stack.

Full token specifications — sizes, weights, line-heights, letter-spacing, platform mapping examples, and Figma style name mappings — are in `resources/token-table.md`.
