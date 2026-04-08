---
name: Elevation Tokens
description: "Drop-shadow and blur effect tokens encoding three visual depth levels — flat, raised, and floating — used to communicate z-axis hierarchy between canvas, cards, panels, and overlays."
---

## Overview

Elevation is expressed through drop-shadows only — no background blur on content layers, no material-style tinting. Four tokens cover all current use cases: flat (level 0), card (level 1, default and selected variants), raised (level 2, panels), and floating (level 3, menus and tooltips).

In Dark mode, shadow opacity is reduced by ~30% because dark surfaces carry natural depth cues. The Figma effect styles encode both modes — platform code always uses the token as-is for the current mode.

Exact shadow values (x/y offset, blur, spread, color), Dark mode adjustments, Figma effect style names, and platform API mapping are in `resources/token-table.md`.
