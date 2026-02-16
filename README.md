# MYB-PPT_motion-skill

> 🎬 从文案到动画演示，一站式 PPT 生成工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-blue)](https://remotion.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 目录

- [功能特性](#功能特性)
- [完整工作流](#完整工作流)
- [Motion Kit 动画系统](#motion-kit-动画系统)
- [快速开始](#快速开始)
- [视觉风格](#视觉风格)
- [布局类型](#布局类型)
- [视觉组件库](#视觉组件库)
- [技术架构](#技术架构)
- [开发路线图](#开发路线图)

---


https://github.com/user-attachments/assets/b87f1f6a-5483-4ecb-85ce-74448fb70771




## 设计理念

| 理念         | 说明                                                 |
| ------------ | ---------------------------------------------------- |
| **流程可控** | AI 必须按 1→2→3→4→5 顺序执行，每步都需要用户确认     |
| **布局规范** | 参考 baoyu-slide-deck 的 14 种标准布局，确保设计质量 |
| **组件复用** | 基于 Remotion 组件库，支持 11 种视觉风格          |
| **自动优化** | 内置布局优化规则，自动检测并修复常见问题             |

---

## 功能特性

### 核心能力

- **内容到 PPT** - 复制URL获取网页信息/粘贴文案，针对PPT进行专业文案拆分 生成专业幻灯片
- **Motion Kit 动画化** - PPT 完成后可进一步动画化
- **双输出格式** - MP4 视频 + HTML 交互播放器
- **11 种视觉风格** - Apple, Tech, Dark Atmospheric 等
- **76+ 视觉组件** - 图表、流程图、形状装饰、字体效果
- **16 种布局模板** - 封面、列表、对比、金句、关键数据等
- **智能分页** - 基于字数动态计算 5-30 页
- **完全自包含** - 无外部 API，无云服务，100% 本地运行

### 与传统工具的区别

| 维度     | 传统 PPT 工具  | MYB-PPT_motion-skill           |
| -------- | -------------- | ------------------------------ |
| 内容输入 | 手动排版       | 粘贴文案/URL读取网页内容 自动生成               |
| 动画实现 | 预设模板       | 代码驱动，完全可控             |
| 输出格式 | 仅 PPTX        | **MP4 视频 + HTML 交互播放器** |
| 图表动画 | 静态图表       | 竞速动画、扇区展开、数字滚动等多种  |
| 背景效果 | 静态或简单过渡 | 呼吸光晕、浮动粒子、渐变流动等多种   |
| 精度控制 | 不可控         | 帧级精度（30fps）              |
| 物理效果 | 线性过渡       | Spring 物理缓动                |

---

## 完整工作流

```
┌─────────────────────────────────────────────────────────┐
│  阶段 1: PPT 制作                                        │
├─────────────────────────────────────────────────────────┤
│  文案 → 规划布局 → 渲染 PNG → 生成 PPTX                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  阶段 2: Motion Kit 动画化                               │
├─────────────────────────────────────────────────────────┤
│  入场动画 → 图表动画 → 背景动效 → 导出 MP4/HTML          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 14 种标准布局

```
基础布局
├── title-hero        # 大标题居中，封面/章节页
├── quote-callout     # 金句/引用，带署名
├── bullet-list       # 要点列表，纯文字
├── key-stat          # 单个大数字，数据展示
├── split-screen      # 左右分屏，图文对比
├── three-columns     # 三栏并列
└── icon-grid         # 图标网格，功能展示

信息图布局
├── binary-comparison   # A vs B 对比
├── hierarchical-layers # 层级结构（金字塔）
├── circular-flow       # 环形循环，迭代流程
├── funnel              # 漏斗转化
└── timeline            # 时间线
```

### 布局选择决策表

| 内容类型          | 推荐布局            | 理由               |
| ----------------- | ------------------- | ------------------ |
| 封面/章节页       | title-hero          | 大标题，视觉冲击   |
| 金句/引用         | quote-callout       | 突出核心观点       |
| 简单列表（2-4条） | bullet-list         | 清晰易读           |
| 对比（A vs B）    | binary-comparison   | 左右对比，一目了然 |
| 流程/步骤         | hierarchical-layers | 顺序展示           |
| 层级结构          | hierarchical-layers | 金字塔/堆叠        |
| 循环流程          | circular-flow       | PDCA等             |
| 三组并列内容      | three-columns       | 平衡展示           |
| 关键数据          | key-stat            | 数字聚焦           |

---

## 操作流程

### ⛔ 强制执行规则（所有使用者必须遵守）

**Step 0: 读取上下文（不可跳过）**

必须读取以下文件：

```bash
# 1. 读取原始文案
cat <project>/sources/raw-content.txt

# 2. 读取当前规划
cat <project>/sources/script.md

# 3. 读取标准值库
cat /Users/myb/Desktop/PPT/motion-kit/src/styles.ts

# 4. 读取布局规范
cat references/split-layout-spec.md
```

**Step 1: 列出执行清单**

必须明确列出要修改的内容和不能修改的边界。

**Step 2: 等待用户确认**

**Step 3: 执行**

只修改清单中列出的内容，每项完成后勾选。

**Step 4: 验证**

渲染后用图像分析验证。

**Step 5: 报告**

逐项报告结果。

### 绝对禁止事项

| 禁止                   | 说明              | 正确做法                           |
| ---------------------- | ----------------- | ---------------------------------- |
| ❌ 硬编码 fontSize     | 如 `fontSize: 26` | 使用 `currentStyle.bulletFontSize` |
| ❌ 硬编码 padding      | 如 `padding: 100` | 使用 `currentStyle.contentPadding` |
| ❌ 擅自修改 visualType | 必须用户确认      | 保留原始设置                       |
| ❌ 删除 bullets        | 忽略原文案内容    | 必须保留                           |
| ❌ 不读规划直接改      | 凭记忆修改        | 先读取文件                         |
| ❌ 跳过验证            | 修改后不检查      | 必须渲染+验证                      |

### ⛔ 强制流程（不可跳过）

```
Step 1: 接收文案 → 仅接收，不执行任何操作
   ↓
Step 2: AI 手动编写规划 → 必须参考 references/layouts.md
   ↓
Step 3: 视觉组件方案 → 每页必须匹配视觉库组件
   ↓
Step 4: 用户确认 → 必须等待用户明确同意
   ↓
Step 5: 渲染生成 → 用户确认后才能执行
```

### 渲染命令

```bash
# 渲染所有幻灯片
node scripts/render-slide.mjs --project <项目目录> --all

# 渲染单页
node scripts/render-slide.mjs --project <项目目录> --slide 1

# 生成 PPTX
node scripts/build-deck.mjs --project <项目目录> --skip-render
```

---


## Motion Kit 动画系统

### 设计理念

Motion Kit 是 PPT 生成的最终呈现阶段。当用户对静态 PPT 满意后，可以进一步动画化：

- **MP4 视频版** - 自动播放，40秒，适合分享/存档
- **HTML 交互版** - 用户控制翻页，适合现场演示

### 核心优势

1. **专业级动画效果** - 对标 Apple Keynote
2. **开发者完全可控** - React + Remotion，代码即动画
3. **双输出格式** - MP4 + HTML
4. **帧级精度** - 30fps，每帧可控
5. **优雅 Spring 物理** - 真实物理感的缓动效果

### 动画效果库

#### 入场动画

| 效果       | 说明                                          |
| ---------- | --------------------------------------------- |
| 淡入上移   | 标题从下方淡入，带缩放                        |
| 依次入场   | 列表/卡片依次出现，间隔 8 帧                  |
| 标题入场   | 4 种效果：fadeUp, fadeIn, scaleIn, slideRight |
| 副标题入场 | 延迟 15 帧入场                                |
| 卡片入场   | 依次入场，带缩放                              |

#### 图表动画

| 效果           | 说明                   |
| -------------- | ---------------------- |
| **竞速柱状图** | 柱子依次生长，竞速效果 |
| **饼图展开**   | 扇区依次展开动画       |

#### 背景动效

| 效果       | 说明                   |
| ---------- | ---------------------- |
| 浮动粒子   | 25+ 粒子随机浮动、闪烁 |
| 呼吸光晕   | 中心光圈脉动           |
| 同心圆脉动 | 5 圆环呼吸效果         |
| 渐变流动   | 色相缓慢旋转           |
| 角落括号   | 4 角括号闪烁           |

#### 数字动画

| 效果     | 说明              |
| -------- | ----------------- |
| 数字滚动 | 从 0 滚动到目标值 |
| 光效脉冲 | 数字光晕脉动      |

### 导出能力

#### MP4 视频

```bash
npx remotion render src/index.ts Presentation out.mp4
```

- 帧率：30fps
- 编码：H.264
- 总时长：8 页 × 5 秒 = 40 秒

#### HTML 交互式播放器

```bash
npm run dev
# 访问 http://localhost:3000/presentation
```

交互控制：

- 空格键 / 点击 → 播放下一页
- 左箭头 → 返回上一页
- 动画结束 → 自动暂停

### Animation Hooks

```typescript
// 入场动画
const { progress, opacity, scale, translateY } = useSlideAnimation();

// 依次入场
const { progress, opacity, scale, translateY } = useStaggerAnimation(index);

// 呼吸效果
const { scale, opacity } = useBreathingAnimation();

// 浮动效果
const { translateY, translateX } = useFloatingAnimation();

// 数字滚动
const value = useCountUp(endValue);

// 光效脉冲
const { glowOpacity, glowScale } = useGlowPulse();
```

### 核心配置

```typescript
const ELEGANT_SPRING = {
  damping: 25, // 高阻尼 = 平滑
  stiffness: 80, // 适中刚度
};

const FPS = 30;
const ANIMATION_FRAMES = 90; // 3 秒动画
const HOLD_FRAMES = 60; // 2 秒停留
const SLIDE_FRAMES = 150; // 每页 5 秒
```

---

## 快速开始

### 环境要求

- Node.js v18+
- Bun（推荐）或 npm

### 安装

需要克隆两个仓库：

```bash
# 1. 克隆 Skill
git clone https://github.com/MYB/MYB-PPT_motion-skill.git
cd MYB-PPT_motion-skill
npm install

# 2. 克隆 Motion Kit（渲染引擎）
cd ..
git clone https://github.com/MYB/MYB-PPT_motion-kit.git
cd MYB-PPT_motion-kit
npm install
```

### 内容输入方式

支持两种方式输入内容，AI 会自动进行最适合 PPT 的文案拆解：

#### 方式 1: URL 读取

提供网页 URL，自动读取并解析内容：

```bash
# 从 URL 读取
bun run scripts/parse-content.mjs --url https://example.com/article
```

#### 方式 2: 直接粘贴

直接复制文案粘贴：

```bash
# 粘贴模式
bun run scripts/parse-content.mjs --paste
# 然后粘贴你的内容，按 Ctrl+D 结束
```

AI 会自动：

- 分析内容结构
- 智能分页（5-30 页）
- 推荐合适的布局
- 匹配视觉组件

### 使用

```bash
# 1. 创建新项目
bun run scripts/new-project.mjs --title "我的演讲" --slug "my-ppt"

# 2. 解析内容（URL 或粘贴）
bun run scripts/parse-content.mjs --project ~/Desktop/PPT/projects/my-ppt

# 3. 分析布局
bun run scripts/analyze-layouts.mjs --project ~/Desktop/PPT/projects/my-ppt

# 4. 构建幻灯片（PNG + PPTX）
bun run scripts/build-deck.mjs --project ~/Desktop/PPT/projects/my-ppt

# 5. 动画化渲染（MP4）
cd ../MYB-PPT_motion-kit
npx remotion render src/index.ts Presentation out.mp4

# 6. 启动交互播放器（HTML）
npm run dev
```

### 输出

```
~/Desktop/PPT/projects/my-ppt/
├── sources/script.md        # 生成的脚本
├── build/
│   ├── deck/                # PNG 幻灯片
│   │   ├── slide-s01.png
│   │   └── ...
│   └── layout-recommendations.json
└── exports/
    └── recording.pptx       # 最终演示文稿
```

---

## 视觉风格（11 种）

| 风格               | 背景           | 适用场景      |
| ------------------ | -------------- | ------------- |
| `apple`            | #0A0A0A 纯黑   | 默认，通用    |
| `tech`             | #0F172A 深蓝   | 技术/数据讲解 |
| `bold-editorial`   | #1A1A1A 深灰   | 产品/营销演讲 |
| `minimal`          | #FAFAFA 浅灰白 | 高端/简洁演讲 |
| `dark-atmospheric` | #0D0D0D 纯黑   | 故事/氛围内容 |
| `corporate`        | #1E293B 深蓝灰 | 商务/企业报告 |
| `chalkboard`       | #2C3E50 深灰绿 | 教育/培训内容 |
| `blueprint`        | #0A192F 工程蓝 | 工程/架构展示 |
| `notion`           | #FFFFFF 纯白   | 笔记/文档风格 |
| `sketch-notes`     | #FFF8DC 米黄   | 创意/头脑风暴 |
| `scientific`       | #F8FAFC 浅灰   | 学术/科研展示 |

<img width="1920" height="1080" alt="tech" src="https://github.com/user-attachments/assets/1d00bf61-7f1b-44d1-900d-800692c0ebc0" />
<img width="1920" height="1080" alt="sketch-notes" src="https://github.com/user-attachments/assets/3e632e5d-447c-467f-810b-d6114037b091" />
<img width="1920" height="1080" alt="scientific" src="https://github.com/user-attachments/assets/91af6cd4-4739-41a9-9bda-7e45c18bd7dd" />
<img width="1920" height="1080" alt="notion" src="https://github.com/user-attachments/assets/1dae7b9e-1494-4cd9-85fa-f778716eba6c" />
<img width="1920" height="1080" alt="minimal" src="https://github.com/user-attachments/assets/4ef67344-9a60-49c1-a4a3-ba50f1cce2ef" />
<img width="1920" height="1080" alt="dark-atmospheric" src="https://github.com/user-attachments/assets/2484c7b4-d630-41aa-8bed-7db18c060b24" />
<img width="1920" height="1080" alt="corporate" src="https://github.com/user-attachments/assets/fb248bd2-4917-4829-bfde-e2af4b991ef9" />
<img width="1920" height="1080" alt="chalkboard" src="https://github.com/user-attachments/assets/b819c140-ea72-4e8f-9e1c-399479134211" />
<img width="1920" height="1080" alt="bold-editorial" src="https://github.com/user-attachments/assets/2d14295a-d28a-490f-9ab4-adf8e543e164" />
<img width="1920" height="1080" alt="blueprint" src="https://github.com/user-attachments/assets/b1662f18-bac0-42e3-b3c5-c9dbeebfa634" />
<img width="1920" height="1080" alt="apple" src="https://github.com/user-attachments/assets/9db98bbd-124d-47f4-ad5f-d6876f093c9d" />

---

## 布局类型（16 种）

| 布局                | 描述          | 用途      |
| ------------------- | ------------- | --------- |
| `title-hero`        | 大标题居中    | 封面页    |
| `bullet-list`       | 编号列表      | 要点信息  |
| `binary-comparison` | A vs B 并排   | 对比分析  |
| `quote-callout`     | 大号引言      | 关键信息  |
| `key-stat`          | 大号数据      | 数据亮点  |
| `split-screen`      | 左右/上下分割 | 分屏展示  |
| `icon-grid`         | 图标网格      | 多项并列  |
| `three-columns`     | 三栏布局      | 三项对比  |
| `bento-grid`        | Bento 盒子    | 仪表盘    |
| `funnel`            | 漏斗图        | 转化流程  |
| `dashboard`         | 数据仪表盘    | 多指标    |
| `circular-flow`     | 环形流程      | 循环流程  |
| `timeline`          | 时间线        | 时间序列  |
| `comparison-matrix` | 对比矩阵      | 多维对比  |
| `agenda`            | 议程列表      | 议程/目录 |
| `section-break`     | 章节标题      | 章节过渡  |

---

## 视觉组件库（76 个组件）

### 字体效果（13 种）

KeynoteText, GlowText, ShadowText, GradientText, StrokeText, NeonText, Retro3DText, SplitColorText, LetterPressText, MetallicText, OutlineShadowText, PerspectiveText, EmbossText

<img width="1920" height="1080" alt="apple" src="https://github.com/user-attachments/assets/5999df9b-a1e9-4056-885d-1a62eff2905a" />

### 图表（12 种）

PieChart, DonutChart, BarChart, HorizontalBarChart, LineChart, AreaChart, RadarChart, GaugeChart, ProgressBars, ScatterChart, DataCard, FunnelChart

<img width="1920" height="1080" alt="apple" src="https://github.com/user-attachments/assets/3715caaf-d80c-4d66-b66a-73896ca2f53d" />

### 流程图（12 种）

PyramidDiagram, OnionDiagram, HorizontalFlow, VerticalFlow, CycleDiagram2, TreeDiagram, OrgChart, MatrixDiagram, SwimlaneDiagram, ComparisonDiagram, StepsDiagram, ChevronDiagram

<img width="1920" height="1080" alt="apple" src="https://github.com/user-attachments/assets/a437d0a5-214c-47c4-a791-6c8030339889" />

### 形状装饰（12 种）

Arrow, DoubleArrow, CurvedArrow, BlockArrow, IconShape, Divider, ShapeBracket, Badge, Tag, PlaceholderBox, DecorLine, CornerMark

<img width="1920" height="1080" alt="apple" src="https://github.com/user-attachments/assets/21cbbc0a-7422-428a-92b4-7f20a07ee4bb" />

### 抽象装饰（5 种）

FloatingDots, ConnectionLines, GlowingPoints, WaveLines, DecorativeGrid

### 几何装饰（6 种）

CircleRing, ConcentricCircles, HexagonGrid, DiamondShape, CornerBrackets, FloatingBlocks

### 数据元素（5 种）

ProgressBar, MiniBarChart, StatCard, MiniLineChart, DataCardStack

### 设备框架（2 种）

DeviceFrame, DeviceCluster

---

## 技术架构

```
MYB-PPT_motion-skill/
├── scripts/           # 核心脚本
│   ├── _lib.mjs       # 共享工具
│   ├── init-root.mjs  # 工作区初始化
│   ├── new-project.mjs
│   ├── parse-content.mjs
│   ├── analyze-layouts.mjs
│   ├── render-slide.mjs
│   └── build-deck.mjs
├── references/        # 文档
│   ├── layouts.md
│   ├── content-rules.md
│   └── dimensions/
└── SKILL.md           # 完整文档

MYB-PPT_motion-kit/    # Remotion 渲染引擎
├── hooks/
│   └── useSlideAnimation.ts    # Animation Hooks
├── components/
│   ├── AnimatedSlide.tsx       # 动画组件
│   └── PresentationPlayer.tsx  # HTML 播放器
├── compositions/
│   ├── Presentation.tsx        # 多页幻灯片
│   ├── charts/animations/      # 图表动画
│   └── shared/visuals/         # 视觉组件
└── app/presentation/           # Next.js 播放器
```

---

## 开发路线图

### 已完成 (v2.0)

- [x] 11 种视觉风格
- [x] 16 种布局模板
- [x] 76+ 视觉组件
- [x] 智能分页
- [x] PPTX 导出
- [x] **Motion Kit 动画系统**
- [x] **MP4 视频导出**
- [x] **HTML 交互式播放器**
- [x] **竞速图表动画**
- [x] **饼图扇区展开**
- [x] **数字滚动动画**
- [x] **动态背景效果**
- [x] **URL 读取 / 直接粘贴两种输入方式**

### 计划中

- [ ] 数据可视化（从 CSV/JSON 生成图表）
- [ ] 智能内容优化
- [ ] PDF 导出
- [ ] 长图导出
- [ ] 更多图表动画类型

---

## 贡献

欢迎贡献！请提交 Pull Request。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 版本历史

| 版本  | 日期       | 更新                                                    |
| ----- | ---------- | ------------------------------------------------------- |
| 2.0.0 | 2026-02-17 | Motion Kit: PPT 动画化呈现系统（MP4 + HTML 交互播放器） |
| 1.5.0 | 2026-02-16 | 新增动画效果库                                          |
| 1.0.0 | 2026-02-15 | 初始版本：40 组件视觉库，11 种风格，14 种布局           |
