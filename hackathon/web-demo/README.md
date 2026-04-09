---
name: Web Demo
description: "ArchUI Web 版本 Demo 规划 — 画布编排 + 模块广场 + 一键替换，黑客松核心展示方案"
---

## 概述

Web Demo 模块规划 ArchUI 的 Web 版本实现方案，围绕两个核心产品支柱构建：

1. **画布编排** — React Flow 节点画布，可视化编排知识模块关系
2. **模块广场** — 共享、发现、一键替换模块，同一功能多种样式

## 核心用户故事

用户项目里有个丑陋的登录页面模块 → 在广场发现精美的登录模块 → 一键替换 → AI agent 根据新模块 spec 重新生成代码 → 立刻得到漂亮的登录页面。

## 子模块

| 模块 | 职责 |
|---|---|
| `canvas-editor` | Phase 1 画布编排器 — React Flow 节点画布、模块卡片、连线渲染、钻入导航 |
| `edit-sync` | Phase 2 编辑与文件同步 — 创建/删除模块、拖线连接、文件监听、LLM Sync |
| `module-marketplace` | Phase 3 模块广场 — 浏览发现、搜索筛选、样式预览对比、评分评论 |
| `replace-flow` | Phase 3 替换流程 — 选中模块→广场选择→预览 diff→UUID 重绑→AI 重新生成 |
| `design-deploy` | Phase 4 设计打磨与部署 — Design Token、动画、Docker 打包、E2E 测试 |
| `tech-stack` | 技术栈 — React 18 + React Flow + Express + Vite + Zustand |

## 实施阶段

| 阶段 | 内容 | 周期 |
|---|---|---|
| Phase 1 | 画布 MVP（模块树渲染、卡片、连线、导航） | 1 周 |
| Phase 2 | 编辑与同步（创建/删除模块、拖线连接、文件监听） | 1 周 |
| Phase 3 | 模块广场（核心差异化：浏览、替换、对比、发布） | 2 周 |
| Phase 4 | 设计打磨与部署（Design Token、动画、Docker） | 1 周 |

## 黑客松 Demo 重点

画布 + 模块替换，30 秒讲清核心价值：打开项目看到模块关系图 → 选中丑模块 → 从广场替换 → AI 重新生成 → 变漂亮。
