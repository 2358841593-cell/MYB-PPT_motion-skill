import path from "node:path";

import {
  copyIfMissing,
  ensureDir,
  getReferencesDir,
  parseArgs,
  resolveRootDir,
  writeText,
} from "./_lib.mjs";

const usage = () => {
  console.log(
    [
      "Usage:",
      "  bun init-root.mjs [--root <path>]",
      "",
      "Defaults:",
      "  --root ~/Desktop/PPT",
    ].join("\n"),
  );
};

const main = () => {
  const { flags } = parseArgs(process.argv);
  if (flags.help) {
    usage();
    process.exit(0);
  }

  const rootDir = resolveRootDir(flags.root);
  const templatesDir = path.join(rootDir, "templates");
  const projectsDir = path.join(rootDir, "projects");

  ensureDir(rootDir);
  ensureDir(templatesDir);
  ensureDir(projectsDir);

  const refs = getReferencesDir();
  const copied = [];
  const maybeCopy = (name) => {
    const src = path.join(refs, name);
    const dest = path.join(templatesDir, name);
    if (copyIfMissing(src, dest)) copied.push(dest);
  };

  maybeCopy("script.template.md");
  maybeCopy("studio.template.yml");

  const readmePath = path.join(rootDir, "README.md");
  copyIfMissing(path.join(refs, "README.root.md"), readmePath);

  // Always refresh a short pointer file (safe overwrite).
  writeText(
    path.join(rootDir, ".root"),
    "This directory is managed by my-ppt-studio (Module 01).\n",
  );

  console.log("Initialized PPT workspace:");
  console.log(`- Root: ${rootDir}`);
  console.log(`- Templates: ${templatesDir}`);
  console.log(`- Projects: ${projectsDir}`);
  if (copied.length > 0) {
    console.log("Templates created:");
    for (const p of copied) console.log(`- ${p}`);
  } else {
    console.log("Templates already exist (no changes).");
  }
};

main();
