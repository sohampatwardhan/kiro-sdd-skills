Refs #[N]

## Summary

[One paragraph: what the spec covers, the workflow used (Requirements-First, Design-First, Quick Spec, or Bugfix), and what is out of scope.]

## Spec files

- `.kiro/specs/[slug]/requirements.md` [or `bugfix.md`]
- `.kiro/specs/[slug]/design.md`
- `.kiro/specs/[slug]/tasks.md`
- [Steering or docs files added or changed, or "No steering changes"]

## Plan

[Number of required and optional tasks. Task 1 creates or updates `.github/workflows/ci.yml`. Critical path from the task graph, such as 1, 2, 3.1, 4.]

[Open questions or residual risks from the analysis pass, or "None".]

## Review

Merging this pull request approves the spec. Implementation starts on `feat/[N]-[slug]` after the merge and arrives as one separate pull request that closes #[N].

- [ ] The requirements or bug analysis are correct and complete
- [ ] The design covers every requirement
- [ ] The tasks cite every acceptance criterion, and task 1 sets up CI
