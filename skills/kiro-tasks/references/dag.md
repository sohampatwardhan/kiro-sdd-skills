# Task DAG

The diagram lives in `tasks.md` under a `## Task graph` heading, after the checkbox list.

## Structure

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
    t2["2. Write types"]
  end
  subgraph phase3 [Phase 3 Rules]
    subgraph parallel3 [Parallel after 2]
      t31["3.1 Reject duplicates"]
      t32["3.2 Reorder entries"]
    end
  end
  subgraph legend [Legend]
    legCrit["Critical path"]
    legPar["Parallelizable"]
    legBlock["Blocked"]
  end
  t1 --> t2
  t2 --> t31
  t2 --> t32
  classDef critical fill:#fde68a,stroke:#b45309,color:#1c1917
  classDef parallel fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
  classDef blocked fill:#fecaca,stroke:#b91c1c,color:#7f1d1d
  class t1,t2 critical
  class t31,t32 parallel
  class legCrit critical
  class legPar parallel
  class legBlock blocked
```

- The CI task is node `t1`, alone in the first phase subgraph. In a new plan it is the only wave 1 task. Every task that has no other dependency gets an arrow from `t1`. It is always `critical`, because every chain starts there. A plan that appended its CI task later (see `../SKILL.md`) still draws that node alone in the first phase, here `phase0`.

- Open with the ELK layout front matter from `kiro-mermaid` (`config.layout: elk`), then `flowchart TB` or `flowchart LR`. Nested subgraphs stay inside that flowchart. Merge into existing front matter instead of adding a second block.
- Direction `TB` or `LR`. Prefer `TB` when there are several phases.
- Subgraph ids are single tokens (`phase1`, `parallel2`, `legend`). Put the human title in brackets: `subgraph phase1 [Phase 1 Foundation]`.
- Nest a parallel group inside its phase.
- Node ids are not the task number. Use `t1`, `t21`, `t22` so a number cannot collide with a reserved word. The visible label carries the official number and the task title, in quotes.
- One arrow `A --> B` means B depends on A.
- Do not link the legend into the graph.
- Style three classes:
  - `critical`: a longest chain of required tasks. If two chains tie, pick the one that delivers the core state change and say so under the diagram.
  - `parallel`: a required task that can run in the same wave as another task once its incoming arrows are satisfied.
  - `blocked`: not part of the required run, or waiting on something outside the spec. Optional tasks are blocked for "run all required".
- A node is in one class. Incoming arrows still mean "not startable until the source is done", including critical nodes that are not the first task.

## Consistency checks

Before approval, all of these are true:

1. Every non-grouping checkbox has exactly one node, and every node (except legend nodes) has exactly one checkbox.
2. The label starts with the checkbox number.
3. Every arrow's source and target exist in the list.
4. There is no cycle.
5. A task that the prose says "builds on X" has an arrow from X.
6. Grouping parents are not nodes, unless the parent itself has a `_Requirements:_` line and no children.
7. Waves implied by the arrows match any wave list you also write. Recompute waves rather than editing them by hand: a task's wave is one more than the max wave of its dependencies. Tasks with no dependencies are wave 1.
8. The CI task's node sits alone in the first phase, has no incoming arrows, and reaches every other unchecked task node. In a new plan that means it is the only wave 1 task.

Kiro does not read this diagram to discover dependencies. It infers a graph from the task text when running the spec. Keep the task order and the detail bullets consistent with the arrows so that inference and the diagram agree. Early tasks must not depend on later ones.
