import { useCanvasStore } from './store/canvas'
import { createMemAdapter } from './filesystem/memAdapter'

const FIXTURE_FS: Record<string, string> = {
  '.archui/layout.yaml': `5c9a1e3f:
  5c9a1e3f: {x: 320, y: 230}
  855df7a8: {x: 770, y: 178}
  1ae0b731: {x: 770, y: 396}
  7e3f1c9a: {x: 1042, y: 178}
  4b6a8d2e: {x: 1042, y: 396}
  ext-2c4d8f1a: {x: 74, y: 192}
  ext-4d9a2c6f: {x: 74, y: 406}
7e3f1c9a:
  7e3f1c9a: {x: 320, y: 230}
  3ccb57fd: {x: 770, y: 178}
  93ab33c4: {x: 770, y: 396}
  68885b70: {x: 1042, y: 178}
  ext-4d9a2c6f: {x: 74, y: 192}
`,
  '/project/README.md': `---
name: ArchUI Playground
description: Root fixture project for workbench screenshots
---
`,
  '/project/.archui/index.yaml': `schema_version: "1"
uuid: 7f3a1b9e
submodules:
  gui: 5c9a1e3f
  core: 2c4d8f1a
  operations: 4d9a2c6f
links: []
`,
  '/project/gui/README.md': `---
name: GUI
description: Canvas-first workspace for the first-wave deep honey refresh
---
`,
  '/project/gui/.archui/index.yaml': `schema_version: "1"
uuid: 5c9a1e3f
submodules:
  screens: 855df7a8
  components: 1ae0b731
  design-system: 7e3f1c9a
  file-sync: 4b6a8d2e
links:
  - uuid: 2c4d8f1a
    relation: depends-on
  - uuid: 4d9a2c6f
    relation: references
`,
  '/project/gui/screens/README.md': `---
name: Screens
description: Screen definitions for landing and canvas workspace states
---
`,
  '/project/gui/screens/.archui/index.yaml': `schema_version: "1"
uuid: 855df7a8
submodules: {}
links:
  - uuid: 1ae0b731
    relation: depends-on
`,
  '/project/gui/components/README.md': `---
name: Components
description: Reusable visual building blocks shared by the workspace
---
`,
  '/project/gui/components/.archui/index.yaml': `schema_version: "1"
uuid: 1ae0b731
submodules: {}
links:
  - uuid: 4d9a2c6f
    relation: related-to
`,
  '/project/gui/design-system/README.md': `---
name: Design System
description: Token and orchestration source for the canvas-first redesign
---
`,
  '/project/gui/design-system/.archui/index.yaml': `schema_version: "1"
uuid: 7e3f1c9a
submodules:
  foundations: 3ccb57fd
  figma-integration: 93ab33c4
  visual-orchestration: 68885b70
links:
  - uuid: 4d9a2c6f
    relation: references
`,
  '/project/gui/design-system/foundations/README.md': `---
name: Foundations
description: Semantic tokens for light and dark workbench themes
---
`,
  '/project/gui/design-system/foundations/.archui/index.yaml': `schema_version: "1"
uuid: 3ccb57fd
submodules: {}
links:
  - uuid: 68885b70
    relation: related-to
`,
  '/project/gui/design-system/figma-integration/README.md': `---
name: Figma Integration
description: MCP connection layer for the editable design truth
---
`,
  '/project/gui/design-system/figma-integration/.archui/index.yaml': `schema_version: "1"
uuid: 93ab33c4
submodules: {}
links:
  - uuid: 68885b70
    relation: references
`,
  '/project/gui/design-system/visual-orchestration/README.md': `---
name: Visual Orchestration
description: Canvas composition grammar for the deep honey workspace
---
`,
  '/project/gui/design-system/visual-orchestration/.archui/index.yaml': `schema_version: "1"
uuid: 68885b70
submodules: {}
links:
  - uuid: 4d9a2c6f
    relation: references
`,
  '/project/gui/file-sync/README.md': `---
name: File Sync
description: Filesystem-backed reload and synchronization layer
---
`,
  '/project/gui/file-sync/.archui/index.yaml': `schema_version: "1"
uuid: 4b6a8d2e
submodules: {}
links:
  - uuid: 4d9a2c6f
    relation: implements
`,
  '/project/core/README.md': `---
name: Core
description: Filesystem rules and UUID graph resolution
---
`,
  '/project/core/.archui/index.yaml': `schema_version: "1"
uuid: 2c4d8f1a
submodules: {}
links:
  - uuid: 5c9a1e3f
    relation: related-to
`,
  '/project/operations/README.md': `---
name: Operations
description: Release and workflow coordination outside the current hierarchy
---
`,
  '/project/operations/.archui/index.yaml': `schema_version: "1"
uuid: 4d9a2c6f
submodules: {}
links:
  - uuid: 1ae0b731
    relation: related-to
  - uuid: 5c9a1e3f
    relation: references
  - uuid: 68885b70
    relation: depends-on
`,
}

declare global {
  interface Window {
    __archui?: {
      getStore: typeof useCanvasStore.getState
      loadFixture: () => Promise<void>
    }
  }
}

export function installTestHook(): void {
  if (typeof window !== 'undefined') {
    window.__archui = {
      getStore: useCanvasStore.getState,
      async loadFixture() {
        const adapter = createMemAdapter(FIXTURE_FS)
        const store = useCanvasStore.getState()
        await store.setAdapter(adapter, '/project', 'mem')
        await store.navigate('/project/gui')
      },
    }
  }
}
