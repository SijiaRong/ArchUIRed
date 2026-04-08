---
name: Module Handle
description: "The connection handle for the focused module's own links — positioned on the left (incoming) or right (outgoing) edge of the description section, representing the module itself as a link endpoint, distinct from the submodule port handles in the port section."
---

## Overview

The module handle is the canvas-level connection anchor for links that belong directly to the focused module (entries in its own `links` array). It appears on the description section of the primary card, not inside the port section.

## Distinction from Port Handle

| | Module Handle | Port Handle |
|---|---|---|
| **Represents** | The focused module itself | A specific submodule within the card |
| **Location** | Edges of the description section | Edges aligned to a port row |
| **Per card** | At most one left, one right | One pair per linked submodule |
| **Driven by** | The focused module's `links` array | A submodule's external links |

## Visibility

- **Left (target) handle** — shown only when at least one external module has a link whose target is the focused module.
- **Right (source) handle** — shown only when the focused module has at least one outgoing link to an external module.
- Both handles are hidden when no module-level links exist in that direction.
