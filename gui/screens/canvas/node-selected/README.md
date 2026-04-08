---
name: Canvas — Node Selected State
description: The canvas state when exactly one module node is selected; the detail panel is visible on the right showing the selected module's frontmatter and file metadata.
---

## Overview

Node-selected is the state when a user has single-clicked a card (either the primary card or an external reference card). The selected card is highlighted (using the `module-node/selected` visual state — highlighted border and elevated shadow) and the detail panel slides in from the right. All idle-state canvas interactions remain active alongside the selection.

The detail panel (`gui/components/detail-panel`) shows the module name (tinted with its card accent color), UUID, description, submodule list, outgoing links (Link to), and incoming links (Linked by). Each row is interactive and navigates the canvas on click.

State transition table is in `resources/transitions.md`.
