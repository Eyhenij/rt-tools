---
name: task-delivery-loop-run
kind: pattern
rule: task-delivery-loop
description: A pattern of the rule task-delivery-loop. Take it at each step of the loop of a task. The ready-made calls: taking the task and the branch, the live check, the review rounds by a diff file, the commit as the machine account, the push set and the PR.
---

# Ready commands for the task delivery loop

A pattern of the rule `task-delivery-loop`; the steps are numbered as there. `N` is the task number, `E` the epic
card, `<base>` the epic branch or `main`. Shell variables do not live from one call to the next,
so every block sets the client and the token itself.

## 2–3. The task and its branch

```bash
GH=/opt/homebrew/bin/gh; export GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)"
git fetch -q origin
node tools/epic-table.mjs E
$GH api "repos/Eyhenij/rt-tools/git/matching-refs/heads/RT-N-" --jq '.[].ref'
$GH api "search/issues?q=repo:Eyhenij/rt-tools+is:pr+RT-N+in:title" --jq '.items[].number'
git branch --list 'RT-N-*'
```

The three last lines answer empty for an untaken task. Empty answers alone do not make it untaken:
a card in progress or a folder with a written plan is a start too.

Outside an epic the task is created by the owner's word, the body from a file:

```bash
npm run task:new -- --outside-epic '<слово владельца>' --title '<Что не так>' \
    --label <label> --slug <slug> < <body file>
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
```

A stand of another copy may already hold the port. Who listens is asked first; a held port is
taken by the variables of the stand, not by stopping the neighbour:

```bash
lsof -nP -iTCP:6007 -sTCP:LISTEN; lsof -nP -iTCP:3310 -sTCP:LISTEN; lsof -nP -iTCP:4310 -sTCP:LISTEN
pnpm run storybook:ui-kit-v2     # the showcase, port 6007
pnpm run serve:stand             # the receiver on 3310, the admin panel on 4310;
                                 # E2E_API_PORT and E2E_ADMIN_PORT move them
```

## 7, 9. Review rounds

The main session writes the diff to a file. Reviewers get the file and never run git:

```bash
git diff origin/<base>...HEAD > <scratchpad>/review-N.diff
```

Each of the three agents gets this frame and its own inputs, never your conclusions:

```text
Review <scratchpad>/review-N.diff (branch RT-N-<slug>). Do not run git, do not edit files.
Return findings with file:line, the failure scenario and a severity.
```

`qa-engineer` gets the agreement and the review lens of `.claude/workflows/feature.js`.
`product-strategist` gets the plan's points and their signs. `goal-critic` gets the owner's words
from the grill and the result, never the plan.

## 8, 9. Commit as the machine account

```bash
EM=317887029+rt-tools-dev@users.noreply.github.com
GIT_AUTHOR_NAME=rt-tools-dev GIT_AUTHOR_EMAIL=$EM GIT_COMMITTER_NAME=rt-tools-dev \
    GIT_COMMITTER_EMAIL=$EM git -c commit.gpgsign=false commit -q -F <message file>
```

The subject: `<type>(<scope>): <что изменилось> после первого круга ревью (RT-N)`. The identity is
prefixed to the commit only: exported, it reaches a push in the same call.

## 11–12. Closing, the push set, the push

```bash
git fetch -q origin && git merge --no-edit origin/<base>
node tools/check-specs.mjs; node tools/check-doc-paths.mjs
bash .claude/hooks/git-guard-push-ahead.sh      # in the background; the copy is clean first
git push -u origin RT-N-<slug>
```

The push guard reads the marks the run ahead left; a step without a mark runs at the push.

## 13. The PR

The body goes to a file first, in the six sections of the pattern `git-workflow-pr-body`: the
`Closes #N` line, «Что сделано», «Точки», «Цель», «Чем подтверждено» with both rounds, «Оставшийся
шаг».

The opening call is typed as `gh pr create` itself, by its full path, never through a variable
such as `$GH`: the delivery guards and the rules gate read the command text, and a variable hides
the call from them — the PR then opens past every condition they hold. Reviewer, assignee and
labels go in the same call. A PR into `main` adds `--draft`: the pipeline wakes for it. One into an
epic branch opens ready, without `--draft`: the delivery guard refuses a draft there.

```bash
GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh pr create --title '[RT-N] <что сделано>' \
    --base <base> --head RT-N-<slug> --body-file <body file> \
    --reviewer Eyhenij --assignee rt-tools-dev --label <label> --draft
```

The state is reread from the host right after: the author must be `rt-tools-dev`, and a reviewer,
an assignee or a label the call did not set is added by REST:

```bash
GH=/opt/homebrew/bin/gh; export GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)"
$GH api repos/Eyhenij/rt-tools/pulls/<pr> \
    --jq '{author: .user.login, reviewers: [.requested_reviewers[].login], assignees: [.assignees[].login], labels: [.labels[].name]}'
$GH api repos/Eyhenij/rt-tools/issues/N --jq '.labels[].name' | while IFS= read -r L; do
    $GH api -X POST repos/Eyhenij/rt-tools/issues/<pr>/labels -f "labels[]=$L" >/dev/null; done
$GH api -X POST repos/Eyhenij/rt-tools/pulls/<pr>/requested_reviewers -f 'reviewers[]=Eyhenij'
npm run -s task:move -- N in-review
```

## After the merge

```bash
GH=/opt/homebrew/bin/gh; export GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)"
$GH api repos/Eyhenij/rt-tools/pulls/<pr> --jq '{merged, merged_at}'
$GH api repos/Eyhenij/rt-tools/issues/N --jq .state
npm run -s check:board
```
