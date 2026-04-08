---
name: Cadence Test Playbook
description: Test playbook for verifying that release cadence rules and schema-sync timing obligations are enforced correctly.
---

## Playbook

[init] All four platforms (iOS, Android, Web, Electron) are at version 1.2.0. No platform has released in 6 weeks. No schema tag change is pending.

[action] The iOS release agent prepares and ships `ios/v1.3.0` after 7 weeks of inactivity.
[eval] The release is valid — it is within the 8-week maximum cadence. No cadence violation is flagged.

[action] The Android release agent attempts to ship `android/v1.3.0` after 9 weeks since its last release.
[eval] The 8-week cadence constraint is breached. The release agent logs a cadence warning. The release may proceed but the violation should be noted in the coordination log.

[end] All platforms are updated. Cadence clock resets.

---

[init] The architect agent has just created `schema/v2`. All platforms are currently at `v1.x.x`. The schema-sync window has opened.

[action] iOS ships `ios/v2.0.0` within 3 weeks of the schema tag.
[eval] iOS satisfies its schema-sync obligation. The coordination state shows iOS as compliant.

[action] Android ships `android/v2.0.0` within 4 weeks.
[eval] Android is compliant. Web and Electron are still pending.

[action] Web ships `web/v2.0.0` within 5 weeks.
[eval] Web is compliant. Only Electron remains.

[action] Electron has not shipped by week 7 (past the 6-week maximum window).
[eval] The 6-week maximum window is breached. An escalation is required before the architect agent may create `schema/v3`. The architect agent must not proceed with `schema/v3` until Electron ships.

[end] Electron ships `electron/v2.0.0` after resolving the delay. All platforms are on MAJOR version 2. The coordination window closes. `schema/v3` may now be created when ready.
