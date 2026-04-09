---
name: 技术栈 Harness
description: "技术栈的验证用例 — 验证开发环境搭建、构建流程、API 端点可用性"
---

## 测试场景

### 开发环境启动

- [init] 克隆项目，npm install
- [action] npm run dev
- [eval] Vite dev server 启动，React Flow 画布页面可访问

### 生产构建

- [init] 开发环境正常
- [action] npm run build
- [eval] Vite 构建成功，输出 dist/ 目录，Express 可正常 serve

### 文件系统 API

- [init] Express 后端运行
- [action] GET /api/fs/read?path=README.md
- [eval] 返回 200，body 包含文件内容

### 广场 API

- [init] Express 后端运行，registry.json 可达
- [action] GET /api/market/modules
- [eval] 返回模块列表 JSON，包含 name、tags、downloads、rating
