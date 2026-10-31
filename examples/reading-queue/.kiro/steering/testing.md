---
inclusion: auto
name: testing
description: "Shelf Club test layout and the proofs a queue change must include. Use when adding or changing tests for the reading queue."
---

# Testing

## Layout

Unit tests construct `QueueService` with an in-memory store. Integration tests send HTTP to the queue routes. Property tests live next to the unit tests and are optional unless a bugfix task names them.

## What a change must prove

- A feature task's tests cover the requirement ids in its `_Requirements_` line.
- A bugfix includes a test that fails before the fix, a test that passes after, and a test that neighboring behavior did not move.

```mermaid
---
config:
  layout: elk
---
flowchart TB
  unit["In-memory unit tests"] --> http["HTTP integration tests"]
  unit --> property["Optional property tests"]
```
