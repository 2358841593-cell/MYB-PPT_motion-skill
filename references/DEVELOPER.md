# my-ppt-studio 开发者文档

## 概述

my-ppt-studio 是一个**强约束流程**的 PPT 生成系统。使用此 skill 的 AI 模型必须严格遵守 5 步流程。

---

## ⛔ 强制规则（AI 必须遵守）

### 流程

```
Step 1: 接收文案 → 仅接收，不执行任何操作
   ↓
Step 2: AI 手动编写规划 → 禁止使用算法自动解析
   ↓
Step 3: 视觉组件方案 → 每页必须匹配视觉库组件
   ↓
Step 4: 用户确认 → 必须等待用户明确同意
   ↓
Step 5: 渲染生成 → 用户确认后才能执行
```

### 禁止事项

| 禁止                            | 说明                         |
| ------------------------------- | ---------------------------- |
| ❌ 禁止调用 `parse-content.mjs` | 该脚本使用正则切分，禁止使用 |
| ❌ 禁止跳过步骤                 | 必须按 1→2→3→4→5 顺序执行    |
| ❌ 禁止提前渲染                 | 必须等 Step 4 用户确认后     |
| ❌ 禁止无 visual 的规划         | 每页必须有 visual 字段       |
| ❌ 禁止连续执行                 | 每步完成后必须等待用户       |

### 强制检查点

AI 在以下情况**必须停止并等待用户**：

1. Step 1 完成后 → 输出确认，等待"继续"
2. Step 2 完成后 → 输出规划，等待"确认"
3. Step 3 完成后 → 输出视觉方案，等待"确认"
4. Step 4 之前 → 必须得到明确同意

---

## Step 1: 接收文案

**AI 行为**:

- 接收文案 → 存储到 `sources/raw-content.txt` → 输出确认 → **停止等待**

---

## Step 2: AI 手动编写规划

**核心规则**:

- ❌ **禁止调用** `parse-content.mjs`
- ✅ **AI 阅读 → 理解 → 手动设计**

**字数规范**:

| 元素     | 要求        |
| -------- | ----------- |
| 标题     | 10-25 字    |
| 副标题   | 15-30 字    |
| 要点     | 15-50 字/条 |
| 要点数   | 2-4 条/页   |
| 每页总计 | 150-350 字  |

**script.md 必须包含 visual 字段**:

```yaml
id: s01
type: cover
title: "标题"
visual:
  type: floating-dots
```

---

## Step 3: 视觉组件方案

**内容可视化组件**:

| 组件         | 适用内容     |
| ------------ | ------------ |
| `pyramid`    | 层级、金字塔 |
| `flow`       | 流程、步骤   |
| `cycle`      | 循环、迭代   |
| `layers`     | 分层架构     |
| `timeline`   | 时间线       |
| `funnel`     | 漏斗转化     |
| `comparison` | A vs B 对比  |

**装饰性组件**:

| 组件             | 用途       |
| ---------------- | ---------- |
| `floating-dots`  | 科技感装饰 |
| `hexagon-grid`   | 技术风格   |
| `glowing-points` | 氛围光点   |
| `wave-lines`     | 流动感     |
| `mini-bar-chart` | 数据暗示   |

**匹配规则**:

| 内容包含 | 必须使用              |
| -------- | --------------------- |
| 层级架构 | `pyramid` 或 `layers` |
| 流程步骤 | `flow`                |
| 循环迭代 | `cycle`               |
| 时间线   | `timeline`            |
| 对比     | `comparison`          |
| 漏斗     | `funnel`              |
| 普通列表 | 装饰组件              |
| 封面     | `floating-dots`       |
| 金句     | `wave-lines`          |

---

## Step 4: 用户确认

**AI 必须等待用户输入**:

- "确认" / "同意" / "继续" → 进入 Step 5
- 修改意见 → 返回修改
- "取消" → 终止

---

## Step 5: 渲染生成

**前置条件**: Step 1-4 完成，用户已确认

**执行命令**:

```bash
node scripts/flow-checker.mjs --project <dir> --check 5
node scripts/analyze-layouts.mjs --project <dir> --accept-all
node scripts/render-slide.mjs --project <dir> --all
node scripts/build-deck.mjs --project <dir> --skip-render
node scripts/flow-checker.mjs --project <dir> --complete 5
```

---

## 视觉风格（11 种）

| 风格             | 适用场景      |
| ---------------- | ------------- |
| apple            | 科技/产品     |
| tech             | 技术/开发     |
| bold-editorial   | 创意/营销     |
| minimal          | 商务/报告     |
| dark-atmospheric | 高端/沉浸     |
| corporate        | 企业/金融     |
| notion           | SaaS/工具     |
| blueprint        | 技术/架构     |
| chalkboard       | 教育/培训     |
| sketch-notes     | 创意/头脑风暴 |
| scientific       | 学术/研究     |

---

## 脚本参考

| 脚本                  | 功能         | 状态     |
| --------------------- | ------------ | -------- |
| `flow-checker.mjs`    | 流程状态检查 | 使用     |
| `analyze-layouts.mjs` | 布局分析     | 使用     |
| `render-slide.mjs`    | 渲染幻灯片   | 使用     |
| `build-deck.mjs`      | 生成 PPTX    | 使用     |
| `parse-content.mjs`   | 自动解析     | **禁止** |

---

## 质量检查

- [ ] 所有 PNG 文件已生成
- [ ] 每个 PNG 文件大小 > 30KB
- [ ] PPTX 文件已生成
- [ ] 每页都有视觉组件
- [ ] 每页字数 150-350 字
