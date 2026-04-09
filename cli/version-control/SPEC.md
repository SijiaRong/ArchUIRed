---
name: Version Control
description: Tracks the CLI's schema version, release version, and migration history so agents and validators can determine compatibility and apply pending upgrades.
---

## Overview

The Version Control module owns all version-related metadata for the ArchUI CLI. It has two responsibilities: (1) exposing the current release version of the CLI package, and (2) tracking the schema version history so migration commands know which upgrades have already been applied to a given project.

## Release Version

The CLI release version follows [Semantic Versioning](https://semver.org/):

- **Major** bump — breaking changes to the CLI command surface or `.archui/index.yaml` schema
- **Minor** bump — new commands or non-breaking schema fields
- **Patch** bump — bug fixes, output formatting, or performance improvements

The authoritative version value lives in `cli/resources/package.json`. This module documents the versioning policy; the package file is the single source of truth for the actual number.

## Schema Versioning

ArchUI module files carry a `schema_version` field in `.archui/index.yaml`. The CLI version-control module records:

- Which `schema_version` values are valid
- What migration steps exist to advance from one schema version to the next
- Which version introduced each structural rule

Migration logic is implemented in `cli/resources/` and invoked via `archui migrate [path]`.

## Current Release

**CLI version:** 0.2.0

This release introduces:
- `archui run` command for agent-driven module commands
- `archui init` and `archui import` for project bootstrapping
- `archui merge` for combining multiple ArchUI projects
