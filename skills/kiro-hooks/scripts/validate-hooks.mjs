#!/usr/bin/env node
/**
 * Validate Kiro v1 hook files against assets/kiro-hooks.v1.schema.json.
 *
 * Usage:
 *   node skills/kiro-hooks/scripts/validate-hooks.mjs [path...]
 *
 * Paths may be hook files or directories. The default is .kiro/hooks in the
 * current directory. Requires the ajv package (npm install ajv).
 *
 * Beyond the schema, this checks two things JSON Schema cannot express:
 * hook names are unique across the files checked, and file-trigger matchers
 * compile as regular expressions.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(scriptDir, "..", "assets", "kiro-hooks.v1.schema.json");
const FILE_TRIGGERS = new Set(["PostFileCreate", "PostFileSave", "PostFileDelete"]);

function loadAjv() {
  const require = createRequire(join(process.cwd(), "package.json"));
  try {
    return require("ajv/dist/2020.js");
  } catch {
    console.error("ajv is not installed. Run: npm install --no-save ajv");
    process.exit(2);
  }
}

function collect(path, files) {
  const info = statSync(path);
  if (info.isFile()) {
    files.push(path);
    return;
  }
  for (const name of readdirSync(path)) {
    const child = join(path, name);
    if (statSync(child).isDirectory()) collect(child, files);
    else if (name.endsWith(".json")) files.push(child);
  }
}

function main() {
  const Ajv2020 = loadAjv();
  const Ajv = Ajv2020.default ?? Ajv2020;
  const ajv = new Ajv({ allErrors: true, strict: true });
  const validate = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf8")));

  const targets = process.argv.slice(2);
  const roots = (targets.length ? targets : [".kiro/hooks"]).map((p) => resolve(p));
  const files = [];
  for (const root of roots) collect(root, files);
  if (files.length === 0) {
    console.error("No hook files found.");
    process.exit(1);
  }

  const seen = new Map();
  let failed = 0;
  for (const file of files) {
    const rel = relative(process.cwd(), file);
    const problems = [];
    let data;
    try {
      data = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      problems.push(`invalid JSON: ${error.message}`);
    }

    if (data !== undefined && !validate(data)) {
      for (const error of validate.errors) {
        problems.push(`${error.instancePath || "/"} ${error.message}`);
      }
    }

    for (const hook of Array.isArray(data?.hooks) ? data.hooks : []) {
      if (typeof hook?.name === "string") {
        if (seen.has(hook.name)) {
          problems.push(`duplicate hook name "${hook.name}" (also in ${seen.get(hook.name)})`);
        } else {
          seen.set(hook.name, rel);
        }
      }
      if (FILE_TRIGGERS.has(hook?.trigger) && typeof hook.matcher === "string") {
        try {
          new RegExp(hook.matcher);
        } catch (error) {
          problems.push(`hook "${hook.name}" matcher is not a valid regex: ${error.message}`);
        }
      }
    }

    if (problems.length) {
      failed += 1;
      console.error(`FAIL  ${rel}`);
      for (const problem of problems) console.error(`      ${problem}`);
    } else {
      console.log(`ok    ${rel}`);
    }
  }

  console.log(`${files.length - failed}/${files.length} hook files valid`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
