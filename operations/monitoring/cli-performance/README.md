---
name: CLI Performance
description: "Performance targets and measurement rules for `archui validate` and `archui index` runtimes, including per-file debug timing."
---

## Overview

CLI performance is measured at the command level. Both primary CLI operations have targets and are logged with `duration_ms` for every invocation. These measurements feed the cross-cutting threshold checks in `monitoring/`.

## `archui validate` Runtime

**Target:** < 2 seconds for projects with fewer than 500 modules.

**Measurement:** Wall-clock time from command invocation to final exit. Logged at `INFO` level with `duration_ms`.

**Below-threshold trigger:** > 5 seconds total. (See `monitoring/` for the investigation procedure.)

**Debug timing:** Pass `--log-level debug` to enable per-file timing — one `DEBUG` entry per file processed, with `duration_ms` on each.

## `archui index` Rebuild Time

**Target:** < 1 second for projects with fewer than 500 modules.

**Measurement:** Wall-clock time for `archui index --fix` to complete. Logged at `INFO` level with `duration_ms`.

**Regression flag:** Regressions of > 2× baseline are logged at `WARN` level. No hard investigation threshold, but persistent regressions warrant profiling.

Per-file timing is available at `DEBUG` log level (pass `--log-level debug` or set `ARCHUI_LOG_LEVEL=debug`).
