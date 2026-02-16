import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const DEFAULT_ROOT_DIR = path.join(os.homedir(), "Desktop", "PPT");

export const resolveRootDir = (rootDir) => {
  return path.resolve(rootDir ?? DEFAULT_ROOT_DIR);
};

export const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const readText = (filePath) => fs.readFileSync(filePath, "utf-8");

export const writeText = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
};

export const fileExists = (filePath) => fs.existsSync(filePath);

export const copyIfMissing = (src, dest) => {
  if (fileExists(dest)) return false;
  writeText(dest, readText(src));
  return true;
};

export const nowIso = () => new Date().toISOString();

export const slugify = (input) => {
  const normalized = String(input ?? "")
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-+/g, "-");
  return normalized;
};

export const timestampSlug = () => {
  const d = new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  return [
    "ppt",
    d.getFullYear(),
    pad2(d.getMonth() + 1),
    pad2(d.getDate()),
    pad2(d.getHours()),
    pad2(d.getMinutes()),
    pad2(d.getSeconds()),
  ].join("");
};

export const getSkillDir = () => {
  // scripts live under <SKILL_DIR>/scripts
  return path.resolve(import.meta.dirname, "..");
};

export const getReferencesDir = () => path.join(getSkillDir(), "references");

export const parseArgs = (argv) => {
  const args = argv.slice(2);
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }

  return { flags, positional };
};

export const safeJsonStringify = (obj) => JSON.stringify(obj, null, 2) + "\n";

export const readJson = (filePath) => JSON.parse(readText(filePath));

export const writeJson = (filePath, obj) =>
  writeText(filePath, safeJsonStringify(obj));
