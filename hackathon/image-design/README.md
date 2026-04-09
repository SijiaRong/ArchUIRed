---
name: 图片生成式设计
description: "基于 Gemini 的图片生成式设计模块 — 定义视觉素材的生成策略、提示词规范与输出管理"
---

## 概述

image-design 模块通过 Gemini 图像生成能力为所有展示材料提供统一的视觉素材。模块定义提示词工程规范、风格一致性约束和输出资产的命名与存放规则。

## 素材清单

| 素材 | 尺寸 | 用途 | 状态 |
|---|---|---|---|
| `hero-main` | 1920×1080 | PPT 封面、视频封面 | 待生成 |
| `hero-banner` | 800×2000 | 易拉宝主视觉 | 待生成 |
| `brochure-cover` | 99×210mm @300DPI | 宣传册封面 | 待生成 |
| `icon-set` | 64×64 × 6 | PPT 功能图标 | 待生成 |
| `bg-texture` | 1920×1080 | 背景纹理 | 待生成 |

## Gemini 提示词规范

### 基础风格描述（所有素材共用）
```
Modern tech illustration, white background, coral orange (#F07040) as accent color,
minimal geometric node-graph aesthetic, rounded rectangles connected by curved dashed
lines, developer-friendly, flat vector style, clean white space, professional and
structured, no text overlay
```

### 每类素材的提示词模板

**Hero 图（主视觉）**
```
Abstract node graph with rounded rectangle modules connected by curved orange dashed
lines on white background, modules have colored header bars (orange, green, purple),
representing a modular document system, clean tech aesthetic, generous white space
aspect ratio: 16:9, high resolution, no text
```

**图标组**
```
flat icon, coral orange (#F07040), simple rounded geometry, [功能含义], white background,
2px stroke style, consistent style across set
```

## 输出规范

- 格式：PNG（透明背景图标）/ JPG（大图）
- 存放：`resources/generated/` 目录，文件名格式 `[素材名]-v[版本号].[格式]`
- 版本管理：每次重新生成创建新版本，不覆盖旧版本

## 与 Gemini API 的集成方式

通过 `Gemini 2.0 Flash` 或 `Imagen 3` 生成图像。调用规范和 API 封装逻辑由具体实现模块定义（参考 `vi` 模块的风格约束作为输入参数）。
