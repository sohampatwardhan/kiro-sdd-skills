# Task list format

This is the shape Kiro's spec task runner reads. Markdown above the list, including the intro and the DAG, is documentation. Do not break the list to make the diagram easier.

## Document order

```text
# Implementation Plan
<optional one- or two-sentence intro>

## Task graph
<what an arrow means and the critical path>
<the mermaid DAG, plus any status or RAG chart>
<optional notes on the diagram>

## Tasks
<the checkbox list, unbroken, to the end of the file>
```

- The task graph section sits directly under the title and the intro. It is never after the list.
- The checkbox list is the last section. Do not put prose, headings, or diagrams between checkboxes.
- No line in the graph section starts with `- [`, so neither Kiro nor the issue sync in `kiro-github-pipeline` reads it as a task.

## Checkboxes

```markdown
- [ ] 1. Set up CI for build, lint, and test
  - Add `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, `npm run build`, and `npm test` on push and pull request
  - Gates every later task: it must pass before task 2 starts

- [ ] 2. Write the queue entry types
  - Add the status enum and the entry record
  - _Requirements: 1.1, 1.2_

- [ ] 3. Enforce queue rules
- [ ] 3.1 Reject a duplicate open title
  - Compare titles after trim and case fold
  - _Requirements: 1.4_
- [ ] 3.2 Reorder queued entries
  - _Requirements: 2.1, 2.2_
```

- Indent detail bullets one level under the checkbox.
- The requirements bullet is italicized with underscores: `_Requirements: 1.4_`.
- Ids are `N` or `N.M` as they appear in the behavior file. Separate with commas and a space.
- Do not put file paths only in the title and nowhere in the design. Paths are allowed in detail bullets when the design already named them.
- Action verbs: Implement, Add, Write, Reject, Wire, Test.
- Optional: `- [ ] 8. Add property tests for the status invariant (optional)`.
- Done: `- [x] 2.1 Reject a duplicate open title`.

## Parents and children

If 3.1 exists, do not also describe the same work on task 3. Task 3 is the group. An agent executing "task 3" should start at 3.1.

A task with no children is a single unit of work and must carry its own `_Requirements:_` line. The one exception is task 1, the CI task. It implements no acceptance criterion, so it has no `_Requirements:_` line. Its last detail bullet says that it gates every later task.

## Coverage

Build a set of cited ids and compare it to the behavior file before asking for approval. Skip task 1, the CI task, in this check. SHALL criteria are required. WITHDRAWN criteria are not cited. SHOULD criteria are cited only by optional tasks unless the user promoted them.

## Bugfix tasks

Include, in order when the dependencies allow:

1. The CI task, as in every plan.
2. The fix: a test that fails on the current behavior (Requirement 1), then the code change for the expected behavior (Requirement 2). Both go in one task and one commit, test first (`test-driven-development`), so no pushed commit leaves CI red.
3. Tests that the unchanged behavior still holds (Requirement 3).

No unrelated cleanup tasks.
