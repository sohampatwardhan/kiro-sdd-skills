import { readFileSync } from "node:fs";

const raw = readFileSync(0, "utf8");
let payload = {};
if (raw.trim()) {
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write("guard-env-writes: stdin was not JSON\n");
    process.exit(1);
  }
}

const blob = JSON.stringify(payload.tool_input ?? "");
if (/(^|[\\/"])\.env($|[\\/."])/.test(blob)) {
  process.stderr.write("Blocked: refusing a write that targets a .env file\n");
  process.exit(2);
}

process.exit(0);
