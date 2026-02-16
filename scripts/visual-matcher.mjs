import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import {
  ensureDir,
  parseArgs,
  readJson,
  writeJson,
  nowIso,
  readText,
} from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun visual-matcher.mjs --project <dir>",
      "  bun visual-matcher.mjs --project <dir> --slide <number>",
      "",
      "Description:",
      "  Analyzes slide content and extracts structured data for visual components.",
      "  Creates dedicated visual slides when content needs diagrams/charts.",
      "",
      "Options:",
      "  --project <dir>   Project directory (required)",
      "  --slide <number>  Process specific slide only",
      "  --dry-run         Show what would be done without rendering",
    ].join("\n"),
  );
};

const VISUAL_PATTERNS = {
  pyramid: {
    patterns: [
      /层级|层次|顶层|底层|核心层|基础层|战略层|战术层|执行层/gi,
      /金字塔|分层|架构.*层/gi,
    ],
    minMatches: 2,
    extractData: (text) => {
      const layers = [];
      const layerPatterns = [
        /(?:顶层|战略层|核心层|第一层)[：:]\s*(.+?)(?=(?:中层|战术层|第二层|底层|基础层|执行层|$))/gi,
        /(?:中层|战术层|第二层)[：:]\s*(.+?)(?=(?:底层|基础层|执行层|第三层|$))/gi,
        /(?:底层|基础层|执行层|第三层)[：:]\s*(.+?)(?=($))/gi,
      ];

      const levelKeywords = [
        "战略",
        "战术",
        "执行",
        "核心",
        "中间",
        "基础",
        "顶层",
        "中层",
        "底层",
      ];
      const lines = text.split(/[。\n]/);

      for (const line of lines) {
        for (const keyword of levelKeywords) {
          if (line.includes(keyword) && line.length > 5 && line.length < 50) {
            const label = line.trim();
            if (!layers.find((l) => l.label === label)) {
              layers.push({
                label: keyword + "层",
                sublabel: line
                  .replace(keyword, "")
                  .replace(/[：:]/g, "")
                  .trim()
                  .slice(0, 20),
              });
            }
          }
        }
      }

      if (layers.length >= 2) return { levels: layers.slice(0, 4) };
      return null;
    },
    composition: "PyramidDiagram",
    minContentLength: 3,
  },

  flow: {
    patterns: [
      /第[一二三四五六七八九十]+步/gi,
      /步骤\s*[一二三四五六七八九十\d]+/gi,
      /阶段\s*[一二三四五六七八九十\d]+/gi,
      /首先.+然后.+最后/gi,
      /流程|过程|步骤/gi,
    ],
    minMatches: 2,
    extractData: (text) => {
      const steps = [];
      const stepPatterns = [
        /第([一二三四五六七八九十\d]+)[步阶段][：:.\s]*(.+?)(?=第[一二三四五六七八九十\d]+[步阶段]|[。\n]|$)/gi,
        /步骤\s*([一二三四五六七八九十\d]+)[：:.\s]*(.+?)(?=步骤\s*[一二三四五六七八九十\d]+|[。\n]|$)/gi,
      ];

      for (const pattern of stepPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const title = match[2].trim().slice(0, 15);
          if (title && !steps.find((s) => s.title === title)) {
            steps.push({ title, description: "" });
          }
        }
      }

      if (steps.length >= 2) return { steps: steps.slice(0, 6) };

      const flowKeywords = text.match(
        /首先|然后|接着|最后|第一步|第二步|第三步/g,
      );
      if (flowKeywords && flowKeywords.length >= 2) {
        const sentences = text
          .split(/[。；]/)
          .filter((s) => s.trim().length > 5 && s.trim().length < 50);
        const flowSteps = sentences
          .slice(0, 5)
          .map((s) => ({ title: s.trim().slice(0, 15), description: "" }));
        if (flowSteps.length >= 2) return { steps: flowSteps };
      }

      return null;
    },
    composition: "HorizontalFlow",
    minContentLength: 3,
  },

  cycle: {
    patterns: [
      /循环|迭代|闭环|反馈|持续/gi,
      /PDCA|计划.*执行.*检查.*改进/gi,
      /周而复始|往复/gi,
    ],
    minMatches: 2,
    extractData: (text) => {
      const labels = [];
      const cyclePatterns = [
        /(?:计划|Plan)[：:\s]*(\S+)/gi,
        /(?:执行|Do)[：:\s]*(\S+)/gi,
        /(?:检查|Check)[：:\s]*(\S+)/gi,
        /(?:改进|Act)[：:\s]*(\S+)/gi,
      ];

      const defaultLabels = ["计划", "执行", "检查", "改进"];
      const pdcaMatch = text.match(/计划|执行|检查|改进|Plan|Do|Check|Act/i);

      if (pdcaMatch) {
        const parts = text
          .split(/[，、。]/)
          .filter((s) => s.trim().length > 1 && s.trim().length < 10);
        if (parts.length >= 3) {
          return { labels: parts.slice(0, 5).map((p) => p.trim()) };
        }
        return { labels: defaultLabels };
      }

      return null;
    },
    composition: "CycleDiagram",
    minContentLength: 2,
  },

  comparison: {
    patterns: [
      /vs\.?|对比|比较|优劣/gi,
      /一方面.*另一方面/gi,
      /A[与和]B|两者/gi,
      /并行.*发散|收敛/gi,
    ],
    minMatches: 1,
    extractData: (text) => {
      const leftItems = [];
      const rightItems = [];

      const vsMatch = text.match(/(.+?)\s*(?:vs\.?|对比|VS)\s*(.+)/i);
      if (vsMatch) {
        return {
          leftTitle: vsMatch[1].trim().slice(0, 10),
          leftItems: [],
          rightTitle: vsMatch[2].trim().slice(0, 10),
          rightItems: [],
        };
      }

      const lines = text.split(/[。\n]/);
      let inLeft = false,
        inRight = false;
      let leftTitle = "",
        rightTitle = "";

      for (const line of lines) {
        if (
          line.includes("并行") ||
          line.includes("发散") ||
          line.includes("一方面")
        ) {
          inLeft = true;
          inRight = false;
          leftTitle = line.slice(0, 15);
        } else if (
          line.includes("系统") ||
          line.includes("收敛") ||
          line.includes("另一方面")
        ) {
          inLeft = false;
          inRight = true;
          rightTitle = line.slice(0, 15);
        } else if (
          inLeft &&
          line.trim().length > 3 &&
          line.trim().length < 30
        ) {
          leftItems.push(line.trim());
        } else if (
          inRight &&
          line.trim().length > 3 &&
          line.trim().length < 30
        ) {
          rightItems.push(line.trim());
        }
      }

      if (
        leftTitle ||
        rightTitle ||
        leftItems.length > 0 ||
        rightItems.length > 0
      ) {
        return {
          leftTitle: leftTitle || "方案A",
          leftItems: leftItems.slice(0, 4),
          rightTitle: rightTitle || "方案B",
          rightItems: rightItems.slice(0, 4),
        };
      }

      return null;
    },
    composition: "BinaryComparison",
    minContentLength: 2,
  },

  timeline: {
    patterns: [
      /\d{4}年|\d{1,2}月/g,
      /时间线|发展历程|演进|历史/gi,
      /第一阶段|第二阶段|第三阶段/gi,
    ],
    minMatches: 2,
    extractData: (text) => {
      const events = [];
      const yearPattern = /(\d{4})年?[：:\s]*(.+?)(?=\d{4}年|[。\n]|$)/g;

      let match;
      while ((match = yearPattern.exec(text)) !== null) {
        events.push({
          year: match[1],
          title: match[2].trim().slice(0, 15) || "事件",
          description: "",
        });
      }

      if (events.length >= 2) return { events: events.slice(0, 6) };

      const stagePattern =
        /第([一二三四五六七八九十\d]+)阶段[：:\s]*(.+?)(?=第[一二三四五六七八九十\d]+阶段|[。\n]|$)/gi;
      const stages = [];
      while ((match = stagePattern.exec(text)) !== null) {
        stages.push({
          year: `阶段${match[1]}`,
          title: match[2].trim().slice(0, 15),
          description: "",
        });
      }

      if (stages.length >= 2) return { events: stages.slice(0, 6) };

      return null;
    },
    composition: "Timeline",
    minContentLength: 2,
  },

  funnel: {
    patterns: [/漏斗|转化|留存/gi, /访问.*注册.*付费/gi, /曝光.*点击.*转化/gi],
    minMatches: 2,
    extractData: (text) => {
      const stages = [];
      const funnelKeywords = [
        "访问",
        "曝光",
        "浏览",
        "点击",
        "注册",
        "下载",
        "激活",
        "付费",
        "复购",
      ];

      const lines = text.split(/[，、。\n]/);
      for (const line of lines) {
        for (const keyword of funnelKeywords) {
          if (line.includes(keyword)) {
            const valueMatch = line.match(/(\d+[.%万]?)/);
            stages.push({
              label: keyword,
              value: valueMatch ? valueMatch[1] : "",
            });
            break;
          }
        }
      }

      if (stages.length >= 2) return { stages: stages.slice(0, 5) };
      return null;
    },
    composition: "Funnel",
    minContentLength: 2,
  },

  tree: {
    patterns: [/分支|子类|下属|包含/gi, /总部.*部门|根节点.*叶子/gi],
    minMatches: 1,
    extractData: (text) => {
      const children = [];
      const branchPattern = /(?:包括|分为|含有)[：:]?\s*(.+?)(?=[。。\n]|$)/gi;

      let match;
      if ((match = branchPattern.exec(text)) !== null) {
        const items = match[1]
          .split(/[、，,和与]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 15);
        if (items.length >= 2) {
          return { root: text.slice(0, 10), children: items.slice(0, 5) };
        }
      }

      return null;
    },
    composition: "TreeDiagram",
    minContentLength: 2,
  },
};

const detectVisualType = (text) => {
  const results = [];

  for (const [type, config] of Object.entries(VISUAL_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of config.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matchCount += matches.length;
      }
    }

    if (matchCount >= config.minMatches) {
      const data = config.extractData(text);
      if (data && Object.keys(data).length > 0) {
        results.push({
          type,
          composition: config.composition,
          matchCount,
          data,
          confidence: matchCount / config.patterns.length,
        });
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
};

const estimateVisualComplexity = (visualType, data) => {
  const complexityMap = {
    pyramid: { items: data.levels?.length || 0, threshold: 3 },
    flow: { items: data.steps?.length || 0, threshold: 4 },
    cycle: { items: data.labels?.length || 0, threshold: 4 },
    comparison: {
      items: (data.leftItems?.length || 0) + (data.rightItems?.length || 0),
      threshold: 4,
    },
    timeline: { items: data.events?.length || 0, threshold: 4 },
    funnel: { items: data.stages?.length || 0, threshold: 3 },
    tree: { items: data.children?.length || 0, threshold: 3 },
  };

  const info = complexityMap[visualType];
  if (!info) return { canInline: true, needsSeparateSlide: false };

  return {
    canInline: info.items <= info.threshold,
    needsSeparateSlide: info.items > info.threshold + 2,
    itemCount: info.items,
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
        const slide = {
          id: `s${String(index + 1).padStart(2, "0")}`,
          index: index + 1,
        };
        let currentArray = null;

        yaml.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("id:"))
            slide.id = trimmed.replace("id:", "").trim();
          else if (trimmed.startsWith("type:"))
            slide.type = trimmed.replace("type:", "").trim();
          else if (trimmed.startsWith("title:"))
            slide.title = trimmed
              .replace("title:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          else if (trimmed.startsWith("subtitle:"))
            slide.subtitle = trimmed
              .replace("subtitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          else if (trimmed.startsWith("bullets:")) {
            slide.bullets = [];
            currentArray = "bullets";
          } else if (trimmed.startsWith("notes:")) {
            currentArray = "notes";
          } else if (trimmed.startsWith("leftTitle:"))
            slide.leftTitle = trimmed
              .replace("leftTitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          else if (trimmed.startsWith("rightTitle:"))
            slide.rightTitle = trimmed
              .replace("rightTitle:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          else if (trimmed.startsWith("leftBullets:")) {
            slide.leftBullets = [];
            currentArray = "leftBullets";
          } else if (trimmed.startsWith("rightBullets:")) {
            slide.rightBullets = [];
            currentArray = "rightBullets";
          } else if (trimmed.startsWith("- ")) {
            const value = trimmed.replace("- ", "").replace(/^["']|["']$/g, "");
            if (currentArray === "bullets" && slide.bullets)
              slide.bullets.push(value);
            else if (currentArray === "leftBullets" && slide.leftBullets)
              slide.leftBullets.push(value);
            else if (currentArray === "rightBullets" && slide.rightBullets)
              slide.rightBullets.push(value);
          }
        });

        slide.rawText = slideText;
        slides.push(slide);
      }
    });
  }

  return { frontMatter, slides };
};

const renderVisualSlide = (
  visualInfo,
  slide,
  style,
  projectDir,
  motionKitDir,
) => {
  const compositionMap = {
    PyramidDiagram: "DiagramsDemo",
    HorizontalFlow: "DiagramsDemo",
    CycleDiagram: "DiagramsDemo",
    BinaryComparison: "BinaryComparison",
    Timeline: "Timeline",
    Funnel: "Funnel",
    TreeDiagram: "DiagramsDemo",
  };

  const visualCompositionId = `${compositionMap[visualInfo.composition] || "DiagramsDemo"}-${style.charAt(0).toUpperCase() + style.slice(1)}`;

  const props = {
    style: style,
    visualType: visualInfo.type,
    visualData: visualInfo.data,
    title: slide.title || "",
    sourceSlideId: slide.id,
  };

  const visualSlideId = `${slide.id}-visual`;
  const propsPath = path.join(
    projectDir,
    "build",
    `props-${visualSlideId}.json`,
  );
  writeJson(propsPath, props);

  const outputPath = path.join(
    projectDir,
    "build",
    "deck",
    `slide-${visualSlideId}.png`,
  );
  ensureDir(path.dirname(outputPath));

  const cmd = `cd "${motionKitDir}" && npx remotion still src/index.ts ${visualCompositionId} "${outputPath}" --props "${propsPath}" 2>&1`;

  try {
    execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    return { success: fs.existsSync(outputPath), outputPath, visualSlideId };
  } catch (error) {
    return { success: false, error: error.message };
  }
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

  const scriptPath = path.join(projectDir, "sources", "script.md");
  if (!fs.existsSync(scriptPath)) {
    console.error(`Error: script.md not found at ${scriptPath}`);
    process.exit(1);
  }

  const scriptContent = readText(scriptPath);
  const { slides } = parseScriptMd(scriptContent);

  const layoutPath = path.join(
    projectDir,
    "build",
    "layout-recommendations.json",
  );
  const layoutData = fs.existsSync(layoutPath)
    ? readJson(layoutPath)
    : { recommendations: [] };
  const style = layoutData.style?.recommended || "apple";

  console.log(`\nAnalyzing ${slides.length} slides for visual components...\n`);

  const visualRecommendations = [];

  for (const slide of slides) {
    const slideText = [
      slide.title,
      slide.subtitle,
      ...(slide.bullets || []),
      ...(slide.leftBullets || []),
      ...(slide.rightBullets || []),
    ]
      .filter(Boolean)
      .join(" ");

    const detected = detectVisualType(slideText);

    if (detected.length > 0) {
      const best = detected[0];
      const complexity = estimateVisualComplexity(best.type, best.data);

      visualRecommendations.push({
        slideId: slide.id,
        slideIndex: slide.index,
        title: slide.title,
        detectedType: best.type,
        composition: best.composition,
        data: best.data,
        confidence: best.confidence,
        complexity,
        action: complexity.needsSeparateSlide ? "create-separate" : "inline",
      });

      console.log(`  [Slide ${slide.index}] "${slide.title?.slice(0, 25)}..."`);
      console.log(
        `    → Detected: ${best.type} (confidence: ${(best.confidence * 100).toFixed(0)}%)`,
      );
      console.log(
        `    → Action: ${complexity.needsSeparateSlide ? "Create separate visual slide" : "Inline visual"}`,
      );
      console.log(`    → Data: ${JSON.stringify(best.data).slice(0, 80)}...`);
      console.log();
    }
  }

  const outputPath = path.join(
    projectDir,
    "build",
    "visual-recommendations.json",
  );
  ensureDir(path.dirname(outputPath));
  writeJson(outputPath, {
    style,
    analyzedAt: nowIso(),
    totalSlides: slides.length,
    slidesWithVisuals: visualRecommendations.length,
    recommendations: visualRecommendations,
  });

  console.log(`\nWrote: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  Total slides: ${slides.length}`);
  console.log(`  Slides needing visuals: ${visualRecommendations.length}`);
  console.log(
    `  Separate visual slides: ${visualRecommendations.filter((r) => r.action === "create-separate").length}`,
  );

  if (!flags.dryRun && visualRecommendations.length > 0) {
    const motionKitDir = "/Users/myb/Desktop/PPT/motion-kit";

    console.log(`\nRendering visual components...\n`);

    for (const rec of visualRecommendations.filter(
      (r) => r.action === "create-separate",
    )) {
      const slide = slides.find((s) => s.id === rec.slideId);
      if (slide) {
        console.log(`  Rendering visual for slide ${rec.slideId}...`);
        const result = renderVisualSlide(
          rec,
          slide,
          style,
          projectDir,
          motionKitDir,
        );
        if (result.success) {
          console.log(`    ✓ ${result.outputPath}`);
        } else {
          console.log(`    ✗ ${result.error}`);
        }
      }
    }
  }

  const manifestPath = path.join(projectDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    manifest.stages.visualMatching = {
      status: "completed",
      at: nowIso(),
      slidesAnalyzed: slides.length,
      visualsDetected: visualRecommendations.length,
    };
    writeJson(manifestPath, manifest);
  }
};

main();
