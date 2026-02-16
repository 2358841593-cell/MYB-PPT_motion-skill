import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import {
  ensureDir,
  nowIso,
  parseArgs,
  readJson,
  writeJson,
  writeText,
  readText,
} from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  node parse-content.mjs --project <dir> --title <title>",
      "  node parse-content.mjs --project <dir> --title <title> --file content.txt",
      "",
      "Options:",
      "  --project <dir>   Project directory (required)",
      "  --title <title>   Episode title (required)",
      "  --file <path>     Read content from file instead of stdin",
      "  --lang <code>     Language code (default: zh)",
      "",
      "Smart Pagination Rules:",
      "  < 1000 words  → 5-10 slides",
      "  1000-3000 words → 10-18 slides",
      "  3000-5000 words → 15-25 slides",
      "  > 5000 words  → 20-30 slides",
    ].join("\n"),
  );
};

const readFromStdin = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const lines = [];
    rl.on("line", (line) => lines.push(line));
    rl.on("close", () => resolve(lines.join("\n")));
  });
};

const readContent = async (filePath) => {
  if (filePath) {
    return readText(filePath);
  }
  console.log(
    "Paste your content below. Press Ctrl+D (Unix) or Ctrl+Z (Windows) when done:\n",
  );
  return readFromStdin();
};

const SLIDE_COUNT_RULES = [
  { maxWords: 1000, minSlides: 5, maxSlides: 10 },
  { maxWords: 3000, minSlides: 10, maxSlides: 18 },
  { maxWords: 5000, minSlides: 15, maxSlides: 25 },
  { maxWords: Infinity, minSlides: 20, maxSlides: 30 },
];

const getRecommendedSlideCount = (wordCount) => {
  for (const rule of SLIDE_COUNT_RULES) {
    if (wordCount <= rule.maxWords) {
      return { min: rule.minSlides, max: rule.maxSlides };
    }
  }
  return { min: 20, max: 30 };
};

const countWords = (text) => {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
};

const CONTENT_TYPE_PATTERNS = {
  process: [
    "步骤",
    "第一步",
    "第二步",
    "第三步",
    "流程",
    "阶段",
    "过程",
    "首先",
    "然后",
    "最后",
  ],
  comparison: [
    "vs",
    "对比",
    "比较",
    "优劣",
    "前后",
    "A和B",
    "一方面",
    "另一方面",
  ],
  data: ["数据", "统计", "%", "增长", "下降", "指标", "KPI", "数字"],
  hierarchy: ["层级", "顶层", "底层", "核心", "金字塔", "结构", "框架"],
  cycle: ["循环", "迭代", "周期", "闭环", "反馈", "持续"],
  timeline: ["年", "月", "日", "时间线", "历史", "发展", "演进"],
  summary: ["总结", "归纳", "结论", "要点", "核心", "关键"],
};

const detectContentType = (text) => {
  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [type, patterns] of Object.entries(CONTENT_TYPE_PATTERNS)) {
    scores[type] = patterns.reduce((score, pattern) => {
      return score + (lowerText.includes(pattern.toLowerCase()) ? 1 : 0);
    }, 0);
  }

  const maxType = Object.entries(scores).reduce(
    (max, [type, score]) => (score > max.score ? { type, score } : max),
    { type: "statement", score: 0 },
  );

  return maxType.score > 0 ? maxType.type : "statement";
};

const VISUAL_COMPONENT_MAP = {
  process: ["StepIndicator", "FlowArrows", "LinearProgression"],
  comparison: ["BinaryComparison", "ScaleBar", "ComparisonMatrix"],
  data: ["MiniBarChart", "StatCard", "ProgressBar", "Dashboard"],
  hierarchy: ["TreeBranching", "HierarchicalLayers", "CircleRing"],
  cycle: ["CycleDiagram", "CircularFlow"],
  timeline: ["Timeline", "WindingRoadmap"],
  summary: ["KeyStat", "QuoteCallout"],
  statement: ["FloatingDots", "WaveLines"],
};

const getRecommendedVisuals = (contentType) => {
  return VISUAL_COMPONENT_MAP[contentType] || VISUAL_COMPONENT_MAP.statement;
};

const detectSlideType = (paragraph, index, totalParagraphs) => {
  const text = paragraph.toLowerCase();

  if (index === 0) return "cover";
  if (index === totalParagraphs - 1) {
    if (
      text.includes("结论") ||
      text.includes("最终") ||
      text.includes("总结")
    ) {
      return "conclusion";
    }
  }

  if (
    text.includes("问题") ||
    text.includes("为什么") ||
    text.includes("瓶颈")
  ) {
    return "problem";
  }

  if (text.includes("结论") || text.includes("最终") || text.includes("总结")) {
    return "conclusion";
  }

  if (text.includes("测试") || text.includes("发现") || text.includes("方案")) {
    return "solution";
  }

  if (text.includes("意味") || text.includes("结构") || text.includes("框架")) {
    return "framework";
  }

  if (text.includes("但") || text.includes("不过") || text.includes("注意")) {
    return "caveat";
  }

  return "statement";
};

const extractBullets = (paragraph) => {
  const lines = paragraph.split("\n").filter((l) => l.trim());
  const bullets = [];
  let narrative = [];

  const MIN_BULLET_LEN = 15;
  const MAX_BULLET_LEN = 50;
  const MAX_BULLETS = 4;

  const extractFromLongText = (text) => {
    const result = [];
    const sentences = text.split(/[。！？；\n]/);
    for (const s of sentences) {
      if (result.length >= MAX_BULLETS) break;
      const trimmed = s.trim();
      if (
        trimmed.length >= MIN_BULLET_LEN &&
        trimmed.length <= MAX_BULLET_LEN
      ) {
        result.push(trimmed);
      } else if (trimmed.length > MAX_BULLET_LEN) {
        const clauses = trimmed.split(/[，、：]/);
        for (const c of clauses) {
          if (result.length >= MAX_BULLETS) break;
          const ct = c.trim();
          if (ct.length >= MIN_BULLET_LEN && ct.length <= MAX_BULLET_LEN) {
            result.push(ct);
          }
        }
      }
    }
    return result;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("-") ||
      trimmed.startsWith("•") ||
      /^\d+[.、)]/.test(trimmed)
    ) {
      const bullet = trimmed.replace(/^[-•\d.、)]+\s*/, "");
      if (bullet.length >= MIN_BULLET_LEN && bullet.length <= MAX_BULLET_LEN) {
        bullets.push(bullet);
      } else if (bullet.length > MAX_BULLET_LEN) {
        const extracted = extractFromLongText(bullet);
        bullets.push(...extracted);
      }
    } else if (
      trimmed.length > 0 &&
      !trimmed.startsWith("```") &&
      !trimmed.startsWith("#")
    ) {
      narrative.push(trimmed);
    }
  }

  if (bullets.length === 0 && lines.length <= 8) {
    const candidates = lines.filter((l) => {
      const t = l.trim();
      return (
        t.length > 0 &&
        !t.startsWith("```") &&
        !t.startsWith("#") &&
        !t.startsWith("|")
      );
    });

    for (const line of candidates) {
      if (bullets.length >= MAX_BULLETS) break;
      const extracted = extractFromLongText(line);
      for (const b of extracted) {
        if (bullets.length >= MAX_BULLETS) break;
        if (!bullets.includes(b)) {
          bullets.push(b);
        }
      }
    }
    narrative = [];
  }

  return {
    bullets: bullets.slice(0, MAX_BULLETS),
    narrative: narrative.join(" "),
  };
};

const generateSlideTitle = (paragraph, slideType, index) => {
  const lines = paragraph.split("\n").filter((l) => l.trim());
  const firstLine = lines[0] || "";

  if (slideType === "cover") {
    return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine;
  }

  if (slideType === "problem") {
    if (firstLine.includes("问题") || firstLine.includes("为什么"))
      return firstLine;
    return (
      "问题：" +
      (firstLine.length > 30 ? firstLine.slice(0, 30) + "..." : firstLine)
    );
  }

  if (slideType === "conclusion") {
    if (firstLine.includes("结论") || firstLine.includes("总结"))
      return firstLine;
    return (
      "总结：" +
      (firstLine.length > 30 ? firstLine.slice(0, 30) + "..." : firstLine)
    );
  }

  return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine;
};

const smartSplitContent = (content, targetSlideCount) => {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
  const wordCount = countWords(content);
  const wordsPerSlide = Math.ceil(wordCount / targetSlideCount);

  const slides = [];
  let currentSlide = { lines: [], wordCount: 0 };
  let slideIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraWords = countWords(para);
    const isFirst = slideIndex === 0 && currentSlide.lines.length === 0;
    const isLast = i === paragraphs.length - 1;

    if (isFirst) {
      currentSlide.lines.push(para);
      currentSlide.wordCount += paraWords;
      if (currentSlide.wordCount >= wordsPerSlide * 0.5 || isLast) {
        slides.push({ ...currentSlide, index: slideIndex });
        slideIndex++;
        currentSlide = { lines: [], wordCount: 0 };
      }
    } else if (
      currentSlide.wordCount + paraWords > wordsPerSlide * 1.3 &&
      currentSlide.lines.length > 0
    ) {
      slides.push({ ...currentSlide, index: slideIndex });
      slideIndex++;
      currentSlide = { lines: [para], wordCount: paraWords };
    } else {
      currentSlide.lines.push(para);
      currentSlide.wordCount += paraWords;
    }

    if (isLast && currentSlide.lines.length > 0) {
      slides.push({ ...currentSlide, index: slideIndex });
    }
  }

  if (slides.length > targetSlideCount * 1.2) {
    const mergeRatio = Math.ceil(slides.length / targetSlideCount);
    const merged = [];
    for (let i = 0; i < slides.length; i += mergeRatio) {
      const toMerge = slides.slice(i, i + mergeRatio);
      merged.push({
        lines: toMerge.flatMap((s) => s.lines),
        wordCount: toMerge.reduce((sum, s) => sum + s.wordCount, 0),
        index: merged.length,
      });
    }
    return merged;
  }

  return slides;
};

const generateSlides = (paragraphs, title, content) => {
  const wordCount = countWords(content);
  const { min, max } = getRecommendedSlideCount(wordCount);
  const targetCount = Math.min(max, Math.max(min, Math.ceil(wordCount / 200)));

  console.log(`Word count: ${wordCount}, Target slides: ${targetCount}`);

  let slideBlocks;
  if (
    paragraphs.length >= targetCount * 0.8 &&
    paragraphs.length <= targetCount * 1.2
  ) {
    slideBlocks = paragraphs.map((p, i) => ({
      lines: [typeof p === "string" ? p : p.text],
      index: i,
    }));
  } else {
    slideBlocks = smartSplitContent(content, targetCount);
  }

  const totalParagraphs = slideBlocks.length;
  const slides = [];

  for (let i = 0; i < slideBlocks.length; i++) {
    const block = slideBlocks[i];
    const blockText = block.lines.join("\n");
    const paragraphLines = block.lines
      .flatMap((l) => l.split("\n"))
      .filter((l) => l.trim());

    const slideType = detectSlideType(blockText, i, totalParagraphs);
    const contentType = detectContentType(blockText);
    const { bullets, narrative } = extractBullets(blockText);
    const slideTitle = generateSlideTitle(blockText, slideType, i);

    const slide = {
      id: `s${String(i + 1).padStart(2, "0")}`,
      type: slideType,
      contentType: contentType,
      title: slideType === "cover" ? title : slideTitle,
      recommendedVisuals: getRecommendedVisuals(contentType),
    };

    if (slideType === "cover") {
      if (paragraphLines.length > 1 && paragraphLines[1].length < 60) {
        slide.subtitle = paragraphLines[1];
      }
      slide.notes = paragraphLines.slice(0, 2).join(" ");
    } else if (slideType === "framework" || contentType === "comparison") {
      const hasLeftRight =
        blockText.includes("vs") ||
        blockText.includes("对比") ||
        blockText.includes("发散");
      if (hasLeftRight) {
        slide.leftTitle = "并行（发散）";
        slide.leftBullets = ["扩张可能性", "放大试错密度"];
        slide.rightTitle = "系统（收敛）";
        slide.rightBullets = ["压缩噪声", "形成可执行结论"];
      } else {
        if (bullets.length > 0) {
          slide.bullets = bullets.slice(0, 4);
        }
      }
      slide.notes = paragraphLines.join(" ");
    } else {
      if (bullets.length > 0) {
        slide.bullets = bullets.slice(0, 4);
      }
      slide.notes = narrative || paragraphLines.slice(0, 3).join(" ");
    }

    const totalChars =
      (slide.bullets || []).reduce((sum, b) => sum + b.length, 0) +
      (slide.title?.length || 0) +
      (slide.subtitle?.length || 0);

    if (totalChars < 100 && narrative && narrative.length > 0) {
      const additionalBullets = narrative
        .split(/[。！？；]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 15 && s.length <= 50)
        .slice(0, 4 - (slide.bullets?.length || 0));

      if (additionalBullets.length > 0) {
        slide.bullets = [...(slide.bullets || []), ...additionalBullets].slice(
          0,
          4,
        );
      }
    }

    if (!slide.notes || slide.notes.length < 20) {
      slide.notes = paragraphLines.join(" ").slice(0, 200);
    }

    slides.push(slide);
  }

  return slides;
};

const generateScriptMd = (title, slides, lang) => {
  const frontMatter = [
    "---",
    `title: "${title}"`,
    `language: "${lang}"`,
    'aspect: "16:9"',
    'theme: "auto"',
    "defaultSlideSeconds: 6",
    "---",
    "",
    "# Goal",
    "",
    `- [自动生成：请补充本期目标]`,
    `- [自动生成：请补充受众]`,
    "",
    "# Data Files",
    "",
    "[如需引用数据文件，请在此列出]",
    "",
    "# Slides",
    "",
  ].join("\n");

  const slidesContent = slides
    .map((slide) => {
      const yamlLines = [
        `id: ${slide.id}`,
        `type: ${slide.type}`,
        `contentType: ${slide.contentType || "statement"}`,
        `title: "${slide.title}"`,
      ];

      if (slide.subtitle) {
        yamlLines.push(`subtitle: "${slide.subtitle}"`);
      }

      if (slide.bullets && !slide.leftTitle) {
        yamlLines.push("bullets:");
        slide.bullets.forEach((b) => yamlLines.push(`  - "${b}"`));
      }

      if (slide.leftTitle) {
        yamlLines.push(`leftTitle: "${slide.leftTitle}"`);
        yamlLines.push("leftBullets:");
        (slide.leftBullets || []).forEach((b) => yamlLines.push(`  - "${b}"`));
        yamlLines.push(`rightTitle: "${slide.rightTitle}"`);
        yamlLines.push("rightBullets:");
        (slide.rightBullets || []).forEach((b) => yamlLines.push(`  - "${b}"`));
      }

      if (slide.recommendedVisuals && slide.recommendedVisuals.length > 0) {
        yamlLines.push(
          `recommendedVisuals: ${slide.recommendedVisuals.join(", ")}`,
        );
      }

      yamlLines.push("notes: |");
      yamlLines.push(`  ${slide.notes || "[请补充口播备注]"}`);

      return `## Slide ${slide.id.replace("s", "")}\n\n\`\`\`yaml\n${yamlLines.join("\n")}\n\`\`\``;
    })
    .join("\n\n");

  return frontMatter + slidesContent + "\n";
};

const main = async () => {
  const { flags } = parseArgs(process.argv);

  if (flags.help) {
    usage();
    process.exit(0);
  }

  const projectDir = flags.project;
  if (!projectDir) {
    usage();
    console.error("\nError: --project is required.");
    process.exit(1);
  }

  const title = flags.title;
  if (!title) {
    usage();
    console.error("\nError: --title is required.");
    process.exit(1);
  }

  const lang = flags.lang || "zh";
  const contentFilePath = flags.file;

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const manifestPath = path.join(projectDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: manifest.json not found in project: ${projectDir}`);
    process.exit(1);
  }

  const content = await readContent(contentFilePath);
  if (!content || content.trim().length === 0) {
    console.error("Error: No content provided.");
    process.exit(1);
  }

  const wordCount = countWords(content);
  console.log(`\nAnalyzing content...`);
  console.log(`  Characters: ${content.length}`);
  console.log(`  Words: ${wordCount}`);

  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
  console.log(`  Paragraphs: ${paragraphs.length}`);

  const slides = generateSlides(paragraphs, title, content);
  console.log(`  Generated: ${slides.length} slides`);

  const scriptContent = generateScriptMd(title, slides, lang);
  const scriptPath = path.join(projectDir, "sources", "script.md");
  writeText(scriptPath, scriptContent);
  console.log(`\nGenerated: ${scriptPath}`);

  const manifest = readJson(manifestPath);
  manifest.project.title = title;
  manifest.project.updatedAt = nowIso();
  manifest.project.wordCount = wordCount;
  manifest.project.slideCount = slides.length;
  manifest.stages.scriptParsed = { status: "completed", at: nowIso() };
  writeJson(manifestPath, manifest);
  console.log(`Updated: ${manifestPath}`);

  console.log("\nSlide summary:");
  slides.forEach((s, i) => {
    const visuals = s.recommendedVisuals ? ` [${s.recommendedVisuals[0]}]` : "";
    console.log(
      `  ${i + 1}. [${s.type}]${visuals} ${s.title.slice(0, 35)}${s.title.length > 35 ? "..." : ""}`,
    );
  });
};

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
