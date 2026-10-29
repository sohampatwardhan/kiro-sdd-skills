# Task list format

This is the shape Kiro's spec task runner reads. Extra Markdown below the list, including the DAG, is documentation. Do not break the list to make the diagram easier.

## Checkboxes

```markdown
- [ ] 1. Write the queue entry types
  - Add the status enum and the entry record
  - _Requirements: 1.1, 1.2_

- [ ] 2. Enforce queue rules
- [ ] 2.1 Reject a duplicate open title
  - Compare titles after trim and case fold
  - _Requirements: 1.4_
- [ ] 2.2 Reorder queued entries
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

If 2.1 exists, do not also describe the same work on task 2. Task 2 is the group. An agent executing "task 2" should start at 2.1.

A task with no children is a single unit of work and must carry its own `_Requirements:_` line.

## Coverage

Build a set of cited ids and compare it to the behavior file before asking for approval. SHALL criteria are required. WITHDRAWN criteria are not cited. SHOULD criteria are cited only by optional tasks unless the user promoted them.

## Bugfix tasks

Include, in order when the dependencies allow:

1. A test that fails on the current behavior (Requirement 1).
2. The code change for the expected behavior (Requirement 2).
3. Tests that the unchanged behavior still holds (Requirement 3).

No unrelated cleanup tasks.
