# Workflows and gates

Kiro's spec surfaces (IDE, CLI, and Web) share one file layout. Confirmed from the specs docs at https://kiro.dev/docs/specs/ and the feature-spec docs.

## Files

```text
.kiro/specs/<feature-name>/
  requirements.md    # feature specs
  bugfix.md          # bugfix specs, instead of requirements.md
  design.md
  tasks.md
```

`<feature-name>` is a kebab-case slug. One feature or one bug per folder. A repo may hold many specs.

## Requirements-First

1. Write `requirements.md` with the `kiro-requirements` skill. Generate a complete first draft from the idea. Do not interview the user one question at a time before that draft.
2. Ask: "Do the requirements look good? If so, we can move on to the design."
3. On request, or when the spec is large, ambiguous, or compliance-sensitive, analyze before design:
   - Contradictions between acceptance criteria
   - Criteria that name no observable outcome
   - Missing negative cases (empty input, unauthorized caller, duplicate, already-in-state)
   - Terms used for two different things
   - Behavior the design cannot satisfy under a stated constraint
4. After approval, write `design.md`. It must cover every requirement number.
5. Ask: "Does the design look good? If so, we can move on to the implementation plan."
6. After approval, write `tasks.md`. Every acceptance criterion id appears in at least one `_Requirements:_` line.
7. Ask: "Do the tasks look good?"

## Design-First

Use this when the user brings an architecture, a fixed stack, or a hard latency, throughput, or compliance constraint. Kiro's design-first flow also distinguishes high-level design (components and non-functional properties) from low-level design (interfaces, data structures, pseudocode). Match the level they asked for.

1. Write `design.md` first. Research the repo. Do not create a side research file.
2. Ask for design approval using the design question above.
3. Derive `requirements.md` that the approved design can actually meet. Drop or rewrite behavior the design cannot do, and say what changed.
4. Ask for requirements approval.
5. Write `tasks.md`, then ask for task approval.

If generated requirements miss the user's intent, go back to the design. Do not paper over a design gap with a requirement the architecture cannot meet.

## Quick Spec

The user must opt in ("quick spec", "skip the gates", "one pass"). Write requirements, design, and tasks without stopping. Tell them the gates were skipped. Both workflows produce the same three filenames. The difference is review, not shape.

## Bugfix

Use a bugfix spec when the defect is in a critical path, the root cause is unclear, earlier fixes caused regressions, or the fix must be documented. A one-line typo does not need one.

1. Write `bugfix.md` with current, expected, and unchanged behavior.
2. Design records root cause, the smallest fix, and three test properties: the bug reproduces, the fix corrects it, and unchanged behavior still holds.
3. Tasks implement that fix and those tests. No drive-by refactors.

Kiro generates property-based tests for these properties in the IDE. Other surfaces still get the tasks; do not claim a PBT runner exists where the project has none.

## Analyze, then stop

After a gated phase, stop. Do not "helpfully" draft the next file in the same turn unless the user already approved or asked for Quick Spec.
