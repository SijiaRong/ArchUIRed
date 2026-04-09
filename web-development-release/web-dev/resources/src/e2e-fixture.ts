/**
 * E2E test fixture — in-memory ArchUI project used by Playwright visual
 * snapshot tests. Loaded when URL contains ?e2e=1.
 *
 * Data mirrors the preview.html reference design so snapshots are directly
 * comparable to the design reference.
 */
import { createMemAdapter } from './filesystem/memAdapter'
import type { FsAdapter } from './types'

const yaml = (s: string) => s   // passthrough — written as ready YAML strings

/** Canonical test project files */
const FIXTURE: Record<string, string> = {

  /* ── Root module ── */
  '/README.md': yaml(`---\nname: ArchUIRed\ndescription: "Dual-interface knowledge management system with node-based visual canvas."\n---\n`),
  '/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "00000000-root-0000-0000-000000000001"
submodules:
  web-development-release: "10000000-0000-0000-0000-000000000001"
  cli: "20000000-0000-0000-0000-000000000001"
  gui: "30000000-0000-0000-0000-000000000001"
links: []
`.trim()),

  /* ── web-development-release ── */
  '/web-development-release/README.md': yaml(`---\nname: Web Development Release\ndescription: "Full web deployment pipeline including React app, build, server, tests and release."\n---\n`),
  '/web-development-release/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "10000000-0000-0000-0000-000000000001"
submodules:
  web-dev: "11000000-0000-0000-0000-000000000001"
  web-server: "12000000-0000-0000-0000-000000000001"
  web-build: "13000000-0000-0000-0000-000000000001"
links:
  - uuid: "30000000-0000-0000-0000-000000000001"
    relation: depends-on
    description: "Web platform implements the GUI design-system token vocabulary."
  - uuid: "20000000-0000-0000-0000-000000000001"
    relation: depends-on
    description: "CI pipeline runs the CLI validator after every build."
`.trim()),

  /* ── web-dev ── */
  '/web-development-release/web-dev/README.md': yaml(`---\nname: Web Dev\ndescription: "React SPA with canvas rendering, filesystem adapter abstraction, and Vite dev tooling."\n---\n`),
  '/web-development-release/web-dev/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "11000000-0000-0000-0000-000000000001"
submodules: {}
links:
  - uuid: "30100000-0000-0000-0000-000000000001"
    relation: implements
    description: "Concrete React implementation of the ArchUI canvas screen spec."
  - uuid: "30000000-0000-0000-0000-000000000001"
    relation: references
    description: "All components use design-system semantic tokens."
  - uuid: "12000000-0000-0000-0000-000000000001"
    relation: depends-on
    description: "Server-hosted mode uses web-server for all filesystem ops."
`.trim()),

  /* ── web-server ── */
  '/web-development-release/web-server/README.md': yaml(`---\nname: Web Server\ndescription: "Zero-dependency Express server that serves the built SPA and exposes a filesystem REST API."\n---\n`),
  '/web-development-release/web-server/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "12000000-0000-0000-0000-000000000001"
submodules: {}
links: []
`.trim()),

  /* ── web-build ── */
  '/web-development-release/web-build/README.md': yaml(`---\nname: Web Build\ndescription: "Distributed assembly pipeline — stages sources from GUI modules and compiles with Vite."\n---\n`),
  '/web-development-release/web-build/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "13000000-0000-0000-0000-000000000001"
submodules: {}
links: []
`.trim()),

  /* ── cli ── */
  '/cli/README.md': yaml(`---\nname: CLI\ndescription: "Validator that checks filesystem conformance after agent modifications."\n---\n`),
  '/cli/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "20000000-0000-0000-0000-000000000001"
submodules: {}
links:
  - uuid: "30000000-0000-0000-0000-000000000001"
    relation: references
    description: "CLI validator references GUI design-system token conventions."
`.trim()),

  /* ── gui ── */
  '/gui/README.md': yaml(`---\nname: GUI\ndescription: "Node-based visual canvas design specifications and component library."\n---\n`),
  '/gui/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "30000000-0000-0000-0000-000000000001"
submodules:
  screens: "30100000-0000-0000-0000-000000000001"
  components: "30200000-0000-0000-0000-000000000001"
  design-system: "30300000-0000-0000-0000-000000000001"
links: []
`.trim()),

  /* ── gui/screens ── */
  '/gui/screens/README.md': yaml(`---\nname: Screens\ndescription: "Full-page view specs for the ArchUI canvas application."\n---\n`),
  '/gui/screens/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "30100000-0000-0000-0000-000000000001"
submodules: {}
links: []
`.trim()),

  /* ── gui/components ── */
  '/gui/components/README.md': yaml(`---\nname: Components\ndescription: "Reusable canvas UI building blocks — cards, edges, breadcrumb, detail panel."\n---\n`),
  '/gui/components/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "30200000-0000-0000-0000-000000000001"
submodules: {}
links: []
`.trim()),

  /* ── gui/design-system ── */
  '/gui/design-system/README.md': yaml(`---\nname: Design System\ndescription: "Semantic token vocabulary for color, typography, spacing, and elevation across all platforms."\n---\n`),
  '/gui/design-system/.archui/index.yaml': yaml(`
schema_version: "1"
uuid: "30300000-0000-0000-0000-000000000001"
submodules: {}
links: []
`.trim()),

  /* ── Global layout (root level) ── */
  '/.archui/layout.yaml': yaml(`
"00000000-root-0000-0000-000000000001":
  "10000000-0000-0000-0000-000000000001": { x: 40, y: 40 }
  "20000000-0000-0000-0000-000000000001": { x: 340, y: 40 }
  "30000000-0000-0000-0000-000000000001": { x: 640, y: 40 }
"10000000-0000-0000-0000-000000000001":
  "11000000-0000-0000-0000-000000000001": { x: 40, y: 60 }
  "12000000-0000-0000-0000-000000000001": { x: 340, y: 60 }
  "13000000-0000-0000-0000-000000000001": { x: 640, y: 60 }
`.trim()),
}

/** Create the E2E memAdapter pre-loaded with the test fixture */
export function createE2eAdapter(): FsAdapter {
  return createMemAdapter(FIXTURE)
}

/** E2E root path */
export const E2E_ROOT = '/'
