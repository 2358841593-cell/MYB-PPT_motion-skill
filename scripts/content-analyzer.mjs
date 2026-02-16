/**
 * 内容分析器 - 分析文案结构、数据特征、推荐布局
 */

const LAYOUT_PATTERNS = {
  // 流程类内容
  flow: {
    patterns: ["流程", "步骤", "阶段", "第一步", "第二步", "首先", "然后", "最后"],
    layouts: ["flow-with-notes", "chart-above-text", "timeline-with-details"],
  },
  // 对比类内容
  comparison: {
    patterns: ["对比", "vs", "相比", "区别", "差异", "优于", "不如"],
    layouts: ["card-combo-2", "diagonal-split", "chart-left-text"],
  },
  // 时间线类
  timeline: {
    patterns: ["年", "月", "历史", "发展", "演进", "历程", "时间"],
    layouts: ["timeline-with-details", "chart-above-text"],
  },
  // 数据展示类
  data: {
    patterns: ["数据", "统计", "占比", "增长", "下降", "%", "倍"],
    layouts: ["chart-with-sidebar", "chart-below-text", "chart-right-text"],
  },
  // 引用/金句类
  quote: {
    patterns: ["\"", """, "说", "认为", "强调", "核心是", "关键是"],
    layouts: ["quote-callout", "full-image-overlay"],
  },
  // 多项并列类
  list: {
    patterns: ["、", "包括", "包含", "主要有", "分为"],
    layouts: ["card-combo-3", "card-combo-4", "chart-above-text"],
  },
};

const analyzeContent = (text) => {
  const result = {
    type: "unknown",
    confidence: 0,
    suggestedLayouts: [],
    wordCount: 0,
    hasData: false,
    hasFlow: false,
    hasComparison: false,
    hasTimeline: false,
  };

  // 计算字数
  result.wordCount = text.replace(/\s/g, "").length;

  // 检测内容类型
  const scores = {};
  for (const [type, config] of Object.entries(LAYOUT_PATTERNS)) {
    scores[type] = 0;
    for (const pattern of config.patterns) {
      const regex = new RegExp(pattern, "gi");
      const matches = text.match(regex);
      if (matches) {
        scores[type] += matches.length;
      }
    }
  }

  // 找出最高分类型
  let maxScore = 0;
  let maxType = "unknown";
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  }

  result.type = maxType;
  result.confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0;
  result.suggestedLayouts = LAYOUT_PATTERNS[maxType]?.layouts || ["chart-above-text"];

  // 检测具体特征
  result.hasData = /[\d+%]/.test(text);
  result.hasFlow = /步骤|阶段|流程|第一|第二|第三/.test(text);
  result.hasComparison = /vs|对比|区别|差异|优于/.test(text);
  result.hasTimeline = /\d{4}年|\d{1,2}月|历史|发展|演进/.test(text);

  return result;
};

const estimateSlideCount = (wordCount, targetDensity = { min: 100, max: 300 }) => {
  const avgDensity = (targetDensity.min + targetDensity.max) / 2;
  const slides = Math.ceil(wordCount / avgDensity);
  return Math.max(5, Math.min(30, slides));
};

const splitContent = (text, targetDensity = { min: 100, max: 300 }) => {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const slides = [];
  let currentSlide = { text: "", wordCount: 0 };
  const splitPositions = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraWords = para.replace(/\s/g, "").length;

    if (currentSlide.wordCount + paraWords > targetDensity.max && currentSlide.wordCount >= targetDensity.min) {
      slides.push(currentSlide);
      splitPositions.push({
        after: `第${i}段`,
        reason: `达到${targetDensity.max}字上限`,
      });
      currentSlide = { text: para, wordCount: paraWords };
    } else {
      currentSlide.text += (currentSlide.text ? "\n\n" : "") + para;
      currentSlide.wordCount += paraWords;
    }
  }

  if (currentSlide.wordCount > 0) {
    slides.push(currentSlide);
  }

  return { slides, splitPositions };
};

const matchLayout = (slideAnalysis) => {
  const { type, wordCount, hasData, hasFlow, hasComparison, hasTimeline } = slideAnalysis;

  // 根据内容特征选择布局
  if (hasFlow && wordCount < 150) {
    return {
      primary: "flow-with-notes",
      alternatives: ["chart-above-text", "timeline-with-details"],
    };
  }

  if (hasTimeline && wordCount < 200) {
    return {
      primary: "timeline-with-details",
      alternatives: ["chart-above-text"],
    };
  }

  if (hasComparison) {
    return {
      primary: "card-combo-2",
      alternatives: ["diagonal-split"],
    };
  }

  if (hasData && wordCount < 150) {
    return {
      primary: "chart-with-sidebar",
      alternatives: ["chart-below-text", "chart-right-text"],
    };
  }

  // 默认布局
  return {
    primary: "chart-above-text",
    alternatives: ["card-combo-3", "quote-callout"],
  };
};

export { analyzeContent, estimateSlideCount, splitContent, matchLayout, LAYOUT_PATTERNS };

if (typeof require !== "undefined" && require.main === module) {
  const testText = `
过去一年发生了许多变化。MCP迅速被行业领导者采用，成为代理连接的标准。
Claude Code作为通用编码代理正式发布。我们还推出了Claude Agent SDK。
  `.trim();

  const analysis = analyzeContent(testText);
  console.log("Analysis:", JSON.stringify(analysis, null, 2));

  const layout = matchLayout(analysis);
  console.log("Layout:", JSON.stringify(layout, null, 2));
}
