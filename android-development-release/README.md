---
name: "Android Development & Release"
description: "Scopes everything an Android agent needs to build and ship the native Jetpack Compose implementation of ArchUI, from local development through Google Play release."
---

## Overview

This module is the top-level scope for all work done by an Android-native agent on ArchUI. It is not loaded by web, desktop, or CLI agents — only by agents whose task involves the Android application.

ArchUI's Android app is a first-class, native-feeling client. It does not wrap a web view. The UI is built entirely in Jetpack Compose and implements the same conceptual canvas model defined in the `gui` module: an infinite, pannable/zoomable canvas populated by module nodes, with drill-down navigation into submodules.

UI designs originate in the `gui/design-system` module and are delivered to Android developers through Figma MCP. The Android implementation is expected to match the design-system tokens (color, typography, spacing, elevation) exactly, translating them into Compose `MaterialTheme` extensions rather than hardcoding values.

## Scope

This module contains two submodules:

- **android-development** — day-to-day development workflow: project setup, Compose canvas implementation, SAF-based filesystem access, coding conventions, Figma MCP integration, and local testing.
- **android-release** — release engineering: versioning, keystore signing, Play Store track rollout, and the release checklist an agent must complete before promoting a build.

## Agent Context

When an agent is initialized with this module in scope, it should assume:

1. The target runtime is Android API 26+ (minSdk 26), with Compose BOM tracked at the latest stable.
2. The ArchUI module tree on the user's device is accessed via Android's Scoped Storage / Storage Access Framework — no direct `File` API access to arbitrary paths.
3. UI changes must be validated against Figma designs pulled via Figma MCP before a PR is opened.
4. Release builds must pass the checklist in `android-release` before any track promotion on Google Play.

## Relationship to Other Modules

The Android app consumes but does not define the ArchUI data model. The authoritative source for module structure, README schema, and filesystem rules lives in `core`. The canvas interaction model and visual language live in `gui`. This module is solely responsible for the Android-native expression of those contracts.
