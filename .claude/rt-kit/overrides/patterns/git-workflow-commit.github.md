## The closing columns in this tree

The section above says the work does not pass through `done` and `deployed`. Here it does, and
by no hand: a merged edit closes its task, the board rule «Item closed» moves the card to Done,
and the rollout moves the closed ones on to Deployed.

- **A task closes on the merge of its PR — into main by the host, into any other branch by the
  pipeline `close-epic-tasks.yml`.** The host reads `Closes #…` only on a merge into the default
  branch; the pipeline reads the same line on a merge into an epic or a chain branch and closes
  the task with a comment naming the PR and the branch. So «closed» here means «merged into the
  epic branch», and the epic's own progress grows as its tasks land.
- **Deployed is set by the rollout, its last step, not by a merge.** After a successful rollout
  `tools/board-deployed.mjs` moves every card in Done with a closed task — except a task of an
  epic still open: that one reached the epic branch, and main only with the epic. The dry run on
  this machine names what would move today: `node tools/board-deployed.mjs --dry-run`.
- **Neither column is moved by hand.** `task:move` accepts both names, and that is for a repair
  after a miss, not for the order of work.
