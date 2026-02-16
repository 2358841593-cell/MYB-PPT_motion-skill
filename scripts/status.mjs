import fs from "node:fs";
import path from "node:path";

import { parseArgs, readJson } from "./_lib.mjs";

const usage = () => {
  console.log("Usage:\n  bun status.mjs <project-dir>");
};

const main = () => {
  const { positional } = parseArgs(process.argv);
  const projectDir = positional[0];
  if (!projectDir) {
    usage();
    process.exit(1);
  }

  const manifestPath = path.join(projectDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const m = readJson(manifestPath);
  console.log("Project status:");
  console.log(`- Title: ${m.project?.title ?? ""}`);
  console.log(`- Slug: ${m.project?.slug ?? ""}`);
  console.log(`- Dir: ${projectDir}`);
  console.log("Stages:");
  for (const [k, v] of Object.entries(m.stages ?? {})) {
    const status = v?.status ?? "unknown";
    console.log(`- ${k}: ${status}`);
  }
};

main();
