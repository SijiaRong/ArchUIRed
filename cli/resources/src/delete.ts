import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { findModuleByUuid } from './utils.js'
import { runClean } from './clean.js'

export async function runDelete(root: string, uuid: string, force: boolean): Promise<void> {
  const absRoot = path.resolve(root)

  const targetPath = findModuleByUuid(absRoot, uuid)
  if (!targetPath) {
    console.error(`Error: no module with UUID "${uuid}" found under ${absRoot}`)
    process.exit(1)
  }

  if (path.resolve(targetPath) === path.resolve(absRoot)) {
    console.error('Error: cannot delete the project root module')
    process.exit(1)
  }

  if (!force) {
    const relativePath = path.relative(absRoot, targetPath)
    const confirmed = await confirm(`Delete module "${uuid}" at ${relativePath}? This cannot be undone. [y/N] `)
    if (!confirmed) {
      console.log('Cancelled.')
      process.exit(2)
    }
  }

  console.log(`Deleting ${path.relative(absRoot, targetPath)}/...`)
  fs.rmSync(targetPath, { recursive: true, force: true })

  console.log('Cleaning dangling references...')
  runClean(absRoot, '.', true)

  console.log(`Done. Module ${uuid} deleted.`)
}

function confirm(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}
