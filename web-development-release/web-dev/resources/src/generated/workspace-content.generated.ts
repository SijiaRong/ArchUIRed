/**
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Regenerate with: npm run sync:design-docs
 * Document snapshot curated_at: 2026-04-09T03:10:00+08:00, 2026-04-09T03:10:00+08:00, 2026-04-09T03:10:00+08:00, 2026-04-09T03:10:00+08:00, 2026-04-09T03:10:00+08:00, 2026-04-09T21:35:00+08:00
 * Sources:
 * - gui/screens/landing/web-copy.yaml
 * - gui/screens/canvas/web-copy.yaml
 * - gui/components/detail-panel/web-copy.yaml
 * - gui/components/primary-module-card/web-copy.yaml
 * - gui/components/link-renderer/web-semantics.yaml
 * - gui/design-system/visual-orchestration/web-brand.yaml
 */

export const workspaceContent = {
  "brand": {
    "wordmark": "ArchUI",
    "logoMark": {
      "assetKey": "archui-a-mark",
      "assetFile": "archui-a-mark.svg",
      "alt": "ArchUI A logo mark",
      "treatment": "Deep Honey single-color",
      "glyphKind": "custom-vector-mark",
      "geometry": {
        "silhouette": "rounded-modular",
        "lean": "forward",
        "source": "vector-asset",
        "notes": "Soft rounded strokes with a motion-forward apex cap. This is a custom SVG mark, not a font glyph."
      },
      "sizes": {
        "sm": {
          "width": 28,
          "height": 28
        },
        "md": {
          "width": 48,
          "height": 48
        },
        "hero": {
          "width": 72,
          "height": 72
        }
      }
    }
  },
  "landing": {
    "brandWordmark": "ArchUI",
    "subtitle": "Canvas-first knowledge workspace for humans and AI agents.",
    "themeToggle": {
      "toLight": "Switch to light",
      "toDark": "Switch to dark"
    },
    "card": {
      "kicker": "Deep Honey / Lake Workspace",
      "title": "Open a project and step into the graph.",
      "body": "This first wave focuses on the canvas workspace, so the entry page stays intentionally light while the workbench carries the visual identity."
    },
    "actions": {
      "connectServer": "Connect to local server",
      "openFolder": "Open folder in Chrome or Edge",
      "showServerUrl": "Show server URL",
      "hideServerUrl": "Hide server URL",
      "serverUrlPlaceholder": "http://localhost:3001"
    }
  },
  "canvas": {
    "intro": {
      "kicker": "Deep Honey Workspace",
      "emptyTitle": "Open a workspace",
      "emptyDescription": "Pick a local ArchUI project to step into the graph."
    },
    "toolbar": {
      "newChild": "New child",
      "reload": "Reload",
      "themeToggle": {
        "toDark": "Dark mode",
        "toLight": "Light mode"
      },
      "commandMenu": "Command menu"
    },
    "metrics": {
      "submodules": "Submodules",
      "externals": "Visible externals",
      "theme": "Theme"
    },
    "breadcrumb": {
      "ariaLabel": "Breadcrumb"
    },
    "selectionHint": {
      "title": "Click a card to inspect it.",
      "body": "Double-click any visible module to drill into that workspace."
    },
    "loading": "Loading workspace...",
    "emptyState": {
      "title": "No submodules yet",
      "body": "Create the first child module to start composing this workspace."
    },
    "placeholder": {
      "unknownModuleName": "Unknown module",
      "unknownModuleDescription": "This module UUID is not currently resolvable in the project index."
    },
    "contextMenu": {
      "openModule": "Open module",
      "newChildModule": "New child module",
      "reloadWorkspace": "Reload workspace",
      "copyModule": "Copy module",
      "pasteModule": "Paste module",
      "copiedToClipboard": "Copied to clipboard",
      "nothingToPaste": "Nothing to paste",
      "pasteFailed": "Paste failed",
      "deleteModule": "Delete module",
      "deleteConfirm": "Delete this module? This cannot be undone.",
      "deleteFailed": "Delete failed"
    },
    "commands": {
      "newChildModule": "New child module",
      "reloadWorkspace": "Reload workspace",
      "reloadHint": "Reload current module",
      "openModuleHint": "Open module"
    }
  },
  "detailPanel": {
    "ariaLabel": "Module details",
    "closeLabel": "Close",
    "closeAriaLabel": "Close details",
    "kicker": {
      "focused": "Focused module",
      "selection": "Selection",
      "visible": "Visible module"
    },
    "fallback": {
      "description": "No description available for this module yet.",
      "missingSubmodule": "This submodule is declared but not currently indexed.",
      "unknownModuleName": "Unknown module",
      "unknownModuleDescription": "This UUID is not currently resolvable in the project index."
    },
    "metrics": {
      "submodules": "Submodules",
      "outgoing": "Outgoing",
      "incoming": "Incoming"
    },
    "sections": {
      "submodules": "Submodules",
      "linksTo": "Links To",
      "linkedBy": "Linked By"
    },
    "empty": {
      "submodules": "No direct submodules.",
      "outgoing": "No outgoing links.",
      "incoming": "No incoming links."
    }
  },
  "moduleCard": {
    "eyebrow": {
      "primary": "Focused module",
      "child": "Submodule"
    },
    "externalEyebrow": {
      "incoming": "Incoming reference",
      "external": "External reference"
    },
    "badges": {
      "submodulesSuffix": "submodules",
      "linksSuffix": "links"
    }
  },
  "linkRenderer": {
    "defaultRelation": "related-to"
  }
} as const
