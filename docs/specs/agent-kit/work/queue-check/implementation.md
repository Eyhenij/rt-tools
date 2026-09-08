# The binding — the check of the work queue

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The check of the work queue sees a task folder in a nested directory too.** — `projects/agent-kit/assets/checks/board.github.mjs:taskDirs`
- **An open PR whose tip carries no run is a divergence of the check.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun`
- **The run is asked about at the tip of the PR, not at its branch.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:runsOnHead`
- **What counts is the very fact of a run, not its colour.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:total_count`
- **A fresh tip without a run is not judged.** — `projects/agent-kit/assets/checks/board-pull-state.github.mjs:RUN_GRACE_MINUTES`
- **A tree without a file of the pipeline is not asked about runs.** — `projects/agent-kit/assets/checks/check-board.github.mjs:HAS_PIPELINE`
- **A tree whose runs were not asked about hears of it by a line of its own.** — `projects/agent-kit/assets/checks/check-board.github.mjs:HAS_PIPELINE`
- **A draft at a green run at the tip is a divergence of the check.** — `projects/agent-kit/assets/checks/board-pull-state.github.mjs:checkReadyDraft`
- **The colour of the run is asked about apart from its presence.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:verdictOnHead`
- **A conflicting open PR is a divergence of the check.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkConflicting`
- **Mergeability that was not counted does not count as a conflict.** — `projects/agent-kit/assets/checks/board.github.mjs:conflicting`
- **At a conflicting request the reason named is the conflict, not the loss of the event.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun` — the line about the conflict is printed instead of the line about the event; scenarios SC-AK-670…672
- **A card carrying a title with a number is a task, whatever marks it wears.** — `projects/agent-kit/assets/checks/check-board.github.mjs:isCargo` — the mark sifts out only a card without a title with a number; scenario `SC-AK-923`
