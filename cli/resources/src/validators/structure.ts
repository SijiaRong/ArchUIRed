import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import type { Violation, IndexYaml } from '../types.js'

const ROOT_HIDDEN_WHITELIST = new Set(['.claude', '.cursor', '.aider', '.windsurf', '.github', '.vscode', '.git'])

export function validateStructure(rootPath: string, isRoot = true): Violation[] {
  const violations: Violation[] = []
  const abs = path.resolve(rootPath)

  // Check identity document exists (README.md, SKILL.md, HARNESS.md, SPEC.md, or MEMORY.md)
  const IDENTITY_DOCS = ['README.md', 'SKILL.md', 'HARNESS.md', 'SPEC.md', 'MEMORY.md']
  const hasIdentityDoc = IDENTITY_DOCS.some(doc => fs.existsSync(path.join(abs, doc)))
  if (!hasIdentityDoc) {
    violations.push({ ruleId: 'missing-readme', filePath: rootPath, message: 'Module folder has no README.md or SKILL.md' })
  }

  // Check .archui/index.yaml exists
  const indexPath = path.join(abs, '.archui', 'index.yaml')
  if (!fs.existsSync(indexPath)) {
    violations.push({ ruleId: 'missing-index', filePath: rootPath, message: 'Module folder has no .archui/index.yaml' })
    return violations // can't check submodule consistency without index
  }

  // Read index.yaml to get declared submodules
  let index: IndexYaml = {}
  let rawIndex: Record<string, unknown> = {}
  try {
    rawIndex = parseYaml(fs.readFileSync(indexPath, 'utf8')) as Record<string, unknown> ?? {}
    index = rawIndex as IndexYaml
  } catch {
    violations.push({ ruleId: 'invalid-index-yaml', filePath: indexPath, message: 'Failed to parse .archui/index.yaml as YAML' })
    return violations
  }

  // Check for forbidden 'layout' field in index.yaml
  if ('layout' in rawIndex) {
    violations.push({
      ruleId: 'index/forbidden-layout-field',
      filePath: indexPath,
      message: 'index.yaml must not contain a "layout" section — canvas layout belongs in .archui/layout.yaml',
    })
  }

  // Check .archui/layout.yaml exists
  const layoutPath = path.join(abs, '.archui', 'layout.yaml')
  if (!fs.existsSync(layoutPath)) {
    violations.push({
      ruleId: 'structure/missing-layout',
      filePath: path.join(rootPath, '.archui', 'layout.yaml'),
      message: 'missing .archui/layout.yaml — canvas layout file is required',
    })
  }

  const declaredSubmodules = new Set(Object.keys(index.submodules ?? {}))

  // Check each subfolder
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true })
  } catch {
    return violations
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name
    if (name === 'resources') continue    // allowed
    if (name === '.archui') continue      // always allowed
    if (isRoot && ROOT_HIDDEN_WHITELIST.has(name)) continue  // root whitelist

    if (!declaredSubmodules.has(name)) {
      violations.push({
        ruleId: 'undeclared-subfolder',
        filePath: path.join(rootPath, name),
        message: `Subfolder "${name}" is not declared in .archui/index.yaml submodules and is not resources/`,
      })
    }
  }

  // Check declared submodules actually exist on disk
  for (const folderName of declaredSubmodules) {
    const childAbs = path.join(abs, folderName)
    if (!fs.existsSync(childAbs) || !fs.statSync(childAbs).isDirectory()) {
      violations.push({
        ruleId: 'missing-submodule-folder',
        filePath: indexPath,
        message: `Declared submodule "${folderName}" does not exist as a directory on disk`,
      })
    }
  }

  // SPEC modules must contain exactly one HARNESS submodule; MEMORY submodule is optional (at most one)
  if (fs.existsSync(path.join(abs, 'SPEC.md'))) {
    const harnessSubmodules = [...declaredSubmodules].filter(name =>
      fs.existsSync(path.join(abs, name, 'HARNESS.md'))
    )
    const memorySubmodules = [...declaredSubmodules].filter(name =>
      fs.existsSync(path.join(abs, name, 'MEMORY.md'))
    )
    if (harnessSubmodules.length === 0) {
      violations.push({
        ruleId: 'spec/missing-harness',
        filePath: rootPath,
        message: 'SPEC module must contain exactly one HARNESS submodule',
      })
    } else if (harnessSubmodules.length > 1) {
      violations.push({
        ruleId: 'spec/multiple-harness',
        filePath: rootPath,
        message: `SPEC module must contain exactly one HARNESS submodule, but found ${harnessSubmodules.length}: ${harnessSubmodules.join(', ')}`,
      })
    }
    if (memorySubmodules.length > 1) {
      violations.push({
        ruleId: 'spec/multiple-memory',
        severity: 'warn',
        filePath: rootPath,
        message: `SPEC module should contain at most one MEMORY submodule, but found ${memorySubmodules.length}: ${memorySubmodules.join(', ')}`,
      })
    }
  }

  // Recurse into declared submodules
  for (const folderName of declaredSubmodules) {
    const childPath = path.join(rootPath, folderName)
    const childAbs2 = path.join(abs, folderName)
    if (fs.existsSync(childAbs2) && fs.statSync(childAbs2).isDirectory()) {
      violations.push(...validateStructure(childPath, false))
    }
  }

  return violations
}
