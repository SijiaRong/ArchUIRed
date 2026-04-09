import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import type { Violation, IndexYaml } from '../types.js'

/**
 * Default node dimensions used for overlap detection.
 * Layout files store only (x, y) — no width/height.
 * These values match the primary-module-card approximate rendered size on the canvas.
 */
const DEFAULT_NODE_WIDTH = 220
const DEFAULT_NODE_HEIGHT = 120

/**
 * Minimum overlap area (px²) that triggers a warning.
 * Small intersections (e.g. 1–2 px) from floating-point drift are ignored.
 */
const OVERLAP_THRESHOLD_PX2 = 200

interface NodeRect {
  uuid: string
  x: number
  y: number
  w: number
  h: number
}

interface LayoutYaml {
  layout?: Record<string, { x?: string | number; y?: string | number; w?: string | number; h?: string | number }>
}

function parseNum(v: string | number | undefined, fallback: number): number {
  if (v === undefined || v === null) return fallback
  const n = typeof v === 'number' ? v : parseFloat(v)
  return isNaN(n) ? fallback : n
}

function overlapArea(a: NodeRect, b: NodeRect): number {
  const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
  const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  return xOverlap * yOverlap
}

function checkLayoutFile(layoutPath: string, moduleRelPath: string): Violation[] {
  const violations: Violation[] = []

  let raw: LayoutYaml
  try {
    raw = parseYaml(fs.readFileSync(layoutPath, 'utf8')) as LayoutYaml ?? {}
  } catch {
    // YAML parse errors are not our concern here
    return violations
  }

  if (!raw.layout || typeof raw.layout !== 'object') return violations

  const rects: NodeRect[] = Object.entries(raw.layout).map(([uuid, pos]) => ({
    uuid,
    x: parseNum(pos?.x, 0),
    y: parseNum(pos?.y, 0),
    w: parseNum(pos?.w, DEFAULT_NODE_WIDTH),
    h: parseNum(pos?.h, DEFAULT_NODE_HEIGHT),
  }))

  // O(n²) pairwise check — layout files are small (typically < 50 nodes)
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const area = overlapArea(rects[i], rects[j])
      if (area > OVERLAP_THRESHOLD_PX2) {
        const pct = Math.round((area / (rects[i].w * rects[i].h)) * 100)
        violations.push({
          ruleId: 'layout/node-overlap',
          severity: 'warn',
          filePath: layoutPath,
          message:
            `Nodes "${rects[i].uuid}" and "${rects[j].uuid}" overlap by ~${Math.round(area)} px² (~${pct}% of node area). ` +
            `Adjust positions in ${path.join(moduleRelPath, '.archui', 'layout.yaml')} so nodes do not obscure each other on the canvas.`,
        })
      }
    }
  }

  return violations
}

export function validateLayout(rootPath: string): Violation[] {
  const violations: Violation[] = []
  const abs = path.resolve(rootPath)

  // Walk every .archui/layout.yaml reachable from index.yaml submodule declarations
  function walk(modulePath: string, moduleAbs: string) {
    const layoutPath = path.join(moduleAbs, '.archui', 'layout.yaml')
    if (fs.existsSync(layoutPath)) {
      violations.push(...checkLayoutFile(layoutPath, modulePath))
    }

    const indexPath = path.join(moduleAbs, '.archui', 'index.yaml')
    if (!fs.existsSync(indexPath)) return
    let index: IndexYaml = {}
    try {
      index = (parseYaml(fs.readFileSync(indexPath, 'utf8')) as IndexYaml) ?? {}
    } catch {
      return
    }

    for (const folderName of Object.keys(index.submodules ?? {})) {
      const childAbs = path.join(moduleAbs, folderName)
      if (fs.existsSync(childAbs) && fs.statSync(childAbs).isDirectory()) {
        walk(path.join(modulePath, folderName), childAbs)
      }
    }
  }

  walk(rootPath, abs)
  return violations
}
