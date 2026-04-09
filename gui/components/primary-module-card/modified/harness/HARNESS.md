---
name: "Primary Module Card — Modified State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Modified State module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Modified State module.

---

## Playbook

### Group 1: Modified state activates when a tracked file gains uncommitted changes

[init] A canvas is open. A primary card is visible for a module with no uncommitted changes (clean state). The card shows a gray status dot and default border.

[action] Edit the module's `SPEC.md` (or `README.md`) by adding any character. Save the file without committing.
[eval] The primary card reactively updates: the status dot changes from gray (`color/status/clean`) to amber (`color/status/modified`). The header background becomes an amber-tinted surface (light: `#FEF3C7`, dark: `#451A03`). A 2px solid amber bar (`color/status/modified`, `#F59E0B`) appears as the header's bottom border. These changes appear within one polling interval (or immediately on filesystem watch).

[action] Observe the card's outer border and body.
[eval] The outer card border remains 1px `color/border/subtle` — it does NOT change to amber. The description body and port section are visually unchanged.

[end] Revert the file change (e.g., `git checkout` or undo edit). Confirm the card returns to the clean state (gray dot, default header background, no bottom accent bar).

### Group 2: Modified state reflects git-tracked changes (not untracked files)

[init] A canvas is open. A module in clean state is visible.

[action] Create a new file inside the module folder (e.g., `resources/notes.txt`) that is NOT yet tracked by git. Save it.
[eval] The primary card does NOT enter the modified state. Untracked files do not trigger the modified status — only changes to files already tracked by git.

[action] Stage the new file with `git add resources/notes.txt`.
[eval] The primary card now shows the modified state (amber dot, amber header). Staged (but uncommitted) changes are treated the same as unstaged changes.

[end] Remove the test file and run `git reset HEAD` if needed. Confirm the card returns to clean state.

### Group 3: Modified + selected combined visual treatment

[init] A canvas is open. A module has uncommitted changes and shows the modified state (amber header, amber dot).

[action] Single-click the modified card.
[eval] The card enters combined modified + selected state: border is 2px `color/border/focus` (blue, selection takes precedence), background is `color/interactive/selected-bg`, header retains the amber tint and 2px amber bottom accent bar, status dot remains amber, box-shadow is `elevation/card/selected` (focus ring + drop shadow). The description section expands.

[action] Press Escape to deselect.
[eval] The card returns to modified-only state: 1px `color/border/subtle` border, amber header accent, amber dot, `elevation/card/default` shadow, description collapses if cursor is not hovering.

[end] No cleanup required.

### Group 4: Modified state is cleared on commit

[init] A canvas is open. A module has uncommitted changes and shows the modified state.

[action] Commit the changes using `git commit -m "test commit"`.
[eval] The primary card reactively updates back to clean state: amber dot reverts to gray (`color/status/clean`), amber header background and bottom bar disappear, default header styling is restored.

[action] Run `git log --oneline -1` to confirm the commit exists.
[eval] The latest commit message is "test commit". The canvas module no longer shows modified state.

[end] If you want to revert: `git revert HEAD` or `git reset HEAD~1` as appropriate.

### Group 5: Multiple modified modules are independently tracked

[init] A canvas is open with at least three primary cards from different modules visible.

[action] Modify the `SPEC.md` of two different modules without committing. Leave the third module unchanged.
[eval] Exactly the two modified modules show the amber modified state. The third module remains in clean state. Each module's state is tracked independently — there is no "any module modified" global toggle.

[action] Revert one of the two modified files.
[eval] That module's card immediately returns to clean state. The other modified module's card retains the amber styling.

[end] Revert all uncommitted changes and confirm all three cards are in clean state.
