# Inclusion modes

Front matter is YAML between `---` lines and must be the first content in the file.

## always

```yaml
---
inclusion: always
---
```

Loaded in every Kiro interaction. Use for product, tech, structure, security baselines, and conventions that apply to every change. This is the default for foundation files even when the front matter is omitted. Write it anyway.

## fileMatch

```yaml
---
inclusion: fileMatch
fileMatchPattern: "src/api/**/*.ts"
---
```

Or several patterns:

```yaml
---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx"]
---
```

Loaded when the files in play match the glob. Quote patterns so YAML does not eat `*`.

Typical patterns from the steering docs: `"*.tsx"`, `"app/api/**/*"`, `"**/*.test.*"`, `"src/components/**/*"`, `"*.md"`.

## manual

```yaml
---
inclusion: manual
---
```

Loaded when the user types `#file-name` (the filename without `.md`) or picks the slash command Kiro creates for that file. Use for runbooks, migrations, and long troubleshooting notes.

## auto

```yaml
---
inclusion: auto
name: testing
description: "Unit and integration test conventions. Use when adding or changing tests."
---
```

`name` and `description` are required. Kiro includes the file when the request matches the description, and also exposes it as a slash command. This is the steering analogue of a skill. Keep the description specific.

CLI V3 supports all four modes. The steering docs say V1 and V2 load `always` automatically and do not provide V3's full fileMatch, manual, and auto behavior. When the user is on an older CLI, say that `always` is the reliable mode.

## What not to do

- Do not put inclusion front matter after a heading.
- Do not use `inclusion: auto` without both `name` and `description`.
- Do not set foundation files to `manual`. They would disappear from the default context.
- Do not duplicate a spec inside steering. Link the spec or summarize the stable rule.
