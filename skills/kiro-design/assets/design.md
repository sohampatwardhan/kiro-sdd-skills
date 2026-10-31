# Design Document

## Overview

[What this feature does, the approach, and why that approach won. Link requirements or bugfix criteria the design covers.]

```mermaid
---
config:
  layout: elk
---
flowchart LR
  caller["Caller"] --> edge["Entry point"]
  edge --> core["Core rule"]
  core --> store["Store"]
```

## Architecture

[Components and the runtime path.]

```mermaid
---
config:
  layout: elk
---
flowchart TB
  subgraph clients [Clients]
    app["Client"]
  end
  subgraph service [Service]
    api["API"]
    rules["Rules"]
  end
  subgraph data [Data]
    db["Database"]
  end
  app --> api
  api --> rules
  rules --> db
```

```mermaid
sequenceDiagram
  actor Caller
  participant Api
  participant Rules
  participant Store
  Caller->>Api: request
  Api->>Rules: apply
  alt accepted
    Rules->>Store: persist
    Store-->>Rules: saved
    Rules-->>Api: ok
    Api-->>Caller: success
  else rejected
    Rules-->>Api: error
    Api-->>Caller: failure
  end
```

## Components and Interfaces

### [Component]

[Purpose, responsibilities, non-responsibilities, dependencies.]

```mermaid
classDiagram
  class Rules {
    +apply(input) Result
  }
  class Store {
    +save(record) Record
  }
  Rules --> Store : reads and writes
```

## Data Models

```mermaid
erDiagram
  OWNER ||--o{ ITEM : owns
  OWNER {
    string id
    string name
  }
  ITEM {
    string id
    string ownerId
    string status
  }
```

```mermaid
---
config:
  layout: elk
---
stateDiagram-v2
  [*] --> draft
  draft --> active : accept
  active --> closed : close
  closed --> [*]
```

## Error Handling

| Condition | Response | State afterward |
| --- | --- | --- |
| [invalid input] | [error] | [unchanged] |

```mermaid
---
config:
  layout: elk
---
flowchart TB
  fail["Failure"] --> kind{"Kind"}
  kind -->|"validation"| client["Client error"]
  kind -->|"conflict"| conflict["Conflict"]
  kind -->|"dependency"| depend["Dependency error"]
```

## Testing Strategy

- Unit: [rules and ids]
- Integration: [sequences]
- Property: [invariant]. Validates: Requirement 1.1
