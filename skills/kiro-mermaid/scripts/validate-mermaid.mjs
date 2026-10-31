#!/usr/bin/env node
/**
 * Render every ```mermaid fence with @mermaid-js/mermaid-cli (mmdc).
 *
 * mmdc validates by rendering. This script never rewrites the source
 * Markdown. It writes temporary .mmd files and asks mmdc for SVG output.
 * Flowcharts and state diagrams must set config.layout to elk. Other
 * diagram types are not checked for that key.
 *
 * Usage:
 *   node skills/kiro-mermaid/scripts/validate-mermaid.mjs [path...]
 *
 * Environment:
 *   CHROME_PATH  Browser executable. Discovered when unset.
 *   MMDC_BIN     mmdc executable. Defaults to npx @mermaid-js/mermaid-cli.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..", "..");
const puppeteerConfig = join(scriptDir, "puppeteer.config.json");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

function walk(dir, files) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) walk(path, files);
    else if (info.isFile() && /\.(md|markdown)$/i.test(name)) files.push(path);
  }
}

function extract(markdown, file) {
  const blocks = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;
  let startLine = 0;
  let body = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^(`{3,}|~{3,})mermaid\s*$/);
    if (!inFence && open) {
      inFence = true;
      fenceChar = open[1][0];
      fenceLen = open[1].length;
      startLine = i + 1;
      body = [];
      continue;
    }
    if (inFence) {
      const close = new RegExp(`^${fenceChar}{${fenceLen},}\\s*$`);
      if (close.test(line)) {
        blocks.push({ startLine, code: body.join("\n") + "\n" });
        inFence = false;
        body = [];
      } else {
        body.push(line);
      }
    }
  }
  if (inFence) {
    throw new Error(`Unclosed mermaid fence in ${file} starting at line ${startLine}`);
  }
  return blocks;
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
  ];
  for (const candidate of candidates) {
    const probe = spawnSync("bash", ["-lc", `command -v ${candidate}`], { encoding: "utf8" });
    if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim();
  }
  return "";
}

function renderArgs(input, output, configPath) {
  return ["-i", input, "-o", output, "-p", configPath, "-b", "white", "-q"];
}

const TARGET_DIAGRAM = /^(?:flowchart|graph|stateDiagram-v2|stateDiagram)\b/;

function layoutValue(raw) {
  const match = raw.trim().match(/^["']?([A-Za-z0-9._-]+)["']?/);
  return match ? match[1] : raw.trim();
}

function frontHasElk(front) {
  for (let i = 0; i < front.length; i++) {
    const line = front[i];
    const inline = line.match(/^config:\s*\{(.*)\}\s*(?:#.*)?$/);
    if (inline) {
      const found = inline[1].match(/(?:^|[,{]\s*)layout\s*:\s*([^,}]+)/);
      return found ? layoutValue(found[1]) === "elk" : false;
    }
    if (/^config:\s*(?:#.*)?$/.test(line)) {
      for (let j = i + 1; j < front.length; j++) {
        const inner = front[j];
        if (inner.trim() === "") continue;
        if (!/^\s/.test(inner)) break;
        const layout = inner.match(/^\s+layout\s*:\s*(.+)$/);
        if (layout) return layoutValue(layout[1]) === "elk";
      }
      return false;
    }
  }
  return false;
}

function elkStatus(code) {
  const lines = code.replace(/\n$/, "").split("\n");
  let front = null;
  let index = 0;
  if (lines[0] && lines[0].trim() === "---") {
    let end = -1;
    for (let j = 1; j < lines.length; j++) {
      if (lines[j].trim() === "---") {
        end = j;
        break;
      }
    }
    if (end !== -1) {
      front = lines.slice(1, end);
      index = end + 1;
    }
  }
  while (index < lines.length) {
    const stripped = lines[index].trim();
    if (stripped === "" || stripped.startsWith("%%")) {
      index += 1;
      continue;
    }
    break;
  }
  const kind = (lines[index] || "").trim();
  if (!TARGET_DIAGRAM.test(kind)) return "skip";
  return front && frontHasElk(front) ? "ok" : "missing";
}

function main() {
  const roots = process.argv.slice(2);
  const start = roots.length ? roots.map((p) => resolve(p)) : [repoRoot];
  const files = [];
  for (const root of start) {
    const info = statSync(root);
    if (info.isDirectory()) walk(root, files);
    else files.push(root);
  }

  const blocks = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const block of extract(text, file)) {
      blocks.push({ file, ...block });
    }
  }

  if (blocks.length === 0) {
    console.error("No mermaid fences found.");
    process.exit(1);
  }

  const chrome = findChrome();
  const tmp = mkdtempSync(join(tmpdir(), "mermaid-validate-"));
  const configPath = join(tmp, "puppeteer.json");
  const base = JSON.parse(readFileSync(puppeteerConfig, "utf8"));
  if (chrome) base.executablePath = chrome;
  writeFileSync(configPath, JSON.stringify(base));

  let failed = 0;
  blocks.forEach((block, index) => {
    const input = join(tmp, `diagram-${index}.mmd`);
    const output = join(tmp, `diagram-${index}.svg`);
    writeFileSync(input, block.code);
    const rel = relative(repoRoot, block.file);
    if (elkStatus(block.code) === "missing") {
      failed += 1;
      console.error(`FAIL  ${rel}:${block.startLine} #${index + 1}`);
      console.error("flowchart or state diagram is missing config.layout: elk");
      return;
    }
    const args = renderArgs(input, output, configPath);
    const result = process.env.MMDC_BIN
      ? spawnSync(process.env.MMDC_BIN, args, { encoding: "utf8" })
      : spawnSync("npx", ["--yes", "@mermaid-js/mermaid-cli", ...args], { encoding: "utf8" });
    report(result, rel, block, index);
    if (result.status !== 0) failed += 1;
  });

  rmSync(tmp, { recursive: true, force: true });
  console.log(`${blocks.length - failed}/${blocks.length} mermaid blocks rendered`);
  process.exit(failed === 0 ? 0 : 1);
}

function report(result, rel, block, index) {
  if (result.status === 0) {
    console.log(`ok    ${rel}:${block.startLine} #${index + 1}`);
    return;
  }
  const detail = `${result.stderr || ""}${result.stdout || ""}`.trim();
  console.error(`FAIL  ${rel}:${block.startLine} #${index + 1}`);
  if (detail) console.error(detail.split("\n").slice(-20).join("\n"));
  if (result.error) console.error(result.error.message);
}

main();
