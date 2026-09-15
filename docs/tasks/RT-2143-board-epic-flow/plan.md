# Plan

**Task:** RT-2143 · **Branch:** RT-2143-board-epic-flow
**Behaviour:** unchanged — владелец: правка конвейера, инструментов доски и текстов, кода приложений нет

## Task footprint

| What  | Where                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Code  | `.github/workflows/close-epic-tasks.yml`, `.github/workflows/deploy.yml`, `tools/board-deployed.mjs`, `tools/tests/board-deployed.test.sh` |
| Rules | `.claude/skills/git-workflow/implementation.md`, `.claude/rt-kit/overrides/patterns/git-workflow-commit.md`                                |
| Board | the repository secret with the board token; the view field «Sub-issues progress» — by the browser                                          |

## What counts as done

- A PR merged into a branch other than main closes the tasks named by `Closes #…` in its body,
  and the board rule moves their cards to Done.
- A successful rollout moves every card in Done with a closed task to Deployed.
- The board view shows the sub-issue progress of an epic card.
- The texts of the tree say so: the companion of `git-workflow` and the override of the pattern.

## Stages

### 1. Closing the tasks on a merge into the epic branch

- **What is done:** the workflow `close-epic-tasks.yml` on `pull_request: closed` — merged and
  base other than main — closes the tasks from the body and leaves a comment naming the PR and
  the branch.
- **Readiness sign:** the workflow file parses; the pipeline lint of the tree passes.
- **Verified by:** `node -e "require('js-yaml')"` is absent here, so: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/close-epic-tasks.yml'))" && echo ok` — «ok». The live proof comes with the next task PR merged into an epic branch after this lands.

### 2. Deployed on a successful rollout

- **What is done:** `tools/board-deployed.mjs` with the pure selection `deployedMoves` and the
  test `tools/tests/board-deployed.test.sh`; a job `board` at the end of `deploy.yml` on
  `ubuntu-latest` with the secret `RT_BOARD_TOKEN`; the secret set from the token file.
- **Readiness sign:** the dry run names the cards that would move today; the test passes in the
  tree's check suite.
- **Verified by:** `node tools/board-deployed.mjs --dry-run` — lines «#<номер>: ✅ Done → Deployed» or «nothing to move»; `bash tools/tests/run.sh` — the summary line counts one more suite and no failures (before the stage: the count without it).

### 3. The board view and the texts

- **What is done:** the field «Sub-issues progress» shown in the board view through the browser;
  the companion of `git-workflow` names the two automations; the override of
  `git-workflow-commit` says the closing columns are passed here.
- **Readiness sign:** the board view shows the progress bar on the epic card; the layout audit
  matches; the docs checks pass.
- **Verified by:** `pnpm run agent-kit:check | tail -1` — «сходится»; `npm run check:docs` — «no divergences»; a screenshot of the board with the progress field.

## What this work does not do

- It does not take task cards off the board and does not change `task:new`: the board shows
  tasks and epics alike, as before.
- It does not close tasks on a merge into main: the host does that itself.
