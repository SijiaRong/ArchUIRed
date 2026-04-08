---
name: Navigation — Breadcrumb
description: "The horizontal breadcrumb trail rendered in the canvas topbar, showing the current navigation path from root to the focused module with clickable crumbs for direct jump navigation."
---

## Overview

The breadcrumb is always visible at the top of the canvas screen. It renders the navigation stack as a sequence of clickable labels separated by `›` chevrons. The root crumb ("ArchUI") is always present and never removed. Mid-crumbs are clickable and jump directly to that depth. The current (rightmost) crumb is non-clickable. When the trail exceeds available width, middle crumbs collapse into `…` with a dropdown.

Visual specification with annotated diagram and interaction table are in `resources/visual-spec.md`.
