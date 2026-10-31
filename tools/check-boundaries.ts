
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Violation {
  file: string;
  importPath: string;
  reason: string;
}

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) return getFiles(file);
    return entry.isFile() && entry.name.endsWith(".ts") ? [file] : [];
  });
}

function getImports(source: string): string[] {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  const patterns = [
    /\bimport\s+(?:type\s+)?[\s\S]*?\s+from\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[\s\S]*?\s+from\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  return [...new Set(patterns.flatMap((pattern) =>
    [...code.matchAll(pattern)].map((match) => match[1])
  ))];
}

export function findViolations(root: string): Violation[] {
  const src = path.resolve(root);
  const modules = path.join(src, "modules");
  const platform = path.join(src, "platform");
  const violations: Violation[] = [];

  for (const file of getFiles(modules)) {
    const relativeFile = path.relative(src, file);
    const currentModule = path.relative(modules, file).split(path.sep)[0];
    const source = fs.readFileSync(file, "utf8");

    for (const importPath of getImports(source)) {
      if (!importPath.startsWith(".")) continue;

      let target = path.resolve(path.dirname(file), importPath);
      if (!path.extname(target)) target += ".ts";

      const relativeTarget = path.relative(src, target);

      if (
        relativeTarget === ".." ||
        relativeTarget.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeTarget)
      ) {
        violations.push({
          file: relativeFile,
          importPath,
          reason: "Import resolves outside src.",
        });
        continue;
      }

      const platformRelative = path.relative(platform, target);
      if (
        platformRelative === "" ||
        (!platformRelative.startsWith(`..${path.sep}`) &&
          platformRelative !== ".." &&
          !path.isAbsolute(platformRelative))
      ) {
        continue;
      }

      const moduleRelative = path.relative(modules, target);
      if (
        moduleRelative === ".." ||
        moduleRelative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(moduleRelative)
      ) {
        violations.push({
          file: relativeFile,
          importPath,
          reason: "Import is outside modules and platform.",
        });
        continue;
      }

      const parts = moduleRelative.split(path.sep);
      if (parts[0] !== currentModule && parts.slice(1).join(path.sep) !== "index.ts") {
        violations.push({
          file: relativeFile,
          importPath,
          reason: "Cross-module imports must target the other module's index.ts.",
        });
      }
    }
  }

  return violations;
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const violations = findViolations(path.resolve("src"));

  for (const violation of violations) {
    console.error(
      `${violation.file}: "${violation.importPath}" — ${violation.reason}`
    );
  }

  if (violations.length) {
    console.error(`\nFound ${violations.length} boundary violation(s).`);
    process.exitCode = 1;
  } else {
    console.log("No module boundary violations found.");
  }
}
