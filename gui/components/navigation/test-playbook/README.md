---
name: Navigation Test Playbook
description: "Playbook for verifying that navigation correctly manages drill-down, back-navigation, breadcrumb display, jump navigation, and session persistence."
---

## Playbook

### Group 1: Drill-in pushes module onto navigation stack and updates breadcrumb

[init] The GUI is open at the root canvas. The navigation stack contains only the root module. The breadcrumb shows only the root crumb.

[action] Double-click a module-node labeled "GUI" to drill into it.
[eval] The canvas re-renders showing GUI's direct submodules. The breadcrumb trail updates to show two crumbs: root and GUI. The navigation stack now has two entries.

[action] In the new canvas, click the drill-in icon on a node labeled "Canvas".
[eval] The canvas re-renders showing Canvas's direct submodules. The breadcrumb shows three crumbs: root, GUI, and Canvas. The navigation stack has three entries.

[end] Click the root crumb in the breadcrumb to return to the root canvas. Confirm the breadcrumb shows only the root crumb.

### Group 2: Back navigation pops stack and highlights previously focused node

[init] The navigation stack has three entries: root, GUI, Canvas. The canvas is displaying Canvas's submodules.

[action] Click the back button in the UI chrome.
[eval] The canvas returns to GUI's submodule view. The breadcrumb shows root and GUI. The Canvas node is briefly highlighted in the GUI canvas to help re-orient the user.

[action] Press the Escape key (with no node selected).
[eval] The canvas returns to the root view. The breadcrumb shows only the root crumb. The GUI node is briefly highlighted.

[end] The navigation stack is now at root. No cleanup needed.

### Group 3: Breadcrumb crumb click jumps directly to any ancestor

[init] The navigation stack has four entries: root, GUI, Canvas, Module Node. The canvas shows Module Node's submodules (or an empty canvas if it has none).

[action] Click the "GUI" crumb in the breadcrumb trail (not back, but a direct crumb click).
[eval] The canvas jumps directly to GUI's canvas. The breadcrumb truncates to show only root and GUI. The navigation stack now has exactly two entries.

[action] Click the root crumb.
[eval] The canvas returns to the root view. The breadcrumb shows only the root crumb.

[end] Navigation stack is at root. No cleanup needed.

### Group 4: Command palette jump navigation

[init] The GUI is open at the root canvas. The .archui/index.yaml contains entries for all modules in the project.

[action] Press Cmd+K (or Ctrl+K) to open the command palette.
[eval] The command palette opens with a search input field.

[action] Type a partial name of a deeply nested module.
[eval] The command palette shows fuzzy-matched results from all modules in the index, updating in real time as characters are typed.

[action] Select a result for a module nested three levels deep.
[eval] The command palette closes. The navigation stack is set to the path from root to the target module's parent. The canvas renders the parent module's canvas with the target node highlighted.

[end] Return to root by clicking the root crumb. Close the command palette if it remains open.

### Group 5: Session persistence across reload

[init] The user has navigated to a module three levels deep (e.g., root > GUI > Canvas). The navigation stack has three entries. The current canvas is showing Canvas's submodules.

[action] Reload the GUI application (or browser page).
[eval] After reload, the GUI restores the last active canvas: Canvas's submodules are displayed. The breadcrumb shows root, GUI, and Canvas.

[action] Clear session storage (or use a fresh private/incognito session) and reload the GUI.
[eval] The GUI opens at the root canvas with only the root crumb in the breadcrumb, since there is no persisted session state.

[end] No filesystem changes were made. Session storage can be left cleared or restored.
