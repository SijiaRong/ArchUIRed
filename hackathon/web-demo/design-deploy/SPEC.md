---
name: 设计打磨与部署
description: "Phase 4 — Design Token 实现、Light/Dark 模式、动画过渡、Docker 打包、E2E 测试、双模式部署"
---

## 概述

设计打磨与部署是产品上线前的最后一个阶段。将 Figma 设计系统落地为代码 token，补全交互动画，完成容器化部署和端到端测试。

## Design Token 实现

### 颜色系统

从 Figma 设计系统导出语义化颜色 token，支持 Light 和 Dark 两套主题：

| Token 类别 | 示例 |
|---|---|
| surface | surface/default, surface/elevated, surface/sunken |
| text | text/primary, text/secondary, text/muted |
| edge | edge/depends-on, edge/implements, edge/references |
| status | status/modified, status/error, status/success |
| interactive | interactive/hover, interactive/active, interactive/focus |

实现方式：CSS Custom Properties，通过 `[data-theme="dark"]` 切换。

### 排版系统

| 角色 | 用途 |
|---|---|
| display | 页面标题 |
| heading | 卡片标题、面板标题 |
| body | 正文内容 |
| caption | 辅助说明、UUID 显示 |
| mono | 代码、路径、UUID |

### 间距与阴影

- 间距：8px 网格基准（4, 8, 12, 16, 24, 32, 48, 64）
- 阴影：4 层深度（sm, md, lg, xl）

## 动画与过渡

| 交互 | 动画 |
|---|---|
| 钻入子模块 | 画布缩放过渡 + 面包屑更新 |
| Detail Panel 展开 | 右侧滑入，300ms ease-out |
| Detail Panel 收起 | 右侧滑出，200ms ease-in |
| 卡片 hover | 微弱上移 + 阴影加深 |
| 连线高亮 | 选中时颜色加深 + 宽度增加 |
| 模块替换完成 | 新卡片淡入 + 成功提示 |

## 部署

### Docker 打包（服务端模式，推荐）

单镜像包含 Express 后端 + React SPA：

- Express serve 静态文件 + /api/* 路由
- 单端口暴露（默认 3000）
- 健康检查端点 /health

### 静态部署（纯前端模式）

CDN 部署 SPA，使用浏览器 File System Access API：

- 仅 Chrome / Edge 支持
- 无需后端，直接读写本地文件系统
- 适合个人使用场景

## E2E 测试

使用 Playwright 覆盖核心用户旅程：

| 测试用例 | 覆盖 Phase |
|---|---|
| 打开项目 → 画布渲染正确 | Phase 1 |
| 创建模块 → 文件系统写入 | Phase 2 |
| 广场搜索 → 模块详情 → 样式对比 | Phase 3 |
| 选中模块 → 广场替换 → AI 触发 | Phase 3 |
| Light/Dark 模式切换 | Phase 4 |
