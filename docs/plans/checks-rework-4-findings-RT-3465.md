# Findings of RT-3465 — the base of the push set from live branches, pinned to the tree

The rules review of the closed task RT-3465 by the role `skill-curator`. Each finding waits for the
owner's decision: a task of its own or none. The texts proposed are the role's, checked against
the tree before they were written here.

## Proposals

- **A scenario suite of the package runs alone, and its fixture paths are checked before git.**
  The new suite was first sourced from a parent suite under a `*.test.sh` name; run alone, its
  fixture paths were empty, and `git -C ""` acts in the directory the run started from — a push or
  `remote set-url` there touches the real branch. Round one caught it. The suites run under the
  system bash 3.2, which misreads the quotes of a heredoc inside `$(...)`; that cost a separate
  debug pass. **Address:** tree — a line in the pitfalls of `agent-kit-source` and its cold part;
  in code, `projects/agent-kit/tests/lib.sh:fixture_repo` and `fixture_repo_branched` exit on an
  empty directory, which holds the rule for every suite that calls `git -C`. **Metric:** first-time
  acceptance of `agent-kit-source`, up.
- **An expected zero in a step check.** `grep -c` and `rg -c` exit 1 when they count zero, and
  every expected form but `exit` demands the code 0. A plan check `grep -c … → = 0` came out
  «exit 1, 0» and needed a replacement line with `|| true`. **Address:** package — a paragraph after
  the expected forms in the sample `projects/agent-kit/assets/samples/tasks/_template/plan.md`: an
  expected `= 0` is written with `|| true`, or the check is `grep -q` → `exit 1`. **Metric:**
  minutes wasted, down.
- **A round-two fix of a guard gets one more fresh reading.** A fix that changes what a guard lets
  through goes to one more fresh `qa-engineer` with the diff of that fix alone, before the push
  set. In RT-3465 such a reading, taken by the executor's own choice, found that a branch name
  inside the pinned ref matched the profile words `visual-gate` and `e2e`, so a light step's mark
  vouched for heavy content. **Address:** tree — a paragraph in section «7, 9. Review rounds» of
  the pattern `task-delivery-loop-run`; the hot rule stands over its 3000-character ceiling.
  **Metric:** owner's corrections, down.
- **The step guard calls the records of the push set «marks».** The guard refuses any shell write
  under the shared git directory of the package, while it holds the push-set records and the cache
  next to the marks. Removing a leftover push-set file was refused as a write of the marks of the
  steps. **Address:** package — `projects/agent-kit/assets/checks/flow-guard.mjs:shellGuards` and
  `judgeCall` narrowed to the steps and the approval directories, a rule and a scenario in
  `docs/specs/agent-kit/turn-guards/flow-script/guard/`. **Metric:** empty refusals of the step
  guard, down.

## No edit, with the reason

- **Shell edits of tree files.** `doc-style` already holds «A tree file is edited by the edit tool,
  not shell», and it was loaded; the miss was in following the rule. A guard for shell writes is a
  separate decision, worth it only if repeated `doc-style` misses grow.
- **The rules gate refused four rules together.** The gate works as designed: the four rules weigh
  12 237 characters against the limit of 10 000; after a compaction the load record resets, and the
  refusal costs one call.
- **An inline script refused for the word of a push, a label picked from memory.** Both are named
  in the existing texts: `task-delivery-loop/GUARDS.md` and the pitfalls of `git-workflow-pr-body`.
