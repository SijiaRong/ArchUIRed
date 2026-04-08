---
name: Screens
description: "Top-level screen modules for the ArchUI GUI, each modeled as a state machine with named states and transition links."
---

## Overview

The `screens` module enumerates all top-level screens in the ArchUI GUI. Each screen is its own sub-module with a state machine structure: child modules represent named states, and `transitions-to` links between states describe the possible navigations triggered by user actions or system events.

The two screens are `landing` (the entry point for project selection and recent projects) and `canvas` (the main workspace with infinite canvas, module nodes, link edges, and drill-down navigation).
