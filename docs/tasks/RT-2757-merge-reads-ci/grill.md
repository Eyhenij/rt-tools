# Grill

Cargo record: postmortem `merged-epic-over-red-image-build.md`.

## The owner request

> параллельно бери в работу новые предложения и замечания из приёмника

## What the tree already has

- The analysis: PR #2607 was merged while the run on its tip was red on the image build; the rollout
  fell, and every next PR into main turned red. The tree profile part of the fix is already in main:
  the paths of the sign-in packages start the image builds before a push.
- The delivery guard recognises `gh pr merge` and checks only the task folder there.
- `rt_pull_state` asks the hosting for the PR state; `verdictOnHead` in the package already reads
  the run on a tip as `none`, `running`, `failure` or `success`.
- A PR into an epic branch gets no run at all: the pipeline listens for PRs into main.

## Decisions

- **The PR state carries the run on its tip, and the merge command is refused on `failure` and
  `running`.** `none` passes: a PR into an epic branch never gets a run. Rejected: refusing on
  `none` — every task of an epic would be refused.
- **A merge by the hosting's button is held by the pattern text.** No guard sees a click in the
  browser.
