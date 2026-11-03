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

From the rules review of the closed task:

- **The push gate set does not hold the file length check.** The branch took
  `docs/specs/agent-kit/delivery-gate/scenarios.md` to 519 lines against the limit of 500, the
  whole set before the push was green, and `node tools/check-file-size.mjs` refused only when run by
  hand. The scenarios were moved into the subdomain `push-sign` by the same branch. **Address:**
  names of this tree — `rt_push_checks` in `.claude/rt-kit/project.sh`.
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

## Left unresolved

- **The finding above** — it is closed by task RT-3067, which is the 24th in the epic order.
