# queue-audit — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. The rule speaks by technique and travels
between repositories whole; everything below is true only here.

## What it is called here

- **the audit run** — `npm run check:board`
- **the work queue** — the project board on GitHub, named by `board` in `.claude/rt-kit/checks.json`
- **the pipeline file the audit asks about** — `pushGate.pipelineFile` in `.claude/rt-kit/checks.json`

## Where it lives

- **the entry point** — `tools/check-board.mjs`
- **the modules** — `tools/board.mjs` and `tools/board-*.mjs`, one subject per file
- **the scenarios** — `docs/specs/agent-kit/board/` and `docs/specs/agent-kit/work/queue-check/`

## Where the articles are carried out

- **A conflicting open PR is a work queue audit discrepancy.** — `tools/board-pull-state.mjs:checkConflicting` — only an outright "conflicts" is judged; mergeability not yet counted gives no line.
- **A lagging column is found by the queue audit, not by eye.** — `tools/check-board.mjs:IN_REVIEW` — the column is judged by the open PRs both ways: a PR whose task is not in review and a review without an open PR.
- **A branch with an open PR lags behind its base silently.** — `tools/board.mjs:behindMain` — a comparison of the base of every open request with its head: for a task it is the epic branch, for an epic main. The line is printed by `tools/check-board.mjs`; scenario SC-AK-1342.
- **The link between a task and an epic is read by the audit both ways.** — `tools/board-epics.mjs:checkEpicLinks` — the contents of an epic are read in the plan named by its card's body, and the body of every task at the host; a divergence is named both ways, and without an epic label the check stays silent.
- **Work that one session cannot close is marked in two places, and they are audited.** — **Not carried out here.** `tools/board-long-work.mjs:checkLongWork` judges both sides — a card label without a line in the work line and a line without a label — only when the key `longWork` in `.claude/rt-kit/checks.json` names the label and the directory. This tree names neither, so the link is not judged. Scenario SC-AK-823
- **The tip of an open PR without a run is seen by the work queue audit, unless the pipeline does not wake for its base.** — `tools/board-pull-state.mjs:checkHeadRun` — the runs on the tip are asked for while the file of the pipeline named by the settings lies in the tree, and a fresh tip is given ten minutes; a request whose base is not the main branch is passed over by `tools/board-pull-state.mjs:baseRefName` before the conflict is read, scenario SC-AK-1338.
- **A run pushed out of the pipeline queue gets a separate audit line.** — `tools/board-pull-state.mjs:checkEvicted` — the sign is taken from the number of the run's jobs: `tools/board-runs.mjs:evictedOnHead` asks for it only on cancelled ones, and a green run on that same tip removes the line.
- **The last run of the main branch is judged by the audit too: red and pushed out get lines of their own.** — `tools/board-runs.mjs:lastMainRun`. The trigger is read by `tools/board-runs.mjs:pipelineWakesOnPush`; here the pipeline wakes on `pull_request` alone, and the audit prints the line about the unchecked run. Scenario `SC-AK-1104`.
- **A draft with a green run on its tip is an audit discrepancy.** — `tools/board-pull-state.mjs:checkReadyDraft` — the colour of the run is asked for only on a draft: green on it means the work is ready, while the merge button is blocked for the owner.
- **The author of an open PR and whether it has a reviewer are audited by the work queue.** — **Not checked here.** `tools/check-board.mjs` asks the host for the column, the run and the mergeability of open requests, and does not yet judge the author and the reviewer. The data is already fetched by `tools/board.mjs:pullState` for the guards — at opening and at lifting the draft — and the audit does not reuse it
