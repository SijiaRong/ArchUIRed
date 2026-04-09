---
name: Design Update Trigger Test Playbook
description: "Verifies that spec changes correctly trigger the Figma sync, code regeneration, and screenshot verification pipeline."
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## Playbook

### Group 1: Design-affecting change triggers full pipeline

[init] A valid ArchUI project exists with a functioning GUI. The Figma MCP is connected and the design file is accessible. A GUI spec module with a known visual component (e.g., module-node default state) is identified.

[action] Modify the spec module's README.md to change a design-affecting property (e.g., update the primary card border-radius from 12px to 16px in the default state spec).
[eval] The Design Update Trigger detects the change as design-affecting and initiates the pipeline. Phase 1 (Figma Sync) updates the corresponding Figma component. Phase 2 (Code Regeneration) regenerates the platform implementation file. Phase 3 (Screenshot Verification) captures a screenshot and confirms the rendered border-radius matches the new spec.

[end] Revert the spec change. Confirm the pipeline re-triggers and restores the original design.

### Group 2: Non-design change does not trigger pipeline

[init] Same setup as Group 1. A GUI spec module with behavioral-only content (e.g., file-sync write strategy) is identified.

[action] Modify the behavioral spec module's README.md to change a non-visual property (e.g., reword the LLM sync description).
[eval] The Design Update Trigger does not initiate the pipeline. No Figma MCP calls are made. No code regeneration occurs.

[end] Revert the spec change.

### Group 3: Screenshot mismatch triggers review cycle

[init] Same setup as Group 1. The Figma file contains a component that matches the current platform implementation.

[action] Manually introduce a discrepancy: update the Figma component's fill color without updating the spec, then trigger the pipeline.
[eval] Phase 3 (Screenshot Verification) detects a mismatch between the rendered output and the Figma spec. The failure is reported with an annotated diff image showing the color difference.

[action] Correct the discrepancy by updating the platform code or the Figma component to match.
[eval] Re-running the screenshot verification passes. The pipeline completes successfully.

[end] Restore original state.

### Group 4: Screenshot capture covers all card types and link rendering

[init] The GUI is displaying a canvas with a primary card, at least two external reference cards, and both direct edges and port edges visible.

[action] Trigger a screenshot capture via the test playbook.
[eval] The captured screenshot includes: the primary card with correct name, UUID, description, module-level handles, and port section; external reference cards with correct names and UUIDs; direct edges with correct arrow direction; port edges with correct arrow direction. All elements match the current Figma spec.

[end] No changes needed.
