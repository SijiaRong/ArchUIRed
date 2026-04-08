---
name: Operations
description: "Cross-cutting operational concerns for all ArchUI components, covering error handling strategy, observability, and structured logging."
---

## Overview

The `operations` module defines the contracts that govern how ArchUI components behave when things go wrong, how they expose internal health signals, and how they produce machine-readable logs. These concerns are not owned by any single component — they apply uniformly across the GUI, CLI, and agent runtime.

All ArchUI components are expected to implement the error categories, monitoring checkpoints, and logging format described in the three submodules. Agents must treat violations of these contracts the same way they treat structural filesystem rule violations: as blockers, not warnings.

## Details

**Scope of this module**

Operations covers three distinct but related concerns:

- **Error handling** (`error-handling/`) — a shared taxonomy of error categories, per-category recovery strategies, and rules for when agents may or may not auto-recover.
- **Monitoring** (`monitoring/`) — performance thresholds and observability checkpoints for the GUI canvas, CLI validation runs, and agent sessions.
- **Logging** (`logging/`) — the NDJSON log format, required and optional fields, log file locations per component, and rotation policy.

**Who must follow these conventions**

| Component | Error handling | Monitoring | Logging |
|---|---|---|---|
| CLI (`archui validate`, `archui index`) | Required | Required (timing) | Required |
| GUI (canvas, file-sync) | Required (status badges) | Required (FPS, sync latency) | Required |
| Agent runs | Required (strict — no proceed past VALIDATION_ERROR) | Required (per-session log) | Required |

**Integration points**

The `gui/file-sync` module is the primary source of `SYNC_FAILURE` and `FILESYSTEM_ERROR` events. The `cli` module is the primary source of `VALIDATION_ERROR`, `PARSE_ERROR`, `BROKEN_LINK`, and `INDEX_STALE` events. The `agent-orchestration` module must read and respect the agent error handling rules in `error-handling/` before touching any module files.
