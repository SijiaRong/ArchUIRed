---
name: 设计打磨与部署 Harness
description: "设计与部署的测试用例 — 验证 token 一致性、主题切换、Docker 构建、E2E 通过率"
---

## 测试场景

### Design Token 一致性

- [init] Figma 设计系统定义了 color/surface/default 为 #ffffff（Light）和 #1a1a1a（Dark）
- [action] 检查 CSS Custom Properties 输出
- [eval] --color-surface-default 在 Light 模式为 #ffffff，Dark 模式为 #1a1a1a

### 主题切换

- [init] 页面以 Light 模式加载
- [action] 点击主题切换按钮
- [eval] 所有组件颜色切换到 Dark 模式，无闪烁，过渡平滑

### Docker 构建

- [init] 项目根目录有 Dockerfile
- [action] docker build -t archui-web .
- [eval] 构建成功，镜像可运行，/health 返回 200

### E2E 全流程

- [init] Docker 容器运行中
- [action] npx playwright test
- [eval] 所有核心用户旅程测试通过（画布渲染、编辑、广场、替换）
