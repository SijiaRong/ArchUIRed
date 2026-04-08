#!/usr/bin/env node

import { spawnSync } from 'child_process'
import { resourcePath } from './design-source.mjs'

const generatedPaths = [
  'src/design-tokens.generated.css',
  'src/generated/workspace-content.generated.ts',
  'src/generated/workspace-layout.generated.ts',
]

function runNodeScript(scriptName) {
  const result = spawnSync(process.execPath, [resourcePath('scripts', scriptName)], {
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

runNodeScript('sync-figma.mjs')
runNodeScript('sync-design-docs.mjs')

const diffResult = spawnSync('git', ['diff', '--exit-code', '--', ...generatedPaths], {
  stdio: 'inherit',
})

if (diffResult.status !== 0) {
  console.error('[verify-design-sync] Generated files are out of date. Run npm run sync:figma and npm run sync:design-docs, then commit the results.')
  process.exit(diffResult.status ?? 1)
}

console.log('[verify-design-sync] Generated design artifacts are in sync.')
