---
name: ArchUI
description: "Agent-native 的模块化知识编排引擎 — 让 AI 可靠导航、高效理解、安全协作"
---

# ArchUI

**Agent-Native Modular Knowledge Orchestration Engine**

为 agentic thinking 时代设计的模块化知识编排引擎。让工作知识可维护、可复用、可生成。

> *Orchestrate once, generate everywhere.*

## The Problem

2025-2026 年，软件工程正在经历范式转变：从"人类写代码、AI 辅助"到"AI 写代码、人类定义意图"。这个转变的瓶颈不在 AI 能力，而在**知识基础设施**——项目知识层越来越复杂，知识散落在代码和文档中，越积越乱，AI 也读不动。

当前的文档系统（Confluence、Notion、README）都是为人类设计的，AI agent 只能勉强适配：

- **跨仓库依赖关系不清**：60 个微服务仓库，架构师需要手动打开 10+ 个文档、在 Slack/Notion/Confluence 中搜索历史讨论，关键的设计决策可能只存在于已离职工程师的脑子里
- **知识传承困难**：新人平均需要 3-6 个月才能理解系统全貌，这期间几乎没有产出；等他理解了，架构可能已经变了
- **文档持续腐烂**：架构文档平均滞后实际代码 3-6 个月，跨团队对齐每周消耗 5-10 小时会议时间
- **Agent 导航困境**：即使有 200K context window，企业级项目（50+ 仓库）仍然无法一次性加载；agent 做"局部最优"却破坏全局一致性

**根本缺陷**：这些工具都是为"人类阅读"设计的。在 agentic engineering 时代，知识基础设施必须从第一天就为 agent 设计。

## The Solution

ArchUI 将知识结构化为可复用模块——每个模块独立可维护，AI 按需加载，直接生成代码。

**核心能力**：

- **可靠地导航**：UUID 链接系统让跨仓库的依赖关系稳定可追踪，不受重命名影响
- **高效地理解**：渐进式披露（description → README body → resources）适配有限的 context window
- **安全地协作**：Schema 验证保证文档质量和 agent 行为的可预测性

**三大亮点**：

| 亮点 | 说明 |
|------|------|
| **一键 Skills 化** | 将知识文档变成可复用、相关联的 Skills 模块 |
| **文档即编排** | 编排知识模块就是编排代码——改 Skills 即改代码 |
| **模块广场** | 发布、发现、替换、组合——Skills 模块的 npm |

**文件系统是唯一真理来源。** AI agent 直接修改文件和文件夹；GUI 和 CLI 是同一结构的不同界面。

## Why Now

1. **Agentic engineering 的兴起**：AI agent 从"代码补全"进化到"多步骤任务执行"，但知识基础设施还停留在"人类阅读"时代
2. **Context window 的瓶颈**：企业级项目（50+ 仓库）无法一次性加载，需要结构化的知识组织来适配 agent 的导航模式
3. **文档熵增的加速**：代码由 agent 生成后变化更快，传统"人工维护文档"模式不可持续
4. **企业 AI 采用率上升**：越来越多企业发现"AI 不理解我们的系统架构"成为瓶颈

## Competitive Landscape

| 维度 | ArchUI | Confluence | Obsidian | Backstage |
|------|--------|-----------|----------|-----------|
| **设计原则** | Agent-native | Human-first | Personal-first | Service-first |
| **知识粒度** | 模块化 + 语义链接 | 页面 + 手动链接 | 笔记 + 双向链接 | 服务 + API catalog |
| **跨仓库链接** | UUID 系统，稳定不变 | 手动维护超链接 | 手动维护 wikilink | Service catalog |
| **结构化约束** | Schema 验证 + CLI | 自由文本 | 自由 Markdown | YAML schema |
| **渐进式披露** | 三层信息密度 | 平铺内容 | 平铺内容 | 部分支持 |
| **协作模式** | Git-based | 云端实时 | 本地 + 插件 | 云端实时 |

**根本不同**：
- vs **Confluence**：我们解决"人与 agent 的协作"，不是"人与人的协作"
- vs **Obsidian**：我们是团队级基础设施，不是个人级笔记工具
- vs **Backstage**：我们是知识图谱，不是服务目录

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
- **Web**: React + React Flow + Vite
- **Desktop**: Electron wrapper
- **Mobile**: React Native (iOS/Android)

Design files are in `gui/design-system/` and reference the Figma file `beEbYQhz9LBLHrAj2eGyft`.

## Vision

成为 agentic engineering 时代的标准知识编排引擎——就像 Git 是代码版本控制的标准一样，ArchUI 将成为开发知识管理的标准。

**Roadmap**:
1. **Phase 1 — 代码编排**：模块化知识结构 + 节点式画布 + CLI 验证
2. **Phase 2 — 模块广场**：发布、发现、替换社区模块，一键替换 + AI 重生成
3. **Phase 3 — 创意编排**：从代码扩展到更广泛的知识编排场景

## Use Cases

### For Architects / Tech Leads（主战场）

- 管理 10+ 个仓库的跨仓库依赖关系，理解"改一个服务会影响哪些下游系统"
- 通过 UUID 链接和语义关系（depends-on、implements、extends）建立可推理的架构知识图谱
- 将架构知识结构化为 Skills 模块，新人通过模块树快速理解系统全貌
- 所有架构决策版本化，可追溯、可审查

### For AI Agents

- 通过渐进式披露在有限 context window 中高效导航大规模知识库
- 沿 `depends-on` 链接遍历系统边界，避免"局部最优破坏全局一致性"
- Schema 验证保证 agent 行为可预测，减少幻觉和错误
- 直接修改文件系统，改 Skills 即改代码

### For Teams

- Git-based 工作流：所有变更版本化，可审查
- Schema 验证防止文档腐烂
- 模块广场：发布、发现、替换、组合——Knowledge 模块的 npm
- 跨平台一致体验（Web / Desktop / Mobile）

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
