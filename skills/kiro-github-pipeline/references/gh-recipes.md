# gh and git recipes

Commands for each stage of the pipeline. They assume a POSIX shell, `git`, and an authenticated `gh` run from the repository root. Flags were checked against the GitHub CLI manual at https://cli.github.com/manual/ on 2026-11-02. Check `gh <command> --help` when a flag is rejected, because older `gh` releases lack the sub-issue flags.

Set these once per spec:

```bash
N=42                      # issue number
SLUG=reading-queue        # .kiro/specs/<slug>/
BASE=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
TMP=$(mktemp -d)          # body files live outside the working tree
```

## Preflight

```bash
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef
git status --porcelain    # must print nothing
ls .github/ISSUE_TEMPLATE .github/workflows .github/pull_request_template.md 2>/dev/null
```

## Issue

Read an existing issue:

```bash
gh issue view "$N" --json number,title,body,labels,state,url
```

Create one from the asset. Strip the template front matter, fill the placeholders in the copy, then create:

```bash
awk 'NR==1 && /^---$/ {fm=1; next} fm && /^---$/ {fm=0; next} !fm' \
  <skill-dir>/assets/issue-template.md > "$TMP/issue.md"
# edit "$TMP/issue.md": replace every [placeholder]
gh label list --limit 200            # use only labels that exist
gh issue create --title "Reading queue for members" --body-file "$TMP/issue.md" --label enhancement
```

`<skill-dir>` is where this skill is installed, such as `.agents/skills/kiro-github-pipeline`. `gh issue create --template "<name>"` only seeds the interactive editor. Use `--body-file` when nobody is at the keyboard.

## Agent block in the issue

Build the block from `tasks.md`. The awk reads checkbox lines at column 0 and appends ` (#123)` when the task has a `- Sub-issue: #123` detail bullet:

```bash
TASKS=".kiro/specs/$SLUG/tasks.md"
SPEC_PR=$(gh pr list --head "spec/$N-$SLUG" --state all --json number --jq '.[0].number // empty')
IMPL_PR=$(gh pr list --head "feat/$N-$SLUG" --state all --json number --jq '.[0].number // empty')
{
  echo "## Spec"
  echo
  echo "- Folder: \`.kiro/specs/$SLUG/\`"
  echo "- Spec PR: ${SPEC_PR:+#}${SPEC_PR:-not opened}"
  echo "- Implementation PR: ${IMPL_PR:+#}${IMPL_PR:-not opened}"
  echo
  echo "## Tasks"
  echo
  awk '
    /^- \[[ xX]\]/ { if (line != "") print line suffix; line = $0; suffix = ""; next }
    line != "" && /^[[:space:]]+- Sub-issue: #[0-9]+/ {
      match($0, /#[0-9]+/); suffix = " (" substr($0, RSTART, RLENGTH) ")"; next
    }
    /^## / { if (line != "") print line suffix; line = ""; suffix = "" }
    END { if (line != "") print line suffix }
  ' "$TASKS"
} > "$TMP/block.md"
```

Splice it between the markers and write the body back. Everything outside the markers is kept:

```bash
gh issue view "$N" --json body --jq .body > "$TMP/body.md"
grep -q 'kiro-pipeline:start' "$TMP/body.md" ||
  printf '\n<!-- kiro-pipeline:start -->\n<!-- kiro-pipeline:end -->\n' >> "$TMP/body.md"
awk -v block="$TMP/block.md" '
  /<!-- kiro-pipeline:start -->/ { print; while ((getline l < block) > 0) print l; skip = 1; next }
  /<!-- kiro-pipeline:end -->/ { skip = 0 }
  !skip { print }
' "$TMP/body.md" > "$TMP/body.new.md"
diff "$TMP/body.md" "$TMP/body.new.md"   # review before writing
gh issue edit "$N" --body-file "$TMP/body.new.md"
```

### Sub-issues

```bash
gh issue create --parent "$N" --title "$SLUG task 3: Implement queue rules" --body-file "$TMP/task3.md"
gh issue edit "$N" --add-sub-issue 123,124      # link issues that already exist
gh issue comment 123 --body "Task 3.1 committed in $(git rev-parse --short HEAD)."
```

If `--parent` or `--add-sub-issue` is not in `gh issue create --help`, use the REST endpoint. It takes the child's database id, not its number:

```bash
CHILD_ID=$(gh api "repos/{owner}/{repo}/issues/123" --jq .id)
gh api --method POST "repos/{owner}/{repo}/issues/$N/sub_issues" -F sub_issue_id="$CHILD_ID"
```

`gh api` fills `{owner}` and `{repo}` from the current repository.

## Spec branch and spec PR

```bash
git fetch origin
git switch -c "spec/$N-$SLUG" "origin/$BASE"
# write and approve each file with kiro-sdd, committing after each one
git add ".kiro/specs/$SLUG/requirements.md"
git commit -m "docs(spec): add requirements for $SLUG" -m "Refs #$N"
# ... design.md, tasks.md, steering ...
git push -u origin "spec/$N-$SLUG"
gh pr create --base "$BASE" --head "spec/$N-$SLUG" \
  --title "docs(spec): add $SLUG spec" --body-file "$TMP/spec-pr.md"
```

Check the gate when resuming:

```bash
gh pr list --head "spec/$N-$SLUG" --state all --json number,state,url
gh pr view "spec/$N-$SLUG" --json state,mergedAt,reviewDecision,url
gh pr view "spec/$N-$SLUG" --comments          # read review feedback
```

`state` is `OPEN`, `CLOSED`, or `MERGED`. `reviewDecision` is `APPROVED`, `CHANGES_REQUESTED`, `REVIEW_REQUIRED`, or empty when no review is required.

## Implementation branch

```bash
git fetch origin
git switch -c "feat/$N-$SLUG" "origin/$BASE"
test -f ".kiro/specs/$SLUG/tasks.md"   # the merged spec must be on the base branch
```

One commit per leaf task, with the box already checked in `tasks.md`:

```bash
git add -A
git commit -m "ci: add build, lint, and test workflow" \
  -m "Task 1 of .kiro/specs/$SLUG/tasks.md
Refs #$N"
git push -u origin "feat/$N-$SLUG"
```

Read CI for the push you just made:

```bash
RUN=$(gh run list --branch "feat/$N-$SLUG" --commit "$(git rev-parse HEAD)" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN" --exit-status
gh run view "$RUN" --log-failed        # when it failed
```

A run can take a few seconds to appear after the push. If `RUN` is empty, list again.

## Implementation PR

Print the acceptance criteria as checklist lines to start the body. For `bugfix.md`, the same awk works because it uses the same `### Requirement N` headings:

```bash
awk '
  /^## / { r = ""; next }
  /^### Requirement [0-9]+/ { r = $3; next }
  r != "" && /^[0-9]+\. / {
    n = $1; sub(/\.$/, "", n); t = $0; sub(/^[0-9]+\. /, "", t)
    print "- [ ] " r "." n " " t ". Evidence:"
  }
' ".kiro/specs/$SLUG/requirements.md"
```

Then delete withdrawn criteria, add each test name after `Evidence:`, and check only the lines this PR proves.

```bash
git log --reverse --format='%h %s' "origin/$BASE..HEAD"   # rows for the Changes table
gh pr create --base "$BASE" --head "feat/$N-$SLUG" \
  --title "feat(queue): add reading queue" --body-file "$TMP/impl-pr.md"
gh pr view --json number,url,closingIssuesReferences --jq '{number, url, closes: [.closingIssuesReferences[].number]}'
gh pr checks --watch --fail-fast
```

`closes` must include `$N` and every sub-issue. Fix the body with `gh pr edit --body-file` if it does not. `gh pr checks` exits 8 while checks are pending.

Stop here. There is no merge step in this skill.

## CI commands by stack

Pin each setup action to its current major release. Use the project's own scripts when it has them.

| Stack | Setup action | Install | Lint | Build | Test |
| --- | --- | --- | --- | --- | --- |
| Node (npm) | `actions/setup-node` | `npm ci` | `npm run lint` | `npm run build` | `npm test` |
| Node (pnpm) | `pnpm/action-setup`, then `actions/setup-node` | `pnpm install --frozen-lockfile` | `pnpm lint` | `pnpm build` | `pnpm test` |
| Python | `actions/setup-python` | `pip install -e ".[dev]"` | `ruff check .` | `python -m build` | `pytest` |
| Go | `actions/setup-go` | `go mod download` | `go vet ./...` | `go build ./...` | `go test ./...` |
| Rust | `dtolnay/rust-toolchain` | none | `cargo clippy --all-targets -- -D warnings` | `cargo build --locked` | `cargo test --locked` |
| Java (Gradle) | `actions/setup-java` | none | `./gradlew check -x test` | `./gradlew build -x test` | `./gradlew test` |

When a stack has no build step, drop the step instead of running a no-op.
