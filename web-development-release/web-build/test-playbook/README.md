---
name: Web Build Test Playbook
description: "Verification steps for the web build pipeline: manifest completeness, staging integrity, dev and production build success, and output structure."
---

## Checks

1. `web-manifest.yaml` exists and lists all active GUI modules.
2. Every file listed in the manifest exists at its expected `<module>/resources/<file>` path.
3. `npm run dev` starts without errors; HMR works when a module's source file is edited.
4. `npm run build` completes with no TypeScript errors and no Vite warnings.
5. `dist/index.html` exists and references hashed asset files.
6. No two manifest entries claim the same output file path.
