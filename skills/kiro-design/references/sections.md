# Design sections

## Overview

What the feature does and the shape of the solution in a few paragraphs. Name the guiding constraint (simplicity, latency, compatibility). List decisions with the alternative that was rejected, in a sentence each. Point at an ADR when the decision is reused elsewhere.

## Architecture

Components, ownership, and runtime path. A flowchart shows who talks to whom. A sequence diagram shows one successful call and one rejected call. External systems are explicit participants. Deployment detail belongs here only when it changes the design.

## Components and Interfaces

For each component: purpose, responsibilities, what it must not do, dependencies, and the interface (types or a table of operations). Another developer should be able to implement it without inventing a method. Keep names aligned with the requirements.

## Data Models

Entities, fields, relationships, validation, and where the data lives. An `erDiagram` is the source of cardinality. A `stateDiagram-v2` is required when a requirement uses lifecycle words (queued, reading, finished). Document illegal transitions next to the diagram.

## Error Handling

Trace inputs, dependencies, state, and partial failure. Map each failure to a caller-visible result and to the state that remains. Prefer the project's existing error type. Include a flowchart from failure to response.

## Testing Strategy

- Unit tests for rules in the requirements.
- Integration tests for the sequences in Architecture.
- Property statements for invariants, each tagged with the criterion id it validates: `Validates: Requirement 3.3`.
- Bugfix designs include the reproduce, fix, and unchanged properties.
- Do not add performance, load, or user-acceptance work to this section unless a requirement demands it. Those are not default tasks.

## Coverage check before approval

Every id `N.M` in the behavior file is mentioned in at least one of: a sequence, a component responsibility, a validation rule, an error row, or a test property. If one is missing, the design is not done.
