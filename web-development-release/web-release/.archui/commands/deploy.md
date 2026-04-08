---
name: Deploy
description: Build the production Docker image and static SPA bundle, run the release checklist, and publish to Docker Hub and GitHub Pages.
icon: 🚀
---

Execute the web platform release deployment. Follow the checklist in `web-development-release/web-release` README.

Steps:
1. Read `web-development-release/web-release/README.md` for the full release checklist.
2. Verify `web-test` run-tests passes — do not proceed if tests are failing.
3. Run `npm run build` from `web-development-release/web-development/resources`.
4. Run `npm run docker:build` to build the Docker image.
5. Run `npm run build:static` to build the static SPA bundle.
6. Verify the Docker image starts correctly: `docker run -p 3000:3000 -v $(pwd):/data archui/web-server`.
7. Run `docker push` to publish to Docker Hub and GHCR.
8. Deploy `dist/` to GitHub Pages.
9. Verify deployed version number matches the release tag.
10. Report completion with links to the published image and deployed URL.

If any step fails, stop and report the error without proceeding to subsequent steps.
