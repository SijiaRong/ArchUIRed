---
name: Primary Module Card — Port Row
description: "A single row in the port section representing one submodule with external links — shows the submodule name and exposes port handles on the left and right edges of the card for incoming and outgoing link connections."
---

## Overview

Each port row corresponds to one direct submodule of the focused module that has at least one external link. Port rows are stacked vertically within the port section.

## Layout

A port row consists of:

- **Left handle slot** — occupied by a port handle dot when the submodule has incoming external links.
- **Submodule name** — the submodule's `name` field from its frontmatter, displayed as a label in the center of the row.
- **Right handle slot** — occupied by a port handle dot when the submodule has outgoing external links.

A submodule with both incoming and outgoing external links shows port handles on both sides.

## Interaction

- **Single click** — selects the submodule (shows it in the detail panel) without leaving the current canvas level.
- **Double click** — drills into the submodule, making it the new primary card.
