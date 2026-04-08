---
name: Prerequisite Check
description: "Defines the three checks that must pass before import can proceed: write permission, git repository presence, and clean working tree — with the specific error or warning to surface for each failure."
---

## Overview

Before any conversion can begin, three conditions must be verified in order. Each failure surfaces a specific, actionable message to the user. Checks 1 and 2 are hard stops — the user cannot proceed until they are resolved. Check 3 is shown only after the user confirms they want to convert.

## Check 1 — Write Permission

**When:** immediately on folder open, before showing any conversion dialog.

**How to verify:** attempt to write and immediately delete a small sentinel file at the project root (e.g. `.archui-write-test`). If the write fails, permission is denied.

**On failure:** show an error dialog:
> "ArchUI cannot convert this folder — write access is required. Check folder permissions and try again."

Do not offer a "Convert" button if this check fails.

## Check 2 — Git Repository

**When:** immediately on folder open, alongside Check 1.

**How to verify:** check for the presence of a `.git` directory at the project root.

**On failure:** show an error dialog:
> "ArchUI cannot convert this folder — a git repository is required. Run `git init` and make an initial commit first."

**Why git is required:** the conversion creates a new git commit. Without git, there is no safety net. The original state must be committed before conversion begins so it can always be recovered with `git reset`.

## Check 3 — Clean Working Tree

**When:** after the user clicks "Convert" in the confirmation dialog.

**How to verify:** run `git status --porcelain`. If the output is non-empty, there are uncommitted changes.

**On failure:** show a warning dialog (not an error — it is recoverable):
> "There are uncommitted changes in this project. Please commit or stash them before converting. This ensures the original state is preserved in git history."

This check is a warning, not a hard block — but the conversion must not proceed until the working tree is clean.

## Check ordering rationale

Checks 1 and 2 are shown before confirmation to avoid wasting the user's time clicking "Convert" only to hit a hard stop. Check 3 is shown after confirmation because running `git status` before the user has expressed intent is unnecessary work.
