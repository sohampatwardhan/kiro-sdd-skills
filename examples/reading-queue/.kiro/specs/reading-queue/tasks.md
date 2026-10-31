# Implementation Plan

- [ ] 1. Define reading-queue types and the SQLite schema
  - Add member, book, queue entry, note, and the status enum
  - Store position, status, and the finish and abandon timestamps on the entry
  - _Requirements: 1.2, 6.1_

- [ ] 2. Implement queue membership rules
- [ ] 2.1 Append a book to the tail of the member queue
  - Trim the title and author before save
  - Reject a caller who is not a member without inserting a row
  - _Requirements: 1.1, 1.2, 1.5_
- [ ] 2.2 Reject an empty title and a duplicate open title
  - Compare titles after trim and case fold against queued and reading entries
  - Leave stored rows unchanged when rejecting
  - _Requirements: 1.3, 1.4_
- [ ] 2.3 Reorder queued entries
  - Persist the submitted order when it is exactly the queued id set
  - Reject any other set and leave the reading entry reading
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Implement reading transitions
- [ ] 3.1 Start the next queued book, or a chosen queued book, when none is reading
  - Move only the lowest-position queued entry when no id is given
  - Move only the requested queued entry when an id is given
  - _Requirements: 3.1, 3.4_
- [ ] 3.2 Reject a start when the queue is empty or a book is already reading
  - Return without writing
  - _Requirements: 3.2, 3.3_
- [ ] 3.3 Finish or abandon the reading entry
  - Record the matching timestamp and leave queued entries queued
  - Reject the call when nothing is reading
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Save a note on the reading entry
  - Store the body when a reading entry exists and the body is 1 to 4000 characters after trim
  - Reject an empty body, an overlong body, and a save when nothing is reading
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Expose the HTTP API
- [ ] 5.1 Add the list and append routes
  - Return the reading entry, then queued entries, then completed entries
  - Return an empty list when the member has no entries
  - _Requirements: 1.1, 1.5, 6.1, 6.2, 6.3_
- [ ] 5.2 Add the reorder, start, finish, and abandon routes
  - Map service conflicts and validation errors to the status codes in the design
  - _Requirements: 2.1, 3.1, 4.1_
- [ ] 5.3 Add the note route
  - Forward the body to the queue service and return the stored note
  - _Requirements: 5.1_

- [ ] 6. Test the queue rules and the API
- [ ] 6.1 Unit-test append, duplicate rejection, and reorder
  - Cover empty titles, case-insensitive duplicates, and a reorder that omits an id
  - _Requirements: 1.3, 1.4, 2.2, 2.3_
- [ ] 6.2 Unit-test transitions and notes
  - Cover an empty start, a second start, finish with nothing reading, and note limits
  - _Requirements: 3.2, 3.3, 4.3, 5.2, 5.3, 5.4_
- [ ] 6.3 Integration-test list, append, and the empty queue
  - Assert order and the unauthorized caller
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7. Add property tests for the one-active-book invariant (optional)
  - Generate sequences of starts, finishes, and rejected calls
  - Assert a member never has two reading entries
  - _Requirements: 3.3_

## Task graph

An arrow means depends-on. The target stays unchecked until every source is checked. Primary critical path: 1, 2.1, 3.1, 3.3, 5.2, 6.3. That path delivers the reading transition through the API. Task 7 is optional, so a required run does not include it.

```mermaid
---
config:
  layout: elk
---
flowchart TB
  subgraph phase1 [Phase 1 Foundation]
    t1["1. Define reading-queue types and the SQLite schema"]
  end
  subgraph phase2 [Phase 2 Queue rules]
    t21["2.1 Append a book to the tail of the member queue"]
    subgraph parallel2 [Parallel after 2.1]
      t22["2.2 Reject an empty title and a duplicate open title"]
      t23["2.3 Reorder queued entries"]
    end
  end
  subgraph phase3 [Phase 3 Session and notes]
    t31["3.1 Start the next or a chosen queued book when none is reading"]
    subgraph parallel3 [Parallel after 3.1]
      t32["3.2 Reject a start when empty or a book is already reading"]
      t33["3.3 Finish or abandon the reading entry"]
      t4["4. Save a note on the reading entry"]
    end
  end
  subgraph phase4 [Phase 4 HTTP API]
    subgraph parallel4 [Parallel when ready]
      t51["5.1 Add the list and append routes"]
      t52["5.2 Add reorder start finish and abandon routes"]
      t53["5.3 Add the note route"]
    end
  end
  subgraph phase5 [Phase 5 Tests]
    subgraph parallel5 [Parallel test groups]
      t61["6.1 Unit-test append duplicate rejection and reorder"]
      t62["6.2 Unit-test transitions and notes"]
    end
    t63["6.3 Integration-test list append and the empty queue"]
    t7["7. Add property tests for the one-active-book invariant"]
  end
  subgraph legend [Legend]
    legCrit["Critical path"]
    legPar["Parallelizable"]
    legBlock["Blocked"]
  end
  t1 --> t21
  t21 --> t22
  t21 --> t23
  t21 --> t31
  t31 --> t32
  t31 --> t33
  t31 --> t4
  t21 --> t51
  t22 --> t51
  t23 --> t52
  t32 --> t52
  t33 --> t52
  t4 --> t53
  t22 --> t61
  t23 --> t61
  t32 --> t62
  t33 --> t62
  t4 --> t62
  t51 --> t63
  t52 --> t63
  t53 --> t63
  t62 --> t7
  classDef critical fill:#fde68a,stroke:#b45309,color:#1c1917
  classDef parallel fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
  classDef blocked fill:#fecaca,stroke:#b91c1c,color:#7f1d1d
  class t1,t21,t31,t33,t52,t63,legCrit critical
  class t22,t23,t32,t4,t51,t53,t61,t62,legPar parallel
  class t7,legBlock blocked
```
