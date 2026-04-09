import { Command } from 'commander'
import { runValidate } from './validate.js'
import { runInit } from './init.js'
import { runClean } from './clean.js'
import { runDelete } from './delete.js'
import { runCopy } from './copy.js'
import { runPaste } from './paste.js'

const program = new Command()

program
  .name('archui')
  .description('ArchUI CLI — filesystem validator and module manager')
  .version('0.2.0')

program
  .command('validate [path]')
  .description('Validate filesystem conformance against ArchUI rules')
  .option('--only <validator>', 'Run only a specific validator (structure|frontmatter|links|index|layout)')
  .action((targetPath: string | undefined, options: { only?: string }) => {
    const root = targetPath ?? process.cwd()
    const { exitCode } = runValidate(root, options.only)
    process.exit(exitCode)
  })

program
  .command('init [path]')
  .description('Initialize a new ArchUI project at the given path')
  .option('--name <name>', 'Module name for README.md frontmatter')
  .option('--description <desc>', 'One-sentence summary for README.md frontmatter')
  .option('--skip-agents', 'Skip agent detection and plugin installation phase')
  .option('--convert', 'Convert the existing project tree into ArchUI modules via agent invocation')
  .action(async (targetPath: string | undefined, options: { name?: string; description?: string; skipAgents?: boolean; convert?: boolean }) => {
    const root = targetPath ?? process.cwd()
    await runInit(root, options)
  })

program
  .command('copy <uuid>')
  .description('Copy a module path to the system clipboard by UUID')
  .action((uuid: string) => {
    const root = process.cwd()
    runCopy(root, uuid)
  })

program
  .command('clean <target>')
  .description('Remove dangling UUID references from a module subtree (dry-run by default)')
  .option('--apply', 'Actually modify files instead of dry-run')
  .action((target: string, options: { apply?: boolean }) => {
    const root = process.cwd()
    runClean(root, target, options.apply ?? false)
  })

program
  .command('delete <uuid>')
  .description('Delete a module by UUID and clean up all dangling references')
  .option('--force', 'Skip interactive confirmation prompt')
  .action(async (uuid: string, options: { force?: boolean }) => {
    const root = process.cwd()
    await runDelete(root, uuid, options.force ?? false)
  })

program
  .command('paste')
  .description('Paste a copied module from clipboard into the current workspace')
  .option('--into <target>', 'Target module UUID or path to paste into (default: cwd)')
  .action(async (options: { into?: string }) => {
    const root = process.cwd()
    await runPaste(root, options.into)
  })

program.parse()
