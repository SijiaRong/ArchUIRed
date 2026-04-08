---
name: "Testing & QA Test Playbook"
description: "Playbook for verifying that the ArchUI testing philosophy, cross-platform test gating, and agent self-check protocol are correctly observed in project development and CI."
---

## Overview

This playbook verifies that the core testing and QA conventions for ArchUI are properly observed: the `archui validate` CI gate is enforced on every platform, the cross-platform test philosophy is applied consistently, and agents follow the required self-check protocol after filesystem modifications.

---

## Playbook

### Group 1: archui validate as universal CI gate

[init] A valid ArchUI project is configured with CI pipelines for at least one platform. The pipeline is set up so that `archui validate` runs as the first step.

[action] Introduce a structural error into the project (e.g., create a module folder with no README.md). Push the change to CI.
[eval] The CI pipeline fails at the `archui validate` step before any other tests run. The failure message identifies the structural error.

[action] Fix the structural error (add a valid README.md to the orphaned folder). Push the corrected change.
[eval] `archui validate` passes and subsequent CI steps proceed normally.

[action] Remove `archui validate` from the CI pipeline's first step. Introduce a structural error and push.
[eval] Other tests may pass or fail unrelated to the structural issue, but the structural error goes undetected — demonstrating that `archui validate` as first gate is essential.

[end] Restore `archui validate` as the first CI step. Remove any introduced structural errors. Confirm `archui validate` passes.

---

### Group 2: One contract, many platform implementations

[init] An ArchUI project has two platform implementations (e.g., iOS and web), each with its own integration test suite. Both suites reference shared fixtures from `core/testing-qa/resources/fixtures/`.

[action] Modify the behavior of a filesystem rule (e.g., change how broken links are reported) on the iOS platform without updating the web platform.
[eval] The iOS integration tests pass under the new behavior. The web integration tests fail because the same fixture produces a different expected result. The divergence is detected and treated as a bug.

[action] Apply the equivalent change to the web platform's integration test suite.
[eval] Both platforms pass their integration tests against the same fixtures. The contract is again consistent across platforms.

[action] Replace a shared fixture in `core/testing-qa/resources/fixtures/` with a platform-local fixture in the iOS module. Run the integration tests.
[eval] The integration tests on iOS pass using the local fixture, but the platform is now testing a different input than the web platform — which is a process violation. A review step or CI check flags that canonical integration tests must use shared fixtures.

[end] Restore the shared fixture usage in all platform integration test suites. Confirm all platform pipelines pass.

---

### Group 3: Agent self-check protocol compliance

[init] An LLM agent is tasked with adding a new submodule to an existing module in a valid ArchUI project. The project passes `archui validate` before the agent begins.

[action] The agent creates the new submodule folder and README.md but forgets to add the submodule to the parent module's `submodules` list. The agent does not run `archui validate` before reporting the task as complete.
[eval] When `archui validate` is later run (by CI or a reviewer), it reports an error: the new folder is not declared in the parent's `submodules` list. The agent's omission of the self-check protocol allowed an invalid state to be committed.

[action] The agent is instructed to follow the self-check protocol. The agent runs `archui validate` immediately after creating the submodule.
[eval] `archui validate` reports the missing `submodules` declaration. The agent reads the error, updates the parent `README.md`, and re-runs `archui validate`.

[action] After fixing the `submodules` declaration, the agent runs `archui validate` a second time.
[eval] `archui validate` exits with code 0. The agent proceeds to commit.

[end] Remove the test submodule and restore the parent module's original state. Confirm `archui validate` passes.
