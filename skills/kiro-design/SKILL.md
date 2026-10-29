---
name: kiro-design
description: "Write or update a Kiro design.md for a feature or bugfix spec, plus architecture notes and ADRs the spec references. Use when turning approved requirements or a technical approach into Overview, Architecture, Components and Interfaces, Data Models, Error Handling, and Testing Strategy, with Mermaid flowcharts, sequence diagrams, class diagrams, and ER diagrams. Stops for approval before tasks unless the user asked for a Quick Spec."
license: MIT
compatibility: "Portable Agent Skills package. Writes Markdown. Diagrams follow the kiro-mermaid skill."
metadata:
  author: kiro-sdd-skills
  version: "1.0.0"
---

# Kiro design

Write `.kiro/specs/<feature-name>/design.md` after the behavior file is approved, or first when the workflow is Design-First. The orchestrator is `kiro-sdd`. Diagrams follow `kiro-mermaid`.

## Required sections

Use these `##` headings, in this order. Kiro's design phase expects them. Subsections are fine. Do not rename or drop a heading.

1. Overview
2. Architecture
3. Components and Interfaces
4. Data Models
5. Error Handling
6. Testing Strategy

Details and what each section must decide are in `references/sections.md`. The skeleton is `assets/design.md`.

## Inputs

- Requirements-First or Bugfix: read `requirements.md` or `bugfix.md` in the same folder. Every requirement id is addressed in the design. Say so in Overview with a short mapping, not a dump of the criteria.
- Design-First: the user's architecture, constraints, and the repo are the input. Requirements come later.
- Read `.kiro/steering/tech.md` and `structure.md` when they exist. Prefer that stack and layout over a new one.
- Research the codebase during design. Do not write a separate research file. Fold the findings into the design.

## Diagrams

The design is the visual spec. Include all of these when the feature has the matching structure:

| Diagram | Section | Use |
| --- | --- | --- |
| Flowchart | Overview or Architecture | Request path and component boundaries |
| Sequence | Architecture | One sequence per major collaboration |
| `classDiagram` | Components and Interfaces | Types the tasks will implement |
| `erDiagram` | Data Models | Persisted entities and cardinality |
| `stateDiagram-v2` | Data Models | Lifecycle the requirements name |
| Flowchart | Error Handling | How failures map to responses |

Read the `kiro-mermaid` skill before inserting fences. Quote labels that contain parentheses, colons, or slashes.

## Project docs the spec cites

When the design depends on a system view or a decision that will outlive this feature, write it outside the spec folder and link it:

| Doc | Path | Template |
| --- | --- | --- |
| Architecture overview | `docs/architecture.md` | `assets/architecture.md` |
| Decision record | `docs/adr/NNNN-kebab-title.md` | `assets/adr.md` |

Use the next free ADR number. An ADR records context, the decision, and consequences. It does not replace `design.md`. Link from the design with a normal Markdown link. Steering files that must stay in sync can also reference the doc with Kiro's `#[[file:docs/architecture.md]]` form; that syntax is owned by `kiro-steering`.

Do not create these docs for a spec that is fully explained in `design.md`.

## Bugfix designs

Same six headings. Overview states the root cause in one paragraph. Architecture shows the broken interaction as a sequence diagram. Testing Strategy lists three properties:

- Current implementation produces the incorrect behavior.
- Fixed implementation produces the expected behavior.
- Unchanged behavior continues to hold.

Tasks will turn those properties into tests. Property-based tests are an IDE Kiro capability; phrase the properties so a normal unit test can encode them too.

## Interfaces

Show the interface the implementer will code: method signatures, request and response fields, and error types. Match the project's language. Do not specify line-by-line algorithms unless the workflow is low-level Design-First.

## Approval

If this phase is gated, stop and ask: "Does the design look good? If so, we can move on to the implementation plan."

On Design-First, the next file is `requirements.md`, not tasks. Say that in the question instead: "Does the design look good? If so, we can derive the requirements."

Do not write the next phase in the same turn unless this file is already approved or the user asked for a Quick Spec.
