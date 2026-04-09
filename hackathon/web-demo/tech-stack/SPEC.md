---
name: 技术栈
description: "Web Demo 技术选型 — React 18 + React Flow + Express + Vite + Zustand + Tailwind + Playwright"
---

## 概述

Web Demo 的技术栈选型，平衡开发效率和产品需求。

## 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | React 18 + TypeScript | 项目 Spec 已指定，生态成熟 |
| 画布 | React Flow | 节点画布成熟方案，高度可定制 |
| 构建 | Vite | 极速 HMR，开发体验最佳 |
| 状态管理 | Zustand | 轻量，适合画布状态 |
| 样式 | CSS Variables + Tailwind | Token 驱动，Figma 同步友好 |
| 后端 | Express | 文件系统 API + 广场 API，轻量可靠 |
| 广场存储 | GitHub Repo → 独立服务 | 初期用 Git 做 registry，后期独立 |
| 测试 | Vitest + Playwright | 单元测试 + E2E 全覆盖 |
| 部署 | Docker / 静态 CDN | 双模式：服务端部署 + 纯前端部署 |

## 系统架构

三层架构：

- **前端**：画布编辑器（React Flow + Zustand）、模块广场（搜索/浏览/对比）、模块详情预览
- **后端**：`/api/fs/*`（文件系统 CRUD）、`/api/market/*`（广场 Registry API）、`/api/sync/*`（LLM 同步触发）
- **数据层**：本地文件系统（.archui/ + README.md）、Git 版本管理、广场 Registry
