# 核心叙事（Core Narrative）

> 这是 ArchUI 项目的核心叙事锚点。所有展示材料（PPT、视频、宣传册）必须与此处的表述保持一致。

## 一句话定位

**ArchUI 是为 agentic thinking 时代设计的企业级开发知识基础设施。**

## 30 秒 Hook（Narrative 层）

2025-2026 年，我们正在经历软件工程的范式转变：从"人类写代码、AI 辅助"到"AI 写代码、人类定义意图"。

这个转变的瓶颈不在 AI 能力，而在**知识基础设施**——当前的文档系统（Confluence、Notion、README）都是为人类设计的，AI 只能勉强适配。

**ArchUI 是第一个从第一天就为 agentic thinking 设计的企业级开发知识基础设施。**

## 核心价值主张

当你的团队有 50 个仓库、10 个 agent 在并行工作时，你需要的不是"更好的 Confluence"，而是"agent-native 的知识基础设施"。

ArchUI 让 AI agent 能够：
- **可靠地导航**：通过 UUID 链接系统，跨仓库的依赖关系稳定可追踪
- **高效地理解**：通过渐进式披露，在有限的 context window 里处理大规模知识库
- **安全地协作**：通过 schema 验证，保证文档质量和 agent 行为的可预测性

## 时代背景（Why Now）

1. **Agentic engineering 的兴起**（2025-2026）
   - AI agent 从"代码补全"进化到"多步骤任务执行"
   - Claude Code、Cursor、Windsurf 等工具让 agent 成为开发主力

2. **Context window 的瓶颈**
   - 即使 Claude 有 200K context，企业级项目（50+ 仓库）仍然无法一次性加载
   - 需要新的知识组织方式来适配 agent 的导航模式

3. **文档熵增的加速**
   - 代码由 agent 生成后，文档更新的负担反而更重（因为变化更快）
   - 传统的"人工维护文档"模式已经不可持续

## 目标用户

**主战场：架构师 / Tech Lead**
- 负责 10+ 个仓库的技术决策
- 需要理解和维护跨仓库的依赖关系
- 面临技术债务和重构压力
- 需要向团队传递架构知识

**次要市场：项目主管（顺带解决）**
- 当架构文档清晰后，团队协同自然改善
- 新人 onboarding 时间缩短
- 跨团队沟通更高效

## 核心差异化

| 维度 | ArchUI | Confluence | Obsidian | Backstage |
|------|--------|-----------|----------|-----------|
| **设计原则** | Agent-native | Human-first | Personal-first | Service-first |
| **知识粒度** | 模块化 + 语义链接 | 页面 + 手动链接 | 笔记 + 双向链接 | 服务 + API catalog |
| **协作模式** | Git-based | 云端实时 | 本地 + 插件 | 云端实时 |
| **目标场景** | 企业开发知识 | 产品文档 | 个人笔记 | 平台工程 |

**我们的根本不同**：
- vs Confluence：我们是"代码级"的文档系统，不是"产品级"的协作工具
- vs Obsidian：我们是"团队级"的基础设施，不是"个人级"的笔记工具
- vs Backstage：我们是"知识层"的组织，不是"服务层"的 catalog

## 长期愿景

成为 agentic engineering 时代的标准知识基础设施——就像 Git 是代码版本控制的标准一样，ArchUI 将成为开发知识管理的标准。

## 使用规则

- 所有展示材料中的核心表述必须引用此文件，不得自行发挥
- 如果需要调整叙事，必须先更新此文件，再同步到其他材料
- 保持"Narrative 大胆 + Implementation 务实"的平衡
