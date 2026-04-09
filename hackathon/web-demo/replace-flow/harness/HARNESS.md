---
name: 替换流程 Harness
description: "替换流程的测试用例 — 验证模块选择、diff 预览、UUID 重绑、AI 重新生成触发"
---

## 测试场景

### 选中本地模块

- [init] 画布显示项目模块
- [action] 选中一个模块，点击"从广场替换"
- [eval] 弹出广场面板，按相同标签推荐替换候选

### Diff 预览

- [init] 用户选择了替换候选模块
- [action] 系统计算新旧模块差异
- [eval] 展示结构差异（子模块增减）、内容差异（README 变化）、链接影响

### UUID 自动重绑

- [init] 项目中有 3 个模块链接到即将被替换的模块
- [action] 确认替换
- [eval] 3 个模块的 .archui/index.yaml 中旧 UUID 被更新为新模块 UUID

### AI 重新生成触发

- [init] 模块替换完成
- [action] 触发 LLM Sync
- [eval] git diff 正确计算，AI agent 收到新模块 spec 作为上下文
