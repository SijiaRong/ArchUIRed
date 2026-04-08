---
name: Agent Verification Test Playbook
description: "Playbook for verifying that agents correctly follow the self-check protocol, trigger peer verification when required, and author test fixtures according to the rules."
---

## Overview

This playbook verifies that the agent verification protocol is followed correctly: the self-check sequence, escalation to peer verification for high-risk changes, and correct fixture authoring practices.

---

## Playbook

### Group 1: Self-check protocol

[init] An agent has just modified an ArchUI module's README.md to add a new link. The modified file has not yet been committed. archui validate has not been run yet.

[action] The agent runs archui validate.
[eval] The command exits with code 0, indicating no violations. The agent proceeds to commit without any further steps.

[action] Simulate the agent introducing an index staleness error by adding a new module folder without updating index.yaml. The agent then runs archui validate.
[eval] archui validate exits with a non-zero code and prints an index staleness error (e.g., "index.yaml is stale"). The error is not a structural error, so the agent proceeds to Step 2.

[action] The agent runs archui index --fix, then re-runs archui validate.
[eval] archui index --fix rebuilds index.yaml. The subsequent archui validate exits with code 0. The agent now proceeds to commit.

[action] Simulate a structural error: the agent sets a required frontmatter field (description) to empty in a README.md. The agent runs archui validate.
[eval] archui validate exits with a non-zero code and prints a structural error (e.g., "Missing required field: description"). The agent does NOT run archui index --fix. Instead it fixes the underlying file and returns to Step 1.

[end] Revert all test mutations. Confirm archui validate passes cleanly.

---

### Group 2: Peer verification triggers

[init] An agent is preparing to commit a change. The change type is known in advance.

[action] The agent adds a new top-level module to the project.
[eval] The orchestration layer is configured to recommend peer verification for this change type. Agent B is dispatched to independently run archui validate and review the diff for semantic correctness.

[action] The agent modifies core/filesystem-rules or makes a schema change adding a new required frontmatter field.
[eval] Peer verification is required (not just recommended). Agent B reviews the diff, checks that all new UUIDs are unique, verifies that submodules lists match folder structure, and confirms no description field is factually wrong or a link relation is logically backwards.

[action] The agent makes a routine description update to an existing module's README.md.
[eval] Peer verification is not required. The agent completes the self-check protocol alone and commits.

[end] All scenarios resolve with a clean archui validate and an appropriate commit message summarising the changes.

---

### Group 3: Fixture authoring

[init] A new integration test case is needed for a scenario not covered by any existing fixture. The agent is tasked with creating it.

[action] The agent creates a new fixture under core/testing-qa/resources/fixtures/ with a descriptive lowercase-hyphenated name. The fixture contains the minimum number of modules needed to exercise the target scenario.
[eval] The fixture is self-contained: it has its own index.yaml that matches its module tree. The fixture root README.md has a description field explaining what property of the ArchUI contract the fixture exercises.

[action] The agent registers the new fixture by adding it to the fixture inventory table in core/testing-qa/integration-tests/README.md, along with the new test case it supports.
[eval] The fixture inventory table in integration-tests/README.md now includes the new fixture entry. The new test case is listed in the canonical case list.

[action] A test case that requires filesystem mutation (adding or removing a module) is run against the fixture.
[eval] The test copies the fixture to a temporary directory before making any mutations. The canonical fixture files under resources/fixtures/ remain unmodified after the test completes.

[end] Run archui validate on the canonical fixture. Confirm it passes. The temporary mutation copy is discarded.
