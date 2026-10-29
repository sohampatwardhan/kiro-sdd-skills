# Requirements Document

## Introduction

[Two or three sentences. Who is affected, what they can do after this feature, and what is explicitly out of scope.]

```mermaid
flowchart LR
  actor["Actor"] --> main["Primary flow"]
  main --> alt["Alternate or error flow"]
  main --> done["Observable outcome"]
```

## Requirements

### Requirement 1

**User Story:** As a [role], I want [capability], so that [benefit].

#### Acceptance Criteria

1. WHEN [event] THEN the system SHALL [observable response]
2. IF [precondition is false] THEN the system SHALL [reject or leave state unchanged]

```mermaid
flowchart TB
  event["Trigger for requirement 1"] --> check{"Guard"}
  check -->|"pass"| ok["Criterion 1.1"]
  check -->|"fail"| reject["Criterion 1.2"]
```

### Requirement 2

**User Story:** As a [role], I want [capability], so that [benefit].

#### Acceptance Criteria

1. WHEN [event] AND [condition] THEN the system SHALL [response]
2. WHILE [state] THE system SHALL [continuous response]
3. WHERE [context] THE system SHALL [contextual response]
