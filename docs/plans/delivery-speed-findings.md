# The findings of the review of the closed works of the epic RT-3624

The findings of the rules review of every closed task of the epic «Простая правка доходит до слияния за
полчаса» accumulate here and wait for the owner's word. The file lies next to the plan of the epic —
`docs/plans/delivery-speed.md`. An ordered item names its task, the rest is not ordered.

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
   `angular-doctor` 0.3.0 and `tools/check-ngdoctor.mjs`. With one copy of a session inside the tree the step
   went from 7 seconds to 426, and the same commit in a copy outside it took 8: of 560 thousand reads of a
   directory in 15 seconds 554 thousand fell into the `node_modules` of the inner copy, since the tool
   leaves out the packages of the root alone. Every set and every push pays it while such a copy stands.
   Ordered as RT-3640: the tool and the pass enter no dot directory, the run takes 6 seconds with the
   copy inside.
2. **`check-doc-paths` is red in a fresh copy** — tree. Two texts name ignored directories that only a
   lived-in copy has: the one of incident analyses and the one of handovers. Proposed: an ignored directory
   named by a text is not judged, or a post-install creates both.

## RT-3630 — the review of 25 November 2026

1. **`git-guard-no-verify` knows a separator only as a word of its own** — package, the hook, its test and
   `docs/specs/agent-kit/no-verify-guard/`. A commit followed at once by `; sed -n` or `|tail -n` is refused,
   and `git commit -m "a b"; git push --no-verify` passes: a quote closed before `;` hides the rest of the
   line. The hole weighs more than the false refusals. Proposed rule: a separator outside quotes ends the
   call and the value before it, whether or not a space stands before it; two scenarios.
2. **`agent-kit-source` forbids what the loop now demands** — tree, the cold part, the end of «Nothing builds
   the package while the push set runs». «Roles run before the set or after it, not beside it» becomes: a
   role that has to build runs before or after; the roles of round two stand beside it under the frame that
   forbids builds. Item 2 of RT-3626 above reads «before the set is run again».
3. **Records and the mark of their step by one commit** — package, `flow-step.mjs`. The rerun before the PR
   reads the progress before the mark, and the step went red there: the folder came back, the check was
   replaced. Proposed: a check that names `progress.md` is refused while its records are not committed; the
   same article in the cold part of `task-flow-plan`.
4. **A rewritten order loses a duty, and the diff reads whole without it** — package, `spec-driven-rule`,
   «Common misses». Proposed: the duties of the old steps are written out on every branch of the order, each
   with its new place or the reason it is dropped; the list goes to the reviewers.
5. **A process is ended by its number, never by a name** — tree, `task-delivery-loop`, the duties. `pkill`
   reached the same tool of a neighbour project; the frame says it to the reviewers alone.
6. **A run of broken variants names the survivors, and between fixes only they and the touched lines run
   again** — tree, `agent-kit-source`. A whole run took 10–15 minutes after every fix. Next to it: a scenario
   of a broken output writes by `process.stdout.write`, for the console of node swallows EPIPE.
7. **The way of the slowed set, if item 1 of the second round is put off** — tree, `GUARDS.md`: a copy outside
   the tree with the owner's word. The measurement took such a copy without that word, against the rule of
   `git-workflow`; it was removed after the push.
8. **A repeat in `task-delivery-loop-run`** — tree, «9, 11–12»: the stop of the own showcase and stand is
   said twice.

## RT-3640 — the review of 25 November 2026

1. **The quick checks stand in the section that starts the round** — tree, `task-delivery-loop-run`, «7, 9».
   `check-file-size` was red in the diff of round one and a role found it: the demand lay in «5–6», already
   passed. Proposed: the block of quick checks before the diff of every round.
2. **A refused commit stops the call** — tree, `task-delivery-loop-run`, «8, 9». A commit refused by the
   subject case went by `;`, and the pruning commit took its files; the set was stopped. Proposed: files by
   name, `&&` after a commit, no `git add` before the commit of the pruning.
3. **The merge of the previous branch is asked before branching** — tree, `task-delivery-loop-run`, «2–3».
   The branch was taken from a ref merged nine minutes earlier, seen only at the closing.
4. **On the light path the fixes of a serious finding in a check are read by one role** — tree,
   `tools/review-path.mjs` and `task-delivery-loop`; the owner's decision, it narrows the word of 24.11. The
   fixes of RT-3640 replaced the mechanism, read by nobody. Price: 3–4 minutes beside the set.
5. **Broken variants run in a copy, in the background and against the code that ships** — tree,
   `agent-kit-source`, one article with item 6 of RT-3630. A runner ended by `timeout` left a broken line in
   the tree, and four variants were counted for a line rewritten later.
6. **A check does not stand on file permissions** — package, `pitfalls/testing.md`. Mode 0 is listed by root
   and by Windows, and the `rmSync` of Node 24 cannot remove it.
7. **A plan asks how long the file is that it adds to** — package, `pitfalls/task-flow-start.md`. The
   scenarios outgrew the limit, and the part they left for stands in no row of the footprint.
8. **The PR call of the loop passes the gate without `git-workflow-hosting`** — tree, the gate map: the form
   with the token and `$(…)` is missed; `docs/archive/*` is in neither map against `archive-record`. The
   owner's choice: two loads more per task.

## RT-3627 — along the work, 25 November 2026

1. **The footprint names files before it is known whether they change** — package, the sample of the plan and
   `task-flow-plan`. Exit 8 asks an edit under every path marked «(правится)», and the plan cannot be edited.
   Four files were named with no edit in view and got one at the close; three of the four were worth it, the
   words of one override were not.
2. **An edit made before the plan's commit is not counted by exit 8** — package, the engine. The findings of
   the second reading went into this file by the commit before the plan's, and the row stayed untouched.

## RT-3627 — the review of 25 November 2026

1. **The guard of the postponed mark reads prose as a mark** — package, `checks/flow-guard.mjs` (`deferChanges`)
   and the same reading in `checks/action-of.mjs`. Any line with the word gives every task number in it, while
   the engine reads the state cell alone. A true sentence of the epic plan was reworded into a vague one.
   Proposed: only a plan row whose state cell is the mark counts; two scenarios.
2. **An argument of the tree's own command is judged by the command, not by a guard that rereads the shell** —
   tree, `agent-kit-source`. The reader `creates_single` was written three times and gave both serious findings
   of round two; `task-new-single.mjs` has the arguments split already. Work behind it: the judgement moves into
   the command and the reader leaves; the base reader of the delivery guard goes onto `hooks/script-files.sh`.
3. **A task done by another task's work leaves the plan of its epic by the same word** — package,
   `git-workflow-queue`, «Tasks fixed by one edit are merged before the merge». The menu about RT-3565 asked of
   closing alone, and its row can now be neither merged nor truly postponed, so its epic cannot end. Proposed:
   the menu names the erasing of the card and of the row.
4. **The frame beside the set names the directory of each role** — tree, `task-delivery-loop-run`. A `cd` into a
   missing directory failed, and the next line wrote into the copy. Proposed: directories made by the executor,
   absolute paths, `cd <dir> || exit 1`.
5. **A fix of the last round narrows and does not replace the mechanism** — tree, `task-delivery-loop`, the
   duties: a mechanism found wrong twice is cut to the forms its scenarios hold, a new one is its own task.
6. **The exception for the only task is retold in ten texts and has drifted** — package, `git-workflow-commit`
   and `task-flow-start`; tree, the cold part of the loop. Proposed: the statement stays in `epic-flow`, the rest
   keep the call.

## RT-3628 — the review of 25 November 2026

1. **The handover of a compaction writes a second state line into the progress** — package,
   `hooks/handoff-write.sh`, with a scenario. The edit of the state matches twice and fails. Proposed: the
   four lines of the handover go without the list mark and the bold — «State at that minute: …».
2. **A call that records an edit waits for the answer of the edit** — tree, `task-delivery-loop-run`, «8, 9».
   A failed state edit did not stop the commit of the same message: 55af55c43 left without it, and the push
   went in one message with the question about the base. Proposed: the commit in the message after the
   answers of its edits, the push in the message after the commit, the diff of a round after both.
3. **The suite of the package resources stands among the quick checks** — tree, `task-delivery-loop-run`,
   «5–6», and the cold part of `agent-kit-source`: `bash projects/agent-kit/tests/syntax.test.sh`, three
   seconds. A hook without the execute bit turned the set red after 449 seconds. One edit with item 1 of
   RT-3640.
4. **The first broken variant of a fix is the fix taken away whole** — tree, the cold part of
   `agent-kit-source`. Sixteen of sixteen by the changed lines, and the former code passed all sixty
   scenarios. One edit with item 6 of RT-3630 and item 5 of RT-3640.
5. **A scenario of a stop measures its time and stops only what it started** — package,
   `pitfalls/testing.md`. A short wait ends by itself with the same code and words; an empty number is «not
   reached»; the group of the target is compared with the group of the test before a kill.
6. **A check that comes earlier asks the judge it runs ahead of** — package, `pitfalls/testing.md`. A list of
   its own diverged in both first editions of the plan and once in the code. A new refusal is named and waits
   for the owner's word; a condition whose repair needs the checked step is left to the last line.
7. **The flow guard reads every literal of a written script as a target** — package, `checks/flow-guard.mjs`.
   Four false refusals in one task; the same script by the Write tool passes. Proposed: where every write
   goes to a literal path, the judged names are those paths. The owner's choice: whether the run of a script
   written by another call is judged.
8. **The discard guard reads the session's tree after a `cd` in the command** — package,
   `hooks/git-guard-discard.sh` and its spec. A clean clone is refused and a dirty copy passes. Proposed: a
   literal `cd` before the call and `git -C` name the directory; an unread one is the session's.
