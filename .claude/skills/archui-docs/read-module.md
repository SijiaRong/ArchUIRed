# Reading ArchUI Modules

Efficient reading strategies for single modules and large module trees.

## Reading a Single Module (always)

Every module context requires exactly two files:

1. **The identity document** — `SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, or `README.md`
2. **`.archui/index.yaml`** in the same directory

Never act on a module after reading only one of these files.

| File | Provides |
|---|---|
| Identity document | name, description, body prose |
| `.archui/index.yaml` | uuid, submodules map, links list |

## Reading a Module Tree

When you need to understand multiple modules (e.g., exploring a feature area), use progressive reading to avoid loading unnecessary context.

### Step 1 — Scan descriptions only

Read only the frontmatter (first ~5 lines) of each identity document, plus each `.archui/index.yaml`.

```
For each module in the tree:
  → Read first 5 lines of identity doc  (name + description)
  → Read .archui/index.yaml             (uuid + structure)
```

This gives you a complete map of the tree with minimal context cost.

### Step 2 — Select relevant modules

From the descriptions, identify the 2–3 modules most relevant to your task.

### Step 3 — Read selected modules fully

Only now load the full body of the modules you selected.

## Context Cost Reference

| What you need | What to read | Context cost |
|---|---|---|
| Module inventory | `description` fields only | ~1 line per module |
| Structure map | `description` + `index.yaml` | ~5 lines per module |
| Specific module detail | Full identity doc + index.yaml | ~50–300 lines |
| Cross-module relationships | `links` from all index.yaml files | ~3 lines per link |

**Never read all identity documents fully at once.** Start narrow, expand as needed.

## Navigating Links

When you encounter a link in `.archui/index.yaml`:

1. Note the target UUID and `relation` type
2. Find the target module: search for that UUID across all `index.yaml` files
   ```bash
   grep -r "<uuid>" . --include="*.yaml"
   ```
3. Read the target's `description` first — decide if you need the full document
4. Only load the full document if it is directly relevant to your task

## Reading HARNESS and MEMORY

| Submodule | Read when |
|---|---|
| HARNESS | Verifying an implementation; writing new tests; understanding expected behaviors |
| MEMORY | Debugging recurring bugs; revisiting an old module; avoiding past mistakes |

Both follow the same two-file rule: identity document + `index.yaml`.
