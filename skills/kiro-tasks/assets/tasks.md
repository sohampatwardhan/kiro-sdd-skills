# Implementation Plan

- [ ] 1. [Stand-alone coding task]
  - [What to write or change]
  - _Requirements: 1.1_

- [ ] 2. [Group title]
- [ ] 2.1 [Sub-task]
  - [What to write or change]
  - _Requirements: 1.2, 2.1_
- [ ] 2.2 [Sub-task that can run beside 2.1]
  - [What to write or change]
  - _Requirements: 2.2_

- [ ] 3. [Later wiring task]
  - [Connect the pieces from 2.1 and 2.2]
  - _Requirements: 3.1_

- [ ] 4. [Extra test task] (optional)
  - [Property or characterization tests]
  - _Requirements: 3.1_

## Task graph

Arrows mean depends-on. A task waits until every incoming source is checked.

```mermaid
flowchart TB
  subgraph phase1 [Phase 1 Foundation]
    t1["1. Stand-alone coding task"]
  end
  subgraph phase2 [Phase 2 Rules]
    subgraph parallel2 [Parallel after 1]
      t21["2.1 Sub-task"]
      t22["2.2 Sub-task beside 2.1"]
    end
  end
  subgraph phase3 [Phase 3 Wiring]
    t3["3. Later wiring task"]
  end
  subgraph phase4 [Phase 4 Optional]
    t4["4. Extra test task"]
  end
  subgraph legend [Legend]
    legCrit["Critical path"]
    legPar["Parallelizable"]
    legBlock["Blocked"]
  end
  t1 --> t21
  t1 --> t22
  t21 --> t3
  t22 --> t3
  t3 --> t4
  classDef critical fill:#fde68a,stroke:#b45309,color:#1c1917
  classDef parallel fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
  classDef blocked fill:#fecaca,stroke:#b91c1c,color:#7f1d1d
  class t1,t21,t3 critical
  class t22 parallel
  class t4,legBlock blocked
  class legCrit critical
  class legPar parallel
```

Primary critical path: 1, 2.1, 3. Task 2.2 is parallel with 2.1. Task 4 is optional, so it is blocked for a required run.
