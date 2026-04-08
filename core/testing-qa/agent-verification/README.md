---
name: Agent Verification
description: "Defines the protocol LLM agents must follow to validate their own ArchUI filesystem changes before committing, including self-check steps, peer verification, and fixture authoring rules."
---

## Overview

LLM agents that write or modify ArchUI files are treated as first-class contributors and are subject to the same correctness requirements as human engineers. This module defines the protocol agents must follow after making any change to the ArchUI filesystem, the conditions under which a second agent should review the work, and the rules for authoring test fixtures.

The protocol is designed to be mechanical and repeatable. An agent that follows it exactly will either produce a valid result or surface a clear, actionable error — it will not silently commit a broken state.

## Self-Check Protocol

Every agent that modifies the ArchUI filesystem must execute the following steps before committing or reporting the task as complete. The steps are sequential; do not skip ahead.

**Step 1 — Run `archui validate`**

```
archui validate
```

- If exit code is 0: the filesystem is valid. Proceed to commit.
- If exit code is non-zero: read the error output carefully. Errors fall into two categories:
  - *Index staleness errors* (e.g., "index.yaml is out of date", "UUID not found in index"): these are fixable with `archui index --fix`. Proceed to Step 2.
  - *Structural errors* (e.g., missing required frontmatter fields, duplicate UUIDs, broken links): these indicate a content problem. Fix the underlying file(s) before continuing. Return to Step 1 after fixing.

**Step 2 — Run `archui index --fix` (only if Step 1 reported index staleness)**

```
archui index --fix
```

This command rebuilds `index.yaml` by walking the current module tree. It resolves staleness errors caused by added, removed, or renamed modules. It does not fix structural errors.

After running this command, do not assume the filesystem is valid — always proceed to Step 3.

**Step 3 — Re-run `archui validate`**

```
archui validate
```

- If exit code is 0: the filesystem is now valid. Proceed to commit.
- If exit code is non-zero: the remaining errors are structural and were not resolved by index rebuild. Read the error output, fix the underlying issue, and return to Step 1.

**Step 4 — Commit**

Only commit once Step 3 produces a clean validate run. The commit message should summarise the ArchUI changes made (e.g., "add testing-qa module and submodules", "rename core/foo to core/bar, update index").

### Protocol Flowchart

```
modify ArchUI files
       │
       ▼
archui validate
       │
   ┌───┴───┐
exit 0   non-zero
   │         │
commit    index-only errors?
            │         │
           yes        no
            │         │
     archui index   fix structural
        --fix        errors in files
            │         │
            └────┬────┘
                 ▼
          archui validate
                 │
             ┌───┴───┐
          exit 0   non-zero
             │         │
          commit    fix & restart
```

## Peer Verification

For changes that are larger in scope or higher in risk, a second agent pass is recommended. Human engineers should configure the orchestration layer to trigger peer verification for the following categories:

| Change type | Peer verification |
|---|---|
| Adding a new top-level module | Recommended |
| Modifying `core/filesystem-rules` | Required |
| Schema changes (new frontmatter fields, changed field semantics) | Required |
| Renaming more than one module in a single commit | Recommended |
| Routine content edits (description updates, link additions) | Not required |

**Peer verification procedure:**

1. Agent A makes the changes and completes the self-check protocol (clean validate).
2. Agent B is given the git diff (not the final state alone — the diff).
3. Agent B runs `archui validate` independently against the modified tree.
4. Agent B reviews the diff for logical consistency:
   - Are all new UUIDs unique and correctly formatted?
   - Are all new links bidirectionally sensible (if A depends-on B, does B's description acknowledge A)?
   - Are `submodules` lists in parent READMEs consistent with the actual folder structure?
   - Does the `description` field in each modified README remain a single, accurate sentence?
5. Agent B reports any issues found. If none, the change is approved and can be merged.

Agent B must not simply re-run the same sequence of edits — its value is in catching semantic errors that `archui validate` cannot detect (e.g., a description that is factually wrong, a link relation that is logically backwards).

## Authoring Test Fixtures

Agents that generate new integration test fixtures must follow these rules:

**Location:** all fixtures are placed under `core/testing-qa/resources/fixtures/<fixture-name>/`. The fixture name should be a lowercase-hyphenated descriptor of what the fixture exercises (e.g., `valid-module`, `broken-link`, `multi-level-tree`).

**Minimality:** a fixture must be the smallest ArchUI project tree that exercises the target scenario. Do not add extra modules, links, or fields that are not needed to demonstrate the case. Minimal fixtures are easier to understand and faster to run.

**Self-contained:** a fixture must be a complete, internally consistent ArchUI project. It must have an `index.yaml` that matches its module tree (unless the fixture is specifically testing a stale-index scenario, in which case the stale state must be intentional and documented in the fixture's own README.md).

**Documented intent:** every fixture root must contain a `README.md` with a `description` field explaining what property of the ArchUI contract the fixture exercises. This description is used by agents and engineers to quickly understand whether a fixture is appropriate for a new test case.

**Do not mutate canonical fixtures:** test cases that require filesystem mutations (cases 6 and 7 in the integration test spec) must copy the fixture to a temporary directory. The canonical fixture files under `resources/fixtures/` are read-only references.

**Fixture registration:** after creating a new fixture, add it to the fixture inventory table in `core/testing-qa/integration-tests/README.md`. If the fixture supports a new test case, add that case to the canonical case list as well.

## Regression Baseline

The integration test specification in `core/testing-qa/integration-tests` is the regression baseline for the ArchUI filesystem contract. The baseline is updated whenever a new rule is added to `core/filesystem-rules`.

**Rule for agents:** any time you add a new rule to `core/filesystem-rules`, you must, in the same commit or an immediately following commit:

1. Add a new test case to `core/testing-qa/integration-tests/README.md` that verifies the new rule.
2. Create any fixture(s) needed by the new test case.
3. Add the new fixture(s) to the fixture inventory table in `core/testing-qa/integration-tests/README.md`.
4. Run `archui validate` and confirm a clean result before committing.

Failing to update the regression baseline when adding a new rule is a process violation. The goal is that the integration test specification is always a complete, accurate reflection of the filesystem rules — never lagging behind.

## Common Errors and Resolutions

| Error message (from `archui validate`) | Meaning | Resolution |
|---|---|---|
| `UUID not found in index: <uuid>` | A link references a UUID that is not in `index.yaml` | Run `archui index --fix`; if UUID still missing, the target module may not exist — fix the link or create the module |
| `Duplicate UUID: <uuid>` | Two modules have the same UUID | One UUID must be changed; use `archui uuid` to generate a fresh unique UUID |
| `Missing required field: <field>` | A README.md frontmatter is missing `uuid`, `name`, or `description` | Add the missing field to the frontmatter |
| `Submodules list mismatch` | The `submodules` field in a README does not match the actual subfolders | Update the `submodules` list to exactly match the existing module subfolders, in alphabetical order |
| `index.yaml is stale` | Modules exist on disk that are not reflected in `index.yaml` | Run `archui index --fix` |
| `Non-module folder detected` | A subfolder that is not a module and not `resources/` was found | Either add a `README.md` to make it a module, rename it to `resources/`, or remove it |
