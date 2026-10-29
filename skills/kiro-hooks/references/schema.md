# Hook schema

The machine-readable version of this page is `../assets/kiro-hooks.v1.schema.json` (JSON Schema draft 2020-12). It is unofficial. Kiro documents the fields but does not publish a schema file. When this page and the schema disagree, fix the schema to match the Kiro docs.

Current file, from https://kiro.dev/docs/hooks/:

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "example-hook",
      "description": "Optional documentation.",
      "enabled": true,
      "trigger": "PostFileSave",
      "matcher": "\\.(ts|tsx)$",
      "timeout": 60,
      "action": { "type": "command", "command": "npx eslint --fix" }
    }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `version` | yes | String `"v1"`. |
| `hooks` | yes | Array. May contain more than one hook. |
| `hooks[].name` | yes | Human-readable id, unique among hooks the user will see. |
| `hooks[].description` | no | Documentation only. |
| `hooks[].trigger` | yes | PascalCase event name. |
| `hooks[].matcher` | no | Omitted means always match. |
| `hooks[].action.type` | yes | `"command"` or `"agent"`. |
| `hooks[].action.command` | when command | Shell command. |
| `hooks[].action.prompt` | when agent | Prompt text. |
| `hooks[].timeout` | no | Seconds for command actions. Default 60. `0` disables. Ignored for agent actions. |
| `hooks[].enabled` | no | Default true. `false` keeps the file without running it. |
| `hooks[].confirm` | no | For `Stop` command hooks. See below. |

## Choices the schema makes

These choices fill gaps in the docs. Revisit them if Kiro publishes a schema.

| Rule | Why |
| --- | --- |
| No additional properties at any level | The docs call the field list the full schema. Strictness catches legacy `when` / `then` and typos. |
| `matcher` is a single string | The field table describes one pattern. The IDE editor accepts several tool-name entries, but the JSON shape for several entries is not documented. |
| `trigger` includes `SessionEnd`, `Manual`, `AgentSpawn`, and `agentSpawn` | The hook types page documents them for CLI V3. New hooks should still prefer the ten main triggers. |
| `timeout` is an integer | The docs give whole seconds and `0` to disable. |
| `confirm` only with `Stop` and a command action | The docs describe confirmation only for `Stop` command hooks. |
| Unique `name` is checked by the script, not the schema | JSON Schema cannot compare values across files. The migration page calls `name` a unique identifier. |

## Matcher

- File triggers: regex against the file path. Escape backslashes in JSON (`\\.(ts|tsx)$`).
- Tool triggers: a tool id, a category (`read`, `write`, `shell`, `web`, `spec`), a source selector (`@mcp`, `@builtin`, `@powers`, `@server`, `@server/tool`), a wildcard (`*`, `?`), or a regex against the tool id. A bare word such as `read` is also a regex, so it can match any id containing that text.
- Prompt submit: the migration notes say the matcher can apply to prompt text. Prefer a command that inspects `USER_PROMPT` or stdin when the decision is more than a regex.

MCP tool events report an internal id like `mcp_postgres_query`, not the display name `@postgres/query`. Match either the `@server/tool` selector or a regex on the internal id.

## Confirm

Only meaningful for a command hook on `Stop`.

```json
"confirm": {
  "question": "Submit this session's results?",
  "confirmCommand": "./confirm-options.sh",
  "options": [
    { "id": "submit", "label": "Yes, submit", "run": true },
    { "id": "dismiss", "label": "Not this time", "run": false }
  ]
}
```

`confirmCommand` is optional. Its stdout is JSON: `{ "skip": true }` skips the hook, or `{ "question": "...", "options": [...] }` replaces the static prompt. Non-zero, timeout, or invalid JSON falls back to the static question.

## Triggers

| Trigger | When | Matcher | Block with exit 2 |
| --- | --- | --- | --- |
| `SessionStart` | Session begins | none | no |
| `Stop` | Agent turn finishes | none | no |
| `UserPromptSubmit` | User sends a message | prompt text | yes, IDE. CLI prompt hooks do not block |
| `PreToolUse` | Before a tool call | tool | yes |
| `PostToolUse` | After a tool call | tool | no |
| `PostFileCreate` | Agent creates a file | path | no |
| `PostFileSave` | Agent saves or edits a file | path | no |
| `PostFileDelete` | Agent deletes a file | path | no |
| `PreTaskExec` | Before a spec task | none | yes |
| `PostTaskExec` | After a spec task | none | no |

`AgentSpawn` and `agentSpawn` are compatibility spellings of `SessionStart` on CLI V3. Write `SessionStart` for new hooks.

## Legacy `.kiro.hook`

IDE 0.x stored one hook per `.kiro/hooks/*.kiro.hook` file with `when` / `then`. The 0.x reference page still shows a `when` / `then` sample. The current hooks page and the IDE 1.0 migration page both say new files use `version`, `hooks[]`, `trigger`, `matcher`, and `action`. Author that shape.

| Old `when.type` | New `trigger` |
| --- | --- |
| `agentSpawn` | `SessionStart` |
| `agentStop` | `Stop` |
| `promptSubmit` | `UserPromptSubmit` |
| `preToolUse` | `PreToolUse` |
| `postToolUse` | `PostToolUse` |
| `fileCreated` | `PostFileCreate` |
| `fileEdited` | `PostFileSave` |
| `fileDeleted` | `PostFileDelete` |
| `preTaskExecution` | `PreTaskExec` |
| `postTaskExecution` | `PostTaskExec` |
| `userTriggered` | No v1 trigger. Existing legacy hooks can still be played in the IDE. New on-demand work is a manual steering file. |

## Stdin

Command hooks receive JSON on stdin and run with the project as the working directory. Exit 0 adds stdout to agent context. The actions page and the migration page disagree about whether every non-zero status blocks or only status 2. Exit 2 is the portable "block this event" signal for `PreToolUse`, `UserPromptSubmit` (IDE), and `PreTaskExec`.

`{{filePath}}` is substituted for file triggers. Prompt text for `UserPromptSubmit` is in `USER_PROMPT` on the IDE and CLI examples. Do not assume `USER_PROMPT` is set for other triggers. Do not assume the payload includes the active agent name. A Kiro issue records captures whose keys were `cwd`, `hook_event_name`, `session_id`, `tool_input`, and `tool_name`.
