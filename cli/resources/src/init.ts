import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as readline from 'readline'
import { execSync, spawnSync, spawn } from 'child_process'
import { parse as parseYaml } from 'yaml'
import { runValidate } from './validate.js'

import CONVERT_PROJECT_PROMPT from '../../../core/agent-config/command-templates/resources/convert-project.md'
import RECONSTRUCT_PROJECT_PROMPT from '../../../core/agent-config/command-templates/resources/reconstruct-project.md'

// Skill templates - archui-spec
import SKILL_ARCHUI_SPEC from '../../../core/agent-config/skill-templates/resources/archui-spec/SKILL.md'
import SKILL_ARCHUI_SPEC_CLI_USAGE from '../../../core/agent-config/skill-templates/resources/archui-spec/cli-usage.md'

// Skill templates - archui-docs
import SKILL_ARCHUI_DOCS from '../../../core/agent-config/skill-templates/resources/archui-docs/SKILL.md'
import SKILL_ARCHUI_DOCS_FRONTMATTER from '../../../core/agent-config/skill-templates/resources/archui-docs/frontmatter-rules.md'
import SKILL_ARCHUI_DOCS_QUALITY from '../../../core/agent-config/skill-templates/resources/archui-docs/quality-checklist.md'
import SKILL_ARCHUI_DOCS_READ_MODULE from '../../../core/agent-config/skill-templates/resources/archui-docs/read-module.md'
import SKILL_ARCHUI_DOCS_READ_SPEC from '../../../core/agent-config/skill-templates/resources/archui-docs/read-spec.md'
import SKILL_ARCHUI_DOCS_WRITE_HARNESS from '../../../core/agent-config/skill-templates/resources/archui-docs/write-harness.md'
import SKILL_ARCHUI_DOCS_WRITE_INDEX from '../../../core/agent-config/skill-templates/resources/archui-docs/write-index.md'
import SKILL_ARCHUI_DOCS_WRITE_LAYOUT from '../../../core/agent-config/skill-templates/resources/archui-docs/write-layout.md'
import SKILL_ARCHUI_DOCS_WRITE_MEMORY from '../../../core/agent-config/skill-templates/resources/archui-docs/write-memory.md'
import SKILL_ARCHUI_DOCS_WRITE_README from '../../../core/agent-config/skill-templates/resources/archui-docs/write-readme.md'
import SKILL_ARCHUI_DOCS_WRITE_SPEC from '../../../core/agent-config/skill-templates/resources/archui-docs/write-spec.md'

// Rule templates
import RULE_COMMITS from '../../../core/agent-config/rule-templates/resources/archui-spec/commits/README.md'
import RULE_CONTEXT_LOADING from '../../../core/agent-config/rule-templates/resources/archui-spec/context-loading/README.md'
import RULE_RESOURCES from '../../../core/agent-config/rule-templates/resources/archui-spec/resources/README.md'
import RULE_SPEC_FORMAT from '../../../core/agent-config/rule-templates/resources/archui-spec/spec-format/README.md'
import RULE_SYNC from '../../../core/agent-config/rule-templates/resources/archui-spec/sync/README.md'
import RULE_UUID from '../../../core/agent-config/rule-templates/resources/archui-spec/uuid/README.md'
import RULE_VALIDATION from '../../../core/agent-config/rule-templates/resources/archui-spec/validation/README.md'

const SKIP_DIRS = new Set([
  '.git', 'node_modules', '.archui', '.archui-backup', '.archui-temp',
  'dist', 'build', '.next', '__pycache__', 'vendor', '.cache',
  'coverage', 'out', 'tmp',
])

// ---------------------------------------------------------------------------
// Terminal spinner (zero-dep, ANSI-based)
// ---------------------------------------------------------------------------

class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private index = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private startTime = 0
  private message: string
  private isTTY: boolean

  constructor(message: string) {
    this.message = message
    this.isTTY = Boolean(process.stdout.isTTY)
  }

  get running(): boolean {
    return this.timer !== null
  }

  start(): void {
    if (this.timer) return
    this.startTime = Date.now()
    if (!this.isTTY) return
    process.stdout.write('\x1B[?25l')
    this.timer = setInterval(() => {
      const frame = this.frames[this.index % this.frames.length]
      const elapsed = this.formatElapsed()
      process.stdout.write(`\r\x1B[2K${frame} ${this.message} ${elapsed}`)
      this.index++
    }, 80)
  }

  update(message: string): void {
    this.message = message
  }

  stop(finalMessage?: string): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.isTTY) {
      process.stdout.write('\r\x1B[2K')
      process.stdout.write('\x1B[?25h')
    }
    if (finalMessage) console.log(finalMessage)
  }

  clearLine(): void {
    if (this.isTTY) process.stdout.write('\r\x1B[2K')
  }

  private formatElapsed(): string {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `(${m}m ${s}s)` : `(${s}s)`
  }
}

function friendlyToolName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('read')) return 'Reading files'
  if (lower.includes('write') || lower.includes('create')) return 'Writing files'
  if (lower.includes('shell') || lower.includes('bash') || lower.includes('execute')) return 'Running command'
  if (lower.includes('grep') || lower.includes('search') || lower.includes('glob')) return 'Searching'
  if (lower.includes('edit') || lower.includes('strreplace')) return 'Editing files'
  if (lower.includes('list')) return 'Listing files'
  return `Calling ${name}`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentInfo {
  name: string
  detected: boolean
  installed: boolean
  flavor: 'claude' | 'cursor' | null
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
// Agent plugin deploy (pure JS, no shell scripts)
// ---------------------------------------------------------------------------

function writeTemplate(basePath: string, relativePath: string, content: string): void {
  const fullPath = path.join(basePath, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function deployAgentPlugin(targetPath: string, flavor: 'claude' | 'cursor'): void {
  const prefix = flavor === 'claude' ? '.claude' : '.cursor'
  const dest = path.join(targetPath, prefix, 'skills')

  // archui-spec skill
  writeTemplate(dest, 'archui-spec/SKILL.md', SKILL_ARCHUI_SPEC)
  writeTemplate(dest, 'archui-spec/cli-usage.md', SKILL_ARCHUI_SPEC_CLI_USAGE)

  // archui-spec rules
  const rules: Record<string, string> = {
    'commits': RULE_COMMITS,
    'context-loading': RULE_CONTEXT_LOADING,
    'resources': RULE_RESOURCES,
    'spec-format': RULE_SPEC_FORMAT,
    'sync': RULE_SYNC,
    'uuid': RULE_UUID,
    'validation': RULE_VALIDATION,
  }
  for (const [dir, content] of Object.entries(rules)) {
    writeTemplate(dest, `archui-spec/rules/${dir}/README.md`, content)
  }

  // archui-docs skill
  const docs: Record<string, string> = {
    'SKILL.md': SKILL_ARCHUI_DOCS,
    'frontmatter-rules.md': SKILL_ARCHUI_DOCS_FRONTMATTER,
    'quality-checklist.md': SKILL_ARCHUI_DOCS_QUALITY,
    'read-module.md': SKILL_ARCHUI_DOCS_READ_MODULE,
    'read-spec.md': SKILL_ARCHUI_DOCS_READ_SPEC,
    'write-harness.md': SKILL_ARCHUI_DOCS_WRITE_HARNESS,
    'write-index.md': SKILL_ARCHUI_DOCS_WRITE_INDEX,
    'write-layout.md': SKILL_ARCHUI_DOCS_WRITE_LAYOUT,
    'write-memory.md': SKILL_ARCHUI_DOCS_WRITE_MEMORY,
    'write-readme.md': SKILL_ARCHUI_DOCS_WRITE_README,
    'write-spec.md': SKILL_ARCHUI_DOCS_WRITE_SPEC,
  }
  for (const [name, content] of Object.entries(docs)) {
    writeTemplate(dest, `archui-docs/${name}`, content)
  }

  // commands
  writeTemplate(dest, 'archui-spec/commands/convert-project.md', CONVERT_PROJECT_PROMPT)
  writeTemplate(dest, 'archui-spec/commands/reconstruct-project.md', RECONSTRUCT_PROJECT_PROMPT)
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
      flavor: 'cursor',
      sentinelCheck: checkCursorInstalled,
    },
    {
      name: 'Claude Code',
      detected: false,
      installed: false,
      flavor: 'claude',
      sentinelCheck: checkClaudeCodeInstalled,
    },
    {
      name: 'Codex',
      detected: false,
      installed: false,
      flavor: null,
      sentinelCheck: checkCodexInstalled,
    },
    {
      name: 'Copilot',
      detected: false,
      installed: false,
      flavor: null,
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

    if (!agent.flavor) {
      console.log(`  ⚠ No deploy support for ${agent.name}, skipping`)
      continue
    }

    try {
      console.log(`  → Installing ArchUI plugin for ${agent.name}...`)
      deployAgentPlugin(targetPath, agent.flavor)
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
// Agent invocation with progress spinner
// ---------------------------------------------------------------------------

function spawnClaudeWithProgress(
  prompt: string,
  cwd: string,
  label: string,
): Promise<number> {
  const spinner = new Spinner(`${label}: Agent starting...`)
  spinner.start()

  return new Promise<number>((resolve) => {
    const child = spawn('claude', [
      '--dangerously-skip-permissions',
      '--verbose',
      '--add-dir', cwd,
      '-p', prompt,
      '--output-format', 'stream-json',
    ], {
      cwd,
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: false,
    })

    let buffer = ''

    function processEvent(event: any): void {
      if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
        for (const block of event.message.content) {
          if (block.type === 'text') {
            spinner.clearLine()
            process.stdout.write(block.text)
            spinner.update(`${label}: Agent thinking...`)
          } else if (block.type === 'tool_use') {
            spinner.update(`${label}: ${friendlyToolName(block.name)}...`)
          }
        }
      } else if (event.type === 'result') {
        const cost = event.cost_usd != null ? ` ($${Number(event.cost_usd).toFixed(4)})` : ''
        spinner.stop(`✓ ${label} complete${cost}`)
      }
    }

    function processLines(lines: string[]): void {
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          processEvent(JSON.parse(trimmed))
        } catch {
          spinner.clearLine()
          process.stdout.write(line + '\n')
        }
      }
    }

    child.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      processLines(lines)
    })

    child.stdout?.on('end', () => {
      if (buffer.trim()) {
        processLines([buffer])
        buffer = ''
      }
    })

    child.on('close', (code) => {
      spinner.stop()
      resolve(code ?? 0)
    })

    child.on('error', (err) => {
      spinner.stop()
      console.error(`Agent CLI error: ${err.message}`)
      resolve(1)
    })
  })
}

async function runConversionAgent(rootPath: string): Promise<number> {
  let prompt = CONVERT_PROJECT_PROMPT
  prompt = prompt.replace(/\{\{project\.root\}\}/g, rootPath)

  const hasClaudeCode = commandExists('claude')
  const hasCodex = detectCodex()

  if (!hasClaudeCode && !hasCodex) {
    console.log('\nNo supported agent CLI detected (claude / codex).')
    console.log('To complete conversion manually, run:')
    console.log(`  claude --dangerously-skip-permissions --add-dir "${rootPath}" -p "<prompt>"`)
    return 0
  }

  if (hasClaudeCode) {
    console.log('\nInvoking Claude Code (autonomous mode)...')
    return spawnClaudeWithProgress(prompt, rootPath, 'Conversion')
  }

  console.log('\nInvoking Codex (autonomous mode)...')
  return new Promise<number>((resolve) => {
    const child = spawn('codex', ['--full-auto', prompt], {
      cwd: rootPath,
      stdio: 'inherit',
      shell: false,
    })
    child.on('close', (code) => resolve(code ?? 0))
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

  if (hasClaudeCode) {
    console.log('\nInvoking Claude Code for reconstruction (autonomous mode)...')
    return spawnClaudeWithProgress(prompt, rootPath, 'Reconstruction')
  }

  console.log('\nInvoking Codex for reconstruction (autonomous mode)...')
  return new Promise<number>((resolve) => {
    const child = spawn('codex', ['--full-auto', prompt], {
      cwd: rootPath,
      stdio: 'inherit',
      shell: false,
    })
    child.on('close', (code) => resolve(code ?? 0))
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
