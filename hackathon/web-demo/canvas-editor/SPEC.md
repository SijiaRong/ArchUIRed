---
name: 画布编排器
description: "React Flow 节点画布 — 模块卡片渲染、Link Edge 连线、Drill-down 钻入导航、Detail Panel 详情面板"
---

> **DEPRECATED:** The external reference card concept has been removed. References to external cards in this document are no longer valid.

## 概述

画布编排器是 ArchUI Web 版的核心交互界面。用户在无限画布上可视化浏览和编排知识模块的层级与链接关系。

## 核心功能

| 功能 | 说明 |
|---|---|
| Primary Module Card | 展示模块名称、描述、UUID、子模块端口列表 |
| External Reference Card | 小卡片展示被链接的外部模块 |
| Link Edge 渲染 | Direct Edge（模块级连线）+ Port Edge（子模块级连线）+ 方向箭头 |
| Drill-down 导航 | 双击子模块钻入下一层画布，面包屑回溯 |
| 快捷跳转 | Cmd+K / Ctrl+K 命令面板，模糊搜索全部模块 |
| Detail Panel | 选中节点时右侧滑出，展示模块完整内容 |
| 布局持久化 | 卡片拖拽位置写入 layout.yaml |

## 画布状态机

三个状态：Idle（无选中）→ Node-Selected（详情面板展开）→ Drilled（钻入子模块层）。

## 技术实现

基于 React Flow 的 controlled 模式，自定义 ModuleNode 和 LinkEdge 组件。状态管理使用 Zustand。
