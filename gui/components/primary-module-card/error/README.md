---
name: Primary Module Card — Error State
description: "The visual state of a primary module card when the module's README.md is missing or its frontmatter is unparseable; a red border and inline error message replace the normal body content."
---

## Overview

The error state is applied when a module folder exists but its README.md is missing, its frontmatter is unparseable, or the `uuid` field is absent. The node still renders so the user can see and fix the problem in-app. A red border (`status/error`), a warning icon replacing the status dot, and a short error message in the body zone replace the normal card appearance.

Visual specification with annotated diagram and trigger conditions are in `resources/visual-spec.md`.
