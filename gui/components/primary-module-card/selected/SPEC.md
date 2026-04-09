---
name: Primary Module Card — Selected State
description: The visual state of a primary module card when it is the currently selected node; highlighted border and elevated shadow to communicate selection to the user.
---

## Overview

The selected state adds a 2px blue border (`color/border/focus`) and a glow ring shadow (`0 0 0 3px color/border/focus` at 20% opacity) to the card. The background is unchanged from the default state. The drill-in icon becomes permanently visible rather than hover-only.

Visual specification with annotated diagram is in `resources/visual-spec.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.
