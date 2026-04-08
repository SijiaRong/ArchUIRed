---
name: Integration Tests
description: "Specifies the seven canonical ArchUI filesystem operation test cases that every platform must implement, using shared fixtures stored in core/testing-qa/resources/fixtures/."
---

## Overview

This module is a platform-agnostic specification of integration tests for the ArchUI filesystem contract. It defines *what* must be tested and *how* to verify correctness. Each platform implements these cases in its native test framework (XCTest, JUnit/Kotest, Vitest) using the shared fixtures in `core/testing-qa/resources/fixtures/`.

A platform's integration test suite is considered complete when all seven cases below pass and use the canonical fixtures. Ad-hoc or platform-local fixtures are not acceptable for these cases — shared fixtures guarantee that all platforms are testing the same contract.

## Canonical Test Cases

### Case 1 — Parse valid frontmatter

**Operation:** parse a README.md with fully-populated valid frontmatter.

**Input fixture:** `fixtures/valid-module/README.md` — a README with all five frontmatter fields populated (`uuid`, `name`, `description`, `submodules`, `links`).

**Steps:**
1. Read the fixture file.
2. Pass the raw string to the platform's frontmatter parser.
3. Assert the returned data structure.

**Expected output:**
- `uuid` equals the exact string in the fixture (8 lowercase hex characters).
- `name` equals the fixture value, with no leading/trailing whitespace.
- `description` equals the fixture value as a single string (newlines collapsed if multi-line YAML folded scalar).
- `submodules` is a list of strings matching the fixture entries, in order.
- `links` is a list of objects; each object has `uuid` (string), and optionally `relation` (string) and `description` (string). Fields absent in YAML must be absent (not `null`) in the parsed structure.

**Must not:** throw an exception, return partial data, or silently drop fields.

---

### Case 2 — Parse frontmatter with missing required fields

**Operation:** parse a README.md that is missing one or more required frontmatter fields.

**Input fixture:** `fixtures/invalid-missing-fields/README.md` — a README where `uuid` is present but `name` and `description` are absent.

**Steps:**
1. Read the fixture file.
2. Pass the raw string to the platform's frontmatter parser.
3. Capture the result or thrown error.

**Expected output:** the parser raises a structured error (exception, `Result.failure`, rejected Promise, etc.) that:
- Identifies the module path or filename.
- Names the missing fields (`name`, `description`).
- Does not return a partial parsed object as if the parse succeeded.

**Must not:** silently succeed with `null` values for missing required fields.

---

### Case 3 — Walk a module tree

**Operation:** recursively discover all submodules in an ArchUI project tree.

**Input fixture:** `fixtures/multi-level-tree/` — a fixture project with three levels of nesting (root → two submodules → one nested submodule each).

**Steps:**
1. Point the tree-walker at the fixture root.
2. Collect all discovered module paths.
3. Assert path list and order.

**Expected output:**
- All six module paths are returned (root + 2 level-1 + 2 level-2 + any leaf modules as defined in the fixture).
- Paths are returned in depth-first order (parent before children).
- Non-module folders (i.e., `resources/`) are not included in the result.
- The `resources/` directory is traversed for fixture purposes but not yielded as a module.

**Must not:** include `resources/` subfolders, skip any valid module, or return modules in breadth-first order when depth-first is specified.

---

### Case 4 — Resolve a UUID link via index.yaml

**Operation:** given a UUID, look it up in `index.yaml` and return the corresponding module path.

**Input fixture:** `fixtures/valid-module/` — the fixture's `index.yaml` maps the module's UUID to its path.

**Steps:**
1. Load `index.yaml` from the fixture root.
2. Call the UUID resolver with a UUID known to be in the index.
3. Assert the returned path.

**Expected output:**
- The resolver returns the path string exactly as recorded in `index.yaml`.
- The path is relative to the project root (not an absolute filesystem path).

**Must not:** return an absolute path, perform filesystem I/O beyond reading `index.yaml`, or silently return `null` when a UUID is present.

---

### Case 5 — Detect a broken link

**Operation:** detect a link whose target UUID is absent from `index.yaml`.

**Input fixture:** `fixtures/broken-link/` — a project where one module references a UUID that is not present in `index.yaml`.

**Steps:**
1. Run `archui validate` against the fixture directory (or call the equivalent validation function directly).
2. Capture the validation result.

**Expected output:**
- Validation reports a non-zero exit code (or equivalent error state).
- The error message identifies the source module path and the unresolved UUID.
- No other validation errors are reported (the fixture is valid in all respects except the one broken link).

**Must not:** silently pass, report the wrong source module, or report additional spurious errors.

---

### Case 6 — Add a new module and verify index update

**Operation:** create a new module folder and README.md, then verify that `index.yaml` is updated.

**Input fixture:** `fixtures/valid-module/` — used as a starting state (copy to a temp directory before mutating).

**Steps:**
1. Copy the fixture to a temporary directory.
2. Create a new subfolder `new-submodule/` with a valid `README.md` (UUID `aabbccdd`, name "New Submodule", description "A test module.").
3. Run `archui index --fix` (or the equivalent index-update function).
4. Read the updated `index.yaml`.
5. Run `archui validate`.

**Expected output:**
- `index.yaml` contains an entry mapping `aabbccdd` to `new-submodule/`.
- `archui validate` exits with code 0.
- No existing entries in `index.yaml` are modified.

**Must not:** overwrite existing index entries, leave the index stale, or create duplicate UUID entries.

---

### Case 7 — Rename a module folder and verify link stability

**Operation:** rename a module's folder and confirm that UUID-based links remain valid after index update.

**Input fixture:** `fixtures/multi-level-tree/` — used as a starting state (copy to a temp directory).

**Steps:**
1. Copy the fixture to a temporary directory.
2. Rename one of the level-1 module folders (e.g., `module-a/` → `module-alpha/`).
3. Run `archui index --fix`.
4. Run `archui validate`.
5. Resolve the renamed module's UUID via the updated `index.yaml`.

**Expected output:**
- `index.yaml` maps the module's original UUID to the new path (`module-alpha/`).
- `archui validate` exits with code 0 — all links that referenced the module's UUID continue to resolve.
- No links in other modules need to be updated (UUIDs are stable across renames).

**Must not:** report broken links after a rename-and-reindex, modify any UUID, or leave stale old-path entries in `index.yaml`.

---

## Fixture Inventory

| Fixture | Used by cases | Description |
|---|---|---|
| `fixtures/valid-module/` | 1, 4, 6 | A single module with all frontmatter fields populated and a correct index.yaml |
| `fixtures/invalid-missing-fields/` | 2 | A module README missing `name` and `description` |
| `fixtures/multi-level-tree/` | 3, 7 | A three-level module hierarchy with correct index.yaml |
| `fixtures/broken-link/` | 5 | A project where one module references a non-existent UUID |

Fixtures are read-only. Tests that mutate the filesystem (cases 6, 7) must copy the relevant fixture to a temporary directory before making any changes.

## Adding New Test Cases

When a new ArchUI filesystem rule is added to `core/filesystem-rules`, a corresponding integration test case must be added to this specification. The test case must:

1. Be assigned a case number continuing the sequence.
2. Reference or create a fixture in `core/testing-qa/resources/fixtures/`.
3. Specify exact inputs, steps, expected outputs, and "must not" conditions.
4. Be implemented on all platforms before the rule change is considered complete.
