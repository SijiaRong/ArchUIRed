---
name: Immediate Writes
description: "Defines which GUI canvas interactions are applied directly to the filesystem without LLM involvement, and which are deferred to LLM sync due to non-local propagation requirements."
---

## Overview

File-sync categorizes GUI interactions by propagation complexity. Simple, deterministic operations — creating a module, renaming, deleting, adding or removing a link, repositioning a node — are written immediately to disk without LLM involvement. Operations with non-local effects, such as moving a module to a new parent or bulk restructuring, are applied to disk first and then deferred to LLM sync for propagation across the module graph.

All immediate writes are atomic where possible; on any filesystem error, the operation is aborted and the error is surfaced rather than leaving a partial write.

Write tables for both immediate and deferred operations are in `resources/write-tables.md`.
