---
name: Telemetry
description: "Opt-in anonymous usage metrics policy for ArchUI: what is reported, what is never reported, transmission schedule, and user configuration commands."
---

## Overview

ArchUI may report anonymous usage metrics to Anthropic if the user has explicitly opted in during onboarding or via `archui config --telemetry on`. Telemetry is never on by default and never includes any content, names, or paths from the user's project.

## What Is Reported

- Module count (total, per project)
- Validation error rate (errors per validation run, by category)
- Sync operation frequency and success/failure rate
- CLI and GUI version

## What Is Never Reported

The following are excluded under all circumstances, regardless of opt-in status:

- File contents
- Module names or descriptions
- File paths
- Agent session logs or outputs
- Any user-identifiable information

## Transmission Policy

Telemetry is transmitted at most once per day, in a single batched request. If telemetry transmission fails, it is silently dropped — it must never cause a user-visible error or retry loop.

## User Configuration

```sh
# Opt in (also prompted during onboarding)
archui config --telemetry on

# Opt out
archui config --telemetry off

# Check current status
archui config --telemetry-status
```
