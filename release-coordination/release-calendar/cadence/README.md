---
name: Cadence
description: "Default release cadence rules, per-platform review lag estimates, and schema-sync timing obligations that govern when platforms must ship after a schema/vX tag."
---

## Default Cadence

There is no lockstep release requirement. Platforms ship when they are ready. The one soft constraint is a **minimum cadence of one release per platform per 8 weeks.** This ceiling prevents diff accumulation that makes store review riskier and makes schema-sync windows harder to schedule. If a platform has nothing user-facing to ship, a maintenance patch (dependency updates, telemetry cleanup) satisfies the cadence requirement.

| Platform | Typical review lag | Notes |
|---|---|---|
| iOS | 1–3 days (App Store review) | Factor into target release dates; expedited review available for critical hotfixes |
| Android | 2–24 hours (Play review) + rollout | Staged rollout (10% → 50% → 100%) adds calendar time; hotfixes can pin to 100% rollout |
| Web | Minutes (CDN deploy) | No review gate; web can lead on feature releases when browser-only work is ready |
| Electron | Hours (auto-update propagation) | No store review; however notarization (macOS) adds 5–30 minutes to CI time |

## Schema-Sync Release Windows

When a `schema/vX` tag is created, each platform must ship its `X.0.0` release before the next `schema/v(X+1)` tag is permitted:

- The architect agent must not create `schema/v3` until all platforms have tagged `v2.0.0` or later.
- If a platform is blocked (e.g., App Store review delay), the architect agent waits. There is no override.
- **Maximum window:** 6 weeks between `schema/vX` creation and the last platform shipping `vX.0.0`. If a platform cannot ship within 6 weeks, escalate to a coordination review before proceeding.
