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
pnpm run storybook:ui-kit-v2     # the showcase, port 6007
pnpm run serve:stand             # the receiver on 3310, the admin panel on 4310
bash tools/tests/run.sh          # the tree's check scenarios over what the change reaches
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
шаг». A PR into `main` opens as a draft — the pipeline wakes for it; one into an epic branch opens
ready.

```bash
GH=/opt/homebrew/bin/gh; export GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)"
$GH pr create --title '[RT-N] <что сделано>' --base <base> --head RT-N-<slug> --body-file <body file> --draft
$GH api repos/Eyhenij/rt-tools/pulls/<pr> --jq '{number, author: .user.login}'
```

The author must be `rt-tools-dev`. Then labels from the task, assignee and reviewer by REST:

```bash
GH=/opt/homebrew/bin/gh; export GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)"
for L in $($GH api repos/Eyhenij/rt-tools/issues/N --jq '.labels[].name'); do
    $GH api -X POST repos/Eyhenij/rt-tools/issues/<pr>/labels -f "labels[]=$L" >/dev/null; done
$GH api -X POST repos/Eyhenij/rt-tools/issues/<pr>/assignees -f 'assignees[]=rt-tools-dev'
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
