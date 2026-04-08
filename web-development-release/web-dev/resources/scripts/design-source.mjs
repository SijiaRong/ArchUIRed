#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const RESOURCES_ROOT = resolve(__dirname, '..')
const REPO_ROOT = resolve(RESOURCES_ROOT, '..', '..', '..')

function toPosix(value) {
  return value.replace(/\\/g, '/')
}

export function repoPath(...segments) {
  return resolve(REPO_ROOT, ...segments)
}

export function resourcePath(...segments) {
  return resolve(RESOURCES_ROOT, ...segments)
}

export function readYamlFromRepo(relativePath) {
  const absolutePath = repoPath(relativePath)
  return parse(readFileSync(absolutePath, 'utf8'))
}

export function writeGeneratedFile(relativePath, content) {
  const absolutePath = resourcePath(relativePath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${content.trimEnd()}\n`, 'utf8')
}

export function buildGeneratedHeader({ command, provenanceLabel, provenanceValue, sources }) {
  const renderedSources = sources.map(source => ` * - ${toPosix(source)}`).join('\n')
  return [
    '/**',
    ' * AUTO-GENERATED FILE. DO NOT EDIT.',
    ` * Regenerate with: ${command}`,
    ` * ${provenanceLabel}: ${provenanceValue}`,
    ' * Sources:',
    renderedSources,
    ' */',
  ].join('\n')
}

export function repoRelativePath(absolutePath) {
  return toPosix(relative(REPO_ROOT, absolutePath))
}
