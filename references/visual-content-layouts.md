# 图文布局完整规范

> 整合自：baoyu-layouts.md + baoyu-design-guidelines.md + split-layout-spec.md + motion-kit 组件

---

## 一、布局类型速查

### 图文分割布局（重点）

| 布局类型                | 文字区 | 图片区 | 适用场景           |
| ----------------------- | ------ | ------ | ------------------ |
| **split-screen**        | 50%    | 50%    | 左右对比、A/B 对比 |
| **hierarchical-layers** | 35-45% | 55-65% | 文字列表 + 图表    |
| **binary-comparison**   | 50%    | 50%    | A vs B 对比        |

### 其他布局

| 布局类型          | 说明       | 适用场景       |
| ----------------- | ---------- | -------------- |
| **title-hero**    | 大标题居中 | 封面、章节分隔 |
| **bullet-list**   | 纯文字列表 | 简单内容       |
| **three-columns** | 三栏       | 三个分类       |
| **quote-callout** | 引言       | 金句、引用     |
| **key-stat**      | 大数字     | 关键数据       |
| **icon-grid**     | 图标网格   | 功能列表       |

---

## 二、图文分割核心原则

### 1. 左右分割比例

```
┌─────────────────────────────────────────────────────────────┐
│  [标题]                                                      │
│  [副标题]                                                    │
│                                                             │
│  ┌──────────────┐    gap:80px    ┌─────────────────────┐   │
│  │              │    ◄────────►  │                     │   │
│  │  文字列表    │                │     可视化图表      │   │
│  │  (35-45%)   │                │      (55-65%)       │   │
│  │              │                │                     │   │
│  │  • 列表1    │                │   ┌───────────┐    │   │
│  │  • 列表2    │                │   │  图表内容  │    │   │
│  │  • 列表3    │                │   └───────────┘    │   │
│  │              │                │                     │   │
│  └──────────────┘                └─────────────────────┘   │
│         ↑                                  ↑               │
│    垂直居中                           垂直居中              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 代码模板

```tsx
{
  /* 主容器 */
}
<div
  style={{
    display: "flex",
    flexDirection: "row",
    alignItems: "center", // 垂直居中
    justifyContent: "flex-start", // 左对齐
    gap: 80, // 固定间距
    width: "100%",
  }}
>
  {/* 左侧文字区 - 固定宽度 */}
  <div
    style={{
      width: 500, // 固定宽度，不用 flex: 1
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* 列表内容 */}
  </div>

  {/* 右侧图区 - 自适应 */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* 图表 */}
  </div>
</div>;
```

### 3. 常见错误

| 错误                              | 问题         | 修正                          |
| --------------------------------- | ------------ | ----------------------------- |
| `justifyContent: "space-between"` | 中间空白太大 | 改为 `flex-start` + `gap: 80` |
| `flex: 1` 两侧都有                | 比例不固定   | 左侧固定宽度                  |
| 图片居中，文字靠左                | 视觉不平衡   | 两者都垂直居中                |
| 硬编码 fontSize                   | 不一致       | 使用 styles.ts                |

---

## 三、字体大小标准（styles.ts）

| 元素     | 属性                | 值      | 用途        |
| -------- | ------------------- | ------- | ----------- |
| 页面标题 | `pageTitleFontSize` | 72      | 主标题      |
| 副标题   | `subtitleFontSize`  | 48      | 副标题      |
| 列表项   | `bulletFontSize`    | 32      | bullet 文字 |
| 内容边距 | `contentPadding`    | 192×108 | 页面边距    |

**⛔ 禁止硬编码数字，必须使用 `currentStyle.xxx`**

---

## 四、图片尺寸参考

| 图类型     | 推荐尺寸 | 说明       |
| ---------- | -------- | ---------- |
| 横向流程图 | 800×180  | 4-5 个节点 |
| 金字塔     | 700×520  | 3-4 层     |
| 垂直流程   | 560×600  | 4 层带描述 |
| 洋葱图     | 480×480  | 3-4 层     |
| 循环图     | 440×440  | 4-5 个节点 |

---

## 五、布局选择指南

### 根据内容选择布局

| 内容类型  | 推荐布局                                           |
| --------- | -------------------------------------------------- |
| 单一叙事  | `bullet-list`, `image-caption`                     |
| 两个概念  | `split-screen`, `binary-comparison`                |
| 三个项目  | `three-columns`, `icon-grid`                       |
| 流程/步骤 | `linear-progression`, `hierarchical-layers`        |
| 数据/指标 | `dashboard`, `key-stat`                            |
| 关系/层级 | `hub-spoke`, `venn-diagram`, `hierarchical-layers` |

### 根据位置选择布局

| 位置 | 推荐布局                    |
| ---- | --------------------------- |
| 开场 | `title-hero`, `agenda`      |
| 中间 | 内容相关布局                |
| 结尾 | `quote-callout`, `key-stat` |

---

## 六、视觉层级原则

| 原则     | 说明                      |
| -------- | ------------------------- |
| 焦点     | 每页只有一个主焦点        |
| 三分法   | 关键元素放在网格交叉点    |
| Z型阅读  | 左上 → 右上 → 左下 → 右下 |
| 大小对比 | 标题 2-3 倍于正文         |
| 留白     | 边距至少 10%              |

---

## 七、参考文件

| 文件            | 路径                                                                |
| --------------- | ------------------------------------------------------------------- |
| baoyu 布局      | `references/baoyu-layouts.md`                                       |
| baoyu 设计指南  | `references/baoyu-design-guidelines.md`                             |
| baoyu 内容规则  | `references/baoyu-content-rules.md`                                 |
| 分割布局规范    | `references/split-layout-spec.md`                                   |
| 标准样式        | `/Users/myb/Desktop/PPT/motion-kit/src/styles.ts`                   |
| BulletList 参考 | `/Users/myb/Desktop/PPT/motion-kit/src/compositions/BulletList.tsx` |
