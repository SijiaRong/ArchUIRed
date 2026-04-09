---
name: Luwei VI
description: "芦苇视觉识别系统 — 清冷自然、极简留白的品牌色彩、字体、图形语言与视觉调性"
---

## 概述

Luwei VI（Visual Identity）模块定义芦苇产品的整体视觉语言。设计调性为「清冷自然、极简留白」，以灰白暖调为底色，青灰为点缀，营造安静专注的决策辅助氛围。

## 品牌色彩

### 主色（清冷自然系）
| 名称 | 色值 | 用途 |
|---|---|---|
| Accent Teal | `#4A7C8A` | 主强调色、按钮、链接、品牌色 |
| Accent Teal Dark | `#3D6B77` | 深色强调、悬停状态 |

### 表面色
| 名称 | 色值 | 用途 |
|---|---|---|
| Surface Page | `#F9F7F3` | 页面背景，暖灰白 |
| Surface Card | `#FFFFFF` | 卡片背景，纯白 |
| Surface Divider | `#E5E4E0` | 分割线、边框 |

### 文字色
| 名称 | 色值 | 用途 |
|---|---|---|
| Text Primary | `#1A1A1A` | 主标题、正文 |
| Text Secondary | `#6B7280` | 说明文字、副标题 |
| Text Tertiary | `#9CA3AF` | 次要信息、标签、注释 |

### 语义色（卡片左边框）
| 名称 | 色值 | 对应场景 |
|---|---|---|
| Action | `#E08D3C` | 行动建议、待办 |
| Insight | `#3D9A5F` | 洞察、分析结果 |
| Reflection | `#7C5CBA` | 反思、回顾 |
| Info | `#4A7C8A` | 信息、提示 |

## 字体规范

### 正文字体
- **系统字体栈**：-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', sans-serif
- 设计哲学：使用系统原生字体，保证最佳渲染和加载速度

### 字号阶梯
| 层级 | 字号 | 行高 | 字重 | 场景 |
|---|---|---|---|---|
| Display | clamp(32px, 5vw, 48px) | 1.25 | 600 | Hero 大标题 |
| Heading 2 | clamp(24px, 3.5vw, 36px) | 1.3 | 600 | 区域标题 |
| Heading 3 | clamp(17px, 2vw, 20px) | — | 500 | 卡片标题 |
| Body | 15–16px | 1.65–1.8 | 400 | 正文 |
| Caption | 13–14px | 1.4 | 500 | 标签、小字、上标 |
| Nav | 14px | — | 400 | 导航链接 |
| Brand | 18px | — | 500 | 导航栏品牌名 |

## 图形语言

### 视觉调性关键词
> 清冷自然、极简留白、安静专注、暖灰白底、青灰点缀、芦苇意象

### 图形元素
- **几何形状**：圆角矩形（radius 12px），柔和卡片
- **线条风格**：0.5px 分割线，颜色 `#E5E4E0`
- **阴影**：极淡投影 `rgba(26, 26, 26, 0.04)`，轻柔浮起感
- **纹理/背景**：纯净暖灰白 `#F9F7F3`，无网格
- **插图风格**：自然意象（芦苇、月亮、水面倒影），摄影+SVG 混合

### 图片构图原则
- 大面积留白，内容居中
- 自然摄影为主视觉，SVG 矢量为辅
- 色调统一偏暖灰，避免高饱和度
- 底部常用芦苇剪影作为视觉收束

## Logo 使用规范

### 品牌标识
- 品牌名：「芦苇 · roseau」
- 中文在前，法语在后，中间用 · 分隔
- 导航栏：中文 500 字重 + 法语 300 字重灰色

### 使用规则
- 导航栏高度 64px，品牌名左对齐
- 背景毛玻璃效果：`backdrop-filter: blur(12px)`
- 深色背景不适用，本产品始终使用浅色模式

## CSS Design Tokens（参考）

```css
:root {
    --bg: #F9F7F3;
    --card: #FFFFFF;
    --text-primary: #1A1A1A;
    --text-secondary: #6B7280;
    --text-tertiary: #9CA3AF;
    --accent: #4A7C8A;
    --accent-hover: #3D6B77;
    --divider: #E5E4E0;
    --action: #E08D3C;
    --insight: #3D9A5F;
    --reflection: #7C5CBA;
    --info: #4A7C8A;
    --shadow: rgba(26, 26, 26, 0.04);
    --radius: 12px;
}
```
