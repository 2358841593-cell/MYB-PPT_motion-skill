import fs from "node:fs";
import path from "node:path";

import {
  ensureDir,
  parseArgs,
  readJson,
  writeJson,
  writeText,
  nowIso,
} from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun analyze-layouts.mjs --project <dir>",
      "",
      "Options:",
      "  --project <dir>   Project directory (required)",
      "  --accept-all      Accept all recommendations without prompting",
      "",
      "Output:",
      "  build/layout-recommendations.json",
    ].join("\n"),
  );
};

const LAYOUT_RULES = [
  {
    name: "binary-comparison",
    keywords: [
      "vs",
      "对比",
      "比较",
      "优劣",
      "前后",
      "串行",
      "并行",
      "发散",
      "收敛",
    ],
    priority: 2,
    description: "A vs B 对比布局",
    match: (text, slide) => {
      if (slide.leftTitle && slide.rightTitle) return 1.0;
      if (text.includes("vs") || text.includes("对比")) return 0.9;
      if (text.includes("串行") && text.includes("并行")) return 0.8;
      if (text.includes("发散") && text.includes("收敛")) return 0.8;
      return 0;
    },
  },
  {
    name: "linear-progression",
    keywords: ["步骤", "流程", "第一步", "第二步", "阶段", "过程"],
    priority: 2,
    description: "线性流程布局",
    match: (text) => {
      if (text.includes("步骤") || text.includes("流程")) return 0.9;
      if (/第[一二三四五]/.test(text)) return 0.8;
      return 0;
    },
  },
  {
    name: "hierarchical-layers",
    keywords: ["层级", "顶层", "底层", "核心", "金字塔"],
    priority: 2,
    description: "层级结构布局",
    match: (text) => {
      if (
        text.includes("层级") ||
        text.includes("顶层") ||
        text.includes("底层")
      )
        return 0.9;
      return 0;
    },
  },
  {
    name: "hub-spoke",
    keywords: ["核心", "围绕", "中心", "结构", "框架"],
    priority: 2,
    description: "中心辐射布局",
    match: (text, slide) => {
      if (slide.type === "framework") return 0.9;
      if (text.includes("核心") && text.includes("围绕")) return 0.8;
      return 0;
    },
  },
  {
    name: "dashboard",
    keywords: ["指标", "数据", "增长", "KPI", "统计"],
    priority: 2,
    description: "数据仪表盘布局",
    match: (text) => {
      if (text.includes("指标") || text.includes("KPI")) return 0.9;
      if (/\d+%/.test(text)) return 0.7;
      return 0;
    },
  },
  {
    name: "quote-callout",
    keywords: ["结论", "最终", "金句", "核心观点"],
    priority: 1,
    description: "引用/金句布局",
    match: (text, slide) => {
      if (slide.type === "conclusion") return 0.85;
      if (text.includes("结论")) return 0.8;
      if (text.length < 50 && !slide.bullets) return 0.7;
      return 0;
    },
  },
  {
    name: "title-hero",
    keywords: [],
    priority: 3,
    description: "大标题居中布局",
    match: (text, slide) => {
      if (slide.type === "cover") return 1.0;
      if (slide.type === "section") return 0.9;
      return 0;
    },
  },
  {
    name: "bullet-list",
    keywords: [],
    priority: 1,
    description: "要点列表布局（默认）",
    match: (text, slide) => {
      if (slide.bullets && slide.bullets.length > 0) return 0.7;
      return 0.5;
    },
  },
];

const STYLE_RULES = [
  {
    name: "tech",
    keywords: ["技术", "代码", "API", "数据", "算法", "架构", "系统", "框架"],
    description: "科技蓝风格 - 深蓝背景+浅蓝强调",
  },
  {
    name: "bold-editorial",
    keywords: ["产品", "发布", "营销", "用户", "市场", "增长", "转化"],
    description: "大胆对比风 - 高对比+多彩强调",
  },
  {
    name: "minimal",
    keywords: ["简洁", "高端", "留白", "设计", "品牌", "形象"],
    description: "极简留白风 - 克制配色+大量留白",
  },
  {
    name: "dark-atmospheric",
    keywords: ["电影", "氛围", "故事", "情绪", "叙事", "旅程"],
    description: "电影暗色风 - 深色+霓虹强调",
  },
];

const analyzeStyle = (allText) => {
  const text = allText.toLowerCase();

  const scores = STYLE_RULES.map((rule) => {
    const matches = rule.keywords.filter((kw) => text.includes(kw));
    return {
      name: rule.name,
      description: rule.description,
      score: matches.length,
    };
  });

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score > 0) {
    return {
      recommended: scores[0].name,
      recommendedDescription: scores[0].description,
      alternatives: scores
        .slice(1, 3)
        .filter((s) => s.score > 0)
        .map((s) => ({
          name: s.name,
          description: s.description,
        })),
    };
  }

  return {
    recommended: "apple",
    recommendedDescription: "经典苹果风 - 纯黑+白字+蓝色强调",
    alternatives: [
      { name: "tech", description: "科技蓝风格" },
      { name: "bold-editorial", description: "大胆对比风" },
    ],
  };
};

const parseScriptMd = (content) => {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontMatter = {};
  if (frontMatterMatch) {
    const yaml = frontMatterMatch[1];
    yaml.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        frontMatter[key.trim()] = valueParts
          .join(":")
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    });
  }

  const slidesMatch = content.match(/## Slide \d+[\s\S]*?(?=## Slide \d+|$)/g);
  const slides = [];

  if (slidesMatch) {
    slidesMatch.forEach((slideText, index) => {
      const yamlMatch = slideText.match(/```yaml\n([\s\S]*?)```/);
      if (yamlMatch) {
        const yaml = yamlMatch[1];
        const slide = { id: `s${String(index + 1).padStart(2, "0")}` };

        yaml.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("id:")) {
            slide.id = trimmed.replace("id:", "").trim();
          } else if (trimmed.startsWith("type:")) {
            slide.type = trimmed.replace("type:", "").trim();
          } else if (trimmed.startsWith("title:")) {
            slide.title = trimmed
              .replace("title:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("subtitle:")) {
            slide.subtitle = trimmed
              .replace("subtitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("bullets:")) {
            slide.bullets = [];
          } else if (trimmed.startsWith("- ") && slide.bullets) {
            slide.bullets.push(
              trimmed.replace("- ", "").replace(/^["']|["']$/g, ""),
            );
          } else if (trimmed.startsWith("leftTitle:")) {
            slide.leftTitle = trimmed
              .replace("leftTitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("rightTitle:")) {
            slide.rightTitle = trimmed
              .replace("rightTitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("leftBullets:")) {
            slide.leftBullets = [];
          } else if (trimmed.startsWith("rightBullets:")) {
            slide.rightBullets = [];
          } else if (trimmed.startsWith("- ") && slide.leftBullets) {
            slide.leftBullets.push(
              trimmed.replace("- ", "").replace(/^["']|["']$/g, ""),
            );
          } else if (trimmed.startsWith("- ") && slide.rightBullets) {
            slide.rightBullets.push(
              trimmed.replace("- ", "").replace(/^["']|["']$/g, ""),
            );
          } else if (trimmed.startsWith("notes:")) {
            slide.notes = "";
          } else if (
            slide.notes !== undefined &&
            !trimmed.includes(":") &&
            !trimmed.startsWith("```")
          ) {
            slide.notes += (slide.notes ? " " : "") + trimmed;
          }
        });

        slides.push(slide);
      }
    });
  }

  return { frontMatter, slides };
};

const analyzeSlide = (slide) => {
  const text = [
    slide.title,
    slide.subtitle,
    slide.notes,
    ...(slide.bullets || []),
  ]
    .filter(Boolean)
    .join(" ");

  const scores = LAYOUT_RULES.map((rule) => ({
    name: rule.name,
    description: rule.description,
    priority: rule.priority,
    score: rule.match(text, slide),
  })).filter((s) => s.score > 0);

  scores.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.priority - a.priority;
  });

  const recommended = scores[0] || {
    name: "bullet-list",
    description: "要点列表布局（默认）",
    score: 0.5,
  };

  return {
    slideId: slide.id,
    slideType: slide.type,
    title: slide.title,
    recommended: recommended.name,
    recommendedDescription: recommended.description,
    confidence: Math.round(recommended.score * 100),
    alternatives: scores.slice(1, 3).map((s) => ({
      name: s.name,
      description: s.description,
      confidence: Math.round(s.score * 100),
    })),
    accepted: false,
  };
};

const main = () => {
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

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const scriptPath = path.join(projectDir, "sources", "script.md");
  if (!fs.existsSync(scriptPath)) {
    console.error(`Error: script.md not found: ${scriptPath}`);
    process.exit(1);
  }

  const manifestPath = path.join(projectDir, "manifest.json");
  const manifest = readJson(manifestPath);

  if (manifest.stages?.scriptParsed?.status !== "completed") {
    console.error(
      "Error: script.md must be parsed first. Run parse-content.mjs",
    );
    process.exit(1);
  }

  console.log("Analyzing slides for layout recommendations...\n");

  const scriptContent = fs.readFileSync(scriptPath, "utf-8");
  const { frontMatter, slides } = parseScriptMd(scriptContent);

  if (slides.length === 0) {
    console.error("Error: No slides found in script.md");
    process.exit(1);
  }

  console.log(`Found ${slides.length} slides.\n`);

  const recommendations = slides.map((slide) => analyzeSlide(slide));

  const allText = slides
    .map((s) =>
      [s.title, s.subtitle, s.notes, ...(s.bullets || [])]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ");
  const styleRecommendation = analyzeStyle(allText);

  if (flags["accept-all"]) {
    recommendations.forEach((r) => {
      r.accepted = true;
    });
    console.log("Auto-accepted all recommendations.\n");
  }

  console.log("Style Recommendation:");
  console.log("─".repeat(80));
  console.log(
    `\n  → ${styleRecommendation.recommended} - ${styleRecommendation.recommendedDescription}`,
  );
  if (styleRecommendation.alternatives.length > 0) {
    console.log(`  Alternatives:`);
    styleRecommendation.alternatives.forEach((alt) => {
      console.log(`    - ${alt.name} - ${alt.description}`);
    });
  }

  console.log("\n\nLayout Recommendations:");
  console.log("─".repeat(80));

  recommendations.forEach((rec, index) => {
    console.log(
      `\n[${index + 1}] ${rec.title.slice(0, 40)}${rec.title.length > 40 ? "..." : ""}`,
    );
    console.log(`    Type: ${rec.slideType}`);
    console.log(
      `    → Recommended: ${rec.recommended} (${rec.confidence}% confidence)`,
    );
    if (rec.alternatives.length > 0) {
      console.log(`    Alternatives:`);
      rec.alternatives.forEach((alt) => {
        console.log(`      - ${alt.name} (${alt.confidence}%)`);
      });
    }
  });

  console.log("\n" + "─".repeat(80));

  const buildDir = path.join(projectDir, "build");
  ensureDir(buildDir);

  const outputPath = path.join(buildDir, "layout-recommendations.json");
  const output = {
    generatedAt: nowIso(),
    projectTitle: frontMatter.title,
    totalSlides: slides.length,
    style: styleRecommendation,
    recommendations,
    allLayouts: LAYOUT_RULES.map((r) => ({
      name: r.name,
      description: r.description,
    })),
    allStyles: [
      { name: "apple", description: "经典苹果风 - 纯黑+白字+蓝色强调" },
      { name: "tech", description: "科技蓝风 - 深蓝背景+浅蓝强调" },
      { name: "bold-editorial", description: "大胆对比风 - 高对比+多彩强调" },
      { name: "minimal", description: "极简留白风 - 克制配色+大量留白" },
      { name: "dark-atmospheric", description: "电影暗色风 - 深色+霓虹强调" },
    ],
  };

  writeJson(outputPath, output);
  console.log(`\nSaved: ${outputPath}`);

  if (!flags["accept-all"]) {
    console.log(
      "\nTo accept recommendations, edit the file and set 'accepted: true' for each slide.",
    );
    console.log("Or run with --accept-all to auto-accept all recommendations.");
  }

  const manifest2 = readJson(manifestPath);
  manifest2.stages.layoutsAnalyzed = { status: "completed", at: nowIso() };
  writeJson(manifestPath, manifest2);
  console.log(`Updated: ${manifestPath}`);
};

const run = async () => {
  try {
    main();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();
