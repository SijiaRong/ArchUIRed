---
name: "Testing & QA"
description: "Defines the project-wide testing philosophy, cross-platform integration test strategy, and the protocol by which agents verify their own filesystem changes."
---

## Overview

This module defines how ArchUI is tested across all platforms and by all agents. Because ArchUI runs on iOS, Android, and web/Electron — each with a distinct native toolchain — the test strategy must separate concerns that are inherently platform-specific from those that can be specified once and executed everywhere.

The guiding principle is: **the ArchUI filesystem contract is platform-agnostic, so its correctness tests are too.** Platform-specific tests (UI rendering, gestures, OS integrations) live in their respective platform modules. This module owns the shared contract.

## Structure

| Submodule | Responsibility |
|---|---|
| `test-pyramid` | Defines the four levels of testing and coverage targets across all platforms |
| `integration-tests` | Specifies the canonical set of ArchUI filesystem operation tests every platform must implement |
| `agent-verification` | Describes the protocol agents follow to validate their own filesystem changes before committing |

## Cross-Platform Test Philosophy

ArchUI's test strategy is built around three axioms:

1. **One contract, many implementations.** The ArchUI filesystem contract (frontmatter schema, UUID index, module tree rules) is defined once in `core/filesystem-rules`. Every platform implements tests against that contract in its native test framework. Behavior divergence between platforms is a bug.

2. **`archui validate` is the universal gate.** Every CI pipeline on every platform runs `archui validate` before merging. A passing validate run means the repository's ArchUI structure is internally consistent. No exceptions.

3. **Agents are first-class test subjects.** LLM agents that write or modify ArchUI files are expected to run the same validation pipeline as human engineers. The `agent-verification` submodule formalises this expectation.

## Resources

Test fixtures (sample ArchUI project trees used in integration tests) are stored under `resources/fixtures/`. Each fixture is a minimal, self-contained ArchUI project tree that exercises a specific contract behaviour.
