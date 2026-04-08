---
name: Web Release Test Playbook
description: "Playbook for verifying the web platform release workflow, including Docker image build and run, production SPA build correctness, bundle size constraints, static deployment, and versioning."
---

## Overview

This playbook verifies the web release module's key steps: Docker image build and runtime behavior, clean production builds, bundle size targets, and both deployment paths (server-hosted and static).

---

## Playbook

### Group 1: Docker image build and run

[init] The repository is on the main branch. No uncommitted changes.

[action] Run npm run build followed by npm run docker:build.
[eval] The Docker image builds successfully with no errors. The image is tagged as archui/web-server:VERSION matching package.json version.

[action] Run docker run -p 3000:3000 -v /path/to/test-project:/data archui/web-server:VERSION and open http://localhost:3000 in Firefox.
[eval] The ArchUI app loads correctly in Firefox. The canvas renders the test project's root module. All filesystem reads and writes go through the server's /api/fs/* endpoints without errors.

[action] Open http://localhost:3000 in Safari.
[eval] The app loads and functions identically in Safari. No FSA-related errors appear.

[end] Stop the Docker container. Remove the test image.

---

### Group 2: Production build correctness

[init] The repository is on main with all feature work merged. CHANGELOG.md is up to date.

[action] Run npm run typecheck.
[eval] TypeScript reports zero type errors.

[action] Run npm run test.
[eval] All unit and integration tests pass.

[action] Run npm run build with NODE_ENV=production.
[eval] The dist/ directory is created with index.html and hashed JS/CSS assets. The main app chunk is confirmed under 500 KB gzipped via npm run build:analyze.

[end] Delete the dist/ directory.

---

### Group 3: Static build and deployment

[init] The production build checks from Group 2 pass.

[action] Run npm run build:static with VITE_FS_MODE=fsa.
[eval] The dist/ directory is created with FSA mode baked in. Opening the bundle in Chrome shows the native directory picker on "Open Project".

[action] Deploy dist/ to a GitHub Pages branch using the gh-pages CLI.
[eval] The site becomes accessible at the configured GitHub Pages URL. The app loads in Chrome and the canvas renders correctly using FSA.

[end] Confirm the GitHub Pages deployment is stable.

---

### Group 4: Versioning

[init] The build and Docker checks pass. CHANGELOG.md has been updated.

[action] Run npm version patch.
[eval] package.json version is bumped, a git commit is created, and a git tag (e.g., v1.2.4) is created locally.

[action] Push the tag with git push origin main --tags.
[eval] The CI release-web workflow triggers. It builds the Docker image, pushes to Docker Hub and GHCR, and deploys the static build to GitHub Pages. All CI steps pass.

[end] Verify Docker Hub shows the new image tag. Verify the About panel in the deployed app shows the new version.
