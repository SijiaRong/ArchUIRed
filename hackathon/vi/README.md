---
name: VI
description: "视觉识别系统 — 统一定义黑客松项目全套材料的品牌色彩、字体、图形语言与视觉调性"
---

## 概述

VI（Visual Identity）模块是整个 Hackathon 展示体系的设计根基。所有子模块（PPT、易拉宝、宣传册、图片生成）的视觉决策均以本模块为单一来源，保证跨材料的品牌一致性。

## 品牌色彩

### 主色
| 名称 | 色值 | 用途 |
|---|---|---|
| Primary | `#F07040` | 标题、强调、按钮、分割线 |
| Primary Dark | `#d85a2a` | 深色强调、悬停状态 |
| Primary Light | `rgba(240,112,64,0.06)` | 浅色背景、卡片底色、网格线 |

### 辅色
| 名称 | 色值 | 用途 |
|---|---|---|
| Text Dark | `#1a1a2e` | 主标题、项目名 |
| Text Mid | `#3d3f52` | 正文、说明文字 |
| Text Light | `#7a7d90` | 次要信息、注释、标签 |
| Surface | `#ffffff` | 页面背景、卡片背景 |
| Card BG | `#fafafa` | 卡片浅灰底色 |

### 节点画布辅助色（用于模块类型区分）
| 名称 | 色值 | 对应模块 |
|---|---|---|
| Node SPEC | `#F07040` | SPEC 模块节点头部 |
| Node MEMORY | `#3a8a5a` | MEMORY 模块节点头部 |
| Node HARNESS | `#6a4aaa` | HARNESS 模块节点头部 |
| Node Config | `#c08030` | index.yaml 节点头部 |
| Node Generic | `#5a7a9a` | README 等通用节点头部 |

## 字体规范

### 中文字体
- **标题**：Noto Sans SC Black/Bold（900/700），用于页面主标题
- **正文**：Noto Sans SC Regular/Medium（400/500），用于正文与说明

### 英文/代码字体
- **标题**：Noto Sans SC Black（900），中英混排统一
- **代码/技术标签**：JetBrains Mono SemiBold（600），用于模块名、UUID、代码片段
- **代码正文**：JetBrains Mono Regular（400），用于代码块、文件路径

### 字号阶梯
| 层级 | 字号 | 行高 | 场景 |
|---|---|---|---|
| Display | 68px / 48–64pt | 1.1 | 易拉宝项目名、PPT 封面大标题 |
| Heading 1 | 26–28px / 32–40pt | 1.2 | PPT 页面标题、易拉宝亮点标题 |
| Heading 2 | 20–22px / 24–28pt | 1.3 | 宣传册分区标题、易拉宝副标题 |
| Body | 16–19px / 14–16pt | 1.6–1.8 | 正文 |
| Caption | 13–14px / 10–12pt | 1.4 | 注释、来源标注、技术标签 |

### Google Fonts 引用
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```

## 图形语言

### 视觉调性关键词
> 科技感、模块化、清晰结构、白底橙色、节点连线、开发者友好

### 图形元素
- **几何形状**：圆角矩形（radius 10–16px），主要形状为卡片和节点
- **线条风格**：2–2.5px 橙色虚线（stroke-dasharray: 8 4），贝塞尔曲线连线
- **纹理/背景**：白底 + 极淡橙色网格（50px 间距，opacity 0.03–0.06）
- **分割线**：橙色渐变（transparent → #F07040 → transparent）
- **阴影**：极浅投影（drop-shadow 0 2px 6px rgba(0,0,0,0.08)）
- **插图风格**：SVG 矢量节点图，扁平化，代码编辑器风格

### 图片构图原则
- 主体居中或遵循黄金比例
- 留白不少于画面面积的 30%
- 白底为主，避免深色背景（除节点画布内部）
- 节点画布使用白色节点 + 彩色头部条的风格

## Logo 使用规范

- 最小尺寸：40px 高度（屏幕）/ 10mm 高度（印刷）
- 安全距离：Logo 高度的 50%
- 禁止变形、旋转、更改颜色
- 深色背景使用白色版，浅色背景使用彩色版

## Gemini 图片生成风格提示词（基础）

```
Modern tech illustration, coral orange (#F07040) accent color on white background,
minimal geometric node-graph style, clean white space, rounded rectangles connected
by curved dashed lines, developer-friendly aesthetic, flat vector style,
professional and structured, no text overlay
```
