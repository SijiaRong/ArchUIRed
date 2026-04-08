---
name: Logging
description: "Structured logging format, required and optional fields, log file locations per component, rotation policy, and debug instructions for agent runs."
---

## Overview

All ArchUI components — CLI, GUI, and agent runtime — write logs in newline-delimited JSON (NDJSON) format. Every log entry is a self-contained JSON object on a single line. This format is chosen for machine readability: logs can be streamed, filtered with `jq`, and ingested by any structured log aggregator without a custom parser.

Human-readable formatting is deliberately not provided in log files. The CLI prints human-readable status to stderr in real time; the log files are for post-hoc debugging and tooling.

The log entry schema (format, levels, required and optional fields) is in `log-schema/`. File locations and debug instructions are in `log-locations/`. The rotation and lifecycle policy is in `log-rotation/`.
