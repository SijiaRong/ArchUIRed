---
name: Import
description: "Defines the flow for importing a non-ArchUI project into ArchUI format: prerequisite checks, user confirmation, clean-state verification, and AI-driven conversion."
---

## Overview

When a user opens a folder that is not a valid ArchUI project, the Import flow activates. It guides the user through a series of checks and confirmations before invoking an AI agent to perform the actual structural conversion.

The Import flow never destroys original content. All existing files and directories are preserved under `resources/original/` inside the modules the AI creates. The goal is lossless conversion: the original project must be fully reconstructable from the ArchUI representation.

## Full Flow

```
User opens a non-ArchUI folder
        │
        ▼
[prerequisite-check]
  ├── Read/write permission?   ──No──▶  Error dialog: "No write access"
  ├── Git repo present?        ──No──▶  Error dialog: "No git repository found"
  └── All checks pass?         ──Yes──▶  Continue
        │
        ▼
Confirmation dialog
  "This folder is not an ArchUI project. Convert it?"
  [Convert]  [Cancel]
        │
        ▼
[prerequisite-check] — clean state
  └── Uncommitted changes?     ──Yes──▶  Warning dialog: "Please commit or stash your changes first"
        │
        ▼
[conversion] — AI agent executes
  ├── Analyze project structure
  ├── Propose module boundaries (module-splitter)
  ├── Create ArchUI folder structure
  └── Place original content in resources/original/
        │
        ▼
Reload project as valid ArchUI
```

## Design Principles

- **Non-destructive.** No original file is ever deleted or overwritten. Content is moved to `resources/original/`.
- **Reversible.** The converted ArchUI structure must be reversible back to the original project by copying `resources/original/` contents out.
- **AI-driven splitting.** Module boundaries are not determined by mechanical rules but by an AI agent reading the project's actual content and semantics.
- **Git-gated.** The flow refuses to proceed with uncommitted changes, ensuring the git history cleanly separates the original state from the ArchUI conversion.
