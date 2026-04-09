---
name: Web Test Playbook
description: "Step-by-step verification procedure for the web platform test suite: how to run each test layer, interpret results, and what to do when tests fail."
---

## Running the full suite

```bash
cd web-development-release/web-dev/resources
npm run test:all
```

Expected: all unit, integration, and e2e tests pass with 0 failures.

## Interpreting failures

- **Unit failures** — component logic or utility bug; fix in `web-dev/resources`
- **Integration failures** — API contract mismatch; fix in `web-server/resources`
- **E2E failures** — may be a test fragility or a real regression; check screenshot artifacts

## Blocking rule

No `web-release` build may proceed if any test in this suite is failing.
