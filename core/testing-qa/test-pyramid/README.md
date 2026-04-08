---
name: Test Pyramid
description: "Defines the four-level ArchUI test pyramid — unit, integration, end-to-end, and CLI validation — with coverage targets and ownership assignments per platform."
---

## Overview

The ArchUI test pyramid has four levels. The bottom two levels (unit and integration) are the foundation: they are fast, deterministic, and must pass before any higher-level test is meaningful. The top level (E2E) validates user-facing behaviour. A fourth cross-cutting layer — CLI validation — applies to every level and every platform.

```
           ┌──────────────────────────┐
           │   End-to-End (per-plat)  │  ← 5 primary user flows
           ├──────────────────────────┤
           │ Integration (cross-plat) │  ← 7 ArchUI FS operations
           ├──────────────────────────┤
           │   Unit Tests (per-plat)  │  ← ≥ 80% business logic
           ├──────────────────────────┤
           │  archui validate (all)   │  ← CI gate on every platform
           └──────────────────────────┘
```

## Level 1 — Unit Tests (per-platform)

Unit tests exercise individual functions in isolation. Each platform owns and runs its own unit tests using its native framework (XCTest on iOS, JUnit/Kotest on Android, Vitest on web/Electron).

**What is unit-tested:**

- **Frontmatter parsing:** given a raw README.md string, the parser correctly extracts `uuid`, `name`, `description`, `submodules`, and `links`. Edge cases include missing optional fields, multi-line descriptions, and YAML with extra unknown keys.
- **UUID generation:** the UUID generator produces a lowercase 8-character hex string, never collides within a given run, and is reproducible when seeded.
- **Link validation logic:** given a set of UUID entries and a list of link targets, the validator correctly identifies broken references and reports the source module path.
- **Canvas rendering calculations:** layout algorithms (node positioning, edge routing, viewport clipping) are unit-tested against known inputs and expected pixel or coordinate outputs.
- **Index diffing:** the function that computes a diff between the current module tree and a stale `index.yaml` correctly identifies added, removed, and renamed modules.

**Coverage target:** unit tests must cover ≥ 80% of business logic (parsing, validation, index management, layout). UI glue code and platform API calls are excluded from the coverage denominator.

**Ownership:** each platform team owns and maintains its unit test suite. Regressions in unit tests block the platform's own CI pipeline.

## Level 2 — Integration Tests (shared specification, per-platform execution)

Integration tests verify that a platform correctly reads and writes ArchUI filesystem structures. The test *cases* are defined once in `core/testing-qa/integration-tests` and are platform-agnostic. Each platform implements them in its native framework.

**What is integration-tested:**

The seven canonical ArchUI filesystem operations. See `core/testing-qa/integration-tests` for the full specification, including exact inputs and expected outputs for each case.

**Fixtures:** all integration tests use fixtures from `core/testing-qa/resources/fixtures/`. Platforms must not use project-local test data for integration tests — using shared fixtures ensures that all platforms test against the same inputs.

**Coverage target:** integration tests must cover all seven canonical ArchUI filesystem operations. No operation may be untested on any platform.

## Level 3 — End-to-End Tests (per-platform)

E2E tests simulate a complete user session. They are the most expensive tests to write and run, so they are scoped to the five primary user flows that represent the core value of ArchUI.

**The five primary user flows:**

1. **Open project:** user opens an ArchUI project from disk; the canvas renders all modules and links without errors; the title bar shows the project name.
2. **Navigate to module:** user taps or clicks a module node; the detail panel opens and shows the module's name, description, and submodule list.
3. **Edit module description:** user edits the description field in the detail panel; on save, the README.md frontmatter on disk reflects the new value; `archui validate` passes.
4. **Add new module:** user creates a new module via the UI; the app generates a UUID, creates the folder and README.md, updates index.yaml; `archui validate` passes.
5. **Detect broken link:** user adds a link to a UUID that does not exist; the UI surfaces a validation error; the file on disk is not written until the error is resolved.

**Ownership:** each platform team owns its E2E suite. E2E tests run in CI on merge to `main` and on release candidate builds.

## Level 4 — CLI Validation (cross-cutting gate)

`archui validate` is not a "test level" in the traditional sense — it is a structural correctness check that runs as a prerequisite for merging any change on any platform. It validates:

- Every module folder contains a README.md with valid frontmatter.
- Every UUID in the project is unique.
- Every link target UUID exists in `index.yaml`.
- `index.yaml` is not stale (every module folder is represented).
- No `submodules` list contradicts the actual folder contents.

**CI integration:** `archui validate` is the first step of every CI pipeline. If it fails, no other tests run and the pipeline is immediately blocked. This prevents wasted CI time on structurally invalid projects.

**Agent integration:** agents run `archui validate` after every filesystem modification. See `core/testing-qa/agent-verification` for the full protocol.

## Coverage Summary

| Level | Scope | Target | Owner |
|---|---|---|---|
| Unit | Individual functions | ≥ 80% business logic | Per-platform team |
| Integration | ArchUI FS operations | All 7 operations | Per-platform team (shared spec) |
| E2E | User flows | 5 primary flows | Per-platform team |
| CLI validate | Structural correctness | 100% — blocks merge | All (CI gate) |
