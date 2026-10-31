---
inclusion: always
---

# Project structure

## Layout

[Top-level directories and what belongs in each.]

```mermaid
---
config:
  layout: elk
---
flowchart TB
  subgraph root [Repository]
    src["src"]
    tests["tests"]
    docs["docs"]
    kiro[".kiro"]
  end
  src --> tests
  docs --> kiro
```

## Naming and imports

- [File naming]
- [How modules import each other]
- [Where a new feature is allowed to add files]

## Specs and steering

- Specs: `.kiro/specs/<feature-name>/`
- Steering: `.kiro/steering/`
- Hooks: `.kiro/hooks/`
