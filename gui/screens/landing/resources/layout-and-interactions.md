# Landing Screen — Layout and Interactions

## Full Screen Layout

The landing screen occupies the full viewport with no topbar, no breadcrumb, and no navigation chrome. It is the only screen that renders without the shared application shell.

```
┌─────────────────────────────────────────────────────────────┐  ← full viewport (100vw × 100vh)
│                                                             │
│                     (spacer: 20vh)                          │
│                                                             │
│              ┌────────────────────────────┐                 │
│              │          ArchUI            │                 │  ← wordmark / logotype
│              └────────────────────────────┘                 │     font: 36px, weight 700
│                                                             │     color: token(text-primary)
│                     (spacer: 40px)                          │     centered horizontally
│                                                             │
│  ─────────────────── Recent Projects ─────────────────────  │  ← section heading
│                                                             │     font: 14px, weight 500
│  ┌─────────────────────┐   ┌─────────────────────┐         │     color: token(text-secondary)
│  │  project-name       │   │  project-name       │         │  ← project card row 1
│  │  ~/path/to/…        │   │  ~/path/to/…        │         │     card: 200px × 80px
│  └─────────────────────┘   └─────────────────────┘         │
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐         │  ← project card row 2
│  │  project-name       │   │  project-name       │         │     (max 4 recent projects
│  │  ~/path/to/…        │   │  ~/path/to/…        │         │      shown in a 2-col grid)
│  └─────────────────────┘   └─────────────────────┘         │
│                                                             │
│                     (spacer: 32px)                          │
│                                                             │
│         [ Open Folder… ]       [ New Project ]              │  ← primary action buttons
│                                                             │     height: 40px
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Empty State (no recent projects)

When the recents list is empty, the project card grid is replaced with a centered hint message. The action buttons remain in place.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     (spacer: 20vh)                          │
│                                                             │
│              ┌────────────────────────────┐                 │
│              │          ArchUI            │                 │
│              └────────────────────────────┘                 │
│                                                             │
│        Open a folder or create a new project to             │  ← empty-state hint
│                      get started.                           │     font: 13px, italic
│                                                             │     color: token(text-tertiary)
│                                                             │
│         [ Open Folder… ]       [ New Project ]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Loading State (project being loaded)

While a project is loading (after a card click or after the file picker confirms), the screen enters a loading state:

```
┌─────────────────────────────────────────────────────────────┐
│              (all other elements dimmed/disabled)           │
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐         │
│  │  project-name       │   │  project-name       │         │
│  │  [  ◌ loading… ]    │   │  ~/path/to/…        │         │  ← spinner overlays
│  └─────────────────────┘   └─────────────────────┘         │     the clicked card
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- A spinner appears centered over the clicked card (or centered over the activated button for "Open Folder…" / "New Project").
- All interactive elements are disabled for the duration.
- On error, an inline error message appears below the action buttons.

---

## Spacing Constants

| Element | Property | Value |
|---|---|---|
| Wordmark | margin-top | 20vh |
| Wordmark | margin-bottom | 40px |
| Section heading | margin-top | 0 (immediately below wordmark spacer) |
| Section heading | margin-bottom | 16px |
| Project card grid | column gap | 16px |
| Project card grid | row gap | 16px |
| Project card grid | margin-bottom | 32px |
| Action buttons | gap | 12px |
| Action buttons | margin-bottom | 20vh |

---

## Project Card Anatomy

```
┌─────────────────────────────────────┐  ← 200px × 80px
│  project-name                    ✕  │  ← name: 13px, weight 500, token(text-primary)
│  ~/Documents/my-project             │  ← path: 11px, weight 400, token(text-secondary)
│  Opened 2 days ago                  │  ← timestamp: 11px, weight 400, token(text-tertiary)
└─────────────────────────────────────┘
```

- `✕` dismiss button appears on hover; clicking it removes the project from recents (no confirmation).
- Name truncates to 1 line with ellipsis.
- Path truncates to 1 line with ellipsis (prefer showing the trailing segment).
- Timestamp uses relative format ("just now", "2 days ago", "3 months ago").

### Stale Card (project no longer on disk)

```
┌─────────────────────────────────────┐
│  project-name                    ✕  │
│  ~/Documents/old-project  ⚠ missing │  ← path + warning badge
│  Opened 3 months ago                │
└─────────────────────────────────────┘
```

- The card is rendered with reduced opacity (0.5).
- A `⚠ missing` badge appears inline with the path.
- Clicking the card shows a non-blocking alert: "This project folder no longer exists. Remove it from recents?"
- The `✕` dismiss button is always visible (not hover-only) on stale cards.

---

## Action Buttons

| Button | Style | Width |
|---|---|---|
| Open Folder… | Primary: `token(accent-primary)` background, white text | auto (min 140px) |
| New Project | Secondary: `token(surface-default)` background, `token(accent-primary)` text, border | auto (min 140px) |

Both buttons: 40px height, 16px horizontal padding, 6px border-radius.

---

## Interaction Table

| User Action | Trigger Condition | Result |
|---|---|---|
| Click a recent project card | Card is valid (project exists on disk) | Begin loading; show spinner on card; on success, transition to canvas/idle |
| Click a recent project card | Card is stale (project missing from disk) | Show inline alert: "Folder no longer exists. Remove from recents?" with Confirm / Cancel |
| Click `✕` on a card | Any card, on hover | Remove project from recents list immediately; update persistent preferences |
| Click `✕` on a stale card | Stale card (always visible) | Remove project from recents list immediately |
| Click "Open Folder…" | Always enabled | Open native folder picker (FSA mode: `window.showDirectoryPicker()`; server mode: server presents directory input); on confirm, validate folder as ArchUI project root and load; on success, transition to canvas/idle |
| Click "New Project" | Always enabled | Open native folder picker to select an empty (or new) target folder; on confirm, scaffold a new ArchUI project at that path; on success, transition to canvas/idle |
| Project load succeeds | After any load path | Transition to canvas/idle with the loaded project set as the active project |
| Project load fails (invalid project) | Folder exists but is not a valid ArchUI root | Show inline error below action buttons: "Not a valid ArchUI project." Remain on landing screen |
| Project load fails (permission denied) | FSA API permission rejected | Show inline error: "Permission denied. Please grant folder access." |

---

## Visual Tokens

| Property | Token | Resolved value (light / dark) |
|---|---|---|
| Screen background | `color/surface/app` | `#F5F5F7` / `#141416` |
| Wordmark color | `color/text/primary` | `#0F0F10` / `#F2F2F3` |
| Section heading color | `color/text/secondary` | `#6B6B72` / `#9898A1` |
| Card background | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Card border (resting) | 1px solid `color/border/subtle` | `#E4E4E8` / `#2C2C33` |
| Card border (hover) | 1px solid `color/accent/primary` | varies by theme |
| Card shadow | `elevation/card/default` | 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06) |
| Card corner radius | `dimension/border-radius-card` | 8px |
| Project name color | `color/text/primary` | `#0F0F10` / `#F2F2F3` |
| Project path color | `color/text/secondary` | `#6B6B72` / `#9898A1` |
| Timestamp color | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Stale card opacity | — | 0.5 |
| Stale badge color | `color/status/warning` | `#F59E0B` |
| Primary button background | `color/accent/primary` | varies by theme |
| Primary button text | `color/text/on-accent` | `#FFFFFF` |
| Secondary button background | `color/surface/default` | `#FFFFFF` / `#1C1C1F` |
| Secondary button text | `color/accent/primary` | varies by theme |
| Secondary button border | 1px solid `color/accent/primary` | varies by theme |
| Empty state text color | `color/text/tertiary` | `#A0A0A8` / `#60606A` |
| Error text color | `color/status/error` | `#EF4444` |

---

## Figma Node

- **Page:** Canvas Layouts (in the ArchUI Design System Figma file, key `beEbYQhz9LBLHrAj2eGyft`)
- **Frame:** `Canvas Layouts / Landing`
