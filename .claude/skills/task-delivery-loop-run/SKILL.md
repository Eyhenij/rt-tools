---
name: task-delivery-loop-run
kind: pattern
rule: task-delivery-loop
description: A pattern of the rule task-delivery-loop. Take it at each step of the loop of a task. The ready-made calls: taking the task and the branch, the live check, the review rounds by a diff file, the commit as the machine account, the push set and the PR.
---

# Ready commands for the task delivery loop

A pattern of the rule `task-delivery-loop`; the steps are numbered as there. `N` is the task number, `E` the epic
card, `<base>` the base of the branch: the previous branch of the chain, the epic branch or `main`. Shell variables do not live from one call to the next,
so every block sets the client and the token itself.

Every call with the token starts with `test -s`: an empty or missing file would leave the variable
empty, and the client answers from the owner's account. A block of several calls makes them through
`bot`, where the check stands in each: one check on the first line would let the next lines run. Its
«no machine token» is no empty answer.

## 2–3. The task and its branch

```bash
bot() { test -s ~/.config/rt-tools-bot-token || { echo 'no machine token' >&2; return 1; }; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh "$@"; }
git fetch -q origin; git fetch -q origin main:main || git merge -q --ff-only origin/main   # the local main too
node tools/epic-table.mjs E
bot api "repos/Eyhenij/rt-tools/git/matching-refs/heads/RT-N-" --jq '.[].ref'
bot api "search/issues?q=repo:Eyhenij/rt-tools+is:pr+RT-N+in:title" --jq '.items[].number'
git branch --list 'RT-N-*'
```

The three last lines answer empty for an untaken task. Empty answers alone do not make it untaken:
a card in progress or a folder with a written plan is a start too.

Outside an epic the body comes from a file too. The only task of its grill is created by the count in
the draft; other work — by the owner's word. A card that already stands gets the line by the third call:

```bash
npm run task:new -- --single --title '<Что не так>' --label <label> --slug <slug> < <body file>
npm run task:new -- --outside-epic '<слово владельца>' --title '<Что не так>' \
    --label <label> --slug <slug> < <body file>
node tools/task-new-single.mjs N --slug <slug>
```

Then the branch and the card, as separate calls:

```bash
git checkout -b RT-N-<slug> origin/<base>
npm run -s task:move -- N in-progress
```

## 5–6. Stages and the live check

```bash
pnpm exec nx affected -t lint typecheck test --parallel --base=origin/<base>
RT_SUITES_BASE=origin/<base> bash tools/tests/run.sh   # the check scenarios the change reaches
node tools/check-file-size.mjs; node tools/check-doc-paths.mjs; node tools/check-specs.mjs
node tools/check-boolean-inputs.mjs; node tools/check-reuse.mjs; pnpm run check:unused
node tools/check-dupes.mjs   # before the commit of a round
```

The last three lines are the quick checks of the push set: the linter after an edit does not judge
`tools/` and texts. They run at every stage and again before the commit of a round.

End to end, the suites a change touches are the ones
`bash -c '. .claude/rt-kit/project.sh; rt_push_touched origin/<base> HEAD'` answers for: `auth` —
`apps/auth-example-e2e/`, `receiver` — `apps/message-bus-admin-e2e/`, `kit2` — each the kit edit
reaches. `everything` runs the whole set before the push and `show2` the showcase; neither demands a
test. The coverage guard judges the pushed head: a commit with the test is pushed before `gh pr create`.

The showcase frames have one road: `node tools/visual-gate.mjs ui-kit-v2 --affected <base>`, the stories
the branch touched, the push set's own line. The whole set is the step of a PR into `main`. A path
sample after the kit matches the named story files, and after `--update` re-takes them.

A heavy run goes alone and in the background: the two calls above, one after the other. The affected run outlasts a foreground call on a cold
cache, and the showcase frames fall with ECONNRESET beside the tests of the packages.

The live check runs in the pinned Chrome. If it does not hold the local tab, the same measurement is
made in the app's built-in browser, and the progress names it.

A stand of another copy may already hold the port. Who listens is asked first; a held port is
taken by the variables of the stand, not by stopping the neighbour:

```bash
lsof -nP -iTCP:6007 -sTCP:LISTEN; lsof -nP -iTCP:3310 -sTCP:LISTEN; lsof -nP -iTCP:4310 -sTCP:LISTEN
pnpm run storybook:ui-kit-v2     # the showcase, port 6007
pnpm run serve:stand             # the receiver on 3310, the admin panel on 4310;
                                 # E2E_API_PORT and E2E_ADMIN_PORT move them
```

## 4. The short plan of the light path

A plan of the light path holds what the engine asks for and no more:

```markdown
# План

**Task:** RT-N · **Branch:** RT-N-<slug>
**Путь:** лёгкий · <N> строк · API и вид не меняются
**Behaviour:** unchanged — <причина>

## Точки

- **A:** <как сейчас>
- **Эта задача доводит до:** <что увидит человек>
- **Признак:** <команда и ответ>

## След задачи

| Что | Где |
| --- | --- |
| Code (правится) | `<path>` |

## Этапы

### 1. <name>

- **Steps:**
    1. <step>
       Check: `<command>` → <expected>
```

The words «API и вид не меняются» are dropped for a change outside the packages. Before the menu of
the approval the path is asked, and any answer but `none` sends the plan to both roles first:

```bash
node tools/review-path.mjs --plan docs/tasks/RT-N-<slug>/plan.md   # the path and its reasons
node tools/review-path.mjs --roles docs/tasks/RT-N-<slug>/plan.md  # none, or the roles
```

## 7, 9. Review rounds

The path is asked first, then the diff goes to a file. Reviewers get the file and never run git:

```bash
node tools/review-path.mjs --base origin/<base>
git diff origin/<base>...HEAD > <scratchpad>/review-N.diff
```

On the light path the round is `qa-engineer` and `goal-critic`, on the full path `product-strategist`
too. After the fixes of round one on the full path, with its tip and the number of serious findings:

```bash
node tools/review-path.mjs --round-two --base origin/<base> --serious <N> --since <tip of round one>
git diff <tip of round one>..HEAD > <scratchpad>/review-N-2.diff   # when it is due
```

Both stand before the merge of the base: after it the range carries another branch's content. Then the
copy is made ready by the first block of steps 9, 11–12, and the set starts beside round two: one message
holds the calls of the roles and the call of `git-guard-push-ahead.sh` from that section. The set waits
for the round on a change of look and on a light plan whose diff is full.

Each of the agents gets this frame and its own inputs, never your conclusions:

```text
Review <scratchpad>/review-N.diff (branch RT-N-<slug>). Do not run git, do not edit files.
Return findings with file:line, the failure scenario and a severity.
```

Beside the set the frame has one line more, and `product-strategist` gets the output of the signs:

```text
The push set runs in this copy: no builds, no nx, no snapshots, no browser, no writes into it. A single
scenario or a mutant goes in a temporary directory of your own, one at a time. A process is ended by its
number, never by a name.
```

`qa-engineer` gets the agreement and the review lens of `.claude/workflows/feature.js`.
`product-strategist` gets the plan's points and their signs. `goal-critic` gets the owner's words
from the grill and the result, never the plan. The replies of the roles are saved to a file of the
scratchpad as they come: the PR body takes their tables word for word.

## 8, 9. Commit as the machine account

```bash
EM=317887029+rt-tools-dev@users.noreply.github.com
GIT_AUTHOR_NAME=rt-tools-dev GIT_AUTHOR_EMAIL=$EM GIT_COMMITTER_NAME=rt-tools-dev \
    GIT_COMMITTER_EMAIL=$EM git -c commit.gpgsign=false commit -q -F <message file>
```

The subject: `<type>(<scope>): <что изменилось> после первого круга ревью (RT-N)`. The identity is
prefixed to the commit only: exported, it reaches a push in the same call. The four variables are
written out in the command, never packed into one:
zsh does not split `$E` into words, so `env $E git commit` passes one argument, and the commit leaves
under the local identity.

## 9, 11–12. Closing, the push set, the push

The copy is made ready first, with a round two and without one; the own showcase and stand are stopped:

```bash
/opt/homebrew/bin/gh pr list --head <base> --state merged   # a merged base: the next one down is taken
git fetch -q origin
EM=317887029+rt-tools-dev@users.noreply.github.com
GIT_AUTHOR_EMAIL=$EM GIT_COMMITTER_EMAIL=$EM \
    GIT_AUTHOR_NAME=rt-tools-dev GIT_COMMITTER_NAME=rt-tools-dev git merge --no-edit origin/<base> \
    || { git diff --name-only --diff-filter=U -- .claude/hooks | while IFS= read -r f; do git checkout --ours -- "$f"; done; false; }
node tools/check-specs.mjs; node tools/check-doc-paths.mjs
```

After the merge and the texts, by a call of its own: the pruning writes into the index, and after a
conflict its removals would leave in the commit of the merge. The same block asks the base again after
the fixes of round two:

```bash
git fetch -q origin; git log --oneline HEAD..origin/<base>   # not empty: the base moved, the block above
test -e "$(git rev-parse --git-path MERGE_HEAD)" || node tools/archive-prune.mjs --apply   # its own commit
```

The host keeps a merged branch, so `git ls-remote` does not show that the base merged: the list of
merged PRs does. The merge carries the machine identity; a
re-signing amend goes by a call of its own, since the push guard judges the commits before the amend.

The own showcase and stand are
stopped before the run ahead: under their load an end-to-end suite went red and was green alone.

The heavy steps run ahead by a call of their own, in the background, on a clean copy. The output
goes to a log outside the working copy, named by the copy, and nothing stands after the set: the
notice carries the code of the last command of the call, and a tail after the set — even
`echo "exit=$?"` — turns red into «exit code 0». A log in the tree makes the copy dirty, and the
set does not start:

```bash
bash .claude/hooks/git-guard-push-ahead.sh > "${TMPDIR:-/tmp}/push-ahead-$(basename "$PWD").log" 2>&1
```

A branch whose PR would not open gets the code 3 within seconds and no step: the lines «— …» of the log name
what to fix. A branch that is not going into a PR yet takes `--no-pr '<reason>'` after the script; the one use for
a branch that goes into a PR stands in step 11.

The verdict is the code of the notice. The log says it in its last line `push ahead:`; on red the
lines after it name the red checks, and «not judged» (101) has the changed paths or the steps without
a mark right above it:

```bash
awk '/^✗ (the copy changed|no mark on the head)/ || /^push ahead: red/ { on = 1 } on' "${TMPDIR:-/tmp}/push-ahead-$(basename "$PWD").log"
```

Beside a round that found something to fix the run is stopped before the first edit. Its pid stands in
the first line of the log; the step in flight gets up to half a minute to put down what it raised. An
ended run leaves its log with a number another process may hold by now, so the command asks whose it is.
The next run starts after the notice with 143: both write into one log, and a stand holds its port till then:

```bash
P="$(sed -n 's/^push ahead: base .*, pid \([0-9]*\)$/\1/p' "${TMPDIR:-/tmp}/push-ahead-$(basename "$PWD").log" | head -1)"
ps -p "${P:-0}" -o command= | grep -q 'git-guard-push-ahead' && kill -TERM "$P" || echo 'no run under this number'
```

A red here is fixed while the task folder still stands. On green the body of the PR is written whole, by
section 13, `goal-critic` reads it, and the folder is taken apart by the last commit: the record is built from both, and the
refusals of the command write nothing (rule `archive-record`). It refuses without the items «Цена» and
«Отменено» in the decisions of the progress: they go by the commit of the last round.

```bash
npm run task:archive -- <body file> --title '[RT-N] <что сделано>'
```

The push is a separate call after the commit; the push guard reads the marks the run ahead left, and a
step without a mark runs at the push:

```bash
git push -u origin RT-N-<slug>
```

## 13. The PR

The PR opens by the body the record was built from, a file in the six sections of the pattern `git-workflow-pr-body`: the
`Closes #N` line, «Что сделано», «Точки», «Цель», «Чем подтверждено» with the path and
its rounds, «Оставшийся шаг» with all the work leaves outside itself: the record takes it from there.

The PR opens after the push has answered: two calls of one message run at once, and a refused push
left a PR on a head the host did not have. The opening call is typed as `gh pr create` itself, by its full path, never through a variable
such as `$GH`: the delivery guards and the rules gate read the command text, and a variable hides
the call from them — the PR then opens past every condition they hold. Reviewer, assignee and
labels go in the same call. A PR into `main` adds `--draft`: the pipeline wakes for it. One into an
epic branch opens ready, without `--draft`: the delivery guard refuses a draft there.

```bash
test -s ~/.config/rt-tools-bot-token && GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" \
    /opt/homebrew/bin/gh pr create --title '[RT-N] <что сделано>' \
    --base <base> --head RT-N-<slug> --body-file <body file> \
    --reviewer Eyhenij --assignee rt-tools-dev --label <label> --draft
```

The `$(…)` in this call, as in every call with the token here, may raise a permission prompt. Before the owner leaves for the night the
form is checked by the pattern `autonomous-work-run`; a form that asks needs the owner's permission
rule, and without it the PR waits for the morning.

The state is reread from the host right after: the author must be `rt-tools-dev`, and a reviewer,
an assignee or a label the call did not set is added by REST:

```bash
bot() { test -s ~/.config/rt-tools-bot-token || { echo 'no machine token' >&2; return 1; }; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh "$@"; }
bot api repos/Eyhenij/rt-tools/pulls/<pr> \
    --jq '{author: .user.login, reviewers: [.requested_reviewers[].login], assignees: [.assignees[].login], labels: [.labels[].name]}'
bot api repos/Eyhenij/rt-tools/issues/N --jq '.labels[].name' | while IFS= read -r L; do
    bot api -X POST repos/Eyhenij/rt-tools/issues/<pr>/labels -f "labels[]=$L" >/dev/null; done
bot api -X POST repos/Eyhenij/rt-tools/pulls/<pr>/requested_reviewers -f 'reviewers[]=Eyhenij'
npm run -s task:move -- N in-review
```

A draft into `main` is lifted on the green run of its tip, in the turn that hands it over:

```bash
test -s ~/.config/rt-tools-bot-token && GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh pr ready <pr>
```

## After the merge

```bash
bot() { test -s ~/.config/rt-tools-bot-token || { echo 'no machine token' >&2; return 1; }; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh "$@"; }
git fetch -q origin; git fetch -q origin main:main || git merge -q --ff-only origin/main
bot api repos/Eyhenij/rt-tools/pulls/<pr> --jq '{merged, merged_at}'
bot api repos/Eyhenij/rt-tools/issues/N --jq .state
npm run -s check:board
```
