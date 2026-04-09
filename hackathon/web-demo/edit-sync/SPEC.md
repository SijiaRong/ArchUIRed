---
name: 编辑与文件同步
description: "Phase 2 — 画布编辑能力与文件系统双向同步：创建/删除模块、拖线连接、布局持久化、文件监听、LLM Sync"
---

## 概述

编辑与文件同步模块为画布增加写入能力。Phase 1 的画布是只读可视化，Phase 2 让用户直接在画布上创建、修改、删除模块，所有操作实时同步到文件系统。

## 核心功能

### Immediate Writes（直接写入）

用户在画布上的确定性操作，立即写入文件系统：

| 操作 | 文件系统效果 |
|---|---|
| 创建模块 | 新建文件夹 + README.md + .archui/index.yaml |
| 重命名模块 | 重命名文件夹，更新父模块 submodules map |
| 删除模块 | 删除文件夹，更新父模块 submodules map |
| 添加链接 | 在画布上从端口拖线到目标，写入 .archui/index.yaml links |
| 删除链接 | 选中连线按 Delete，从 index.yaml 移除对应 link |
| 拖拽卡片 | 位置写入 .archui/layout.yaml |

### 文件监听

检测外部编辑（用户在编辑器中直接修改文件），自动刷新画布：

- OS 级文件监听（fs.watch / chokidar）
- 检测 README.md frontmatter 变化 → 更新卡片显示
- 检测 index.yaml 变化 → 更新连线和子模块列表
- 检测 layout.yaml 变化 → 更新卡片位置

### LLM Sync 入口

非确定性操作（影响范围超出当前模块）需要 AI 介入：

- 画布顶部显示"有未同步的变更"提示
- 用户点击触发 → 计算 git diff → 发送给 AI agent
- AI agent 根据 diff 更新受影响的模块
- 用户确认 AI 的修改结果

### Detail Panel 编辑模式

选中模块后 Detail Panel 支持编辑：

- 编辑 name 和 description（写入 README.md frontmatter）
- 编辑模块正文内容（写入 README.md body）
- 管理链接列表（增删改 links）

## 卡片状态指示

| 状态 | 视觉效果 | 含义 |
|---|---|---|
| default | 正常边框 | 无变更 |
| modified | 琥珀色重点色 | 有未保存或未同步的变更 |
| error | 红色边框 | 文件解析错误或结构违规 |

## Express API 端点

| 端点 | 方法 | 用途 |
|---|---|---|
| /api/fs/read | GET | 读取文件内容 |
| /api/fs/write | POST | 写入文件内容 |
| /api/fs/mkdir | POST | 创建文件夹 |
| /api/fs/rename | POST | 重命名文件/文件夹 |
| /api/fs/delete | DELETE | 删除文件/文件夹 |
| /api/fs/watch | WebSocket | 文件变更推送 |

所有路径操作需做路径遍历防护（禁止 `..` 和绝对路径）。
