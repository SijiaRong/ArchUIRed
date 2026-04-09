import { validateStructure } from './validators/structure.js'
import { validateFrontmatter } from './validators/frontmatter.js'
import { validateLinks } from './validators/links.js'
import { validateIndexSync } from './validators/indexSync.js'
import { validateLayout } from './validators/layout.js'
import type { Violation } from './types.js'

export function runValidate(targetPath: string, only?: string): { violations: Violation[]; exitCode: number } {
  let violations: Violation[] = []

  if (!only || only === 'structure') {
    violations.push(...validateStructure(targetPath))
  }
  if (!only || only === 'frontmatter') violations.push(...validateFrontmatter(targetPath))
  if (!only || only === 'links')       violations.push(...validateLinks(targetPath))
  if (!only || only === 'index')       violations.push(...validateIndexSync(targetPath))
  if (!only || only === 'layout')      violations.push(...validateLayout(targetPath))

  const errors = violations.filter(v => v.severity !== 'warn')
  const warnings = violations.filter(v => v.severity === 'warn')

  for (const v of warnings) {
    console.log(`WARN   [${v.ruleId}]  ${v.filePath}  ${v.message}`)
  }
  for (const v of errors) {
    console.log(`ERROR  [${v.ruleId}]  ${v.filePath}  ${v.message}`)
  }

  if (violations.length === 0) {
    console.log('Validation complete: all checks passed.')
  } else {
    const parts: string[] = []
    if (errors.length > 0) parts.push(`${errors.length} error(s)`)
    if (warnings.length > 0) parts.push(`${warnings.length} warning(s)`)
    console.log(`Validation complete: ${parts.join(', ')}.`)
  }

  return { violations, exitCode: Math.min(errors.length, 127) }
}
