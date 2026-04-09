import { build } from 'esbuild'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  banner: { js: '#!/usr/bin/env node' },
  external: Object.keys(pkg.dependencies ?? {}),
  loader: {
    '.sh': 'text',
    '.md': 'text',
  },
})

console.log('CLI build complete → dist/index.js')
