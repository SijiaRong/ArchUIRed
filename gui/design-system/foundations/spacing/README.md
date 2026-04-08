---
name: "Spacing & Dimension Tokens"
description: "An 8px-grid spacing scale for layout gaps and padding, plus fixed dimension tokens for hardcoded component geometry such as node width, header height, and port row height."
---

## Overview

Spacing tokens cover all flexible layout values (padding, gap, margin) on a 4px base grid. Dimension tokens cover fixed structural measurements that do not scale — the constants platform code uses to compute canvas layout and handle positioning.

Both token groups live in Figma variable collections and must be consumed by name in all platform code. The dimension tokens also define the port handle Y formula used to align edge endpoints with port rows. Full token tables and the formula are in `resources/token-table.md`.
