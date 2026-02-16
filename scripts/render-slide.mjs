import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { ensureDir, parseArgs, readJson, writeJson, nowIso } from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun render-slide.mjs --project <dir> --slide <number>",
      "  bun render-slide.mjs --project <dir> --all",
      "",
      "Options:",
      "  --project <dir>   Project directory (required)",
      "  --slide <number>  Slide number to render (1-based)",
      "  --all             Render all slides",
      "  --style <name>    Override style (apple, tech, etc.)",
      "",
      "Output:",
      "  build/deck/slide-XX.png",
    ].join("\n"),
  );
};

const LAYOUT_TO_COMPOSITION = {
  // 基础布局
  "title-hero": "CoverHero",
  "quote-callout": "QuoteCallout",
  "bullet-list": "BulletList",
  "key-stat": "KeyStat",
  "split-screen": "SplitScreen",
  "two-columns": "SplitScreen",
  "three-columns": "ThreeColumns",
  "icon-grid": "IconGrid",
  // 信息图布局
  "linear-progression": "BulletList",
  "binary-comparison": "BinaryComparison",
  "hierarchical-layers": "VisualWithContent",
  "visual-content": "VisualWithContent",
  "hub-spoke": "CircularFlow",
  "circular-flow": "CircularFlow",
  funnel: "Funnel",
  timeline: "Timeline",
  // 图表布局
  "bar-chart": "BarChart",
  "bar-horizontal": "BarChart",
  chart: "BarChart",
  "line-chart": "LineChart",
  "pie-chart": "PieChart",
  // 兼容旧布局名
  "cover-hero": "CoverHero",
  "card-combo-2": "CardCombo2",
  "card-combo-3": "CardCombo3",
  "card-combo-4": "CardCombo4",
  "flow-with-notes": "FlowWithNotes",
  "timeline-with-details": "TimelineWithDetails",
  "chart-with-sidebar": "ChartWithSidebar",
  dashboard: "Dashboard",
  "diagonal-split": "DiagonalSplit",
  "full-image-overlay": "FullImageOverlay",
  section: "SectionBreak",
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

        let currentCard = null;
        let currentArray = null;

        yaml.split("\n").forEach((line) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("id:")) {
            slide.id = trimmed.replace("id:", "").trim();
          } else if (trimmed.startsWith("type:")) {
            if (currentArray === "visual" && slide.visual) {
              slide.visual.type = trimmed.replace("type:", "").trim();
            } else {
              slide.type = trimmed.replace("type:", "").trim();
            }
          } else if (trimmed.startsWith("layout:")) {
            slide.layout = trimmed.replace("layout:", "").trim();
          } else if (trimmed.startsWith("textEffect:")) {
            slide.textEffect = trimmed.replace("textEffect:", "").trim();
          } else if (trimmed.startsWith("visualType:")) {
            slide.visualType = trimmed.replace("visualType:", "").trim();
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
          } else if (trimmed.startsWith("quote:")) {
            slide.quote = trimmed
              .replace("quote:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("author:")) {
            slide.author = trimmed
              .replace("author:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("attribution:")) {
            slide.attribution = trimmed
              .replace("attribution:", "")
              .trim()
              .replace(/^["']|["']$/g, "");
          } else if (trimmed.startsWith("bullets:")) {
            slide.bullets = [];
            currentArray = "bullets";
            currentCard = null;
          } else if (trimmed.startsWith("cards:")) {
            slide.cards = [];
            currentArray = "cards";
            currentCard = null;
          } else if (trimmed.startsWith("steps:")) {
            // 如果当前在 visual-data 块中，处理为 visualData 的 steps
            if (currentArray === "visual-data") {
              const target = slide.visualData || slide.visual?.data;
              if (target) {
                target.steps = [];
              }
              currentArray = slide.visualData
                ? "visual-data-steps"
                : "visual-steps";
            } else {
              slide.steps = [];
              currentArray = "steps";
              currentCard = null;
            }
          } else if (trimmed.startsWith("notes:")) {
            currentArray = "notes";
            currentCard = null;
          } else if (trimmed.startsWith("stages:")) {
            slide.stages = [];
            currentArray = "stages";
            currentCard = null;
          } else if (trimmed.startsWith("events:")) {
            slide.events = [];
            currentArray = "events";
            currentCard = null;
          } else if (trimmed.startsWith("details:")) {
            slide.details = [];
            currentArray = "details";
            currentCard = null;
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
            currentArray = "leftBullets";
            currentCard = null;
          } else if (trimmed.startsWith("rightBullets:")) {
            slide.rightBullets = [];
            currentArray = "rightBullets";
            currentCard = null;
          } else if (trimmed.startsWith("visual:")) {
            slide.visual = {};
            currentArray = "visual";
            currentCard = null;
          } else if (trimmed.startsWith("visualData:")) {
            slide.visualData = {};
            currentArray = "visual-data";
            currentCard = null;
          } else if (trimmed.startsWith("chartData:")) {
            slide.chartData = {};
            currentArray = "chartData";
            currentCard = null;
          } else if (currentArray === "chartData") {
            if (trimmed.startsWith("labels:")) {
              const labelsMatch = trimmed.match(/\[(.+)\]/);
              if (labelsMatch && slide.chartData) {
                slide.chartData.labels = labelsMatch[1]
                  .split(",")
                  .map((v) => v.trim().replace(/^["']|["']$/g, ""));
              }
            } else if (trimmed.startsWith("values:")) {
              const valuesMatch = trimmed.match(/\[(.+)\]/);
              if (valuesMatch && slide.chartData) {
                slide.chartData.values = valuesMatch[1]
                  .split(",")
                  .map((v) => parseFloat(v.trim()));
              }
            } else if (trimmed.startsWith("unit:")) {
              if (slide.chartData) {
                slide.chartData.unit = trimmed
                  .replace("unit:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            } else if (trimmed.startsWith("horizontal:")) {
              if (slide.chartData) {
                slide.chartData.horizontal = trimmed.includes("true");
              }
            } else if (trimmed.startsWith("showValues:")) {
              if (slide.chartData) {
                slide.chartData.showValues = trimmed.includes("true");
              }
            } else if (trimmed.startsWith("donut:")) {
              if (slide.chartData) {
                slide.chartData.donut = trimmed.includes("true");
              }
            } else if (trimmed.startsWith("centerText:")) {
              if (slide.chartData) {
                slide.chartData.centerText = trimmed
                  .replace("centerText:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            } else if (trimmed.startsWith("segments:")) {
              if (slide.chartData) {
                slide.chartData.segments = [];
                currentArray = "chartData-segments";
              }
            }
          } else if (currentArray === "chartData-segments") {
            if (trimmed.startsWith("- label:")) {
              if (slide.chartData && slide.chartData.segments) {
                slide.chartData.segments.push({
                  label: trimmed
                    .replace("- label:", "")
                    .trim()
                    .replace(/^["']|["']$/g, ""),
                  value: 0,
                });
              }
            } else if (trimmed.startsWith("value:")) {
              if (
                slide.chartData &&
                slide.chartData.segments &&
                slide.chartData.segments.length > 0
              ) {
                const lastSegment =
                  slide.chartData.segments[slide.chartData.segments.length - 1];
                lastSegment.value = parseFloat(
                  trimmed.replace("value:", "").trim(),
                );
              }
            }
          } else if (currentArray === "visual-data") {
            slide.visualData = {};
            currentArray = "visual-data";
            currentCard = null;
          } else if (currentArray === "visual") {
            if (trimmed.startsWith("type:")) {
              slide.visual.type = trimmed
                .replace("type:", "")
                .trim()
                .replace(/^["']|["']$/g, "");
            } else if (trimmed.startsWith("position:")) {
              slide.visual.position = trimmed
                .replace("position:", "")
                .trim()
                .replace(/^["']|["']$/g, "");
            } else if (trimmed.startsWith("count:")) {
              slide.visual.count = parseInt(
                trimmed.replace("count:", "").trim(),
              );
            } else if (trimmed.startsWith("amplitude:")) {
              slide.visual.amplitude = parseInt(
                trimmed.replace("amplitude:", "").trim(),
              );
            } else if (trimmed.startsWith("cols:")) {
              slide.visual.cols = parseInt(trimmed.replace("cols:", "").trim());
            } else if (trimmed.startsWith("rows:")) {
              slide.visual.rows = parseInt(trimmed.replace("rows:", "").trim());
            } else if (trimmed.startsWith("values:")) {
              const valuesMatch = trimmed.match(/\[(.+)\]/);
              if (valuesMatch) {
                slide.visual.values = valuesMatch[1]
                  .split(",")
                  .map((v) => parseFloat(v.trim()));
              }
            } else if (trimmed.startsWith("data:")) {
              slide.visual.data = {};
              currentArray = "visual-data";
            }
          } else if (currentArray === "visual-data") {
            if (trimmed.startsWith("steps:")) {
              const target = slide.visualData || slide.visual?.data;
              if (target) {
                target.steps = [];
              }
              currentArray = slide.visualData
                ? "visual-data-steps"
                : "visual-steps";
            } else if (trimmed.startsWith("levels:")) {
              const target = slide.visualData || slide.visual?.data;
              if (target) {
                target.levels = [];
              }
              currentArray = slide.visualData
                ? "visual-data-levels"
                : "visual-levels";
            } else if (trimmed.startsWith("layers:")) {
              const target = slide.visualData || slide.visual?.data;
              if (target) {
                target.layers = [];
              }
              currentArray = slide.visualData
                ? "visual-data-layers"
                : "visual-layers";
            } else if (trimmed.startsWith("items:")) {
              const target = slide.visualData || slide.visual?.data;
              if (target) {
                target.items = [];
              }
              currentArray = slide.visualData
                ? "visual-data-items"
                : "visual-items";
            }
          } else if (currentArray === "visual-data-layers") {
            if (trimmed.startsWith("- label:")) {
              slide.visualData.layers = slide.visualData.layers || [];
              slide.visualData.layers.push({
                label: trimmed
                  .replace("- label:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
              });
            }
          } else if (currentArray === "visual-levels") {
            if (trimmed.startsWith("- label:")) {
              slide.visual.data.levels = slide.visual.data.levels || [];
              slide.visual.data.levels.push({
                label: trimmed
                  .replace("- label:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                sublabel: "",
              });
            } else if (trimmed.startsWith("sublabel:")) {
              const lastLevel =
                slide.visual.data.levels[slide.visual.data.levels.length - 1];
              if (lastLevel) {
                lastLevel.sublabel = trimmed
                  .replace("sublabel:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            }
          } else if (currentArray === "visual-items") {
            if (trimmed.startsWith("- label:")) {
              const colorMatch = trimmed.match(/color:\s*["']?([^"']+)["']?/);
              slide.visual.data.items.push({
                label: trimmed
                  .replace("- label:", "")
                  .split(",")
                  .shift()
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                color: colorMatch ? colorMatch[1] : "accent",
              });
            }
          } else if (currentArray === "visual-data-steps") {
            if (trimmed.startsWith("- title:")) {
              slide.visualData.steps.push({
                title: trimmed
                  .replace("- title:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                desc: "",
              });
            } else if (trimmed.startsWith("desc:")) {
              const lastStep =
                slide.visualData.steps[slide.visualData.steps.length - 1];
              if (lastStep) {
                lastStep.desc = trimmed
                  .replace("desc:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            }
          } else if (currentArray === "visual-steps") {
            if (trimmed.startsWith("- title:")) {
              slide.visual.data.steps.push({
                title: trimmed
                  .replace("- title:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                desc: "",
              });
            } else if (trimmed.startsWith("desc:")) {
              const lastStep =
                slide.visual.data.steps[slide.visual.data.steps.length - 1];
              if (lastStep) {
                lastStep.desc = trimmed
                  .replace("desc:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            }
          } else if (currentArray === "visual-data-levels") {
            if (trimmed.startsWith("- label:")) {
              slide.visualData.levels = slide.visualData.levels || [];
              slide.visualData.levels.push({
                label: trimmed
                  .replace("- label:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                sublabel: "",
              });
            } else if (trimmed.startsWith("sublabel:")) {
              const lastLevel =
                slide.visualData.levels[slide.visualData.levels.length - 1];
              if (lastLevel) {
                lastLevel.sublabel = trimmed
                  .replace("sublabel:", "")
                  .trim()
                  .replace(/^["']|["']$/g, "");
              }
            }
          } else if (currentArray === "visual-data-items") {
            if (trimmed.startsWith("- label:")) {
              const colorMatch = trimmed.match(/color:\s*["']?([^"']+)["']?/);
              slide.visualData.items.push({
                label: trimmed
                  .replace("- label:", "")
                  .split(",")
                  .shift()
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                color: colorMatch ? colorMatch[1] : "accent",
              });
            }
          } else if (trimmed.startsWith("- title:")) {
            if (currentArray === "cards" && slide.cards) {
              currentCard = {
                title: trimmed
                  .replace("- title:", "")
                  .trim()
                  .replace(/^["']|["']$/g, ""),
                items: [],
              };
              slide.cards.push(currentCard);
            }
          } else if (trimmed.startsWith("title:") && currentArray === null) {
            // skip, already handled
          } else if (trimmed.startsWith("items:")) {
            // items array starts
          } else if (trimmed.startsWith("- ") && trimmed.includes(":")) {
            // key-value pair like "- description: xxx"
            const [key, ...valParts] = trimmed.replace("- ", "").split(":");
            if (currentCard && key === "description") {
              currentCard.description = valParts
                .join(":")
                .trim()
                .replace(/^["']|["']$/g, "");
            } else if (currentCard && key === "value") {
              currentCard.value = valParts
                .join(":")
                .trim()
                .replace(/^["']|["']$/g, "");
            } else if (currentCard && key === "label") {
              currentCard.label = valParts
                .join(":")
                .trim()
                .replace(/^["']|["']$/g, "");
            }
          } else if (trimmed.startsWith("- ")) {
            const value = trimmed.replace("- ", "").replace(/^["']|["']$/g, "");
            if (currentCard && currentCard.items) {
              currentCard.items.push(value);
            } else if (currentArray === "bullets" && slide.bullets) {
              slide.bullets.push(value);
            } else if (currentArray === "steps" && slide.steps) {
              slide.steps.push(value);
            } else if (currentArray === "stages" && slide.stages) {
              slide.stages.push(value);
            } else if (currentArray === "events" && slide.events) {
              slide.events.push(value);
            } else if (currentArray === "details" && slide.details) {
              slide.details.push(value);
            } else if (currentArray === "leftBullets" && slide.leftBullets) {
              slide.leftBullets.push(value);
            } else if (currentArray === "rightBullets" && slide.rightBullets) {
              slide.rightBullets.push(value);
            }
          }
        });

        slides.push(slide);
      }
    });
  }

  return { frontMatter, slides };
};

const buildProps = (slide, layout, style) => {
  const baseProps = {
    title: slide.title || "",
    style: style,
  };

  if (slide.subtitle) {
    baseProps.subtitle = slide.subtitle;
  }

  if (slide.bullets && slide.bullets.length > 0) {
    baseProps.bullets = slide.bullets;
  }

  if (slide.cards && slide.cards.length > 0) {
    baseProps.cards = slide.cards;
  }

  if (slide.steps && slide.steps.length > 0) {
    baseProps.steps = slide.steps;
    if (slide.notes) {
      baseProps.notes = slide.notes;
    }
  }

  if (slide.stages && slide.stages.length > 0) {
    baseProps.stages = slide.stages;
  }

  if (slide.events && slide.events.length > 0) {
    baseProps.events = slide.events;
    if (slide.details) {
      baseProps.details = slide.details;
    }
  }

  if (slide.quote) {
    baseProps.quote = slide.quote;
    if (slide.author) {
      baseProps.author = slide.author;
    }
    if (slide.attribution) {
      baseProps.attribution = slide.attribution;
    }
  }

  if (layout === "binary-comparison" || layout === "card-combo-2") {
    if (!baseProps.cards && (slide.leftTitle || slide.rightTitle)) {
      baseProps.cards = [
        { title: slide.leftTitle || "左侧", items: slide.leftBullets || [] },
        { title: slide.rightTitle || "右侧", items: slide.rightBullets || [] },
      ];
    }
    if (slide.leftBullets && slide.rightBullets) {
      baseProps.leftTitle = slide.leftTitle || "左侧";
      baseProps.rightTitle = slide.rightTitle || "右侧";
      baseProps.leftBullets = slide.leftBullets;
      baseProps.rightBullets = slide.rightBullets;
    }
  }

  if (slide.visual) {
    baseProps.visual = slide.visual;
  }

  if (slide.textEffect) {
    baseProps.textEffect = slide.textEffect;
  }

  if (slide.visualType) {
    baseProps.visualType = slide.visualType;
  }

  if (slide.visualData) {
    baseProps.visualData = slide.visualData;
  }

  // 处理图表数据
  if (slide.chartData) {
    // BarChart: labels, values, unit, horizontal, showValues
    if (slide.chartData.labels && slide.chartData.values) {
      baseProps.labels = slide.chartData.labels;
      baseProps.values = slide.chartData.values;
      if (slide.chartData.unit) {
        baseProps.unit = slide.chartData.unit;
      }
      if (slide.chartData.horizontal !== undefined) {
        baseProps.horizontal = slide.chartData.horizontal;
      }
      if (slide.chartData.showValues !== undefined) {
        baseProps.showValues = slide.chartData.showValues;
      }
    }
    // PieChart: segments, donut, centerText
    if (slide.chartData.segments) {
      baseProps.segments = slide.chartData.segments;
      if (slide.chartData.donut !== undefined) {
        baseProps.donut = slide.chartData.donut;
      }
      if (slide.chartData.centerText) {
        baseProps.centerText = slide.chartData.centerText;
      }
    }
  }

  return baseProps;
};

const styleToCompositionName = (style) => {
  const styleMap = {
    apple: "Apple",
    tech: "Tech",
    "bold-editorial": "BoldEditorial",
    minimal: "Minimal",
    "dark-atmospheric": "DarkAtmospheric",
  };
  return styleMap[style] || "Apple";
};

const MIN_FILE_SIZE = 30000;

const renderSlide = (slide, layout, style, projectDir, motionKitDir) => {
  const composition = LAYOUT_TO_COMPOSITION[layout] || "BulletList";
  const compositionId = `${composition}-${styleToCompositionName(style)}`;

  const props = buildProps(slide, layout, style);
  const propsPath = path.join(projectDir, "build", `props-${slide.id}.json`);
  writeJson(propsPath, props);

  const outputPath = path.join(
    projectDir,
    "build",
    "deck",
    `slide-${slide.id}.png`,
  );
  ensureDir(path.dirname(outputPath));

  const cmd = `cd "${motionKitDir}" && npx remotion still src/index.ts ${compositionId} "${outputPath}" --props "${propsPath}" 2>&1`;

  try {
    const result = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });

    if (!fs.existsSync(outputPath)) {
      return { success: false, error: `File not created: ${outputPath}` };
    }

    const stats = fs.statSync(outputPath);
    if (stats.size < MIN_FILE_SIZE) {
      return {
        success: false,
        error: `File too small (${stats.size} bytes): ${outputPath}. Minimum: ${MIN_FILE_SIZE}`,
      };
    }

    return { success: true, outputPath, size: stats.size };
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

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const layoutPath = path.join(
    projectDir,
    "build",
    "layout-recommendations.json",
  );
  if (!fs.existsSync(layoutPath)) {
    console.error(
      "Error: layout-recommendations.json not found. Run analyze-layouts.mjs first.",
    );
    process.exit(1);
  }

  const layoutData = readJson(layoutPath);
  const style = flags.style || layoutData.style?.recommended || "apple";

  const scriptPath = path.join(projectDir, "sources", "script.md");
  const scriptContent = fs.readFileSync(scriptPath, "utf-8");
  const { slides } = parseScriptMd(scriptContent);

  const motionKitDir = "/Users/myb/Desktop/PPT/motion-kit";

  if (!fs.existsSync(motionKitDir)) {
    console.error(`Error: motion-kit not found at ${motionKitDir}`);
    process.exit(1);
  }

  let slidesToRender = [];

  // 构建布局映射：优先使用 slide.layout，其次是 recommendations
  const getLayoutForSlide = (slide, index, recommendations) => {
    if (slide.layout && LAYOUT_TO_COMPOSITION[slide.layout]) {
      return slide.layout;
    }
    if (slide.type === "cover") {
      return "cover-hero";
    }
    if (slide.type === "quote") {
      return "quote-callout";
    }
    if (slide.type === "comparison") {
      return "binary-comparison";
    }
    if (slide.type === "split") {
      return "split-screen";
    }
    if (slide.type === "columns") {
      return "three-columns";
    }
    if (slide.type === "cycle") {
      return "circular-flow";
    }
    if (slide.type === "timeline") {
      return "timeline";
    }
    if (slide.type === "stats") {
      return "key-stat";
    }
    if (slide.type === "section") {
      return "section";
    }
    if (slide.visualType || slide.visualData) {
      return "visual-content";
    }
    return recommendations[index]?.recommended || "bullet-list";
  };

  if (flags.all) {
    slidesToRender = slides.map((slide, index) => ({
      slide,
      layout: getLayoutForSlide(slide, index, layoutData.recommendations || []),
    }));
  } else if (flags.slide) {
    const slideIndex = parseInt(flags.slide) - 1;
    if (slideIndex < 0 || slideIndex >= slides.length) {
      console.error(`Error: Invalid slide number. Must be 1-${slides.length}`);
      process.exit(1);
    }
    slidesToRender = [
      {
        slide: slides[slideIndex],
        layout: getLayoutForSlide(
          slides[slideIndex],
          slideIndex,
          layoutData.recommendations || [],
        ),
      },
    ];
  } else {
    usage();
    console.error("\nError: Must specify --slide <number> or --all");
    process.exit(1);
  }

  console.log(
    `Rendering ${slidesToRender.length} slide(s) with style: ${style}\n`,
  );

  const results = [];
  slidesToRender.forEach(({ slide, layout }, index) => {
    console.log(
      `[${index + 1}/${slidesToRender.length}] Rendering slide ${slide.id} (${layout})...`,
    );

    // Debug: print chartData if exists
    if (slide.chartData) {
      console.log(`  chartData:`, JSON.stringify(slide.chartData));
    }

    const result = renderSlide(slide, layout, style, projectDir, motionKitDir);
    results.push({ slide: slide.id, ...result });

    if (result.success) {
      console.log(`  ✓ ${result.outputPath}`);
    } else {
      console.error(`  ✗ ${result.error}`);
    }
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(`\nRendered ${successCount}/${results.length} slides.`);

  const manifestPath = path.join(projectDir, "manifest.json");
  const manifest = readJson(manifestPath);
  manifest.stages.slidesRendered = {
    status: successCount === results.length ? "completed" : "partial",
    at: nowIso(),
    count: successCount,
    total: results.length,
  };
  writeJson(manifestPath, manifest);
};

main();
