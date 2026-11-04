# Findings of the epic about the intake findings of 03.11.2026

The findings accumulate here, next to the plan `docs/plans/cargo-2026-11.md`. The owner reads them
when the epic is over.

## RT-3044 — the push gate recognises a push by the git subcommand

- **The turn exit guard does not recognise the owner's order to wait for the merge.** The order
  «не переходи к следующей задаче пока я не дам аппрув и пока не будет вмержен этот пр» holds no
  word from the stop list of `turn-exit-verdict.sh`, and the same message holds «бери». A quote of
  it in « » therefore releases nothing, and the guard demands the next task three times after the
  PR opened. **Address:** rules layer — `hooks/turn-exit-verdict.sh`, the same edit as task RT-3067.
- **The two guards leave no lawful exit between them.** The turn exit guard names a question to
  the owner through the tool as a lawful exit. The grill gate refuses that question twice: once
  because the rules hold the answer, once because no tree-changing command followed the last
  refusal. The only remaining move is to take the next task against the owner's word. The session
  looped six times on the same refusal after PR #3083 opened. **Address:** rules layer —
  `hooks/turn-exit-guard.sh` and `hooks/grill-gate.sh`, the same edit as task RT-3067.
- **A turn longer than the guard's window has no work in it at all.** `rt_te_verdict` reads
  `tail -n 400` of the transcript. The owner's last message lay further back, so the window held no
  input, the turn came out empty, and edits and commands made in it counted as nothing. The refusal
  «nothing was done in this turn» then repeats on every exit, whatever is done. **Address:** rules
  layer — `hooks/turn-exit-verdict.sh`, the same edit as task RT-3067.
- **Work on the hosting does not count as work of the turn.** The turn after the review of PR #3083
  pushed the fix, rewrote the PR body, answered the review and asked for a review again. The guard
  then refused with «nothing was done in this turn — neither an edit nor a command changing the
  tree» four times in a row: a push and a call to the hosting do not change the working tree.
  **Address:** rules layer — `hooks/turn-exit-verdict.sh`, the same edit as task RT-3067.
  The same happened after the push of the third review fix: the commit, the push, the PR body,
  the reply and the review request were done in one turn, and the guard refused three times with
  the same text. The owner's order quoted in « » released nothing, since it lay outside the
  window. The grill gate then refused the question about it until a tree edit came first.
- **A move of the branch tip in the same command is not judged.** `git reset --hard <ref>`,
  `git merge`, `git pull`, `git rebase` and `git cherry-pick` before a push change what leaves,
  while the set ran on the tree before them. Only `checkout`, `switch` and `gh pr checkout` are
  read as a switch. Refusing them would refuse the usual "merge main, then push" in one command.
  Whether to judge them is the owner's decision. **Address:** rules layer — `hooks/push-sign.sh`.

From the rules review of the closed task:

- **The file length check was missed by a partial copy of the set, not by the set.** The branch
  took `docs/specs/agent-kit/delivery-gate/scenarios.md` to 519 lines against the limit of 500, the
  set run by hand before the push was green, and `node tools/check-file-size.mjs` refused only when
  run apart. The check stands in the set through the package default; the copy that was run had
  been read from the profile alone, as the RT-3045 finding below describes. The scenarios were
  moved into the subdomain `push-sign` by the same branch. **Address:** closed by the RT-3045
  article about running the set whole.
- **`specs:for` lists several specs for one file, and the first one was taken.** For
  `hooks/git-guard-push-tests.sh` it printed `checks/spec.md` first, with one binding, and
  `delivery-gate/spec.md` second, with ten. The move to `in_work` named the first. **Address:**
  rules layer — the article of `spec-driven` about finding the spec by a command, or the order of
  `checks/specs-for.mjs`.
- **Creating the cards of an epic at once leaves a task folder for every card.** 39 calls of
  `task:new --epic-of` built 39 folders from the sample, and the work queue audit named 38 of them.
  **Address:** rules layer — `patterns/task-flow-start.md` or `checks/task-new.github.mjs`.
- **The plan named scenario numbers before the free number was asked.** It carried SC-AK-1234…1236,
  the free ones were SC-AK-1237…1239. **Address:** rules layer — the plan sample
  `samples/tasks/_template/plan.md`.
- **A new test of a guard passed on the old guard.** A refusal case on a red set is green whatever
  the sign under test does. The gate map sends `projects/agent-kit/tests/*` to `agent-kit-source`
  alone, and the rule `testing` was never loaded. **Address:** names of this tree —
  `.claude/rt-kit/gate-map.sh` and the rule `agent-kit-source`.
- **A neighbour's record cannot go into the quarantine.** The rule `cargo-triage` sends every
  disputable record there, and `cargo:close` moves a foreign record only into «fixed» and
  «released». **Address:** names of this tree — the rule `cargo-triage`.

## RT-3045 — the delivery rule names the path of a push, a review and the set by the profile

- **The profile alone prints part of the gate set and stays silent about it.** `rt_push_checks`
  of this tree calls `rt_push_checks_default`. Sourced without the package default, it prints 31
  lines of 46, and the missing function is named on stderr only. Through RT-3044 the executor ran
  the set from such a copy: 15 checks never ran, among them `check-glossary` and
  `check-archive-age`, and the push guard refused on both. The state review `agent-kit doctor`
  prints the set whole; what the tree lacks is a command that runs it whole, as the guard reads
  it. **Address:** rules layer — such a command next to the state review.

## Left unresolved

- **The turn exit guard findings of RT-3044** — they are closed by task RT-3067, which is the 24th in the epic order.
