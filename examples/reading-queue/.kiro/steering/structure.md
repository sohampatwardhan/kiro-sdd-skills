---
inclusion: always
---

# Project structure

This example is a spec specimen. Application source is added only when someone executes the tasks. Until then the tree is documents.

```mermaid
---
config:
  layout: elk
---
flowchart TB
  subgraph root [reading-queue example]
    kiro[".kiro"]
    docs["docs"]
    hooks["scripts/hooks"]
  end
  subgraph specRoot [Specs]
    feature["specs/reading-queue"]
    bug["specs/duplicate-title-match"]
  end
  kiro --> specRoot
  kiro --> steer["steering"]
  kiro --> hookFiles["hooks"]
  docs --> adr["adr"]
```

## Where new files go

| Kind | Path |
| --- | --- |
| Feature spec | `.kiro/specs/<feature-name>/` |
| Steering | `.kiro/steering/` |
| Hooks | `.kiro/hooks/` |
| Architecture and ADRs | `docs/` and `docs/adr/` |
| Hook helper scripts | `scripts/hooks/` |

When the tasks are executed, queue types go in `src/queue/`, HTTP routes in `src/api/`, and tests in `test/`. Import the service from the API. Do not import the API from the service.

## Naming

- Spec folders are kebab-case.
- Steering files are kebab-case or the foundation names `product.md`, `tech.md`, and `structure.md`.
- ADR files are `NNNN-kebab-title.md`.
