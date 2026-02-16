# 图文分割布局规范

> ⛔ **强制约束**：所有字体大小、间距必须使用 `styles.ts` 标准值，禁止硬编码

## AI 实现前必查清单

在编写 `VisualWithContent.tsx` 或任何布局组件前，**必须**：

1. [ ] 阅读 `/Users/myb/Desktop/PPT/motion-kit/src/styles.ts` 获取标准值
2. [ ] 阅读 `/Users/myb/Desktop/PPT/motion-kit/src/compositions/BulletList.tsx` 参考正确实现
3. [ ] 检查每个 `fontSize`、`padding`、`gap` 是否来自 `currentStyle`
4. [ ] 禁止出现 `fontSize: 26` 这样的硬编码数字

## 标准值对照表

| 参数           | styles.ts 属性      | 值  | 错误示例          |
| -------------- | ------------------- | --- | ----------------- |
| 页面标题字号   | `pageTitleFontSize` | 72  | `fontSize: 52` ❌ |
| 列表项字号     | `bulletFontSize`    | 32  | `fontSize: 26` ❌ |
| 内容区 padding | `contentPadding`    | 192 | `padding: 100` ❌ |
| 副标题字号     | `subtitleFontSize`  | 48  | `fontSize: 22` ❌ |

---

基于 motion-kit 现有组件（SplitScreen, BinaryComparison）的布局最佳实践。

## 核心布局原则

### 1. 左右分割比例

| 内容类型                   | 左侧（文字） | 右侧（图） | 说明           |
| -------------------------- | ------------ | ---------- | -------------- |
| 纯文字列表 + 流程图        | 45%          | 55%        | 图需要更多空间 |
| 纯文字列表 + 洋葱图/循环图 | 40%          | 60%        | 圆形图需要空间 |
| 纯文字列表 + 垂直流程      | 35%          | 65%        | 垂直流程较高   |
| 无文字 + 任意图            | 0%           | 100%       | 图居中         |

### 2. 间距规范（必须使用 styles.ts 标准值）

| 元素           | styles.ts 属性   | 值          | 说明               |
| -------------- | ---------------- | ----------- | ------------------ |
| 内容区 padding | `contentPadding` | 192px 108px | 禁止硬编码         |
| 左右区间隔     | 固定值           | 80px        | `gap: 80`          |
| 标题到内容     | 固定值           | 50px        | `marginBottom: 50` |

**⛔ 禁止事项**：

- ❌ 禁止硬编码 `padding: 100px 70px`
- ✅ 必须使用 `currentStyle.contentPadding`

### 3. 字体大小（必须使用 styles.ts 标准值）

| 元素     | styles.ts 属性      | 值  | 说明                   |
| -------- | ------------------- | --- | ---------------------- |
| 主标题   | `pageTitleFontSize` | 72  | 禁止硬编码             |
| 副标题   | `subtitleFontSize`  | 48  | 禁止硬编码             |
| 列表项   | `bulletFontSize`    | 32  | 禁止硬编码             |
| 编号圆点 | 16px 数字           | 16  | 和 BulletList 组件一致 |

**⛔ 禁止事项**：

- ❌ 禁止硬编码 `fontSize: 26` 等数字
- ✅ 必须使用 `currentStyle.bulletFontSize` 等标准值

### 4. 图片尺寸

| 图类型     | 推荐尺寸 | 说明       |
| ---------- | -------- | ---------- |
| 横向流程图 | 700×140  | 4-5 个节点 |
| 洋葱图     | 380×380  | 3-4 层     |
| 垂直流程   | 440×480  | 4 层带描述 |
| 循环图     | 340×340  | 4-5 个节点 |
| 金字塔     | 520×380  | 3-4 层     |

## 布局代码模板

### 标准左右分割

```tsx
<div
  style={{
    display: "flex",
    alignItems: "center", // 垂直居中
    justifyContent: "flex-start", // 左对齐，不是 space-between
    gap: 80, // 固定间距
    width: "100%",
  }}
>
  {/* 左侧文字区 - 固定宽度 */}
  <div
    style={{
      width: 500, // 固定宽度，不是 flex: 1
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* 文字内容 */}
  </div>

  {/* 右侧图区 - 自适应 */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* 可视化图表 */}
  </div>
</div>
```

### 无文字纯图

```tsx
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  }}
>
  {/* 可视化图表 - 居中 */}
</div>
```

## 对齐规则

1. **垂直对齐**：`alignItems: "center"` - 左右两侧垂直居中
2. **水平对齐**：`justifyContent: "flex-start"` - 从左开始排列
3. **文字左对齐**：列表项 `textAlign: "left"`
4. **图居中**：图表容器 `justifyContent: "center"`

## 常见错误

| 错误                              | 问题           | 修正                               |
| --------------------------------- | -------------- | ---------------------------------- |
| `justifyContent: "space-between"` | 中间空白太大   | 改为 `flex-start` + 固定 gap       |
| `flex: 1` 两侧都有                | 比例不灵活     | 左侧固定宽度，右侧自适应           |
| 硬编码 `fontSize: 26`             | 不一致         | 使用 `currentStyle.bulletFontSize` |
| 硬编码 `padding: 100`             | 不一致         | 使用 `currentStyle.contentPadding` |
| 图放正中央                        | 文字靠左很奇怪 | 左右分割，都垂直居中               |
| 图太小（<300px）                  | 内容看不清     | 根据内容类型选择合适尺寸           |

## 参考组件

- `SplitScreen.tsx` - 左右对比布局
- `BinaryComparison.tsx` - A vs B 对比
- `ThreeColumns.tsx` - 三栏布局
