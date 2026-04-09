---
name: Link Renderer — External Stub (Deprecated)
description: Previously rendered compact stub nodes for cross-boundary links. Deprecated — external links now materialize as full external reference cards with name and UUID.
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Overview

External stubs were previously rendered as compact nodes (showing an arrow icon and the target name) when a link crossed the current canvas boundary. They served as lightweight placeholders for non-visible modules.

## Current Status

External stubs are **replaced by external reference cards** in the primary-card rendering model. Every cross-boundary link now materializes as a full external reference card showing the module's complete name and a dimmed UUID. External reference cards are draggable, positionable, and support navigation on double-click.

This module is retained as a reserved placeholder in case a future design iteration reintroduces a more compact representation for certain edge cases.
