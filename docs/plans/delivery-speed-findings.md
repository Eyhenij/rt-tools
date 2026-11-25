# The findings of the review of the closed works of the epic RT-3624

The findings of the rules review of every closed task of the epic «Простая правка доходит до слияния за
полчаса» accumulate here and wait for the owner's word. The file lies next to the plan of the epic —
`docs/plans/delivery-speed.md`. Nothing of it is ordered yet.

## RT-3625 — the review of 25 November 2026

1. **The turn-exit guard released the night turn of 24 November at 23:48 on a ghost task** — package,
   `taskOver` in `task-flow/source/session.mjs`. The notice of an agent that handed its report back reads
   «is waiting on its own background work», so the engine counts the agent as running for 90 minutes.
   Proposed: the words «(its SubagentHandback call)» in the notice are an end of the run; a line in
   SC-AK-1759 and a test.
2. **The incident analysis of the night that stopped for seven hours names no guard defect** — tree. The
   release of the turn at 23:48 goes into its mechanism and its prevention before it is sent.
3. **The night rule postpones a task whose approval is missing whole** — package, `rules/autonomous-work.md`
   and its law. Proposed: a missing approval holds the code, and the branch, the grill, the plan and its
   reading go on.
4. **A wait said in words with no call behind it** — package, `autonomous-work`. The existing article speaks
   of the wording, not of the missing call.
5. **«I approve all your plans» marks no plan** — package, `commands/night.md`. Proposed: the owner hears it
   the same minute, with the list of the plans not read yet.
6. **The refusal of `plan-red` without a session record reads as a missing approval** — package,
   `checks/flow-plan.mjs` and the cold part of `task-flow-start`. Proposed: the message names the variable
   `RT_FLOW_TRANSCRIPT`, and the pattern carries the command.
7. **Nothing calls the pruning of the archive at the closing** — tree, `task-delivery-loop-run`. Proposed:
   `node tools/archive-prune.mjs` before the set; a set run after midnight turned red on records that were in
   term when the work closed.
8. **The replies of the roles and the body of the PR are lost with the scratchpad** — tree, the second case;
   the wording stands in the proposals of RT-3607. RT-3631 pulls the other way and is settled together with
   it.

## RT-3626 — the review of 25 November 2026

1. **The mark of a full window is never taken back, and the fill is counted over a squeeze** — package,
   `hooks/facts.sh` (`rt_fact_window_fill`) and `hooks/window-fill-guard.sh`. After a squeeze the last usage
   record still holds the former fill, and the first calls are refused. The file of the stop stays for good:
   on 25 November the turn-exit guard released six turns in a row by it, 08:46–09:21, both review rounds
   included. Proposed: the fill is counted after the last `compact_boundary`, the mark and the step of the
   warning leave with the fill; two scenarios.
2. **The rows of a role grow old after the fixes of the last round** — tree, `task-delivery-loop`. Proposed:
   after the commit of the last round each role whose table goes into the PR body judges again the rows the
   fixes touched, before the base is merged in and the set starts. Here a finding came with the set already
   running, and the set was stopped.
3. **A command that gives a verdict is no guard: what it cannot read it refuses** — package, `testing`. The
   article «A broken guard lets the action through» reads as a leave for any check to end with zero.
4. **A list that lets a change past a check is proved by what it lets go** — tree, `agent-kit-source`. An
   exclusion names files, never their directory: an excluded directory of tests freed its runner too.
5. **A forecast in a plan names what it is counted from** — package, `task-flow-start`. «С П2 предел около
   47» had no count behind it and was refuted by the second round.
6. **The same without a text of its own:** a test edited through the shell although its article was loaded;
   the replies of the roles not saved, the second case under item 8 above.
