---
name: Web Release
description: "Defines the web platform release workflow: packaging the built SPA and Express server into a Docker image, deploying to Docker Hub and GitHub Pages, versioning, and the release checklist; requires web-build and web-test to pass first."
---

## Overview

Web Release is the final stage of the web platform pipeline. It takes the compiled output from `web-build` and the verified test results from `web-test`, packages them, and publishes to the configured distribution channels.

Web Release does **not** perform compilation — that is `web-build`'s responsibility. It only packages and deploys an already-built `dist/`.

## Prerequisites

Before any release step, verify:
- `web-build` has produced a clean `dist/` (no TypeScript errors, no Vite warnings)
- `web-test` has passed all layers (unit, integration, e2e)
- `archui validate .` exits 0

## Docker Image

Packages the Express server + built SPA into a single image:

```bash
npm run docker:build   # builds archui/web-server:VERSION
docker push archui/web-server:VERSION
```

The project root is mounted at runtime:
```bash
docker run -p 3000:3000 -v /path/to/my-archui-project:/data archui/web-server:VERSION
```

## Static Release (Chrome/Edge only)

Deploys `dist/` to GitHub Pages (FSA mode, no server required):

```bash
npm run deploy:pages
```

## Versioning

Version source of truth is `package.json`. Bump and tag:

```bash
npm version patch   # or minor / major — bumps package.json, creates git tag
git push origin main --tags
```

## CI Pipeline

The `release-web` GitHub Actions workflow triggers on version tags (`v*`):

1. Pull built `dist/` from `web-build` CI artifact
2. `npm run docker:build` — build and tag Docker image
3. `docker push` to Docker Hub and GHCR
4. `npm run deploy:pages` — deploy static SPA to GitHub Pages
5. Verify version number in deployed app

## Release Checklist

- [ ] `web-build` clean (zero errors, zero warnings)
- [ ] `web-test` all layers passing
- [ ] `docker run` smoke test passes
- [ ] Static build loads in Chrome with FSA
- [ ] `CHANGELOG.md` updated
- [ ] `npm version <patch|minor|major>` run
- [ ] Tags pushed and CI `release-web` passes
- [ ] Docker image live on Docker Hub
- [ ] GitHub Pages deployment live
