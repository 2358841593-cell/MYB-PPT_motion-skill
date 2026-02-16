# my-ppt-studio 开发路线图

## 项目愿景

打造一个**自包含、开源的 PPT 生成工具**，完全本地运行，无外部 API 依赖。用户粘贴原始文案即可自动生成专业幻灯片，支持多种视觉风格和丰富的装饰组件。

---

## 当前版本：v1.1

### 已完成功能

#### 模块 01：内容解析 ✅ 已完成

| 功能       | 状态 | 描述                     |
| ---------- | ---- | ------------------------ |
| 项目脚手架 | ✅   | 标准目录结构             |
| 内容解析器 | ✅   | 原始文本 → script.md     |
| 智能分页   | ✅   | 基于字数 5-30 页动态计算 |
| 类型检测   | ✅   | 自动识别封面/问题/结论等 |
| 状态追踪   | ✅   | manifest.json            |

#### 模块 02：静态 PPT 生成 ✅ 已完成

| 功能      | 状态 | 描述               |
| --------- | ---- | ------------------ |
| 布局分析  | ✅   | 智能推荐 14 种布局 |
| 样式分析  | ✅   | 根据 11 种风格推荐 |
| PNG 渲染  | ✅   | Remotion 静态帧    |
| PPTX 组装 | ✅   | 全屏图片，16:9     |

#### 模块 03：视觉组件库 ✅ 已完成

| 类别     | 状态 | 组件数量                                                                                         |
| -------- | ---- | ------------------------------------------------------------------------------------------------ |
| 设备框架 | ✅   | 2 个（DeviceFrame, DeviceCluster）                                                               |
| 抽象图形 | ✅   | 5 个（FloatingDots, ConnectionLines, GlowingPoints, WaveLines, DecorativeGrid）                  |
| 几何装饰 | ✅   | 6 个（CircleRing, ConcentricCircles, HexagonGrid, DiamondShape, CornerBrackets, FloatingBlocks） |
| 数据元素 | ✅   | 5 个（ProgressBar, MiniBarChart, StatCard, MiniLineChart, DataCardStack）                        |
| 流程图   | ✅   | 5 个（StepIndicator, Timeline, FlowArrows, ProcessNodes, CycleDiagram）                          |

---

## 视觉风格（11 种全部实现）

| 风格               | 状态    | 背景           | 强调色                                     |
| ------------------ | ------- | -------------- | ------------------------------------------ |
| `apple`            | ✅ 完成 | #0A0A0A 纯黑   | #3B82F6 蓝色                               |
| `tech`             | ✅ 完成 | #0F172A 深蓝   | #60A5FA 浅蓝 + 网格                        |
| `bold-editorial`   | ✅ 完成 | #1A1A1A 深灰   | #FF3366 粉红 + #00D4AA 青绿 + #FFD60A 黄色 |
| `minimal`          | ✅ 完成 | #FAFAFA 浅灰白 | #6B7280 灰色                               |
| `dark-atmospheric` | ✅ 完成 | #0D0D0D 纯黑   | #00FF88 霓虹绿 + #8B5CF6 紫色              |
| `corporate`        | ✅ 完成 | #1E293B 深蓝灰 | #3B82F6 专业蓝                             |
| `chalkboard`       | ✅ 完成 | #2C3E50 深灰绿 | #F5F5F5 粉笔白                             |
| `blueprint`        | ✅ 完成 | #0A192F 工程蓝 | #60A5FA 蓝色线条                           |
| `notion`           | ✅ 完成 | #FFFFFF 纯白   | #1F2937 黑灰                               |
| `sketch-notes`     | ✅ 完成 | #FFF8DC 米黄   | 多彩手绘风                                 |
| `scientific`       | ✅ 完成 | #F8FAFC 浅灰   | #1E40AF 深蓝                               |

---

## 布局模板（16 种全部实现）

| 模板               | 状态    | 描述          |
| ------------------ | ------- | ------------- |
| `CoverHero`        | ✅ 完成 | 封面/大标题页 |
| `BulletList`       | ✅ 完成 | 要点列表页    |
| `BinaryComparison` | ✅ 完成 | A vs B 对比页 |
| `QuoteCallout`     | ✅ 完成 | 金句/引用页   |
| `KeyStat`          | ✅ 完成 | 关键数据页    |
| `SplitScreen`      | ✅ 完成 | 分屏布局页    |
| `IconGrid`         | ✅ 完成 | 图标网格页    |
| `ThreeColumns`     | ✅ 完成 | 三栏布局页    |
| `BentoGrid`        | ✅ 完成 | Bento 盒子页  |
| `Funnel`           | ✅ 完成 | 漏斗图页      |
| `Dashboard`        | ✅ 完成 | 仪表盘页      |
| `CircularFlow`     | ✅ 完成 | 环形流程页    |
| `Timeline`         | ✅ 完成 | 时间线页      |
| `ComparisonMatrix` | ✅ 完成 | 对比矩阵页    |
| `Agenda`           | ✅ 完成 | 议程页        |
| `SectionBreak`     | ✅ 完成 | 章节分隔页    |

---

## 未来开发

### 模块 04：数据可视化 📋 计划中

| 功能          | 优先级 | 描述               |
| ------------- | ------ | ------------------ |
| `LineChart`   | 高     | 折线图（趋势数据） |
| `BarChart`    | 高     | 柱状图（对比数据） |
| `PieChart`    | 中     | 饼图（占比分布）   |
| `TableGrid`   | 中     | 数据表格           |
| CSV/JSON 加载 | 高     | 外部数据文件支持   |

### 模块 05：动态动画 📋 计划中

| 功能     | 优先级 | 描述                 |
| -------- | ------ | -------------------- |
| 文字动画 | 中     | 光扫效果、打字机效果 |
| 图表动画 | 中     | 增长、展开动画       |
| 背景动画 | 低     | 渐变漂移、噪点动画   |
| MP4 导出 | 中     | 视频导出支持         |

### 模块 06：高级导出 📋 计划中

| 功能     | 优先级 | 描述               |
| -------- | ------ | ------------------ |
| PDF 导出 | 中     | 直接 PDF 生成      |
| 长图导出 | 低     | 垂直拼接所有幻灯片 |
| H5 导出  | 低     | 网页版演示         |

---

## 技术架构

```
my-ppt-studio/
├── scripts/           # Node.js 脚本
│   ├── _lib.mjs       # 共享工具
│   ├── init-root.mjs  # 工作区初始化
│   ├── new-project.mjs
│   ├── parse-content.mjs
│   ├── analyze-layouts.mjs
│   ├── render-slide.mjs
│   └── build-deck.mjs
│
├── references/        # 文档
│   ├── layouts.md
│   ├── content-rules.md
│   ├── dimensions/
│   └── templates/
│
└── (工作区)
    └── ~/Desktop/PPT/
        ├── motion-kit/    # Remotion 项目
        │   └── src/
        │       ├── styles.ts
        │       ├── Root.tsx
        │       └── compositions/
        │           ├── CoverHero.tsx
        │           ├── BulletList.tsx
        │           ├── BinaryComparison.tsx
        │           ├── QuoteCallout.tsx
        │           ├── KeyStat.tsx
        │           ├── SplitScreen.tsx
        │           ├── IconGrid.tsx
        │           ├── ThreeColumns.tsx
        │           ├── BentoGrid.tsx
        │           ├── Funnel.tsx
        │           ├── Dashboard.tsx
        │           ├── CircularFlow.tsx
        │           ├── Timeline.tsx
        │           ├── ComparisonMatrix.tsx
        │           ├── Agenda.tsx
        │           ├── SectionBreak.tsx
        │           └── shared/
        │               └── visuals/
        │                   ├── DeviceFrame.tsx
        │                   ├── AbstractShapes.tsx
        │                   ├── GeometricDeco.tsx
        │                   ├── DataElements.tsx
        │                   └── FlowDiagram.tsx
        └── projects/
            └── <project>/
                ├── sources/
                ├── build/
                └── exports/
```

---

## 依赖

### 运行时（内置）

- Node.js (v18+)
- Bun（脚本执行）
- Remotion（渲染）
- pptxgenjs（PPTX 组装）

### 无外部 API

本项目设计为**完全自包含**：

- 无云服务
- 无需 API 密钥
- 无网络请求
- 所有处理本地完成

---

## 版本历史

| 版本 | 日期    | 变更                                               |
| ---- | ------- | -------------------------------------------------- |
| v1.1 | 2026-02 | 新增 6 种风格、12 种布局、智能分页、视觉组件库增强 |
| v1.0 | 2026-02 | 初始发布：5 种风格、4 种模板、视觉组件库           |

---

## 贡献指南

添加新功能时：

1. 在 `styles.ts` 中更新新视觉风格
2. 在 `compositions/` 目录创建组件
3. 在 `Root.tsx` 中注册所有风格变体（组件名-风格名）
4. 如需要，更新 `render-slide.mjs`
5. 更新 `SKILL.md` 文档
6. 添加测试渲染以验证

---

## 测试清单

发布前验证：

- [ ] 所有 11 种风格对每个组件渲染正确
- [ ] `init` 创建正确的目录结构
- [ ] `new` 创建包含所有文件夹的项目
- [ ] `parse` 生成有效的 script.md
- [ ] `analyze` 生成有效的推荐
- [ ] `build` 创建有效的 PPTX
- [ ] 无外部网络调用
- [ ] 代码中无 API 密钥
