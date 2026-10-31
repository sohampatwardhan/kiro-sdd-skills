---
name: kiro-steering
description: "Create and maintain Kiro steering files in .kiro/steering/, including foundation product.md, tech.md, and structure.md plus custom files. Use when the user asks for steering, project context for Kiro, inclusion modes always, fileMatch, manual, or auto, fileMatchPattern, or file references written as #[[file:]] and #[[folder:]]."
license: MIT
compatibility: "Portable Agent Skills package. Writes Markdown with YAML front matter. Diagrams follow the kiro-mermaid skill."
metadata:
  author: kiro-sdd-skills
  version: "1.0.0"
---

# Kiro steering

Steering is persistent project context Kiro loads beside a spec. It is not a spec. Specs live under `.kiro/specs/<feature>/`. Steering lives under `.kiro/steering/`.

Confirmed from https://kiro.dev/docs/steering/ (fetched 2026-10-29). Inclusion details are in `references/inclusion.md`.

## Where files go

| Scope | Path | Wins on conflict |
| --- | --- | --- |
| Workspace | `.kiro/steering/*.md` | Workspace |
| Global | `~/.kiro/steering/*.md` | Overridden by workspace |

Write workspace files unless the user asked for a personal global convention. Never put secrets in steering.

Custom agents do not load steering unless their config includes it:

```json
{ "resources": ["file://.kiro/steering/**/*.md"] }
```

`AGENTS.md` at the repo root, under `~/.kiro/steering/`, or in a subdirectory is also steering. It is always included and does not support inclusion modes. Do not add inclusion front matter to `AGENTS.md` and expect Kiro to honor it.

## Foundation files

Create these three when the user asks for foundation steering or when you are generating project context from scratch. They are included in every interaction by default. Still set `inclusion: always` so the mode is visible.

| File | Template | Contents |
| --- | --- | --- |
| `product.md` | `assets/product.md` | Purpose, users, key features, objectives |
| `tech.md` | `assets/tech.md` | Frameworks, libraries, tools, technical constraints |
| `structure.md` | `assets/structure.md` | Directories, naming, imports, architectural decisions |

Read the repo before writing. Describe the project that exists, not an idealized stack. One domain per custom file after these three.

## Custom files

| Mode | Template | When |
| --- | --- | --- |
| `fileMatch` | `assets/api-standards.md` | Guidance for files that match a glob |
| `manual` | `assets/runbook.md` | Rare, heavy context the user will name with `#file-name` |
| `auto` | `assets/testing.md` | Loaded when the request matches `name` and `description` |

Front matter is the first bytes of the file. No title, blank line, or comment before the opening `---`.

## File references

Keep steering pointed at live files instead of pasting them:

```markdown
#[[file:docs/architecture.md]]
#[[file:docs/adr/0001-one-active-book.md:12-28]]
#[[folder:docs/adr]]
```

Whole-file references work across Kiro surfaces. A single line (`:12`) or inclusive range (`:12-28`), and `#[[folder:...]]` for a one-level listing, are documented for Kiro IDE and CLI V3. Paths are relative to the workspace root for workspace steering, to `~/.kiro/steering/` for global steering, and to the containing folder for `AGENTS.md`.

Use a range only after you have read the file and confirmed those lines exist. If Kiro cannot resolve a reference it leaves a visible marker. Do not point at a file you did not create or find.

## Diagrams

Each steering file includes at least one Mermaid flowchart that shows the rule the prose states (user journey, stack, directory ownership, request path, or test layers). Open that flowchart with the ELK layout front matter from `kiro-mermaid`. Follow `kiro-mermaid`.

## Maintaining steering

Update steering when the stack, layout, or product boundary changes. Review file references after a move. Treat the edit like code: no secrets, one domain per file, names that say what they govern (`api-standards.md`, not `notes.md`).
