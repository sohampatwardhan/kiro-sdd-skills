# EARS acceptance criteria

Kiro's feature-spec docs specify:

`WHEN [condition/event] THE SYSTEM SHALL [expected behavior]`

Kiro's own generated specs use the `THEN` form. Write that form. Both are accepted by readers; pick `THEN` and stay with it inside one file.

Keywords are uppercase: `WHEN`, `IF`, `WHILE`, `WHERE`, `AND`, `OR`, `THEN`, `SHALL`.

| Pattern | Template | Use |
| --- | --- | --- |
| Event | `WHEN [event] THEN the system SHALL [response]` | A trigger happened |
| Conditional | `IF [precondition] THEN the system SHALL [response]` | A state is already true |
| Compound | `WHEN [event] AND [condition] THEN the system SHALL [response]` | Trigger plus guard |
| Continuous | `WHILE [state] THE system SHALL [response]` | Behavior holds for the duration of a state |
| Contextual | `WHERE [context] THE system SHALL [response]` | A deployment, locale, or feature context |
| Ubiquitous | `THE system SHALL [response]` | Always, with no trigger. Rare. Prefer a trigger. |
| Unwanted | `IF [bad condition] THEN the system SHALL [reject or leave unchanged]` | Negative case |
| Bug, current | `WHEN [condition] THEN the system [incorrect behavior]` | Defect. No SHALL. |
| Bug, expected | `WHEN [condition] THEN the system SHALL [correct behavior]` | Fix |
| Bug, unchanged | `WHEN [condition] THEN the system SHALL CONTINUE TO [existing behavior]` | Regression fence |

## Quality bar

- One response per criterion. Two SHALL clauses means two numbers.
- "The system" is the product, not a class name. Design names the class.
- Quote user-visible copy in double quotes inside the criterion.
- Say what does not change when a request is rejected ("leave the queue unchanged").
- `WHILE` needs a state the design can draw. `WHERE` needs a context the design can find.

## Ids

```text
### Requirement 4
#### Acceptance Criteria
1. ...    → 4.1
2. ...    → 4.2
```

Tasks reference `4.1`, never "Requirement 4" alone, when a single criterion is the target. Several ids in one task are comma-separated: `4.1, 4.2`.
