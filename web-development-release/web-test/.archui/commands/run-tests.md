---
name: Run Tests
description: Execute the full web test suite — unit, integration, and e2e — and report results.
icon: ✓
---

Run all test layers for the web platform in sequence.

Steps:
1. Verify `web-development/resources` and `web-server/resources` exist and are built.
2. Run `npm run test` (unit + integration) from `web-development-release/web-development/resources`.
3. If unit/integration pass, run `npm run test:e2e` (Playwright).
4. Report a summary: pass/fail counts per layer, any failure output.
5. If any layer fails, identify whether the failure is in `web-development` or `web-server` resources and report which module needs to be fixed.

Do not modify any resources. This command is read-only — it only runs tests and reports.
