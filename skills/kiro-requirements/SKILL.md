---
name: kiro-requirements
description: "Write or update a Kiro feature requirements.md or bugfix bugfix.md under .kiro/specs. Use when drafting user stories, EARS acceptance criteria (WHEN, IF, WHILE, WHERE, THE SYSTEM SHALL), numbered criteria such as 1.2, analyzing requirements for gaps, or revising requirements before design. Stops for approval before any design file unless the user asked for a Quick Spec."
license: MIT
compatibility: "Portable Agent Skills package. Writes Markdown. Diagrams follow the kiro-mermaid skill."
metadata:
  author: kiro-sdd-skills
  version: "1.0.0"
---

# Kiro requirements and bugfix analysis

Write the behavior file for one spec. The orchestrator is `kiro-sdd`. Diagrams follow `kiro-mermaid`.

## Where the file goes

| Spec | Path | Do not also create |
| --- | --- | --- |
| Feature | `.kiro/specs/<feature-name>/requirements.md` | `bugfix.md` in that folder |
| Bugfix | `.kiro/specs/<feature-name>/bugfix.md` | `requirements.md` in that folder |

`<feature-name>` is an existing slug, or a new kebab-case slug you choose once.

## Feature requirements

Follow `assets/requirements.md`. Required shape, which Kiro's spec flow expects:

```markdown
# Requirements Document

## Introduction

## Requirements

### Requirement 1

**User Story:** As a [role], I want [capability], so that [benefit]

#### Acceptance Criteria

1. WHEN [event] THEN the system SHALL [observable response]
```

Rules that keep later phases traceable:

- One user story per requirement. Put related criteria under it instead of splitting every sentence into a new requirement.
- Number requirements `1`, `2`, `3` and criteria `1.`, `2.`, `3.` under each. Criterion 2 of Requirement 1 is `1.2`. Tasks cite these ids. Do not invent `US-001` or `FR-001` as the address.
- Every criterion is one EARS sentence. Patterns and examples are in `references/ears.md`.
- Use SHALL for mandatory behavior. Use SHOULD only for non-mandatory behavior, and do not let tasks treat SHOULD as a ship blocker unless the user says so.
- Cover the unhappy paths: invalid input, unauthorized caller, empty state, conflict, and "already in the desired state".
- Name observable outcomes (what is stored, returned, or left unchanged), not implementation steps.
- Keep domain words identical to the words you will use in `design.md`.
- First draft is complete. Do not stall on a questionnaire before writing the file. Ask for approval after the file exists.

## Bugfix analysis

Follow `assets/bugfix.md`. Kiro uses three sections instead of user stories:

- Current behavior (defect): `WHEN [condition] THEN the system [incorrect behavior]`
- Expected behavior: `WHEN [condition] THEN the system SHALL [correct behavior]`
- Unchanged behavior: `WHEN [condition] THEN the system SHALL CONTINUE TO [existing behavior]`

Still use `### Requirement N` and numbered criteria so `tasks.md` can cite `1.1`, `2.1`, `3.1`. Requirement 1 is the defect, Requirement 2 is the correction, Requirement 3 is what must not change. Add further requirements only when a second defect is truly in scope.

## Diagrams

Every requirements or bugfix document includes Mermaid. Flowcharts and any `stateDiagram-v2` open with the ELK layout front matter from `kiro-mermaid` (`config.layout: elk`):

- a flowchart of the user or defect flow
- a flowchart of decisions between acceptance criteria
- a `stateDiagram-v2` when the criteria name lifecycle states

Read `../kiro-mermaid/SKILL.md` (or the installed `kiro-mermaid` skill) before inserting a fence. Do not put an unparseable sample in a `mermaid` fence.

## Approval

If this phase is gated, stop after writing and ask: "Do the requirements look good? If so, we can move on to the design." For a bugfix, use the same question about the bugfix analysis. Revise in place. Do not renumber ids that tasks already cite; see `../kiro-sdd/references/iteration.md`.

Do not write `design.md` in the same turn unless the user already approved this file or explicitly asked for a Quick Spec.

## Analysis pass

When asked to analyze requirements, or before leaving a Quick Spec draft, check contradictions, ambiguous actors, untestable SHALL statements, missing negative cases, and criteria no design could satisfy. Edit the file. Do not only comment.
