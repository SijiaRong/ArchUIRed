---
name: Port Row Handle
description: "The connection handle on a port row — a small colored dot on the left (incoming) or right (outgoing) edge of the primary card, vertically aligned to its submodule's row, used as the endpoint for link edges originating from or arriving at that submodule."
---

## Overview

Port handles are the visual anchors for link edges that connect to a specific submodule. They sit at the card boundary, precisely aligned to the vertical center of their port row. This alignment lets viewers immediately trace which submodule a link edge belongs to.

## Distinction from Module Handle

Port handles are semantically and visually distinct from the module-level handle:

| | Port Handle | Module Handle |
|---|---|---|
| **Represents** | A specific submodule within the card | The focused module itself |
| **Position** | Left/right edge, aligned to a port row | Left/right edge of the description section |
| **Per card** | One pair per submodule with external links | One pair for the whole card |

## Appearance

Port handles use the same accent color as the card header. A handle dot is only rendered when the corresponding direction (incoming or outgoing) has at least one external link for that submodule.

## Connection rules

- A **left (target) port handle** is the endpoint for edges whose source is outside the current module hierarchy, pointing toward this submodule.
- A **right (source) port handle** is the origin point for edges that leave this submodule toward external modules.
- A port handle is never rendered if there are no links in that direction for its submodule.
