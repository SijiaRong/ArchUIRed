---
name: "Primary Module Card — Error State Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Primary Module Card — Error State module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Primary Module Card — Error State module.

---

## Playbook

### Group 1: Error state activates when the identity document is missing

[init] A canvas is open. A module folder exists with a valid `SPEC.md`. The card renders in default state.

[action] Delete the module's `SPEC.md` from disk. Wait for the canvas to detect the file change.
[eval] The card enters error state: the border changes to 2px solid `color/status/error` (red, `#EF4444`). The background becomes a subtle red tint (light: `#FEF2F2`). A box-shadow ring of `0 0 0 3px rgba(239,68,68,0.15)` appears. The header displays the folder basename (in italic) instead of the module name. The ⚠ icon replaces the status dot. The body area shows the error message: `README.md missing` (or equivalent for SPEC.md).

[action] Observe the port section.
[eval] No port section is rendered. The error card shows only the header and the error message body zone. No port divider is visible.

[end] Restore the deleted `SPEC.md`. Confirm the card returns to default (or modified, if the file was restored as a new unstaged change).

### Group 2: Error state activates for unparseable frontmatter

[init] A canvas is open. A module has a valid `SPEC.md` in default state.

[action] Open the module's `SPEC.md` and corrupt the YAML frontmatter block (e.g., add `name: [invalid: yaml`). Save the file.
[eval] The card enters error state: 2px red border, subtle red background, ⚠ icon in header, folder basename shown in italic as title. The error message in the body reads: `Frontmatter parse error`.

[action] Observe the UUID row in the header.
[eval] The UUID row is hidden (or empty) because no UUID is parseable from the frontmatter.

[end] Fix the frontmatter and save. Confirm the card recovers to the modified state (since the file now has uncommitted changes) or default state.

### Group 3: Error message specificity — missing required fields

[init] A canvas is open. A module has a `SPEC.md` with valid YAML structure but the `uuid` field is missing from frontmatter.

[action] Observe the card.
[eval] The card shows error state with the message `Missing field: uuid` in the body zone.

[action] Add the `uuid` field back to frontmatter but remove the `description` field instead. Save.
[eval] The card shows error state with the message `Missing field: description`.

[action] Restore all required fields (`name`, `description`, `uuid`). Save.
[eval] The card recovers to default or modified state. No error state visible.

[end] Commit or revert the frontmatter changes.

### Group 4: Error node remains selectable and drill-in works

[init] A canvas is open. A module is in error state (e.g., missing `uuid` field).

[action] Single-click the error card.
[eval] The card enters a selected-over-error state. A detail panel opens showing the full list of validation errors for this module and a "Fix" button/shortcut.

[action] Click the [↗] drill-in icon on the error card.
[eval] The canvas navigates into the module. The new canvas level shows a blank or minimal primary card with the raw error message rather than normal submodule content.

[end] Navigate back using the breadcrumb. Fix the module's frontmatter and confirm it recovers.

### Group 5: Error state overrides modified state

[init] A canvas is open. A module has uncommitted changes (modified state, amber header, amber dot).

[action] Further corrupt the module's `SPEC.md` by removing the `uuid` field (leaving the file with uncommitted changes AND a parse error).
[eval] The card renders in error state only: 2px red border, red background tint, ⚠ icon. The amber modified indicators (amber dot, amber header) are NOT visible. Error state overrides all other status signals.

[action] Fix the `uuid` field but do not commit (leave the file as uncommitted).
[eval] The card recovers from error state to the modified state (amber header, amber dot, 1px subtle border).

[end] Commit or revert the changes. Confirm the card returns to clean default state.
