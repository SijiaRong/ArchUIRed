---
name: "Navigation — Breadcrumb Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Navigation — Breadcrumb module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Navigation — Breadcrumb module.

---

## Playbook

### Group 1: Root crumb is always present

[init] The GUI opens at the root canvas. The navigation stack contains only the root module entry.

[action] Observe the breadcrumb bar rendered in the topbar.
[eval] The breadcrumb shows exactly one crumb: "ArchUI" (the root crumb). No other crumbs are present.

[action] Drill into a submodule by double-clicking its node.
[eval] The breadcrumb now shows two crumbs: "ArchUI" and the drilled-into module name. The root crumb "ArchUI" is still the leftmost item and remains visible.

[action] Continue drilling two more levels deep.
[eval] The breadcrumb shows four crumbs total. "ArchUI" remains the leftmost crumb at every depth. It was not removed or collapsed.

[end] Click the root crumb to return to the root canvas.

---

### Group 2: Clicking a mid-trail crumb navigates directly to that level

[init] The navigation stack has four entries: root → GUI → Canvas → Module Node. The breadcrumb displays all four crumbs.

[action] Click the "GUI" crumb (the second item in the trail, not the root and not the current).
[eval] The canvas renders GUI's direct submodules. The breadcrumb truncates to two crumbs: "ArchUI" and "GUI". The navigation stack now has exactly two entries. The Canvas node is not shown (it was deeper than the clicked crumb).

[action] From the GUI canvas, drill into "Canvas". Then click the "ArchUI" root crumb.
[eval] The canvas returns to the root view. The breadcrumb shows only the "ArchUI" crumb. The navigation stack has one entry.

[end] Navigation stack is at root. No cleanup needed.

---

### Group 3: Active (current) crumb is visually distinct and non-interactive

[init] The GUI is at a canvas three levels deep: root → GUI → Canvas. The breadcrumb shows "ArchUI › GUI › Canvas".

[action] Observe the visual styling of the three crumbs in the breadcrumb bar.
[eval] "ArchUI" and "GUI" render in the link color (`color/text/link`) with no underline. "Canvas" (current/rightmost) renders in the primary text color (`color/text/primary`) with font-weight 500. There is a visible difference between the current crumb and the clickable crumbs.

[action] Click the "Canvas" crumb (the current/rightmost crumb).
[eval] Nothing happens. The navigation stack does not change. The canvas does not re-render. The breadcrumb trail does not change.

[action] Hover over the "GUI" crumb.
[eval] An underline appears on "GUI" and the cursor changes to a pointer. Neither the "Canvas" crumb nor the separator `›` show hover styling.

[end] Navigate back to root using the root crumb.

---

### Group 4: Overflow truncation collapses middle crumbs and restores via dropdown

[init] The viewport is narrowed so that a full six-level trail would exceed the available breadcrumb bar width. The navigation stack has six entries: root → A → B → C → D → E.

[action] Observe the breadcrumb bar.
[eval] The breadcrumb shows: "ArchUI  ›  …  ›  E". The middle crumbs (A, B, C, D) are not individually visible — they are collapsed behind the `…` overflow button. The root crumb and current crumb are always visible.

[action] Click the `…` overflow button.
[eval] A dropdown panel appears below the `…` button. It lists the hidden crumbs in order: A at the top, then B, C, D. All entries are clickable.

[action] Click "B" in the dropdown.
[eval] The dropdown closes. The canvas navigates to B's canvas. The breadcrumb now shows "ArchUI › B" (two crumbs). No overflow `…` is needed at this depth.

[end] Return to root by clicking the "ArchUI" crumb.
