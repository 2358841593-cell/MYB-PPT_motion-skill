import fs from "node:fs";
import path from "node:path";

import {
  ensureDir,
  getReferencesDir,
  nowIso,
  parseArgs,
  resolveRootDir,
  slugify,
  timestampSlug,
  writeJson,
  writeText,
  readText,
} from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun new-project.mjs --title <title> [--slug <slug>] [--root <path>]",
      "",
      "Notes:",
      "  - If --slug is omitted and title contains non-ASCII, a timestamp slug is used.",
    ].join("\n"),
  );
};

const fillTemplate = (content, vars) => {
  let out = content;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`<${k}>`, String(v));
  }
  return out;
};

const main = () => {
  const { flags } = parseArgs(process.argv);
  if (flags.help) {
    usage();
    process.exit(0);
  }

  const title = String(flags.title ?? "").trim();
  if (!title) {
    usage();
    console.error("\nError: --title is required.");
    process.exit(1);
  }

  const rootDir = resolveRootDir(flags.root);
  const projectsDir = path.join(rootDir, "projects");
  ensureDir(projectsDir);

  const explicitSlug = flags.slug ? String(flags.slug).trim() : "";
  const derivedSlug = slugify(title);
  const slug = explicitSlug || derivedSlug || timestampSlug();

  const projectDir = path.join(projectsDir, slug);
  if (fs.existsSync(projectDir)) {
    console.error(`Error: project already exists: ${projectDir}`);
    process.exit(1);
  }

  const sourcesDir = path.join(projectDir, "sources");
  const buildDir = path.join(projectDir, "build");
  const exportsDir = path.join(projectDir, "exports");

  ensureDir(path.join(sourcesDir, "data"));
  ensureDir(path.join(sourcesDir, "assets"));
  ensureDir(path.join(buildDir, "deck"));
  ensureDir(path.join(buildDir, "motion"));
  ensureDir(exportsDir);

  const refs = getReferencesDir();
  const iso = nowIso();

  const scriptTemplate = readText(path.join(refs, "script.template.md"));
  writeText(
    path.join(sourcesDir, "script.md"),
    fillTemplate(scriptTemplate, { TITLE: title }),
  );

  const studioTemplate = readText(path.join(refs, "studio.template.yml"));
  writeText(
    path.join(projectDir, "studio.yml"),
    fillTemplate(studioTemplate, {
      TITLE: title,
      SLUG: slug,
      ROOT_DIR: rootDir,
    }),
  );

  const manifestTemplate = JSON.parse(
    readText(path.join(refs, "manifest.template.json")),
  );
  manifestTemplate.project.title = title;
  manifestTemplate.project.slug = slug;
  manifestTemplate.project.rootDir = projectDir;
  manifestTemplate.project.createdAt = iso;
  manifestTemplate.project.updatedAt = iso;
  manifestTemplate.stages.projectInit.at = iso;
  writeJson(path.join(projectDir, "manifest.json"), manifestTemplate);

  console.log("Created new PPT project:");
  console.log(`- Title: ${title}`);
  console.log(`- Slug: ${slug}`);
  console.log(`- Project: ${projectDir}`);
  console.log("Files:");
  console.log(`- ${path.join(sourcesDir, "script.md")}`);
  console.log(`- ${path.join(projectDir, "studio.yml")}`);
  console.log(`- ${path.join(projectDir, "manifest.json")}`);
};

main();
