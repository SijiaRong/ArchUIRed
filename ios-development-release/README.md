---
name: "iOS Development & Release"
description: "Scopes everything an iOS agent needs to natively implement and ship ArchUI on iOS using SwiftUI, from canvas implementation to App Store release."
---

## Overview

This module is the authoritative scope for all iOS-native work on ArchUI. It is loaded exclusively by agents operating in an iOS context — whether that is implementing UI, running a local development loop, or preparing an App Store release.

ArchUI's iOS app is a SwiftUI application that faithfully implements the gui module's canvas specification. The infinite-scroll, zoomable canvas is the primary surface; module nodes are rendered as SwiftUI views, and navigation drill-down is handled through a `NavigationStack`. UI designs are sourced from the design-system module via Figma MCP, ensuring pixel-level fidelity between the design layer and the shipped app.

## Module Structure

| Submodule | Purpose |
|-----------|---------|
| `ios-development` | SwiftUI implementation patterns, local dev setup, coding conventions, Figma MCP integration, and file-sync approach |
| `ios-release` | App Store submission, versioning, signing, TestFlight, and release agent workflow |

## Agent Scope

An iOS agent spawned within this module should:

1. Read `ios-development/README.md` to understand the development workflow before touching any Swift code.
2. Read `ios-release/README.md` before initiating any release or TestFlight distribution step.
3. Never modify files outside this module tree or `gui/` without explicit cross-module approval.
4. Always validate that any new subfolder introduced here follows the ArchUI filesystem rules defined in `core`.
