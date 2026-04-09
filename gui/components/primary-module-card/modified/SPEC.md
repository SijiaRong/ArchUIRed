---
name: Primary Module Card — Modified State
description: The visual state of a primary module card when the module has uncommitted git changes; an amber accent on the header communicates pending edits.
---

## Overview

The modified state signals uncommitted git changes. A 4px amber left-border accent (`status/modified`) and amber header status dot distinguish modified nodes from clean ones. The card background and main border are unchanged from the default state.

Visual specification with annotated diagram is in `resources/visual-spec.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.
