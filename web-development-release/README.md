---
name: Web Development and Release
description: "Scopes all development and release workflows for the ArchUI web platform — a React SPA served by an Express backend that provides filesystem access to any browser, deployable as a Docker image for self-hosting or as a static bundle for Chrome/Edge with native FSA."
---

## Overview

The `web-development-release` module owns everything needed to develop, test, and ship the ArchUI web platform. This consists of two cooperating parts: the React SPA frontend and the Express backend server.

The backend server is the key enabler for regular users — it allows anyone to open ArchUI in any browser without installing Electron or a desktop app. The server hosts the ArchUI project on the user's machine (or a team server) and exposes a filesystem REST API that the React app calls. All browsers are supported this way.

## Deployment Modes

**Server-hosted (recommended for all users):** The Express backend serves both the built React SPA and the `/api/fs/*` filesystem API on a single port. Packaged as a Docker image or npm global package. Works in all browsers.

**Static-only (Chrome/Edge FSA mode):** The SPA is deployed to a CDN or static host (GitHub Pages, Cloudflare Pages) without a backend. Filesystem access uses the browser's native File System Access API. Only works in Chrome/Edge; not suitable for general user distribution.

## Submodules

- **web-development** — React SPA implementation, canvas architecture, filesystem adapter, local dev toolchain, and coding conventions.
- **web-server** — Express backend server: filesystem REST API, static SPA serving, Docker packaging, and security model.
- **web-release** — Build pipeline, versioning, Docker image publishing, and release checklist covering both deployment modes.
