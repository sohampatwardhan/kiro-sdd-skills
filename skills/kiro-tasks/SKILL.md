---
name: kiro-tasks
description: "Write or update a Kiro tasks.md implementation plan. Use when breaking an approved design into numbered checkbox tasks, sub-tasks such as 2.1, requirement traceability like _Requirements: 1.2, 3.1_, optional tasks, or a Mermaid DAG of phases and parallel groups. Task 1 always creates or updates the CI workflow and comes first in the DAG. Also use when syncing tasks after a requirements or design change."
license: MIT
compatibility: "Portable Agent Skills package. Writes Markdown. The task DAG follows the kiro-mermaid skill."
metadata:
  author: kiro-sdd-skills
  version: "1.0.0"
---

# Kiro tasks

Write `.kiro/specs/<feature-name>/tasks.md` only after design and the behavior file are both approved, unless the user asked for a Quick Spec. The orchestrator is `kiro-sdd`. The DAG follows `kiro-mermaid`. Format rules are in `references/format.md`. DAG rules are in `references/dag.md`. The skeleton is `assets/tasks.md`.

## What a task is

Convert the design into coding steps for an agent that already has the spec open. Each task builds on earlier tasks and ends with the pieces wired together.

Include only work that writes, modifies, or tests code: types, logic, persistence, API surface, and tests. Do not include deployment, user acceptance testing, performance-metrics gathering, user training, or writing end-user docs.

## Shape

```markdown
# Implementation Plan

- [ ] 1. Set up CI for build, lint, and test
  - Create or update `.github/workflows/ci.yml` to run the project's build, lint, and test commands on push and pull request
  - Gates every later task: it must pass before task 2 starts

- [ ] 2. Major task that stands alone
  - Concrete coding detail
  - _Requirements: 1.1_

- [ ] 3. Group of related work
- [ ] 3.1 First sub-task
  - Concrete coding detail
  - _Requirements: 2.1, 3.3_
```

- Two levels maximum. Sub-tasks use `2.1`, `2.2`, not a third level.
- Every checkbox is numbered. Children do not repeat the parent's number as a sibling.
- The last bullet under a task that does work is `_Requirements: 1.2, 3.1_`. Ids only, comma-separated, no descriptions. Task 1, the CI task, is the only exception (see below).
- A parent that exists only to group children may omit detail bullets. Children carry the requirement ids.
- Put `(optional)` at the end of a task title when Kiro should be able to skip it on "run all required tasks". Use this for extra tests, not for behavior the requirements mark SHALL. The marker `- [ ]*` appears in some Kiro task templates; kiro.dev documents optional tasks but does not publish that marker. Prefer the visible `(optional)` title so the plan stays readable, and you may also use `- [ ]*` when the user wants the template marker.
- Completed work the user asks you to recognize uses `- [x]`.

## Task 1 is CI

Every new task list starts with a CI task, so each later task lands on a branch that CI already checks.

- Task 1 creates or updates `.github/workflows/ci.yml`. On another host, use that host's CI file and say which in the title. It is a major task with no children.
- The workflow runs the project's build, lint, and test commands for its stack. Take them from `.kiro/steering/tech.md`, the design, or the project manifest. If the project lacks one of them, the detail bullets name the tool the task adds. `kiro-github-pipeline` has a skeleton in `assets/ci.yml`.
- When the existing workflow misses something the spec adds, such as a new package, test directory, or service, task 1 extends it.
- When the existing workflow already covers every path the spec touches, write task 1 checked (`- [x] 1.`) with a detail bullet naming the workflow file and its jobs. Numbering and the DAG stay the same shape either way.
- Task 1 implements no acceptance criterion. It has no `_Requirements:_` line, and coverage checks skip it. Its last detail bullet says that it gates every later task.
- Every other task depends on task 1, directly or through another task.

Bugfix plans follow the same rule. The failing reproduction test moves to task 2.

## Traceability

Every acceptance-criterion id in `requirements.md` or `bugfix.md` appears in at least one `_Requirements:_` line. If one is missing, add a task or go back to design. Do not cite a whole requirement when only one criterion is implemented; cite `1.2`, not `1`, unless the task truly covers every criterion under Requirement 1. If you cite `1`, the design must show that every child criterion is in that task.

## Dependencies and the DAG

Kiro infers a dependency graph when it runs all tasks, then executes independent tasks in a wave. The checkbox list has no official `depends-on` field. Do not invent one inside the requirement bullet.

Put the graph in a Mermaid flowchart in `tasks.md`:

- Open with the ELK layout front matter from `kiro-mermaid` (`config.layout: elk`), including when the diagram uses nested subgraphs. Merge it into existing front matter. Do not add a second block.
- Nested subgraphs: phase, then parallel group inside the phase.
- The CI task comes first: node `t1` alone in the first phase, `subgraph phase1 [Phase 1 CI]`. Every task that has no other dependency gets an arrow from `t1`, so every node is reachable from it. `t1` is on the critical path.
- One node per checkbox that does work. Use the same number as the list (`2.1`, not a nickname).
- An arrow means the target depends on the source. The source must be checked before the target starts.
- `classDef` styles for critical path, parallelizable, and blocked, plus a legend subgraph.
- After any edit to the checkboxes, update the diagram in the same change. Numbers, arrows, and classes must match the list.

`references/dag.md` has the styling and the consistency checks.

## Order

Start with the CI task. Then types and interfaces, then rules, then the entry points that wire them, then tests that lock the criteria. Interleave tests with the rules they lock when that keeps a step small. No orphan code that nothing later calls.

## Approval and sync

If this phase is gated, stop and ask: "Do the tasks look good?"

When syncing after a spec edit, follow `../kiro-sdd/references/iteration.md`. Append tasks. Do not renumber. Rebuild the DAG from the new list.

An existing plan written before the CI rule keeps its numbers. Append the CI task with the next free major number, put its node alone in a new first phase of the DAG (`subgraph phase0 [Phase 0 CI]`, so existing phase ids stay put), and draw arrows from it to every unchecked task that has no other unchecked dependency. Say under the diagram that this task runs first despite its number.

When the project tracks the spec in a GitHub issue, `kiro-github-pipeline` mirrors these checkboxes into the issue. Change `tasks.md` first, then sync the issue.
