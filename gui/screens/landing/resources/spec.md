# Landing Screen Spec

## Layout Measurements

```
┌─────────────────────────────────────────────┐  ← full viewport
│                                             │
│              (spacer: ~20vh)                │
│                                             │
│         ┌───────────────────────┐           │  wordmark centered
│         │       ArchUI          │           │  font: 36px, weight 700
│         └───────────────────────┘           │
│                                             │
│  Recent Projects (section heading: 14px)    │
│  ┌──────────────┐  ┌──────────────┐         │  project cards: 2-column grid
│  │ project-name │  │ project-name │         │  card: 200px × 80px
│  │ ~/path/to/…  │  │ ~/path/to/…  │         │
│  └──────────────┘  └──────────────┘         │
│  (max 4 recent projects shown)              │
│                                             │
│  [ Open Folder… ]     [ New Project ]       │  action buttons: 40px tall
│                                             │
└─────────────────────────────────────────────┘
```

## Spacing Constants

```
wordmark margin-bottom:    40px
section-heading margin-top: 32px
section-heading margin-bottom: 16px
project-card-grid gap:     16px
project-card-grid margin-bottom: 32px
action-buttons gap:        12px
```

## Project Card

```
width: 200px
height: 80px
padding: 12px
border-radius: 8px
border: 1px solid token(border-neutral)
background: token(surface-default)
box-shadow: 0 1px 2px rgba(0,0,0,0.06)

project-name: 13px, weight 500, token(text-primary), truncate 1 line
project-path: 11px, weight 400, token(text-secondary), truncate 1 line
```

Hover: border-color → token(accent-primary), box-shadow elevated.
Click: triggers project load → transition to canvas/idle.

## Action Buttons

```
[ Open Folder… ]  — primary style: token(accent-primary) background, white text
[ New Project ]   — secondary style: token(surface-default) background, token(accent-primary) text, border
```

Both buttons: 40px height, 16px horizontal padding, 6px border-radius.

## Empty State (No Recent Projects)

If no recent projects exist, the Recent Projects section is replaced with a centered hint:
```
Open a folder or create a new project to get started.
```
Font: 13px, token(text-tertiary), italic.

## Loading State

When a project is being loaded (after card click or folder picker confirm):
- Show spinner centered on the clicked card or action button.
- Disable all interactions.
- Transition to canvas/idle once the module graph is ready.
- On error (invalid ArchUI project): show inline error below the action area.
