---
name: Recovery Strategies Test Playbook
description: Playbook for verifying that each error category triggers the correct recovery strategy and that agent and GUI behavior conforms to the recovery contract.
---

## Playbook

### Group 1: Agent blockers and auto-recovery

[init] An ArchUI agent session is initialized with a valid project. The project has one module with a VALIDATION_ERROR (missing uuid field) and one module with an INDEX_STALE condition.

[action] The agent attempts to modify the module with the VALIDATION_ERROR.
[eval] The agent stops before modifying any files. It reports the VALIDATION_ERROR (file path and violated rule) to the caller. No file action is taken.

[action] The agent encounters the INDEX_STALE condition while navigating the module graph.
[eval] The agent silently runs archui index --fix. After confirming it succeeded, the agent resumes its task without prompting the user.

[action] Fix the VALIDATION_ERROR by adding the missing uuid field. Re-run archui validate.
[eval] No errors remain. The agent can now proceed to modify the previously blocked module.

[end] Project passes validation. Agent session completes cleanly.

---

### Group 2: GUI error badge and panel behavior

[init] The GUI is open with a project that has one module with a BROKEN_LINK and another with a SYNC_FAILURE logged.

[action] Observe the canvas nodes for the two affected modules.
[eval] The BROKEN_LINK module node shows a yellow status badge. The SYNC_FAILURE module node shows a red status badge. Unaffected nodes show no badge.

[action] Hover over the yellow badge on the BROKEN_LINK node.
[eval] A tooltip appears showing "BROKEN_LINK" and the first line of the error message (the unresolvable UUID and the declaring file path).

[action] Open the global error panel from the toolbar.
[eval] The panel lists both errors grouped by category. Each entry shows the file path and the full error message. The panel updates in real time — if archui index --fix is run and resolves the BROKEN_LINK, that entry disappears from the panel without a page refresh.

[end] Resolve both errors. Confirm all badges disappear and the global error panel shows no entries.
