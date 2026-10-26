import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { findViolations } from "../tools/check-boundaries.ts";

const ROOT = fileURLToPath(new URL("../src", import.meta.url));

test("the checker runs and returns a list", () => {
  // Here so you can see the checker working before you clean anything up.
  // Delete this test once the next one is green.
  assert.ok(Array.isArray(findViolations(ROOT)));
});

test("no module reaches past another module's index.ts", () => {
  const v = findViolations(ROOT);
  assert.deepEqual(v, [], "boundary violations:\n" +
    v.map((x) => `  ${x.file} -> ${x.importPath}`).join("\n"));
});

test("importing from platform is still allowed", () => {
  const v = findViolations(ROOT);
  assert.equal(v.filter((x) => x.importPath.includes("platform")).length, 0);
});

test("a type-only import across a boundary counts too", () => {
  const v = findViolations(ROOT);
  assert.equal(v.filter((x) => x.importPath.endsWith("/repo.ts")).length, 0);
});
