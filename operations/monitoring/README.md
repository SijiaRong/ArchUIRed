---
name: Monitoring
description: "Observability checkpoints, performance thresholds, and telemetry policy for the ArchUI GUI, CLI, and agent runtime."
---

## Overview

ArchUI is a local-first tool with no always-on server process. Monitoring therefore means: measuring performance at defined checkpoints during user-initiated operations and agent runs, comparing against thresholds, and logging anomalies. There is no continuous uptime monitoring. Telemetry is strictly opt-in and never includes file content or module names.

Detailed signal definitions and collection rules are in the submodules: GUI health signals in `gui-health/`, CLI performance checkpoints in `cli-performance/`, agent run observability requirements in `agent-observability/`, and the telemetry policy in `telemetry/`.

## Performance Thresholds That Should Trigger Investigation

The following conditions indicate a performance regression that warrants investigation before release or deployment:

| Condition | Threshold | Action |
|---|---|---|
| `archui validate` runtime | > 5 seconds (any project size) | Profile per-file timing with `--log-level debug`; check for filesystem or YAML parser hotspots |
| Canvas FPS under load | < 30 FPS at ≤ 50 visible nodes | Profile render loop; check for unnecessary re-renders triggered by filesystem watch events |
| LLM sync latency | > 30 seconds for a single-file change | Check API response time vs. post-processing time; confirm response is not hitting retry logic |

Thresholds are evaluated against the `duration_ms` field in structured log entries. Automated CI checks should fail if a benchmark run breaches any of these thresholds on reference hardware.
