import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { ensureDir, parseArgs, readJson, writeJson, nowIso } from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun build-deck.mjs --project <dir>",
      "",
      "Options:",
      "  --project <dir>   Project directory (required)",
      "  --skip-render     Skip rendering, only build PPTX",
      "",
      "Output:",
      "  build/deck/slide-*.png",
      "  exports/recording.pptx",
    ].join("\n"),
  );
};

const buildPptx = async (projectDir, slides) => {
  const PptxGenJS = (await import("pptxgenjs")).default;

  const pptx = new PptxGenJS();

  // 明确定义 16:9 布局（1920x1080 对应 10x5.625 英寸）
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM_16x9";

  pptx.title = path.basename(projectDir);
  pptx.author = "my-ppt-studio";

  slides.forEach((slide, index) => {
    const slidePage = pptx.addSlide();
    const imagePath = path.join(
      projectDir,
      "build",
      "deck",
      `slide-${slide.id}.png`,
    );

    if (fs.existsSync(imagePath)) {
      slidePage.addImage({
        path: imagePath,
        x: 0,
        y: 0,
        w: 10,
        h: 5.625,
      });
    } else {
      console.error(`Warning: Image not found: ${imagePath}`);
    }
  });

  const exportsDir = path.join(projectDir, "exports");
  ensureDir(exportsDir);

  const outputPath = path.join(exportsDir, "recording.pptx");
  await pptx.writeFile({ fileName: outputPath });

  return outputPath;
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
  // Support both array format and object with recommendations property
  const recommendations = Array.isArray(layoutData)
    ? layoutData
    : layoutData.recommendations
      ? Object.values(layoutData.recommendations)
      : [];
  const unaccepted = recommendations.filter((r) => !r.accepted);

  if (unaccepted.length > 0) {
    console.error(
      `Error: ${unaccepted.length} slide(s) not accepted. Edit layout-recommendations.json or run with --accept-all.`,
    );
    process.exit(1);
  }

  const manifestPath = path.join(projectDir, "manifest.json");
  const manifest = readJson(manifestPath);

  if (!flags["skip-render"]) {
    console.log("Rendering all slides...\n");

    const skillDir = path.dirname(import.meta.url.replace("file://", ""));
    const renderScript = path.join(skillDir, "render-slide.mjs");

    const cmd = `cd "${skillDir}" && bun render-slide.mjs --project "${projectDir}" --all`;

    try {
      execSync(cmd, { encoding: "utf-8", stdio: "inherit" });
    } catch (error) {
      console.error("Error during rendering. Check render output above.");
      process.exit(1);
    }
  }

  console.log("\nBuilding PPTX...");

  const scriptPath = path.join(projectDir, "sources", "script.md");
  const scriptContent = fs.readFileSync(scriptPath, "utf-8");

  const slidesMatch = scriptContent.match(/## Slide \d+/g) || [];
  const slides = slidesMatch.map((_, index) => ({
    id: `s${String(index + 1).padStart(2, "0")}`,
  }));

  const outputPath = await buildPptx(projectDir, slides);

  console.log(`\n✓ PPTX created: ${outputPath}`);

  manifest.stages.deckBuilt = { status: "completed", at: nowIso() };
  manifest.artifacts.pptx = outputPath;
  writeJson(manifestPath, manifest);

  console.log(`✓ Manifest updated`);

  console.log("\nBuild complete!");
  console.log(`  - PNG files: ${path.join(projectDir, "build", "deck")}`);
  console.log(`  - PPTX file: ${outputPath}`);
};

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
