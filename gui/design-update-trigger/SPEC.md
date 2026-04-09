---
name: Design Update Trigger
description: "Detects GUI spec changes that affect visual design and orchestrates the Figma sync, per-platform code regeneration, and screenshot verification pipeline."
---

## Overview

This workflow treats `gui/design-system/visual-orchestration` as the semantic staging layer between external reference evidence and the canonical Figma file. Browser captures, Playwright traces, Chrome DevTools notes, and reverse-engineering summaries are inputs to the orchestration layer, not direct implementation sources.

The Design Update Trigger bridges the gap between ArchUI spec changes and their visual realization. When a GUI module README.md or spec resource is modified and the change affects visual design (card anatomy, layout rules, link rendering, component states, typography, spacing, colors), this module detects the change and orchestrates a three-phase pipeline:

1. **Figma Design Sync** — Push the spec delta to the canonical Figma file via Figma MCP, updating affected components, tokens, and canvas layouts.
2. **Platform Code Regeneration** — Trigger each affected platform's code generator to re-read Figma via MCP and regenerate implementation files (React components for Web, SwiftUI views for iOS, Compose composables for Android).
3. **Screenshot Verification** — Run the GUI test playbook's screenshot comparison group to capture the rendered result and confirm visual consistency with the updated Figma spec.

## Change Detection

Changes to the workspace composition rules captured by `visual-orchestration` are design-affecting even when the underlying component list is unchanged. Purely behavioral changes still do not activate this pipeline.

## Input Evidence

Manual redesigns may begin with inspection of a reference UI in the browser. In that case, the agent first captures the evidence bundle: screenshots, spacing notes, panel hierarchy observations, interaction timings, and any extracted visual vocabulary. That evidence is rewritten into ArchUI orchestration rules before any Figma or platform file is touched.

A spec change is considered design-affecting when it modifies any of: component anatomy or dimensions, visual state definitions (default, selected, error, modified), layout rules (card placement, spacing, overlap constraints), link rendering (edge types, arrow styles, handle positions), or design token references (color, typography, spacing, elevation). Changes that are purely behavioral (e.g., navigation flow, file-sync triggers) do not activate this pipeline.

## Trigger Points

The pipeline can be triggered in two ways:

- **Agent-driven**: After a programming agent modifies GUI spec modules, it checks whether the change is design-affecting. If yes, it invokes this module's workflow before considering the task complete.
- **Manual**: A human or architect agent explicitly invokes the design update after a batch of spec changes, for example after a major rendering model redesign.

## Pipeline Phases

### Phase 1: Figma Sync

Read the changed spec modules together with `visual-orchestration` so the implementation wave understands not just which components changed, but how the whole workspace should now be composed.

The agent loads `figma-integration` for MCP call patterns, then:
1. Reads the changed spec modules to extract the visual delta (what changed visually).
2. Opens the Figma file via MCP and locates the affected components on the Components page and layouts on the Canvas Layouts page.
3. Updates Figma nodes to match the new spec: adjusts auto-layout, dimension constraints, fill colors, text styles, and variant properties.
4. If new tokens are needed, updates the Foundations page first, then references the new tokens in components.

### Phase 2: Platform Code Regeneration

Web and Electron are handled as one shared SPA implementation wave unless the redesign changes native-shell-only behavior.

After Figma is updated:
1. Each platform agent (Web, iOS, Android, Electron) re-reads the affected Figma components via MCP.
2. Platform agents regenerate the corresponding implementation files using their standard code generation workflow.
3. Regenerated files are validated by platform-specific build/lint checks.

### Phase 3: Screenshot Verification

Screenshot comparisons must include the approved visual-orchestration states for workspace, panel, and dense-edge scenes. Baselines are refreshed only after the Figma update and shared SPA implementation wave agree.

After code regeneration:
1. The GUI test playbook's screenshot comparison group is executed on all affected platforms.
2. Screenshots of the rendered canvas are captured and compared against the updated Figma spec.
3. Discrepancies are reported as test failures with annotated diff images.
4. The pipeline is not considered complete until all screenshots pass the visual consistency threshold.

## Failure Handling

If any phase fails, the pipeline halts and reports the failure. Figma sync failures require manual MCP credential verification. Code regeneration failures are treated as platform build errors. Screenshot mismatches trigger a review cycle where the agent adjusts either the Figma spec or the platform code until consistency is achieved.
