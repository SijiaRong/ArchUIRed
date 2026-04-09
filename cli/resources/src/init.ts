import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as readline from 'readline'
import { fileURLToPath } from 'url'
import { execSync, spawnSync, spawn } from 'child_process'
import { parse as parseYaml } from 'yaml'
import { runValidate } from './validate.js'

import CLAUDE_CODE_DEPLOY_SH from './templates/claude-code-deploy.sh'
import CONVERT_PROJECT_PROMPT from '../../../core/agent-config/command-templates/resources/convert-project.md'
import RECONSTRUCT_PROJECT_PROMPT from '../../../core/agent-config/command-templates/resources/reconstruct-project.md'

const CURSOR_DEPLOY_SH = ''

const SKIP_DIRS = new Set([
  '.git', 'node_modules', '.archui', '.archui-backup', '.archui-temp',
  'dist', 'build', '.next', '__pycache__', 'vendor', '.cache',
  'coverage', 'out', 'tmp',
])

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentInfo {
  name: string
  detected: boolean
  installed: boolean
  deployScript: string
  sentinelCheck: (targetPath: string) => boolean
}

// ---------------------------------------------------------------------------
// Agent detection helpers
// ---------------------------------------------------------------------------

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function detectCursor(): boolean {
  if (process.platform === 'darwin' && fs.existsSync('/Applications/Cursor.app')) return true
  return commandExists('cursor')
}

function detectClaudeCode(): boolean {
  return commandExists('claude')
}

function detectCodex(): boolean {
  if (commandExists('codex')) return true
  try {
    const result = spawnSync('npm', ['list', '-g', '@openai/codex'], { stdio: 'pipe', shell: true })
    return result.status === 0
  } catch {
    return false
  }
}

function detectCopilot(): boolean {
  try {
    const result = spawnSync('code', ['--list-extensions'], { stdio: 'pipe', shell: true })
    if (result.status !== 0) return false
    const output = (result.stdout?.toString() ?? '').toLowerCase()
    return output.includes('github.copilot')
  } catch {
    return false
  }
}

function checkCursorInstalled(targetPath: string): boolean {
  return fs.existsSync(path.join(targetPath, '.cursor', 'skills', 'archui-spec', 'SKILL.md'))
}

function checkClaudeCodeInstalled(targetPath: string): boolean {
  return (
    fs.existsSync(path.join(targetPath, '.claude', 'skills', 'archui-spec', 'SKILL.md')) &&
    fs.existsSync(path.join(targetPath, '.claude', 'skills', 'archui-docs', 'SKILL.md'))
  )
}

function checkCodexInstalled(targetPath: string): boolean {
  const agentsFile = path.join(targetPath, 'AGENTS.md')
  if (!fs.existsSync(agentsFile)) return false
  try {
    const content = fs.readFileSync(agentsFile, 'utf8')
    return content.trimStart().startsWith('# ArchUI Agent Instructions')
  } catch {
    return false
  }
}

function checkCopilotInstalled(targetPath: string): boolean {
  const instructionsFile = path.join(targetPath, '.github', 'copilot-instructions.md')
  if (!fs.existsSync(instructionsFile)) return false
  try {
    const content = fs.readFileSync(instructionsFile, 'utf8')
    return content.trimStart().startsWith('# ArchUI Project Instructions')
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// UUID helpers
// ---------------------------------------------------------------------------

function generateUuid(): string {
  return crypto.randomBytes(4).toString('hex')
}

function isUuidUnique(uuid: string, targetPath: string): boolean {
  const found = findIndexYamls(targetPath)
  for (const f of found) {
    try {
      const content = fs.readFileSync(f, 'utf8')
      const parsed = parseYaml(content)
      if (parsed?.uuid === uuid) return false
    } catch {
      // ignore parse errors
    }
  }
  return true
}

function findIndexYamls(dir: string): string[] {
  const results: string[] = []
  function walk(current: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name === 'index.yaml' && current.endsWith('.archui')) {
        results.push(fullPath)
      }
    }
  }
  walk(dir)
  return results
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

function kebabToTitle(name: string): string {
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function mergeReadme(filePath: string, name: string, description: string): void {
  const frontmatter = `---\nname: ${name}\ndescription: ${description}\n---\n`

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, frontmatter, 'utf8')
    return
  }

  const existing = fs.readFileSync(filePath, 'utf8')

  if (!existing.trimStart().startsWith('---')) {
    fs.writeFileSync(filePath, frontmatter + '\n' + existing, 'utf8')
    return
  }

  const hasName = /^name:/m.test(existing)
  const hasDescription = /^description:/m.test(existing)

  if (hasName && hasDescription) {
    // complete — leave untouched
    return
  }

  // partial — patch missing fields
  let patched = existing
  if (!hasName) {
    patched = patched.replace(/^---/, `---\nname: ${name}`)
  }
  if (!hasDescription) {
    patched = patched.replace(/^---/, `---\ndescription: ${description}`)
  }
  fs.writeFileSync(filePath, patched, 'utf8')
}

function writeLayoutYaml(dotArchUiDir: string, form: 'leaf' | 'parent', uuid?: string): void {
  const layoutPath = path.join(dotArchUiDir, 'layout.yaml')
  let content: string
  if (form === 'leaf') {
    content = `nodes: {}\nviewport:\n  zoom: 1\n  pan: {x: 0, y: 0}\n`
  } else {
    if (!uuid) throw new Error('uuid required for parent layout form')
    content = `layout:\n  ${uuid}:\n    x: "0"\n    y: "0"\n`
  }
  fs.writeFileSync(layoutPath, content, 'utf8')
}

// ---------------------------------------------------------------------------
// Prompt helpers (readline-based, no new deps)
// ---------------------------------------------------------------------------

function isInteractiveTTY(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}

function isVSCodeTerminal(): boolean {
  return process.env.TERM_PROGRAM === 'vscode'
}

async function promptLine(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function promptConfirm(question: string): Promise<boolean> {
  const answer = await promptLine(`${question} [Y/n] `)
  return answer === '' || answer.toLowerCase().startsWith('y')
}

function openInBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32'  ? 'start' : 'xdg-open'
  try {
    spawnSync(cmd, [url], { stdio: 'ignore', shell: process.platform === 'win32' })
  } catch {
    // Not fatal — URL already printed to terminal
  }
}

async function promptMultiSelect(
  message: string,
  choices: Array<{ label: string; value: string; selected: boolean }>
): Promise<string[]> {
  console.log(message)
  choices.forEach((c, i) => {
    const marker = c.selected ? '(pre-selected)' : ''
    console.log(`  ${i + 1}) ${c.label} ${marker}`)
  })
  const answer = await promptLine('Enter numbers to install (comma-separated, or Enter to skip): ')
  if (!answer) return []
  const indices = answer.split(',').map((s) => parseInt(s.trim(), 10) - 1)
  return indices
    .filter((i) => i >= 0 && i < choices.length)
    .map((i) => choices[i].value)
}

// ---------------------------------------------------------------------------
// Agent setup phase
// ---------------------------------------------------------------------------

async function runAgentSetup(targetPath: string): Promise<void> {
  console.log('\nDetecting AI agents...')

  const agents: AgentInfo[] = [
    {
      name: 'Cursor',
      detected: false,
      installed: false,
      deployScript: CURSOR_DEPLOY_SH,
      sentinelCheck: checkCursorInstalled,
    },
    {
      name: 'Claude Code',
      detected: false,
      installed: false,
      deployScript: CLAUDE_CODE_DEPLOY_SH,
      sentinelCheck: checkClaudeCodeInstalled,
    },
    {
      name: 'Codex',
      detected: false,
      installed: false,
      deployScript: '',
      sentinelCheck: checkCodexInstalled,
    },
    {
      name: 'Copilot',
      detected: false,
      installed: false,
      deployScript: '',
      sentinelCheck: checkCopilotInstalled,
    },
  ]

  // Detection (errors are never fatal)
  try { agents[0].detected = detectCursor() } catch { /* skip */ }
  try { agents[1].detected = detectClaudeCode() } catch { /* skip */ }
  try { agents[2].detected = detectCodex() } catch { /* skip */ }
  try { agents[3].detected = detectCopilot() } catch { /* skip */ }

  // Plugin status check
  for (const agent of agents) {
    if (agent.detected) {
      try { agent.installed = agent.sentinelCheck(targetPath) } catch { /* skip */ }
    }
  }

  // Print summary
  console.log('\nDetected AI agents:')
  for (const agent of agents) {
    if (agent.detected) {
      const pluginStatus = agent.installed ? 'ArchUI plugin installed' : 'ArchUI plugin not installed'
      console.log(`  [✓] ${agent.name.padEnd(12)} — ${pluginStatus}`)
    } else {
      console.log(`  [ ] ${agent.name.padEnd(12)} — not detected, skipping`)
    }
  }

  const detectedNotInstalled = agents.filter((a) => a.detected && !a.installed)

  if (detectedNotInstalled.length === 0) {
    if (agents.some((a) => a.detected)) {
      console.log('\nAll detected agents already have the ArchUI plugin installed.')
    }
    return
  }

  const choices = detectedNotInstalled.map((a) => ({
    label: a.name,
    value: a.name,
    selected: false,
  }))

  const selected = await promptMultiSelect(
    '\nInstall ArchUI plugin for (enter numbers, comma-separated, or Enter to skip):',
    choices
  )

  for (const agentName of selected) {
    const agent = agents.find((a) => a.name === agentName)
    if (!agent) continue

    if (!agent.deployScript) {
      console.log(`  ⚠ No deploy script for ${agent.name}, skipping`)
      continue
    }

    try {
      console.log(`  → Installing ArchUI plugin for ${agent.name}...`)
      const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..')
      execSync('bash -s', {
        input: agent.deployScript,
        cwd: targetPath,
        stdio: ['pipe', 'inherit', 'inherit'],
        env: { ...process.env, REPO_ROOT: repoRoot },
      })
      console.log(`  ✓ ${agent.name} plugin installed`)
    } catch (err) {
      console.log(`  ⚠ Failed to install ${agent.name} plugin (non-fatal): ${(err as Error).message}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Backup & reconstruct helpers
// ---------------------------------------------------------------------------

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function removeDirContents(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    if (entry.name === '.archui-backup' || entry.name === '.archui-temp') continue
    if (entry.name === 'README.md' || entry.name === '.archui') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true })
    } else {
      fs.unlinkSync(fullPath)
    }
  }
}

async function runBackupPhase(rootPath: string): Promise<void> {
  const backupDir = path.join(rootPath, '.archui-backup')
  const tempDir = path.join(rootPath, '.archui-temp')

  if (fs.existsSync(backupDir) || fs.existsSync(tempDir)) {
    console.error('Error: .archui-backup/ or .archui-temp/ already exists. Remove them first or use a clean directory.')
    process.exit(1)
  }

  console.log('Phase 1: Backing up project files...')
  copyDirRecursive(rootPath, backupDir)
  console.log(`  ✓ Created .archui-backup/ (${countFiles(backupDir)} files)`)

  copyDirRecursive(rootPath, tempDir)
  console.log(`  ✓ Created .archui-temp/ (${countFiles(tempDir)} files)`)

  console.log('  → Removing originals from working tree...')
  removeDirContents(rootPath)
  console.log('  ✓ Working tree cleaned (only .archui/, README.md, .archui-backup/, .archui-temp/ remain)')
}

function countFiles(dir: string): number {
  let count = 0
  const walk = (d: string) => {
    const entries = fs.readdirSync(d, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name)
      if (entry.isDirectory()) walk(fullPath)
      else count++
    }
  }
  walk(dir)
  return count
}

// ---------------------------------------------------------------------------
// Conversion agent
// ---------------------------------------------------------------------------

async function runConversionAgent(rootPath: string): Promise<number> {
  let prompt = CONVERT_PROJECT_PROMPT
  prompt = prompt.replace(/\{\{project\.root\}\}/g, rootPath)

  // Detect agent CLI
  const hasClaudeCode = commandExists('claude')
  const hasCodex = detectCodex()

  if (!hasClaudeCode && !hasCodex) {
    console.log('\nNo supported agent CLI detected (claude / codex).')
    console.log('To complete conversion manually, run:')
    console.log(`  claude --dangerously-skip-permissions --add-dir "${rootPath}" -p "<prompt>"`)
    return 0
  }

  return new Promise<number>((resolve) => {
    let child: ReturnType<typeof spawn>

    if (hasClaudeCode) {
      console.log('\nInvoking Claude Code (autonomous mode)...')
      child = spawn('claude', [
        '--dangerously-skip-permissions',
        '--verbose',
        '--add-dir', rootPath,
        '-p', prompt,
        '--output-format', 'stream-json',
      ], {
        cwd: rootPath,
        stdio: ['inherit', 'pipe', 'inherit'],
        shell: false,
      })

      // Parse NDJSON stream and forward only assistant text blocks to stdout
      let buffer = ''
      child.stdout?.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const event = JSON.parse(trimmed)
            if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
              for (const block of event.message.content) {
                if (block.type === 'text') process.stdout.write(block.text)
              }
            }
          } catch {
            // Non-JSON line — forward as-is
            process.stdout.write(line + '\n')
          }
        }
      })

      child.stdout?.on('end', () => {
        // Flush any remaining partial line in the buffer
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer.trim())
            if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
              for (const block of event.message.content) {
                if (block.type === 'text') process.stdout.write(block.text)
              }
            }
          } catch {
            process.stdout.write(buffer + '\n')
          }
        }
      })
    } else {
      console.log('\nInvoking Codex (autonomous mode)...')
      child = spawn('codex', ['--full-auto', prompt], {
        cwd: rootPath,
        stdio: 'inherit',
        shell: false,
      })
    }

    child.on('close', (code) => {
      resolve(code ?? 0)
    })

    child.on('error', (err) => {
      console.error(`Agent CLI error: ${err.message}`)
      resolve(1)
    })
  })
}

// ---------------------------------------------------------------------------
// Reconstruction agent
// ---------------------------------------------------------------------------

async function runReconstructAgent(rootPath: string): Promise<number> {
  let prompt = RECONSTRUCT_PROJECT_PROMPT
  prompt = prompt.replace(/\{\{project\.root\}\}/g, rootPath)

  const hasClaudeCode = commandExists('claude')
  const hasCodex = detectCodex()

  if (!hasClaudeCode && !hasCodex) {
    console.log('\nNo supported agent CLI detected (claude / codex).')
    console.log('To complete reconstruction manually, run:')
    console.log(`  claude --dangerously-skip-permissions --add-dir "${rootPath}" -p "<prompt>"`)
    return 0
  }

  return new Promise<number>((resolve) => {
    let child: ReturnType<typeof spawn>

    if (hasClaudeCode) {
      console.log('\nInvoking Claude Code for reconstruction (autonomous mode)...')
      child = spawn('claude', [
        '--dangerously-skip-permissions',
        '--verbose',
        '--add-dir', rootPath,
        '-p', prompt,
        '--output-format', 'stream-json',
      ], {
        cwd: rootPath,
        stdio: ['inherit', 'pipe', 'inherit'],
        shell: false,
      })

      let buffer = ''
      child.stdout?.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const event = JSON.parse(trimmed)
            if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
              for (const block of event.message.content) {
                if (block.type === 'text') process.stdout.write(block.text)
              }
            }
          } catch {
            process.stdout.write(line + '\n')
          }
        }
      })

      child.stdout?.on('end', () => {
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer.trim())
            if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
              for (const block of event.message.content) {
                if (block.type === 'text') process.stdout.write(block.text)
              }
            }
          } catch {
            process.stdout.write(buffer + '\n')
          }
        }
      })
    } else {
      console.log('\nInvoking Codex for reconstruction (autonomous mode)...')
      child = spawn('codex', ['--full-auto', prompt], {
        cwd: rootPath,
        stdio: 'inherit',
        shell: false,
      })
    }

    child.on('close', (code) => {
      resolve(code ?? 0)
    })

    child.on('error', (err) => {
      console.error(`Agent CLI error: ${err.message}`)
      resolve(1)
    })
  })
}

// ---------------------------------------------------------------------------
// Main init function
// ---------------------------------------------------------------------------

export interface InitOptions {
  name?: string
  description?: string
  skipAgents?: boolean
  convert?: boolean
  reconstruct?: boolean
  openUrl?: string
}

export async function runInit(targetPath: string, options: InitOptions): Promise<void> {
  const resolvedPath = path.resolve(targetPath)

  // 1. Verify path is a writable directory
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: path does not exist: ${resolvedPath}`)
    process.exit(1)
  }

  const stat = fs.statSync(resolvedPath)
  if (!stat.isDirectory()) {
    console.error(`Error: path is not a directory: ${resolvedPath}`)
    process.exit(1)
  }

  try {
    fs.accessSync(resolvedPath, fs.constants.W_OK)
  } catch {
    console.error(`Error: path is not writable: ${resolvedPath}`)
    process.exit(1)
  }

  // 2. Agent setup phase
  if (!options.skipAgents && isInteractiveTTY()) {
    try {
      await runAgentSetup(resolvedPath)
    } catch (err) {
      // Agent setup is never fatal
      console.log(`\nAgent setup encountered an error (non-fatal): ${(err as Error).message}`)
    }
    console.log()
  }

  // 3. Check for existing .archui/index.yaml (idempotent)
  const archUiDir = path.join(resolvedPath, '.archui')
  const indexYamlPath = path.join(archUiDir, 'index.yaml')

  if (fs.existsSync(indexYamlPath)) {
    try {
      const content = fs.readFileSync(indexYamlPath, 'utf8')
      const parsed = parseYaml(content)
      const existingUuid = parsed?.uuid ?? 'unknown'
      console.log(`Already an ArchUI project (uuid: ${existingUuid}). Nothing to do.`)
    } catch {
      console.log('Already an ArchUI project. Nothing to do.')
    }
    process.exit(0)
  }

  // Determine name
  const name = options.name ?? path.basename(resolvedPath)

  // 4. Prompt for description if missing
  let description = options.description ?? ''
  if (!description) {
    if (!isInteractiveTTY()) {
      description = ''
    } else {
      description = await promptLine(`Describe this project's purpose (press Enter to skip — an agent can fill this in later): `)
    }
  }

  // 5–6. Generate unique UUID
  let uuid = generateUuid()
  let attempts = 0
  while (!isUuidUnique(uuid, resolvedPath) && attempts < 20) {
    uuid = generateUuid()
    attempts++
  }

  // 7. Write README.md (apply merge rule — never overwrite existing content)
  const readmePath = path.join(resolvedPath, 'README.md')
  mergeReadme(readmePath, name, description)

  // 8. Write .archui/index.yaml
  fs.mkdirSync(archUiDir, { recursive: true })
  const indexYamlContent = `schema_version: 1\nuuid: "${uuid}"\nsubmodules: {}\nlinks: []\n`
  fs.writeFileSync(indexYamlPath, indexYamlContent, 'utf8')
  writeLayoutYaml(archUiDir, 'leaf')

  // 9. Stage files if inside a git repo
  const gitDir = path.join(resolvedPath, '.git')
  if (fs.existsSync(gitDir)) {
    try {
      execSync('git add README.md .archui/index.yaml .archui/layout.yaml', { cwd: resolvedPath, stdio: 'ignore' })
    } catch {
      // Not fatal — git may not be configured
    }
  }

  // 10. Print success
  console.log(`Initialized ArchUI project: ${name} (uuid: ${uuid})`)

  // 11. Conversion phase (--convert)
  if (options.convert) {
    console.log('\nInvoking conversion agent...')
    const agentExitCode = await runConversionAgent(resolvedPath)
    if (agentExitCode !== 0) {
      console.error(`\nAgent invocation failed (exit code ${agentExitCode}).`)
      process.exit(3)
    }
  }

  // 12. Reconstruction phase (--reconstruct)
  if (options.reconstruct) {
    console.log('\nStarting project reconstruction...')
    await runBackupPhase(resolvedPath)
    console.log('\nPhase 1 complete. Invoking reconstruction agent for phases 2-7...')
    const agentExitCode = await runReconstructAgent(resolvedPath)
    if (agentExitCode !== 0) {
      console.error(`\nReconstruction agent failed (exit code ${agentExitCode}).`)
      console.log('.archui-backup/ is preserved — your original files are safe.')
      process.exit(3)
    }
  }

  // 13. Post-init: validate then optionally open browser
  const { exitCode: validateExit } = runValidate(resolvedPath)
  if (validateExit > 0) {
    console.log('\nValidation found errors. Fix them before opening ArchUI.')
  } else {
    const url = options.openUrl
      ?? process.env.ARCHUI_GUI_URL
      ?? 'https://actionandlink.com/archui'

    if (isVSCodeTerminal()) {
      console.log(`\n✔ Validation passed. Open ArchUI: ${url}`)
    } else if (isInteractiveTTY()) {
      const yes = await promptConfirm('\n✔ Validation passed. Open ArchUI in browser?')
      if (yes) openInBrowser(url)
    }
  }
}
