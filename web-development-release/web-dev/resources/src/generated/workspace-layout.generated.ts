/**
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Regenerate with: npm run sync:design-docs
 * Document snapshot curated_at: 2026-04-09T03:10:00+08:00
 * Sources:
 * - gui/design-system/visual-orchestration/web-layout.yaml
 */

export const workspaceLayout = {
  "canvas": {
    "graph": {
      "primaryNode": {
        "x": 320,
        "y": 230
      },
      "childGrid": {
        "originX": 700,
        "originY": 120,
        "columnWidth": 260,
        "rowHeight": 190,
        "staggerY": 26,
        "twoColumnThreshold": 4
      },
      "externalNodes": {
        "leftX": 42,
        "rightX": 1180,
        "startY": 120,
        "gapY": 168
      },
      "fitView": {
        "padding": 0.16,
        "maxZoom": 1.15
      },
      "zoom": {
        "min": 0.28,
        "max": 2.2
      }
    },
    "overlays": {
      "intro": {
        "desktop": {
          "top": 24,
          "left": 28,
          "maxWidth": 420
        },
        "tablet": {
          "maxWidth": 320
        },
        "mobile": {
          "top": 16,
          "left": 16,
          "right": 16
        }
      },
      "toolbar": {
        "desktop": {
          "top": 28,
          "right": 28
        },
        "mobile": {
          "top": 148,
          "left": 16,
          "right": 16
        }
      },
      "workspaceMeta": {
        "desktop": {
          "top": 184,
          "left": 28
        },
        "tablet": {
          "top": 170
        },
        "mobile": {
          "top": 214,
          "left": 16
        }
      },
      "selectionHint": {
        "desktop": {
          "right": 28,
          "bottom": 28
        },
        "mobile": {
          "left": 16,
          "right": 16,
          "bottom": 16
        }
      },
      "detailPanel": {
        "desktop": {
          "top": 88,
          "right": 24,
          "bottom": 24,
          "width": 360,
          "viewportInset": 48
        },
        "mobile": {
          "inset": 16,
          "maxHeight": "min(58vh, 480px)"
        }
      }
    }
  }
} as const
