# Landing Screen — Behavioral Spec

## Purpose

The landing screen is the entry point of the ArchUI application. It is shown on first launch and any time the application starts with no project loaded. Its sole responsibility is to get a project into memory so the app can transition to the canvas screen.

There is no internal state machine: the landing screen is a single, flat view. All navigational outcomes are transitions out to `canvas/idle`.

---

## Data Model

### Recent Projects List

The recent projects list is a persisted, ordered array of project entries stored in application preferences (not in any ArchUI module file). Each entry contains:

| Field | Type | Description |
|---|---|---|
| `name` | string | The project name read from the root module's identity document frontmatter (`name` field) at the time the project was last opened |
| `path` | string | Absolute filesystem path to the project root folder |
| `lastOpened` | ISO 8601 timestamp | Date and time the project was last opened |

The list is capped at **8 entries** (most-recently-used order). When a new project is opened, it is prepended and any entry beyond position 8 is dropped. Duplicate paths are deduplicated: if the same path is opened again, its existing entry moves to position 1 and its `lastOpened` is updated.

On screen mount, each entry is **probed** (see Stale Entry Detection below) and rendered in order, most recent first. Only the **4 most recent** entries are displayed in the grid; a "Show more" affordance may expand to all 8 (future extension).

---

## Adapter Modes

The landing screen has two runtime modes depending on the deployment adapter:

### FSA Mode (File System Access API — web and Electron renderer)

- Recent projects are stored in `localStorage` (key: `archui.recents`) as a JSON array.
- The project root path is stored as a serialized `FileSystemDirectoryHandle` in `IndexedDB` (key store: `archui-handles`). The path string is used for display only.
- "Open Folder…" calls `window.showDirectoryPicker({ mode: 'readwrite' })`.
- "New Project" calls `window.showDirectoryPicker({ mode: 'readwrite' })` on an empty or new folder, then scaffolds the project structure (see Scaffolding below).
- Stale entry detection: attempt to call `.queryPermission({ mode: 'readwrite' })` on the stored handle. If the handle is no longer valid or permission is denied, the entry is marked stale.

### Server Mode (Node.js / CLI-server backend)

- Recent projects are stored server-side in a preferences file (e.g., `~/.config/archui/recents.json`).
- The server provides the recents list via a REST endpoint (`GET /api/recents`).
- "Open Folder…" opens a server-side directory picker UI (a text input pre-filled with the last used directory, plus a browse affordance if the OS supports it).
- "New Project" presents the same directory picker, then POSTs to `POST /api/projects/create` with the chosen path.
- Stale entry detection: the server checks whether the path exists on disk when it returns the recents list.

---

## Behaviors

### On Mount

1. Read the recents list from the appropriate store (localStorage/IndexedDB in FSA mode; server API in server mode).
2. For each entry: probe validity (see Stale Entry Detection).
3. Render the grid of up to 4 cards (most recent first), or the empty-state hint if the list is empty.
4. Render the "Open Folder…" and "New Project" action buttons.

The mount is synchronous in server mode (list is returned in the API response) and asynchronous in FSA mode (IndexedDB read may take a render cycle). During the async read, show skeleton cards in place of real cards.

### Opening a Recent Project

1. User clicks a valid (non-stale) project card.
2. The card enters loading state: spinner appears, all interactions disabled.
3. In FSA mode: request `readwrite` permission on the stored handle (will show browser permission prompt if not already granted). On denial, show error and re-enable interactions.
4. Read the project root: parse `.archui/index.yaml` at the root. If absent or malformed, treat as invalid (show error).
5. Recursively load the module graph from the root (depth-first, following `submodules` maps).
6. On success: update the entry's `lastOpened` timestamp, move it to position 1, persist the updated recents list, then transition to `canvas/idle` with the loaded project.
7. On failure: show inline error below the action buttons. Re-enable interactions.

### Opening an Existing Project via "Open Folder…"

1. User clicks "Open Folder…".
2. The button enters loading state: spinner appears on the button, all interactions disabled.
3. Invoke the folder picker (adapter-specific, see Adapter Modes above).
4. If the user cancels: re-enable interactions, no error shown.
5. If the user confirms a folder: validate it as an ArchUI project root (must have `.archui/index.yaml` at the top level).
6. On valid: proceed with steps 5–6 from "Opening a Recent Project" above.
7. On invalid: show inline error: "Not a valid ArchUI project. The selected folder must contain a `.archui/index.yaml` file."

### Creating a New Project via "New Project"

1. User clicks "New Project".
2. The button enters loading state; all interactions disabled.
3. Invoke the folder picker. User selects a target folder (should be empty; a warning is shown if it is non-empty but the action is not blocked).
4. If the user cancels: re-enable interactions.
5. If the user confirms: scaffold the new project at the selected path (see Scaffolding below).
6. On success: add the new project to recents and transition to `canvas/idle`.
7. On scaffold failure (e.g., write permission denied): show inline error.

### Removing a Project from Recents

1. User hovers a project card; the `✕` dismiss button becomes visible.
2. User clicks `✕`.
3. Remove the entry from the recents list and persist.
4. Remove the card from the grid with a brief fade-out transition.
5. If the grid is now empty, show the empty-state hint.
6. No confirmation dialog is shown for a valid card.

### Stale Entry Detection

A stale entry is one whose project folder no longer exists at the recorded path (or whose FSA handle has become invalid).

- Stale entries are rendered at reduced opacity (0.5) with a `⚠ missing` badge.
- The `✕` dismiss button is always visible (not hover-only) on stale cards.
- Clicking a stale card does not attempt to load the project. Instead, it shows a non-blocking inline alert directly on the card: "This project folder no longer exists. Remove it from recents?" with "Remove" and "Keep" actions.
  - "Remove": same behavior as clicking `✕`.
  - "Keep": dismiss the alert, card remains stale.

---

## Scaffolding a New Project

When "New Project" is confirmed, the following minimal structure is written to the selected folder:

```
<selected-folder>/
├── .archui/
│   └── index.yaml       ← root module metadata (new UUID, empty submodules map, empty links)
└── README.md            ← frontmatter with name (defaults to folder name) and empty description
```

The root `index.yaml` is generated with:
- A freshly generated UUID (v4).
- `submodules: {}` (empty map).
- `links: []` (empty array).

The `README.md` is generated with:
- `name`: the selected folder's basename (with hyphens replaced by spaces, title-cased).
- `description`: empty string (user fills in later).

The scaffolded project is immediately valid according to the ArchUI filesystem rules.

---

## Transitions Out

| Outcome | Destination | Trigger |
|---|---|---|
| Project loaded successfully | `canvas/idle` | Any successful load path (recent card, Open Folder…, New Project) |

There are no other navigation targets from the landing screen. The back button / browser history does not navigate back to the landing screen once the canvas is active.

---

## Error States

All errors are shown as an inline error message below the action buttons unless otherwise specified. Errors auto-dismiss after 8 seconds or on any new user interaction.

| Error | Message |
|---|---|
| Loaded folder is not a valid ArchUI project | "Not a valid ArchUI project. The selected folder must contain a `.archui/index.yaml` file." |
| Module graph parse failure | "Failed to load project: `<error detail>`. Check the developer console for details." |
| FSA permission denied | "Permission denied. Please grant read/write access to the project folder." |
| New project scaffold write failure | "Could not create project: permission denied. Choose a folder you have write access to." |
| Network error (server mode only) | "Could not reach the ArchUI server. Is it running?" |

---

## Layout and Visual Tokens

See `resources/layout-and-interactions.md` for the full ASCII layout diagram, spacing constants, and visual token table.
