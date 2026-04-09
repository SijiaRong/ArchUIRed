---
name: Primary Module Card — Error State
description: "The visual state of a primary module card when the module's README.md is missing or its frontmatter is unparseable; a red border and inline error message replace the normal body content."
---

## Overview

The error state is applied when a module folder exists but its README.md is missing, its frontmatter is unparseable, or the `uuid` field is absent. The node still renders so the user can see and fix the problem in-app. A red border (`status/error`), a warning icon replacing the status dot, and a short error message in the body zone replace the normal card appearance.

Visual specification with annotated diagram and trigger conditions are in `resources/visual-spec.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.
