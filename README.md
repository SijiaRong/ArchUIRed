---
name: ArchUI
description: "开发知识编排引擎 — 为 agentic engineering 时代设计"
---

# ArchUI

**为 agentic engineering 时代设计的开发知识编排引擎。**

## The Problem

2025-2026 年，软件工程正在经历范式转变：从"人类写代码、AI 辅助"到"AI 写代码、人类定义意图"。这个转变的瓶颈不在 AI 能力，而在**知识基础设施**。

当前的文档系统（Confluence、Notion、README）都是为人类设计的，AI agent 只能勉强适配：

- **跨仓库依赖关系不清**：50 个微服务仓库，架构师需要手动打开 10+ 个文档才能理解依赖关系
- **知识传承困难**：新人平均需要 3-6 个月才能理解系统全貌，这期间几乎没有产出
- **文档持续腐烂**：架构文档平均滞后实际代码 3-6 个月，agent 无法信任过时的信息
- **Agent 导航困境**：即使有 200K context window，agent 仍然无法可靠地在大型项目中导航和推理

## The Solution

ArchUI 是第一个从第一天就为 agentic engineering 设计的开发知识编排引擎：

- **UUID 链接系统**：跨仓库的关系通过 UUID 稳定表达，不受重命名影响，agent 可以可靠地遍历依赖图
- **渐进式披露**：description（一句话）→ README body（详细）→ resources（代码），三层信息密度适配有限的 context window
- **Schema 验证**：CLI 验证器保证文档结构一致性，agent 行为可预测
- **Git-based 协作**：所有变更通过 git 追踪，和代码用同一套工作流
- **双界面设计**：
  - **GUI (Canvas)** — 人类通过节点式可视化画布操作
  - **CLI** — Agent 通过命令行工具验证和修改

**文件系统是唯一真理来源。** AI agent 可以直接修改文件和文件夹；GUI 和 CLI 是同一结构的不同界面。

## Filesystem Structure

Every module is a folder. Every folder contains a `README.md` (human-readable identity) and a `.archui/` directory (structural metadata). The structure is infinitely nestable:

```
<project>/
├── .archui/
│   └── index.yaml          # root module metadata (uuid, submodules map, links)
├── README.md               # name + description only
├── <moduleA>/
│   ├── .archui/
│   │   └── index.yaml      # moduleA metadata
│   ├── README.md
│   ├── <submoduleA1>/
│   │   ├── .archui/
│   │   │   └── index.yaml
│   │   └── README.md
│   └── resources/          # optional: code, videos, any reference material
└── <moduleB>/
    ├── .archui/
    │   └── index.yaml
    ├── README.md
    └── resources/
```

### README.md Format

Each `README.md` contains only human-readable identity fields — just `name` and `description`:

```markdown
---
name: Module A
description: One-sentence summary loaded into agent context by default.
---

## Overview

Full prose description of this module...
```

### .archui/index.yaml Format

Each module's `.archui/index.yaml` contains all structural metadata for that module:

```yaml
schema_version: 1
uuid: a1b2c3d4
submodules:                 # direct children: folder-name → child uuid
  submoduleA1: e5f6g7h8
  submoduleA2: f9g0h1i2
links:
  - uuid: b3c4d5e6
    relation: depends-on
    description: "Why this dependency exists"
  - uuid: c5d6e7f8
    relation: implements
    description: "What interface or contract this fulfills"
```

**Key design decisions**:

- **UUID stability**: Links use UUIDs, not file paths. Renaming or moving a module does not break links.
- **Relation semantics**: Links carry meaning (`depends-on`, `implements`, `extends`). Agents can reason about the graph structure.
- **Separation of concerns**: `README.md` is for humans (prose), `.archui/index.yaml` is for structure (machine-readable).

## Progressive Disclosure (渐进式披露)

Agents load knowledge in three layers:

1. **description** (from README frontmatter) — one sentence, always loaded
2. **README body** — full prose, loaded on demand
3. **resources/** — code, diagrams, videos, loaded only when needed

This design respects context window limits while allowing deep exploration.

## CLI

The CLI validates structure, runs agents, and propagates changes:

```bash
# Validate all modules conform to ArchUI schema
archui validate .

# Regenerate all UUIDs (useful after forking)
archui uuid-regenerate .

# Run an agent task on a module
archui agent --module ./path/to/module --task "update dependencies"

# Propagate changes across linked modules
archui sync --from ./moduleA --relation depends-on
```

## GUI (Canvas)

The GUI is a node-based visual canvas where:

- Each module is a card showing `name` and `description`
- Links between modules are edges with relation labels
- Drag-and-drop to create new modules or relink
- Click to expand and edit README body
- All edits write directly to the filesystem

The GUI is built with:
- **Web**: React + Canvas API
- **Desktop**: Electron wrapper
- **Mobile**: React Native (iOS/Android)

Design files are in `gui/design-system/` and reference the Figma file `beEbYQhz9LBLHrAj2eGyft`.

## Use Cases

### For Architects / Tech Leads

- Map dependencies across 50+ microservice repositories
- Understand "what breaks if I change this service?"
- Onboard new team members with a visual knowledge graph
- Document architectural decisions with stable links

### For AI Agents

- Navigate large codebases without loading everything into context
- Follow `depends-on` links to understand system boundaries
- Verify changes don't violate architectural constraints
- Generate documentation that stays in sync with code

### For Teams

- Git-based workflow: all changes are versioned and reviewable
- Schema validation prevents documentation rot
- Progressive disclosure keeps context manageable
- Cross-repository knowledge lives in one place

## Forking This Project

If you fork ArchUI to build your own system, replace the following project-specific values:

### Figma design file
All GUI spec files reference the ArchUI Figma file key `beEbYQhz9LBLHrAj2eGyft`. Replace it with your own file key in these locations:

```
gui/design-system/figma-integration/resources/mcp-reference.md   ← start here, has setup instructions
gui/design-system/foundations/README.md
gui/screens/canvas/resources/layout-and-states.md
gui/screens/landing/resources/layout-and-interactions.md
gui/components/detail-panel/resources/visual-spec.md
gui/components/navigation/breadcrumb/resources/visual-spec.md
gui/components/link-renderer/port-edge/resources/routing-spec.md
gui/components/primary-module-card/*/resources/visual-spec.md     ← 5 files
```

Your Figma file key is the alphanumeric segment in your file URL:
`https://www.figma.com/design/<file-key>/Your-File-Name`

### App identifiers
| Platform | Location | Value to replace |
|----------|----------|-----------------|
| Electron | `electron-development-release/electron-release/README.md` | `com.archui.desktop` |
| iOS | `ios-development-release/ios-release/README.md` | `ArchUI Development` / `ArchUI Distribution` signing identities |
| Android | `android-development-release/android-release/README.md` | `ARCHUI_KEYSTORE_*` environment variable names |

### Docker image namespace
`web-development-release/web-release/resources/deploy.sh` uses `archui/web-server` as the Docker Hub image name. Replace with your own namespace.

### Module UUIDs
Every `.archui/index.yaml` contains UUIDs that identify modules within this repository. If you fork and maintain a separate ArchUI project, regenerate all UUIDs to avoid collision with the upstream project:

```bash
# After cloning, regenerate UUIDs with the CLI
node cli/resources/dist/index.js uuid-regenerate .
```
