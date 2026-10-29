# Iterating on an existing spec

Kiro specs are refined in place. Confirmed behavior from https://kiro.dev/docs/specs/best-practices/ (fetched 2026-10-29):

- Requirements-First: edit `requirements.md`, then update `design.md` to match, then sync `tasks.md`.
- Design-First: edit `design.md`, then re-derive requirements that are still feasible, then sync tasks.
- The workflow choice is fixed for that folder. Starting over means a new spec folder. Relevant sections may be copied.
- A bugfix spec stays a bugfix. New capability gets its own feature spec.
- `#spec` in Kiro chat loads the whole spec. From another agent, read the three files yourself.

## Numbering

Existing ids are stable addresses.

- Do not renumber `### Requirement N` or acceptance criteria `1.`, `2.`, `3.` once any `tasks.md` cites them.
- Add Requirement N+1, or the next criterion number inside a requirement.
- Do not renumber checkbox tasks. Append the next free major number, or the next free sub-number.
- When a criterion is withdrawn, mark it withdrawn in prose and leave the number in place. Point tasks that cited it at the replacement, or remove those tasks only if they were never completed and nothing else cites them.

## Sync tasks

"Sync files" in Kiro updates `tasks.md` from the other two documents and can check off work that already exists in the repo.

When asked to sync:

1. Re-read requirements (or bugfix), design, and tasks.
2. Add tasks for new criterion ids. Use new task numbers.
3. If the user asks which tasks are already done, inspect the code and check only the tasks whose behavior is present. Use `- [x]`. Do not check a parent while a child is open.
4. Leave optional tasks optional.
5. Update the Mermaid DAG in the same edit so numbers, edges, and classes still match the list. A diagram that disagrees with the checkboxes is a failed sync.

## Partial edits

A request to "add password reset to the spec" is an iteration, not a new workflow. Stay in the existing order: change the upstream artifact first (requirements, or design if the spec was Design-First), get approval when gates are in force, then propagate.
