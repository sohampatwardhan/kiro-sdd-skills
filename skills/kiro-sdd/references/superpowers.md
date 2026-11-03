# Superpowers

Some steps call skills from [obra/superpowers](https://github.com/obra/superpowers) because those skills do the step better than this package would. The kiro skills still own the spec files, the phase gates, and the GitHub pipeline. Where a superpowers skill wins, the kiro skills call it and carry no competing text. Where kiro wins, the superpowers skill is not called on a Kiro spec.

## Before calling one

1. If your agent already lists the skill (for example `superpowers:test-driven-development` from the Claude Code plugin), use it.
2. Otherwise, once per run, pass every skill the run will need to `sh <kiro-sdd>/scripts/ensure-superpowers.sh <skill> ...`. It looks for `<skill>/SKILL.md` in the project and global skill folders (`.agents`, `.claude`, `.kiro`, `.cursor`, `~/.codex`) and the Claude Code plugin cache. It installs anything missing with `npx -y skills add obra/superpowers -g -y --skill <skill> ...`, then prints `<skill> <path>` for each one.
3. If a newly installed skill does not load until the agent restarts, read the printed `SKILL.md` and follow it.
4. If a line says `MISSING` (offline, no `npx`, or the install was refused), say so in one line and use the fallback below. Never block a spec on it.

The script checks for files instead of parsing `npx skills list -g --json`, because that command's output stops at 64 KB when piped.

## Where each one is used

| Step | Skill | Called from | Kiro rules that still win | Fallback |
| --- | --- | --- | --- | --- |
| The idea is too fuzzy to draft: no clear user, outcome, or scope in the request, issue, or repo | `brainstorming` | `kiro-sdd` "Choose the workflow first", `kiro-requirements` | Its outcome goes into the first spec file and Decisions, not `docs/superpowers/specs/`. Then return to the kiro-sdd gates instead of `writing-plans`. On GitHub, post the agreed outcome (intent, goals and non-goals, chosen approach) as one issue comment | Draft first, ask at most one or two questions |
| Bugfix root cause | `systematic-debugging`, phases 1 to 3 | `kiro-sdd` Bugfix, `kiro-design` "Bugfix designs" | Investigate only. The fix is a task, and it waits for spec approval | Reproduce, trace back to the source, and write down one hypothesis |
| Each leaf task that changes behavior | `test-driven-development` | `kiro-sdd` "Executing tasks", `kiro-github-pipeline` Stage 4 | The approved plan is the permission it asks for: task 1 (CI) and config-only tasks are exempt. The red test and the code land in the task's one commit | Write the criterion's test, watch it fail, then implement |
| A test, build, or CI run fails during a task | `systematic-debugging` | same | Stay on the same task. After three failed fixes, pause as kiro-sdd lists | Read the error, reproduce it, and fix the cause rather than the symptom |
| After the last task, before the implementation PR | `requesting-code-review` | same | Run it once per spec, not once per task. Requirements are the three spec files, and the range is `$(git merge-base origin/<default> HEAD)..HEAD`. Fix Critical and Important findings in commits scoped to the task they touch, and list those under Deviations | Review the diff yourself against the spec and the PR's Testing table |
| Acting on review findings or human PR comments | `receiving-code-review` | `kiro-github-pipeline` Stage 4 | Reply in the review thread. A question that would change the spec goes on the issue, and a spec change pauses for re-approval | Check each item against the code before you change anything |
| Implementation branch when the checkout holds other work | `using-git-worktrees` | `kiro-github-pipeline` Stage 4 | The branch is still `feat/<N>-<slug>` from the remote default branch. Keep the worktree until a human merges the PR | Stop and ask for a clean checkout |

Not called on a Kiro spec: `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `finishing-a-development-branch`, and `verification-before-completion`. See the table below for why. Skills that the called skills invoke themselves, such as `systematic-debugging` calling `verification-before-completion`, are fine.

## How each step was decided

Each candidate gets 1 to 3 points (3 is best) on four criteria:

- **Coverage (C):** does it handle the whole step, including this package's rules?
- **Fit (F):** does it work with the `.kiro/specs` layout, EARS, Mermaid, questions as issue comments, and specs committed straight to the default branch?
- **Cost ($):** how many tokens it loads and how many extra steps or turns it adds.
- **Overlap (O):** how much it conflicts with existing kiro guidance.

A candidate with coverage 1 cannot do the step, so it cannot win. Otherwise the higher total wins, and a tie keeps kiro's own guidance because that adds no dependency.

| Step | kiro-sdd C/F/$/O | Superpowers C/F/$/O | Winner | Why |
| --- | --- | --- | --- | --- |
| Brainstorm, fuzzy idea | 1/3/3/3 = 10 | `brainstorming` 3/2/1/2 = 8 | superpowers | A draft from a fuzzy idea is a guess. Its multi-turn cost is paid only when the idea really is fuzzy. Clear ideas skip it |
| Requirements | `kiro-requirements` 3/3/3/3 = 12 | `brainstorming` design doc 1/1/2/2 = 6 | kiro | EARS, stable ids, and the Kiro layout. Superpowers has no requirements format |
| Design | `kiro-design` 3/3/3/3 = 12 | `brainstorming` written design 2/1/1/2 = 6 | kiro | Six Kiro headings, Mermaid, and a Decisions table. Adopted: the builder read-through, done by the author instead of a subagent |
| Tasks | `kiro-tasks` 3/3/3/3 = 12 | `writing-plans` 2/1/1/1 = 5 | kiro | `tasks.md`, traceability, the DAG, and CI first. `writing-plans` writes code-level steps that repeat the design to `docs/superpowers/plans/` and asks for an execution method. Adopted: a check that names and signatures agree across tasks |
| Execution loop | `kiro-sdd` + pipeline 3/3/3/3 = 12 | `executing-plans` 2/1/1/1 = 5, `subagent-driven-development` 3/2/1/2 = 8 | kiro | `tasks.md` and the issue are already the ledger, with the same continuous-run rule. `executing-plans` ends in the finishing menu. `subagent-driven-development` pays for two fresh contexts per task |
| Implementation, TDD | 1/3/3/3 = 10 | `test-driven-development` 3/3/2/2 = 10 | superpowers | kiro said "implement it, then run checks", with no test-first step. The approved plan settles TDD's ask-before-skipping rule for config |
| Debugging | 1/3/3/3 = 10 | `systematic-debugging` 3/3/2/3 = 11 | superpowers | kiro had only "three attempts". It uses the same three-fix stop rule, and its failing test becomes the bugfix test |
| Verification | 2/3/3/3 = 11 | `verification-before-completion` 3/3/3/2 = 11 | kiro (tie) | TDD's verify-green step and `systematic-debugging` already demand fresh evidence. Adopted its rule in one line: every claim cites a run made after the last change |
| Review before the PR | 1/3/3/3 = 10 | `requesting-code-review` 3/3/2/3 = 11 | superpowers | kiro had no review step. One fresh reviewer per spec costs little |
| Receiving review | 1/3/3/3 = 10 | `receiving-code-review` 3/2/2/3 = 10 | superpowers | kiro had nothing. Fit is 2 because spec-changing questions still go on the issue |
| Branch isolation | 2/3/3/3 = 11 | `using-git-worktrees` 3/3/2/2 = 10 | kiro, or worktrees when the checkout is in use | An in-place branch is enough on a clean checkout. When the checkout holds other work, kiro's coverage drops to 1. Adopted: the clean-baseline run before task 1 |
| Finishing the branch | 3/3/3/3 = 12 | `finishing-a-development-branch` 2/1/2/1 = 6 | kiro | Its menu offers a local merge and asks the user. kiro always pushes one PR, and a human merges it. Adopted: keep the worktree until the merge |
| Parallel work | 3/3/3/3 = 12 | `dispatching-parallel-agents` 2/1/1/2 = 6 | kiro | Tasks share one branch, with one commit each in DAG order. Parallel agents in one tree would collide |
