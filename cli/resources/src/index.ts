import { Command } from 'commander'
import { runValidate } from './validate.js'
import { runInit } from './init.js'

const program = new Command()

program
  .name('archui')
  .description('ArchUI CLI — filesystem validator and module manager')
  .version('0.1.0')

program
  .command('validate [path]')
  .description('Validate filesystem conformance against ArchUI rules')
  .option('--only <validator>', 'Run only a specific validator (structure|frontmatter|links|index)')
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

program.parse()
