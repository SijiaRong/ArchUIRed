#!/usr/bin/env node
/**
 * token-lint.mjs — Static analysis for design-token violations.
 *
 * Scans src/**\/*.{css,tsx,ts} for hardcoded values that bypass the
 * design-token vocabulary defined in design-tokens.css.
 *
 * Based on: gui/design-system/harness/token-lint/README.md
 *
 * Exit code:
 *   0 — no violations
 *   1 — violations found (fails CI)
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

// ─── Allowed files (token definitions themselves are exempt) ──────────────
const EXEMPT_FILES = new Set([
  'design-tokens.css',   // the source of truth — hardcoded values are expected here
  'e2e-fixture.ts',      // test fixture — contains YAML strings, not CSS
])

// ─── Legal typography token sizes (px) ────────────────────────────────────
const VALID_FONT_SIZES_PX = new Set([11, 12, 13, 14, 22])   // from typography token table

// ─── Legal border-radius values (px) ──────────────────────────────────────
const VALID_RADII_PX = new Set([3, 4, 8, 50])   // 3=scrollbar thumb, 4=border-radius-small, 8=card, 50%=circle

// ─── Legal spacing values (multiples of 4px up to 48px) ───────────────────
const VALID_SPACING_PX = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48])

// ─── Violation rules ───────────────────────────────────────────────────────

/** @type {Array<{name:string, pattern:RegExp, check?:(m:RegExpMatchArray,line:string)=>boolean, message:string}>} */
const RULES = [
  {
    name: 'hardcoded-hex',
    pattern: /#([0-9a-fA-F]{3,8})\b/g,
    // Exempt: hex values inside CSS variable definitions (--color-xxx: #value)
    // Exempt: hex values inside SVG arrowhead color maps (object literals where
    //         CSS var() is not usable — SVG <marker> fill must be a literal color)
    check: (_m, line) => {
      const trimmed = line.trim()
      // Allow hex inside token definition lines (--xxx: #value)
      if (/--[\w-]+\s*:\s*#/.test(trimmed)) return false
      // Allow hex as a value in object literal lines: 'key': '#hex'
      if (/['"`][^'"`]+['"`]\s*:\s*['"`]#/.test(trimmed)) return false
      // Allow hex in const/let declarations used as SVG fill literals
      if (/const\s+\w+\s*=\s*['"`]#/.test(trimmed)) return false
      // Allow hex inside rgba() which is caught separately
      return true
    },
    message: 'Hardcoded hex color — use a CSS token variable instead',
  },
  {
    name: 'hardcoded-rgba',
    pattern: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    check: (_m, line) => {
      const trimmed = line.trim()
      // Allow rgba in token definition lines
      if (/--[\w-]+\s*:/.test(trimmed)) return false
      // Allow the specific interactive overlays and known shadow values
      // (these are defined inline in the design tokens, not component code)
      return true
    },
    message: 'Hardcoded rgba color — use a CSS token variable instead',
  },
  {
    name: 'out-of-vocab-font-size',
    // Matches: font-size: 15px (not in typography token table)
    pattern: /font-size\s*:\s*(\d+)px/g,
    check: (m) => !VALID_FONT_SIZES_PX.has(parseInt(m[1], 10)),
    message: 'Font size not in typography token table — use a defined typography token',
  },
  {
    name: 'out-of-vocab-border-radius',
    // Matches: border-radius: 15px
    pattern: /border-radius\s*:\s*(\d+)px/g,
    check: (m) => !VALID_RADII_PX.has(parseInt(m[1], 10)),
    message: 'Border radius not in token table — use --dimension-border-radius-card or --dimension-border-radius-small',
  },
]

// ─── File walker ───────────────────────────────────────────────────────────

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...walk(full))
    } else if (['.css', '.ts', '.tsx'].includes(extname(entry))) {
      results.push(full)
    }
  }
  return results
}

// ─── Main ──────────────────────────────────────────────────────────────────

let violations = 0
const files = walk(SRC_DIR)

for (const filePath of files) {
  const fileName = filePath.split('/').pop()
  if (EXEMPT_FILES.has(fileName)) continue

  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const rule of RULES) {
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
      let m
      while ((m = pattern.exec(line)) !== null) {
        const shouldFlag = rule.check ? rule.check(m, line) : true
        if (shouldFlag) {
          const rel = filePath.replace(SRC_DIR + '/', '')
          console.error(`[token-lint] ${rel}:${i + 1}  [${rule.name}]  ${m[0]}`)
          console.error(`             → ${rule.message}`)
          violations++
        }
      }
    }
  }
}

if (violations === 0) {
  console.log('[token-lint] ✓ No violations found.')
  process.exit(0)
} else {
  console.error(`\n[token-lint] ✗ ${violations} violation(s). Fix before committing.`)
  process.exit(1)
}
