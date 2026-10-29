# Architecture overview

[One paragraph on what this system is and who it serves. This file is project context. Feature designs link here instead of repeating it.]

```mermaid
flowchart TB
  subgraph actors [Actors]
    user["User"]
  end
  subgraph system [System]
    app["Application"]
    api["API"]
  end
  subgraph external [External]
    db["Database"]
  end
  user --> app
  app --> api
  api --> db
```

## Containers

[Short description of each runtime piece and what it owns.]

```mermaid
flowchart LR
  client["Client"] --> api["API"]
  api --> worker["Worker"]
  api --> db["Database"]
  worker --> db
```

## Cross-cutting rules

- [How requests are authenticated]
- [How errors are shaped]
- [What this overview deliberately does not decide]
