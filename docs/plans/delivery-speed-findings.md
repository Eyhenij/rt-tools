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

## RT-3629 — the review of 25 November 2026

1. **`plan-red` goes red on a plan that moved after its commit** — package, `checks/flow-plan.mjs`
   (`runPlanRed`, by `changedSincePlan` of `flow-step.mjs`). Its mark of 25 November fell on the text of 8
   steps while the menu named the one of 9. Test: a plan added by one commit and changed by the next is
   refused, no mark.
2. **The first commit of the folder carries the grill and the progress, the plan comes by one commit after
   its last reading** — package, `patterns/task-flow-start.md`. The written item stands in the cold part
   alone, and the plan went by `git add -A` into the first commit.
3. **The end of the readings is named** — tree, `task-delivery-loop-run`: the findings of both roles land by
   one edit; a reading with no blocking finding changes the plan no more, a clarification goes to the
   progress; a rule that sorts past changes is run on past merges before the first reading.
4. **A guard of test edits by the shell** — package, the owner's decision. Four shell writes against 28 by
   the tool, the third case. Price: a read of a test by an interpreter is refused too.
5. **`git-guard-discard` does not judge the data of a heredoc** — package. Two false refusals; a body fed to
   `bash`, `zsh` or `ssh` stays judged. It goes after item 4: both refusals stopped a shell edit of a test.
6. **A scenario of `tools/tests` refuses braces with a comma inside `"$(… "…" …)"`** — tree. In bash 3.2 two
   scenarios came out green on nothing.

## RT-3630 — found by the second review round on 25 November 2026

1. **`check:ngdoctor` walks the packages of a working copy that lies inside this one** — tree,
   `angular-doctor` 0.3.0 and `tools/check-ngdoctor.mjs`. With one copy under `.claude/worktrees` the step
   went from 7 seconds to 426: of 560 thousand reads of a directory in 15 seconds 554 thousand fell into
   its `node_modules`, since the tool leaves out the packages of the root alone. Every set and every push
   pays it while such a copy stands. Proposed: the step gives the tool an ignore of `.claude/`, or the
   copies of the sessions stand outside the tree.
