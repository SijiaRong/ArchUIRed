---
name: Navigation — Breadcrumb
description: "The horizontal breadcrumb trail rendered in the canvas topbar, showing the current navigation path from root to the focused module with clickable crumbs for direct jump navigation."
---

## Overview

The breadcrumb is always visible at the top of the canvas screen. It renders the navigation stack as a sequence of clickable labels separated by `›` chevrons. The root crumb ("ArchUI") is always present and never removed. Mid-crumbs are clickable and jump directly to that depth. The current (rightmost) crumb is non-clickable. When the trail exceeds available width, middle crumbs collapse into `…` with a dropdown.

Visual specification with annotated diagram and interaction table are in `resources/visual-spec.md`.

## Design System

All visual properties — color, typography, spacing, and elevation — must use semantic tokens from the Design System (`gui/design-system/`). Do not use raw hex, pixel, or opacity values in implementations. Consult `gui/design-system/foundations/color/resources/token-table.md`, `gui/design-system/foundations/typography/resources/token-table.md`, `gui/design-system/foundations/spacing/resources/token-table.md`, and `gui/design-system/foundations/elevation/resources/token-table.md` for the complete token vocabulary.
