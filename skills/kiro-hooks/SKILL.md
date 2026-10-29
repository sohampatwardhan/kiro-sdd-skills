---
name: kiro-hooks
description: "Author Kiro agent hooks as .kiro/hooks JSON files with version v1. Use when the user wants hooks for file create, save, or delete, prompt submit, agent stop, session start, pre or post tool use, or pre or post spec task execution, including command or agent actions, matchers, and confirm prompts. Documents the legacy .kiro.hook format only as a migration note."
license: MIT
compatibility: "Portable Agent Skills package. Writes JSON. Current Kiro reads .kiro/hooks/*.json, not .kiro.hook."
metadata:
  author: kiro-sdd-skills
  version: "1.0.0"
---

# Kiro hooks

Write hooks in the current v1 JSON schema. The authoritative pages are https://kiro.dev/docs/hooks/ and https://kiro.dev/docs/hooks/types/ (fetched 2026-10-29). Field-by-field notes are in `references/schema.md`.

## Location

| Scope | Path |
| --- | --- |
| Workspace | `.kiro/hooks/<kebab-name>.json` |
| Global, CLI V3 | `~/.kiro/hooks/<kebab-name>.json` |

Any `.json` filename works. Prefer one concern per file. A file may contain several hooks in its `hooks` array. Hooks activate when a session starts. Do not tell the user to register them.

Do not create new `.kiro.hook` files. IDE 0.x used that extension. Current Kiro does not execute those files. The migration map is in `references/schema.md`.

## Minimal file

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "lint-on-save",
      "trigger": "PostFileSave",
      "matcher": "\\.(ts|tsx)$",
      "action": {
        "type": "command",
        "command": "npx eslint --fix {{filePath}}"
      }
    }
  ]
}
```

Copy a closer starting point from `assets/` when you can:

| Asset | Trigger | Action |
| --- | --- | --- |
| `lint-on-save.json` | `PostFileSave` | command |
| `prompt-context.json` | `UserPromptSubmit` | agent |
| `stop-review.json` | `Stop` | command with `confirm` |
| `guard-env-writes.json` | `PreToolUse` | command that can block |
| `task-lifecycle.json` | `PreTaskExec`, `PostTaskExec` | agent |

## Triggers to offer

Use the PascalCase `trigger` values: `SessionStart`, `Stop`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PostFileCreate`, `PostFileSave`, `PostFileDelete`, `PreTaskExec`, `PostTaskExec`.

`SessionEnd` is CLI V3 only. `Manual` is listed by CLI V3 and is not invocable from `/hooks`. The IDE cannot create a new manual hook. For an on-demand workflow, write a `manual` steering file instead (`kiro-steering`).

File triggers observe agent writes, not edits the user makes by hand in the editor.

## Actions

- `command` runs a shell command in the project root. It receives a JSON event on stdin. `{{filePath}}` is available for file triggers. `USER_PROMPT` is the documented environment variable for prompt submit.
- `agent` injects `action.prompt` into the conversation. On prompt submit, that prompt is appended to the user prompt. Agent actions do not block the triggering event.

Prefer `command` for formatters, linters, and policy checks. Prefer `agent` when the next step needs judgment. Say so in `description`.

## Safety

- Do not put secrets in hook JSON or in prompts.
- A blocking hook must fail closed on the event it guards, and must print a one-line reason on stderr.
- Exit-code docs disagree. The 1.0 hooks migration page says exit code `2` blocks `PreToolUse`, `UserPromptSubmit`, and `PreTaskExec`, and any other non-zero code is an error rather than a block. The hook actions page says any non-zero code blocks Pre Tool Use and Prompt Submit. New hooks that mean to block should exit `2`, and the skill should mention the conflict to the user when they ask for a gate.
- There is no published JSON schema for the stdin payload. Examples and field notes that were captured against IDE 1.x use `session_id`, `hook_event_name`, `cwd`, and, for tool events, `tool_name`, `tool_input`, and `tool_response`. Treat unknown fields as optional.
- File and task triggers do not run in Kiro Web sessions. Web can store the JSON for later local use.

## Validate

Parse the file with a JSON parser before finishing. Pretty-print with two-space indent. `version` is the string `"v1"`, not a number.
