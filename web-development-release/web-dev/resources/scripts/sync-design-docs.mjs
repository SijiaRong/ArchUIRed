#!/usr/bin/env node

import { buildGeneratedHeader, readYamlFromRepo, writeGeneratedFile } from './design-source.mjs'

const SOURCES = {
  landing: 'gui/screens/landing/web-copy.yaml',
  canvas: 'gui/screens/canvas/web-copy.yaml',
  detailPanel: 'gui/components/detail-panel/web-copy.yaml',
  moduleCard: 'gui/components/primary-module-card/web-copy.yaml',
  linkRenderer: 'gui/components/link-renderer/web-semantics.yaml',
  visualOrchestration: 'gui/design-system/visual-orchestration/web-layout.yaml',
}

const landing = readYamlFromRepo(SOURCES.landing)
const canvas = readYamlFromRepo(SOURCES.canvas)
const detailPanel = readYamlFromRepo(SOURCES.detailPanel)
const moduleCard = readYamlFromRepo(SOURCES.moduleCard)
const linkRenderer = readYamlFromRepo(SOURCES.linkRenderer)
const visualOrchestration = readYamlFromRepo(SOURCES.visualOrchestration)

const contentHeader = buildGeneratedHeader({
  command: 'npm run sync:design-docs',
  provenanceLabel: 'Document snapshot curated_at',
  provenanceValue: [
    landing.provenance.curatedAt,
    canvas.provenance.curatedAt,
    detailPanel.provenance.curatedAt,
    moduleCard.provenance.curatedAt,
    linkRenderer.provenance.curatedAt,
  ].join(', '),
  sources: [
    SOURCES.landing,
    SOURCES.canvas,
    SOURCES.detailPanel,
    SOURCES.moduleCard,
    SOURCES.linkRenderer,
  ],
})

const workspaceContent = {
  landing: landing.copy,
  canvas: canvas.copy,
  detailPanel: detailPanel.copy,
  moduleCard: moduleCard.copy,
  linkRenderer: linkRenderer.semantics,
}

writeGeneratedFile(
  'src/generated/workspace-content.generated.ts',
  `${contentHeader}

export const workspaceContent = ${JSON.stringify(workspaceContent, null, 2)} as const
`,
)

const layoutHeader = buildGeneratedHeader({
  command: 'npm run sync:design-docs',
  provenanceLabel: 'Document snapshot curated_at',
  provenanceValue: visualOrchestration.provenance.curatedAt,
  sources: [SOURCES.visualOrchestration],
})

writeGeneratedFile(
  'src/generated/workspace-layout.generated.ts',
  `${layoutHeader}

export const workspaceLayout = ${JSON.stringify(visualOrchestration.layout, null, 2)} as const
`,
)
