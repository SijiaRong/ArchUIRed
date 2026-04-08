#!/usr/bin/env node

import { buildGeneratedHeader, readYamlFromRepo, writeGeneratedFile } from './design-source.mjs'

const TOKEN_EXPORT_PATH = 'gui/design-system/foundations/web-token-export.yaml'
const snapshot = readYamlFromRepo(TOKEN_EXPORT_PATH)

function renderTheme(selector, theme) {
  const lines = [selector, '{', `  color-scheme: ${theme.colorScheme};`]
  for (const [name, value] of Object.entries(theme.vars)) {
    lines.push(`  --${name}: ${value};`)
  }
  lines.push('}')
  return lines.join('\n')
}

const header = buildGeneratedHeader({
  command: 'npm run sync:figma',
  provenanceLabel: 'Figma snapshot exported_at',
  provenanceValue: snapshot.provenance.exportedAt,
  sources: [TOKEN_EXPORT_PATH, ...snapshot.provenance.sources],
})

const content = [
  header,
  '',
  renderTheme(':root', snapshot.themes.light),
  '',
  renderTheme(":root[data-theme='dark']", snapshot.themes.dark),
].join('\n')

writeGeneratedFile('src/design-tokens.generated.css', content)
