---
name: Web Test
description: "Defines and runs the full test suite for the web platform: unit tests for React components and filesystem utilities, integration tests for the Express API endpoints, and end-to-end browser tests via Playwright."
---

## Overview

Web Test is the quality gate between development and release. It runs after both `web-development` (React app) and `web-server` (Express backend) have been built, and its resources implement the test suites that verify both components work correctly together.

## Test Layers

### Unit tests (`resources/unit/`)
- React component tests (Vitest + Testing Library)
- Filesystem adapter logic (FsAdapter interface contract)
- YAML parsing and frontmatter utilities

### Integration tests (`resources/integration/`)
- Express `/api/fs/*` endpoint tests (supertest)
- Path traversal prevention
- Read/write/list round-trips against a real temp directory

### End-to-end tests (`resources/e2e/`)
- Playwright tests covering key user flows:
  - Open project folder (FSA flow in Chromium)
  - Navigate canvas: drill-in, drill-out, breadcrumb
  - Create and rename a module
  - Link two modules
  - Run a command (mock AI agent response)
- Playwright screenshot assertions covering the approved workspace compositions:
  - Idle canvas with dense external-card layout
  - Selected primary card with detail panel visible
  - Drilled canvas with breadcrumb return context and active edges
  - Self-hosted font rendering may use a tiny `maxDiffPixels` tolerance so sub-pixel antialiasing noise does not mask real layout regressions

## Running Tests

```bash
npm run test           # unit + integration
npm run test:e2e       # Playwright e2e (requires built app running)
npm run test:all       # all three layers in sequence
```

## Pass Criteria

All three layers must pass before any release build proceeds. Test failures block `web-release`.

Visual redesigns do not count as complete until screenshot baselines are refreshed from an approved Figma update and the resulting Playwright comparisons pass in the shared Web/Electron SPA.

## Implements

This module implements the test coverage required by:
- `web-development` — component and filesystem behaviour
- `web-server` — API contract and security model
