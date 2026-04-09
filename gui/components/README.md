---
name: Components
description: "Reusable visual components shared across all ArchUI GUI screens, each with named visual states and documented interaction behaviors."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

The `components` module collects all reusable UI building blocks used by the ArchUI GUI screens. Each component is platform-agnostic at this level — the description here is purely behavioral and visual. Platform-specific implementations (SwiftUI, React, Compose) live in their respective platform modules.

The three components are `module-node` (primary card for the focused module and small external reference cards), `link-renderer` (directional edges between card handles), and `navigation` (breadcrumb trail and drill-down navigation controls).
