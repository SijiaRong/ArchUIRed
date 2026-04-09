---
name: 编辑与文件同步 Harness
description: "编辑与同步的测试用例 — 验证模块 CRUD、连线操作、文件监听、LLM Sync 触发"
---

## 测试场景

### 创建模块

- [init] 画布显示根模块，有 2 个子模块
- [action] 点击"新建模块"，输入名称
- [eval] 文件系统新增文件夹 + README.md + .archui/index.yaml，画布新增卡片，父模块 submodules 更新

### 删除模块

- [init] 画布有 3 个子模块
- [action] 选中一个模块，按 Delete，确认删除
- [eval] 文件夹被删除，父模块 submodules 移除该条目，指向该模块的链接被清理

### 拖线创建链接

- [init] 画布有 2 个外部引用卡片
- [action] 从子模块端口拖线到外部卡片
- [eval] .archui/index.yaml 的 links 数组新增一条记录，画布渲染新连线

### 文件监听

- [init] 画布显示模块 A
- [action] 在外部编辑器修改模块 A 的 README.md frontmatter
- [eval] 画布自动刷新，卡片标题更新为新 name

### LLM Sync 触发

- [init] 用户在画布上重命名了一个被多个模块引用的模块
- [action] 点击"同步变更"
- [eval] 系统计算 git diff，将 diff 发送到 AI agent 接口，显示同步进度
