---
name: 画布编排器 Harness
description: "画布编排器的测试用例 — 验证模块卡片渲染、连线、钻入导航、状态机转换"
---

## 测试场景

### 模块树渲染

- [init] 打开包含 3 层嵌套的 ArchUI 项目
- [action] 画布加载根模块
- [eval] Primary Module Card 正确显示 name、description、UUID、子模块端口列表

### Link Edge 渲染

- [init] 项目包含跨模块链接
- [action] 画布渲染连线
- [eval] Direct Edge 和 Port Edge 正确连接，箭头指向 target 端

### Drill-down 导航

- [init] 画布显示根模块
- [action] 双击子模块端口行
- [eval] 画布切换到子模块层级，面包屑更新，返回按钮可用

### 状态机转换

- [init] 画布处于 Idle 状态
- [action] 点击模块卡片
- [eval] 切换到 Node-Selected，Detail Panel 从右侧滑出
