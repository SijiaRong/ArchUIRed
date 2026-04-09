#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs'
import { extname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { readYamlFromRepo } from './design-source.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')
const GENERATED_MARKER = 'AUTO-GENERATED FILE. DO NOT EDIT.'
const EXEMPT_RELATIVE_PATHS = new Set([
  'design-tokens.generated.css',
  'e2e-fixture.ts',
])
const VALID_FONT_SIZES_PX = new Set([11, 12, 13, 14, 22])
const VALID_RADII_PX = new Set([3, 4, 8, 50])
const ALLOWED_COMPONENT_NUMERIC_CONSTANTS = new Set(['ACCENT_COUNT'])
const DESIGN_COPY_SOURCE_PATHS = [
  'gui/screens/landing/web-copy.yaml',
  'gui/screens/canvas/web-copy.yaml',
  'gui/components/detail-panel/web-copy.yaml',
  'gui/components/primary-module-card/web-copy.yaml',
  'gui/design-system/visual-orchestration/web-brand.yaml',
]

function toPosix(value) {
  return value.replace(/\\/g, '/')
}

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function collectStringValues(value, target) {
  if (typeof value === 'string') {
    target.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, target)
    return
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectStringValues(nested, target)
  }
}

function buildDesignCopyMatchers() {
  const literals = []
  for (const sourcePath of DESIGN_COPY_SOURCE_PATHS) {
    const document = readYamlFromRepo(sourcePath)
    collectStringValues(document.copy ?? document.brand, literals)
  }

  return [...new Set(literals.filter(literal => literal.length >= 3))].map(literal => ({
    literal,
    patterns: [
      new RegExp(`(['"\`])${escapeRegExp(literal)}\\1`),
      new RegExp(`>${escapeRegExp(literal)}<`),
    ],
  }))
}

const DESIGN_COPY_MATCHERS = buildDesignCopyMatchers()

const RULES = [
  {
    name: 'hardcoded-hex',
    pattern: /#([0-9a-fA-F]{3,8})\b/g,
    check: (_match, line) => !/--[\w-]+\s*:\s*#/.test(line.trim()),
    message: 'Hardcoded hex color. Use a generated design token.',
  },
  {
    name: 'hardcoded-rgba',
    pattern: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    check: (_match, line) => !/--[\w-]+\s*:/.test(line.trim()),
    message: 'Hardcoded rgba color. Use a generated design token.',
  },
  {
    name: 'out-of-vocab-font-size',
    pattern: /font-size\s*:\s*(\d+)px/g,
    check: match => !VALID_FONT_SIZES_PX.has(Number.parseInt(match[1], 10)),
    message: 'Font size is outside the approved typography token table.',
  },
  {
    name: 'out-of-vocab-border-radius',
    pattern: /border-radius\s*:\s*(\d+)px/g,
    check: match => !VALID_RADII_PX.has(Number.parseInt(match[1], 10)),
    message: 'Border radius is outside the approved token table.',
  },
]

function recordViolation(relPath, lineNumber, ruleName, matchedText, message) {
  console.error(`[token-lint] ${relPath}:${lineNumber}  [${ruleName}]  ${matchedText}`)
  console.error(`             -> ${message}`)
  return 1
}

let violations = 0

for (const filePath of walk(SRC_DIR)) {
  const relPath = toPosix(relative(SRC_DIR, filePath))
  const content = readFileSync(filePath, 'utf8')
  if (EXEMPT_RELATIVE_PATHS.has(relPath) || relPath.startsWith('generated/') || content.includes(GENERATED_MARKER)) {
    continue
  }

  const lines = content.split('\n')
  const isComponentSource = relPath.startsWith('components/') && ['.ts', '.tsx'].includes(extname(filePath))

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    for (const rule of RULES) {
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
      let match
      while ((match = pattern.exec(line)) !== null) {
        if (!rule.check || rule.check(match, line)) {
          violations += recordViolation(relPath, index + 1, rule.name, match[0], rule.message)
        }
      }
    }

    if (!isComponentSource) continue

    const numericConstantMatch = line.match(/^\s*const\s+([A-Z][A-Z0-9_]+)\s*=\s*(-?\d+(?:\.\d+)?)/)
    if (numericConstantMatch && !ALLOWED_COMPONENT_NUMERIC_CONSTANTS.has(numericConstantMatch[1])) {
      violations += recordViolation(
        relPath,
        index + 1,
        'hardcoded-layout-constant',
        numericConstantMatch[0].trim(),
        'Move default workspace layout constants into generated design-doc artifacts.',
      )
    }

    for (const matcher of DESIGN_COPY_MATCHERS) {
      if (matcher.patterns.some(pattern => pattern.test(line))) {
        violations += recordViolation(
          relPath,
          index + 1,
          'hardcoded-design-copy',
          matcher.literal,
          'Component copy must come from generated workspace-content artifacts.',
        )
      }
    }
  }
}

if (violations === 0) {
  console.log('[token-lint] No violations found.')
  process.exit(0)
}

console.error(`\n[token-lint] ${violations} violation(s). Fix before committing.`)
process.exit(1)
