---
name: "Landing Screen Test Playbook"
description: "Playbook for verifying the behaviour and constraints defined in the Landing Screen module."
---

## Overview

This playbook verifies the behaviour and structural constraints defined in the Landing Screen module. Each group targets one distinct concern; steps within a group are sequential.

---

## Group 1 — Recent Projects List Renders Correctly

**Precondition:** Preferences contain 3 recent project entries with distinct names, absolute paths, and `lastOpened` timestamps (set to 2 hours ago, 2 days ago, and 3 weeks ago respectively). All three project folders exist on disk.

**Steps:**

1. Mount the landing screen.
2. Assert: the "Recent Projects" section heading is visible.
3. Assert: exactly 3 project cards are rendered in the grid (2-column layout: row 1 has 2 cards, row 2 has 1 card).
4. For each card, assert:
   - Project name matches the `name` field from the stored entry, truncated to 1 line.
   - Project path matches the `path` field from the stored entry, truncated to 1 line.
   - Timestamp is rendered in relative format — "2 hours ago", "2 days ago", "3 weeks ago" respectively.
5. Assert: cards are ordered most-recent-first (2 hours → 2 days → 3 weeks).
6. Assert: the empty-state hint is not visible.
7. Assert: "Open Folder…" and "New Project" buttons are visible and enabled.

---

## Group 2 — Clicking a Recent Project Loads It and Navigates to Canvas

**Precondition:** Preferences contain 1 recent project entry pointing to a valid ArchUI project root (has `.archui/index.yaml` at root). The project folder exists on disk.

**Steps:**

1. Mount the landing screen.
2. Click the project card.
3. Assert: a loading spinner appears on the clicked card.
4. Assert: all other interactive elements (other cards, "Open Folder…", "New Project") are disabled.
5. Wait for the load to complete.
6. Assert: the app transitions to `canvas/idle`.
7. Assert: the active project in the application state matches the loaded project's root UUID.
8. Assert: the `lastOpened` timestamp for this entry has been updated to the current time in the persisted recents list.
9. Assert: the entry is now at position 1 in the recents list.

---

## Group 3 — Empty State Renders When No Recent Projects Exist

**Precondition:** Preferences contain an empty recent projects list (or no recents key at all).

**Steps:**

1. Mount the landing screen.
2. Assert: the "Recent Projects" section heading is not visible.
3. Assert: no project cards are rendered.
4. Assert: the empty-state hint is visible with text "Open a folder or create a new project to get started."
5. Assert: the hint text is rendered in italic at 13px with `color/text/tertiary`.
6. Assert: "Open Folder…" and "New Project" buttons are visible and enabled.
7. Assert: no error messages are shown.

---

## Group 4 — Create New Project (FSA Mode)

**Precondition:** Running in FSA mode. The recent projects list is empty. A writable empty directory is available in the test environment.

**Steps:**

1. Mount the landing screen.
2. Click "New Project".
3. Assert: the folder picker is invoked (`window.showDirectoryPicker` is called with `mode: 'readwrite'`).
4. Simulate the user selecting the empty test directory.
5. Assert: a loading spinner appears on the "New Project" button.
6. Assert: all other interactive elements are disabled.
7. Wait for scaffolding to complete.
8. Assert: the selected directory now contains `.archui/index.yaml` and `README.md`.
9. Assert: `.archui/index.yaml` contains a valid UUID v4, `submodules: {}`, and `links: []`.
10. Assert: `README.md` frontmatter contains a `name` (derived from the folder basename) and an empty `description`.
11. Assert: the new project is added to the recents list at position 1.
12. Assert: the app transitions to `canvas/idle` with the new project active.

---

## Group 5 — Stale Project Shows Warning and Is Removable from Recents

**Precondition:** Preferences contain 2 recent project entries. Entry A points to a valid project that exists on disk. Entry B points to a path that no longer exists on disk (stale).

**Steps:**

1. Mount the landing screen.
2. Assert: Entry A's card is rendered at full opacity with no warning badge.
3. Assert: Entry B's card is rendered at 0.5 opacity with a `⚠ missing` badge adjacent to the path.
4. Assert: Entry B's `✕` dismiss button is visible without requiring hover.
5. Click Entry B's card.
6. Assert: no project load is attempted.
7. Assert: an inline alert appears on the card with text "This project folder no longer exists. Remove it from recents?" and "Remove" and "Keep" action buttons.
8. Click "Remove".
9. Assert: Entry B's card is removed from the grid (with a fade-out transition).
10. Assert: the persisted recents list no longer contains Entry B's path.
11. Assert: Entry A's card is still visible and unaffected.
12. Mount the landing screen fresh and assert Entry B does not reappear.
