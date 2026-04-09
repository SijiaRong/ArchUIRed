---
name: "Detail Panel Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Detail Panel module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Detail Panel module.

---

## Playbook

### Group 1: Panel show and hide animation on selection change

[init] A canvas is open at the root level. At least two primary cards are visible. No module is currently selected. The detail panel is confirmed to be off-screen (translateX(100%)) — not visible to the user.

[action] Single-click on any primary card.
[eval] The detail panel slides in from the right within 200ms using ease-out timing. The panel is now fully visible at translateX(0). The panel displays the name, UUID, and description of the clicked module in the header section.

[action] Click on an empty area of the canvas (no card, no edge, no handle under the cursor).
[eval] The detail panel slides out to the right within 200ms using ease-in timing. The panel is fully off-screen at translateX(100%). The selected module's card returns to its default (unselected) visual state.

[action] Single-click on a second primary card (different from the first).
[eval] The detail panel remains visible and smoothly updates its content to display the second module's data. The panel does not slide out and back in — it stays at translateX(0) and re-renders the header and sections for the new selection.

[end] Click empty canvas to close the panel. Confirm the panel is off-screen and no card shows a selected state.

---

### Group 2: Header section renders correct module data

[init] A canvas is open. One visible primary card corresponds to a module with known name ("Alpha Module"), UUID starting with "a1b2c3d4", and description ("A known description for testing."). The module has siblings at the current level so it has a deterministic accent color at index N.

[action] Single-click the primary card for "Alpha Module".
[eval] The detail panel header shows "Alpha Module" in large bold text (24px) colored with color/port/N (matching the card's accent color). The UUID line shows "a1b2c3d4" in small monospace text at reduced opacity (≈0.45). The description shows "A known description for testing." in 13px regular body text (color/text/secondary).

[action] Edit the module's README.md frontmatter: change name to "Alpha Module Updated" and description to "Updated description." Save the file.
[eval] The detail panel header re-renders automatically: title shows "Alpha Module Updated" and description shows "Updated description." without closing and reopening the panel.

[end] Revert the README.md to its original values. Confirm the panel header updates back to "Alpha Module" and "A known description for testing."

---

### Group 3: Submodules section renders and hides correctly

[init] A canvas is open. Module A has three declared submodules (names: "Sub Alpha", "Sub Beta", "Sub Gamma", each with a known description). Module B has no submodules. No module is selected.

[action] Single-click Module A's primary card.
[eval] The detail panel shows a "SUBMODULES (3)" section header below the description, preceded by a horizontal separator line. Three rows are listed: "Sub Alpha", "Sub Beta", "Sub Gamma" — each with a dimmed `›` arrow indicator on the left. The count "(3)" in the header matches the number of rows.

[action] Hover the mouse over the "Sub Alpha" row.
[eval] The row background changes to color/interactive/hover. The description text for "Sub Alpha" appears below its name as secondary text (11px, color/text/secondary).

[action] Move the mouse away from the row.
[eval] The row background returns to transparent. The inline description disappears.

[action] Click on empty canvas to deselect, then single-click Module B's primary card.
[eval] The detail panel shows the header for Module B (name, UUID, description) but the Submodules section is entirely absent — no "SUBMODULES (0)" header, no separator, no empty-state text.

[end] Click empty canvas to close the panel.

---

### Group 4: Link to and Linked by sections render with relation pills

[init] A canvas is open. Module X has two outgoing links: one with relation "depends-on" targeting Module Y, and one with relation "references" targeting Module Z. Module Z also has a link back to Module X with relation "implements". No module is selected.

[action] Single-click Module X's primary card.
[eval] The detail panel shows a "LINK TO (2)" section with two rows. The first row shows a "depends-on" pill (blue tint, color/edge/depends-on) and the name "Module Y". The second row shows a "references" pill (muted tint, color/edge/references) and the name "Module Z". A "LINKED BY (1)" section appears below, with one row showing an "implements" pill and the name "Module Z".

[action] Hover over the "Module Y" row in the Link to section.
[eval] The row background changes to color/interactive/hover. Module Y's own description (from its README.md) appears as inline secondary text below "Module Y".

[action] Click the "Module Y" row.
[eval] The canvas navigates to the level where Module Y is visible (Module Y's parent level). After navigation, Module Y's card is selected (accent border + glow) and centred in the viewport. The detail panel updates to show Module Y's data.

[end] Navigate back to the original canvas level. Confirm Module X's state is restored to default (unselected).

---

### Group 5: Empty state — all sections absent when no relationships exist

[init] A canvas is open. Module Lone is a leaf module: it has zero submodules, zero outgoing links, and no other module links to it. No module is selected.

[action] Single-click Module Lone's primary card.
[eval] The detail panel is visible and shows only the header section: title, UUID line, and description. There are no section separators, no "SUBMODULES" header, no "LINK TO" header, no "LINKED BY" header, no empty-state illustrations or placeholder labels. The panel bottom padding (spacing/8) follows immediately after the description text.

[action] Observe the panel's scrollable area.
[eval] There is no scrollbar or overflow indicator — the content fits within the panel height.

[end] Click empty canvas to close the panel. Confirm the panel is off-screen.
