---
name: CLI Performance Test Playbook
description: "Test playbook for verifying that `archui validate` and `archui index` runtimes are measured, logged, and flagged correctly against their thresholds."
---

## Playbook

[init] An ArchUI project with 200 modules is present on disk. The index is up to date. No previous log entries exist for this invocation.

[action] Run `archui validate` against the project root.
[eval] The command exits 0. An `INFO`-level log entry is present with `duration_ms` reflecting wall-clock time. The value is < 2000 ms (within target for < 500 modules).

[action] Run `archui validate --log-level debug`.
[eval] In addition to the summary `INFO` entry, one `DEBUG` entry per file is present, each with its own `duration_ms`. No file exceeds a disproportionate share of the total time.

[end] Log file is closed. No ERROR or WARN entries present for this run.

---

[init] The same 200-module project. The `archui validate` runtime is artificially degraded to simulate a slow run taking 6 seconds.

[action] Run `archui validate`.
[eval] The command exits non-zero (or exits 0 with a performance warning). The `INFO` log entry has `duration_ms` > 5000. In benchmark CI mode, this breaches the threshold defined in `monitoring/` and the CI check fails.

[end] Degradation is removed. Subsequent runs return to < 2 seconds.

---

[init] An ArchUI project with 200 modules. `.archui/index.yaml` is missing and must be rebuilt.

[action] Run `archui index --fix`.
[eval] The command completes and writes a new `.archui/index.yaml`. An `INFO` entry is logged with `duration_ms` < 1000 ms.

[action] Run `archui index --fix` a second time immediately after. Compare `duration_ms` values between the two runs.
[eval] The second run duration is within 2× of the first. If one run is more than 2× slower, a `WARN` entry is emitted noting the regression.

[end] Index is consistent with the filesystem. No ERROR entries.
