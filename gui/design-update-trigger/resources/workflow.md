# Design Update Trigger — Workflow Reference

## Pipeline Flow

```
Spec change detected
       │
       ▼
┌──────────────────┐
│ Change Analysis   │  Classify: design-affecting vs behavioral-only
│                   │  Inputs: git diff of GUI module README.md and resources/*.md
└──────┬───────────┘
       │ design-affecting
       ▼
┌──────────────────┐
│ Phase 1:          │  Load figma-integration → MCP call patterns
│ Figma Sync        │  Read changed specs → extract visual delta
│                   │  Update Figma components + tokens via MCP
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Phase 2:          │  Each platform agent re-reads Figma via MCP
│ Code Regeneration │  Regenerate affected implementation files
│                   │  Run platform build/lint validation
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Phase 3:          │  Execute GUI test playbook screenshot group
│ Screenshot Verify │  Compare rendered output vs Figma spec
│                   │  Report pass/fail with annotated diffs
└──────┬───────────┘
       │
       ▼
   Pipeline complete
```

## Change Classification Rules

Design-affecting changes modify any of:

| Category         | Examples                                                          |
|------------------|-------------------------------------------------------------------|
| Component anatomy| Card dimensions, border-radius, section layout, handle positions  |
| Visual states    | Default/selected/error/modified appearance, shadows, borders      |
| Layout rules     | Card placement, spacing between cards, overlap constraints        |
| Link rendering   | Edge types, arrow styles, path routing, handle visibility         |
| Design tokens    | Color references, typography scale, spacing values, elevation     |

Behavioral-only changes (do NOT trigger):

| Category         | Examples                                                          |
|------------------|-------------------------------------------------------------------|
| Navigation flow  | Drill-in targets, breadcrumb behavior, back navigation            |
| File sync logic  | Write strategy, index updates, LLM sync triggers                 |
| Data model       | Frontmatter schema, link relation vocabulary                      |
| Test procedures  | Playbook steps, evaluation criteria (unless visual)               |

## Agent Checklist

Before considering a GUI spec modification complete, the modifying agent must:

1. [ ] Determine if the change is design-affecting using the classification table above.
2. [ ] If design-affecting, invoke the Design Update Trigger pipeline.
3. [ ] Confirm Phase 1 (Figma Sync) completed without MCP errors.
4. [ ] Confirm Phase 2 (Code Regeneration) produced valid platform code.
5. [ ] Confirm Phase 3 (Screenshot Verification) passed for all affected platforms.
6. [ ] If any phase failed, resolve the issue and re-run from the failed phase.

## Screenshot Comparison Spec

- Capture: headless browser (Web), simulator (iOS/Android) at 1x resolution.
- Baseline: Figma frame export at matching resolution via MCP `exportAsync`.
- Comparison: pixel-diff with a configurable threshold (default: 0.1% pixel difference tolerance).
- Output: pass/fail status, annotated diff image highlighting mismatched regions, side-by-side composite.
