---
name: Test Pyramid Test Playbook
description: "Playbook for verifying that each level of the ArchUI test pyramid — unit, integration, end-to-end, and CLI validation gate — meets its coverage targets and ownership requirements."
---

## Overview

This playbook verifies that all four levels of the ArchUI test pyramid are correctly implemented: unit tests cover at least 80% of business logic, integration tests cover all seven canonical operations, E2E tests cover the five primary user flows, and `archui validate` is the mandatory CI gate.

---

## Playbook

### Group 1: Unit test coverage requirement

[init] A platform (e.g., iOS) has a unit test suite covering frontmatter parsing, UUID generation, link validation logic, and index diffing.

[action] Remove unit tests for the UUID generation function. Run the coverage report.
[eval] The coverage report shows business logic coverage below 80%. The CI pipeline for the platform fails the coverage gate.

[action] Restore the UUID generation unit tests. Run the coverage report.
[eval] Coverage is at or above 80% for business logic. The CI pipeline passes the coverage gate.

[action] Add a new parsing edge case to the platform codebase (e.g., a README with a YAML folded scalar in the `description` field) without adding a corresponding unit test. Run the coverage report.
[eval] Coverage may drop below 80% depending on the total denominator. If it drops below, the CI pipeline fails the coverage gate until the test is added.

[end] Ensure all unit tests are present and coverage is above 80%. Confirm the platform's CI pipeline passes.

---

### Group 2: Integration test completeness

[init] A platform's integration test suite is set up and references shared fixtures from `core/testing-qa/resources/fixtures/`.

[action] Remove the test case for Case 5 (broken link detection) from the platform's integration test suite. Run the suite.
[eval] The suite reports fewer test cases than the required seven canonical operations. A CI check or review process flags that Case 5 is missing — no platform may leave a canonical operation untested.

[action] Restore the Case 5 test using the shared `fixtures/broken-link/` fixture. Run the suite.
[eval] All seven canonical test cases pass. The integration suite is complete.

[action] Replace the shared `fixtures/valid-module/` fixture reference with a locally-defined inline fixture for Case 1. Run the suite.
[eval] Case 1 passes locally but is now testing a different input than other platforms. A review flags the non-shared fixture as a process violation. The canonical fixtures must be used.

[end] Restore all seven test cases using canonical shared fixtures. Confirm the platform's integration test suite passes completely.

---

### Group 3: E2E coverage of the five primary user flows

[init] A platform's E2E test suite exists. All five primary user flows have corresponding E2E tests.

[action] Remove the E2E test for Flow 4 (add new module via the UI). Run the E2E suite.
[eval] The suite reports only four flows covered. A review or CI check flags that all five primary user flows must have E2E tests.

[action] Re-add the E2E test for Flow 4. Confirm it creates the folder and README.md on disk and that `archui validate` passes within the test.
[eval] The E2E suite reports all five flows passing.

[action] Run Flow 5 (detect broken link via the UI) in the E2E suite. The test adds a link to a non-existent UUID.
[eval] The UI surfaces a validation error before writing the file to disk. `archui validate` is not needed because the invalid state was never persisted. The E2E test passes.

[end] Confirm all five E2E flows pass. Confirm the platform's CI pipeline completes without errors.

---

### Group 4: CLI validate as the universal CI gate

[init] A platform CI pipeline is configured with `archui validate` as the first step, followed by unit tests, integration tests, and E2E tests.

[action] Introduce a structural error into the ArchUI project (e.g., a module missing its `uuid` frontmatter field). Push to CI.
[eval] `archui validate` fails on the first CI step. The pipeline stops immediately. Unit, integration, and E2E tests do not run.

[action] Fix the structural error. Push again.
[eval] `archui validate` passes. All subsequent test levels execute and pass.

[end] Ensure the ArchUI project is structurally valid and the CI pipeline runs all four levels successfully.
