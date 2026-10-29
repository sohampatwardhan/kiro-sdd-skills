---
inclusion: fileMatch
fileMatchPattern: "src/api/**/*.ts"
---

# API standards

Use this when editing TypeScript under `src/api/`.

## Status codes

| Situation | Status |
| --- | --- |
| Created entry | 201 |
| Successful read or update | 200 |
| Missing or unknown member | 401 |
| Empty input, unknown id, or illegal transition | 422 |
| Duplicate open title, or a second active book | 409 |
| Store unavailable | 503 |

The response body for an error is `{ "error": "<stable-code>" }`. Do not put the stack trace in the body.

```mermaid
sequenceDiagram
  actor Client
  participant Api
  participant Queue
  Client->>Api: request
  Api->>Queue: call
  alt success
    Queue-->>Api: value
    Api-->>Client: 200 or 201
  else invalid
    Queue-->>Api: validation
    Api-->>Client: 422
  else conflict
    Queue-->>Api: conflict
    Api-->>Client: 409
  end
```
