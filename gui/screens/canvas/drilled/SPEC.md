---
name: Canvas — Drilled State
description: "The canvas state immediately after drilling into a module; the canvas re-renders with the drilled module as the new primary card and its submodule ports inside, and the breadcrumb trail is extended by one crumb."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

Drilled is the transient label for the canvas state after a drill-in action. Structurally, the canvas renders identically to idle — same layout, same components — except that the focused module has changed (the drilled module is now the primary card), the breadcrumb trail has grown by one crumb, and no card is initially selected. Drilled always immediately settles into idle (or node-selected if an external reference card auto-selects the target).

The drill-in entry animation lasts approximately 200ms: the previously selected node expands to fill the viewport, then the new canvas fades in.

State transition table is in `resources/transitions.md`.
