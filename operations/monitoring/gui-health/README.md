---
name: GUI Health
description: "Canvas frame rate, LLM sync response time, and filesystem watch latency targets and measurement rules for the ArchUI GUI."
---

## Overview

GUI health is tracked through three independent signals. Each has a target, a measurement point, and a below-threshold trigger. All signals are logged to the GUI log file; none are shown to the user outside developer mode.

## Canvas Frame Rate

**Target:** ≥ 60 FPS during pan and zoom operations.

**Measurement:** The render loop tick rate, sampled over a 500 ms window during any active pan or zoom gesture. Logged at `DEBUG` level.

**Below-threshold trigger:** < 30 FPS at ≤ 50 visible nodes. (See `monitoring/` for the cross-cutting threshold table and investigation procedure.)

Frame rate is reported in the GUI's performance overlay (developer mode only).

## LLM Sync Response Time

**Target:** Response received and validated within 30 seconds for a single-file change.

**Measurement:** Elapsed time from when `gui/file-sync` dispatches a sync request to the LLM API until the full response is received and validated. Logged at `INFO` level with `duration_ms` for every sync operation.

**Below-threshold trigger:** > 30 seconds for a single-file change.

## Filesystem Watch Latency

**Target:** No hard threshold; flag anomalies.

**Measurement:** Elapsed time from a filesystem change event (reported by the OS watcher) to when the GUI canvas reflects the updated module state. Logged at `DEBUG` level.

**Anomaly flag:** Latency exceeding 2 seconds on a local disk is flagged in the log at `WARN` level.
