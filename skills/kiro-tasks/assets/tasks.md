# Implementation Plan

- [ ] 1. Set up CI for build, lint, and test
  - [Create or update `.github/workflows/ci.yml` with the project's build, lint, and test commands]
  - Gates every later task: it must pass before task 2 starts

- [ ] 2. [Stand-alone coding task]
  - [What to write or change]
  - _Requirements: 1.1_

- [ ] 3. [Group title]
- [ ] 3.1 [Sub-task]
  - [What to write or change]
  - _Requirements: 1.2, 2.1_
- [ ] 3.2 [Sub-task that can run beside 3.1]
  - [What to write or change]
  - _Requirements: 2.2_

- [ ] 4. [Later wiring task]
  - [Connect the pieces from 3.1 and 3.2]
  - _Requirements: 3.1_

- [ ] 5. [Extra test task] (optional)
  - [Property or characterization tests]
  - _Requirements: 3.1_

## Task graph

Arrows mean depends-on. A task waits until every incoming source is checked.

```mermaid
---
config:
  layout: elk
---
flowchart TB
  subgraph phase1 [Phase 1 CI]
    t1["1. Set up CI for build, lint, and test"]
  end
  subgraph phase2 [Phase 2 Foundation]
    t2["2. Stand-alone coding task"]
  end
  subgraph phase3 [Phase 3 Rules]
    subgraph parallel3 [Parallel after 2]
      t31["3.1 Sub-task"]
      t32["3.2 Sub-task beside 3.1"]
    end
  end
  subgraph phase4 [Phase 4 Wiring]
    t4["4. Later wiring task"]
  end
  subgraph phase5 [Phase 5 Optional]
    t5["5. Extra test task"]
  end
  subgraph legend [Legend]
    legCrit["Critical path"]
    legPar["Parallelizable"]
    legBlock["Blocked"]
  end
  t1 --> t2
  t2 --> t31
  t2 --> t32
  t31 --> t4
  t32 --> t4
  t4 --> t5
  classDef critical fill:#fde68a,stroke:#b45309,color:#1c1917
  classDef parallel fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
  classDef blocked fill:#fecaca,stroke:#b91c1c,color:#7f1d1d
  class t1,t2,t31,t4 critical
  class t32 parallel
  class t5,legBlock blocked
  class legCrit critical
  class legPar parallel
```

Primary critical path: 1, 2, 3.1, 4. Task 1 sets up CI, so every later task lands checked. Task 3.2 is parallel with 3.1. Task 5 is optional, so it is blocked for a required run.
