# Scenarios: a mark is measured again, not believed

The scenarios of the engine that alone marks a step done, of the final rerun before the PR, of the
guard and of exit 5 that confirm the approval in the session records, and of the replay whose judge
runs with no tools. They merge into `docs/specs/agent-kit/turn-guards/flow-script/` and its
subdomains `guard/` and `replay/` with the same numbers.

The numbers SC-AK-1715, SC-AK-1717, SC-AK-1719 and SC-AK-1722 were issued to scenarios of a rerun
inside the guard and at exit 7, which this agreement dropped. They stay empty and are not issued
again.

### SC-AK-1702 — a matching step command marks the step done in the progress itself

Given a progress whose step 1.1 is current and step 1.2 not begun, and a check of step 1.1 that matches
When `step 1.1` is run
Then the mark of step 1.1 lies in the directory of the marks, the progress marks step 1.1 done and step 1.2 current

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1703 — an edit that marks a step done is refused even with a mark on disk

Given a plan with checks, a progress whose step 1.1 is current, and a mark of step 1.1 lying in the directory of the marks
When an edit marks step 1.1 done
Then the edit is refused, and the refusal names `node tools/task-flow-script.mjs step 1.1`

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1704 — a step past its limit refuses the PR

Given a done step 1.1 whose check runs longer than the limit, the limit set short for the test
When the PR of the task is opened
Then the opening is refused naming step 1.1 and that the limit ran out

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1705 — a check command that does not run refuses the PR

Given a done step 1.1 whose check command is not found, expected `exit 0`
When the PR of the task is opened
Then the opening is refused naming step 1.1, the expected `exit 0` and the code it got

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1706 — the refusal of the PR names every step that did not match

Given done steps 1.1 and 1.2, the check of 1.1 matching and the check of 1.2 not matching
When the PR of the task is opened
Then the opening is refused, and the refusal names step 1.2 and not step 1.1

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1707 — the final rerun runs a replaced check in its replaced form

Given a done step 1.1 whose check the plan wrote red, and a decision in the progress replacing it with a matching check, quoting a message the owner typed
When the PR of the task is opened
Then the opening is not refused for step 1.1

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1708 — an approval confirmed in the record lets an edit of the engine through

Given an approved plan naming the engine in a footprint row marked «(правится)», and an approval mark naming the entry of a record where the owner chose «Одобряю план RT-2» after both roles
When an edit of the engine is made
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1709 — an approval mark whose place holds no approving answer is refused

Given the same plan, and an approval mark naming an entry where the owner chose «Переделай этап 1»
When an edit of the engine is made
Then it is refused naming that no approving answer stands at the place the mark names

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1710 — an answer that can no longer be found is refused with the move

Given the same plan, and an approval mark naming a record that lies on disk but no longer holds the entry of that `uuid`
When an edit of the engine is made
Then it is refused, and the refusal names the move: ask the owner again and run `plan-red`

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1711 — the judge of a recorded turn gets no tools and no expected verdicts

Given the fixture `1450-answer-mid-work.json` and the hook `turn-judge`
When the replay builds the call of the judge
Then the call has no tools, settings, hooks, MCP servers or memory and runs outside the tree on the model of the hook. Its prompt holds the hook text and the `turns` and `next` of the fixture, and no file name, `case`, `kind` or expected verdict

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1756 — the judge run as the hook reads the turn from disk

Given the fixture `1450-answer-mid-work.json` with the expected verdict `block` and the hook declaration of the tree
When the replay runs the judge as the hook
Then the prompt is the one of the declaration, and its hook input names a session record on disk that holds the turn. The call has the tools Read, Grep and Glob, the answer `{"ok": false}` counts as `block`, and the line of the case names its seconds

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1758 — the declaration orders round 1 with the pattern of the judge text

Given the hook declaration of the tree that orders round 1 of the judge with a pattern of the owner's words
When the replay suite compares it with the pattern `OWNER` of the judge text
Then both are the same text, and a declaration that names no such pattern passes

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1757 — the live count picks the runs of the declaration on the branch

Given session records with runs of the current declaration on the current branch, a run of an older prompt and a run on another branch. The runs on the branch are: one with a duration, one with no duration past the timeout, one refused by the judge with no duration, one dropped when another Stop hook refused
When the live count runs
Then it counts only the runs of the current declaration on the current branch and leaves out the dropped one. It times a run with no duration from the last reply of the agent before its summary. The one past the timeout with no refusal of the judge counts as a timeout

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1712 — a verdict different from the expected one is a mismatch

Given a judge that answers `allow` on a fixture whose expected verdict is `block`
When the replay runs
Then the line of that fixture names `block` expected and `allow` got, the count line names one mismatch, and the code is 1

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1713 — an answer that is not one verdict is a mismatch

Given a judge that answers with prose naming neither `allow` nor `block`
When the replay runs
Then the fixture counts as a mismatch, and the code is 1

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1714 — a verdict file written before the run is not read

Given a verdict file of the removed form, judge-verdicts for turn-judge, put back into the fixtures with every expected verdict, and a judge that answers `allow` on a fixture expected `block`
When the replay runs
Then the fixture counts as a mismatch, and the code is 1

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1716 — a plan stripped of its checks in the working copy does not lift the refusal

Given a plan whose commit wrote a check under step 1.1, and the same plan in the working copy with every check line removed
When an edit marks step 1.1 done
Then the edit is refused, as for a plan with checks

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1718 — exit 5 confirms the approval at its place

Given a plan with red checks and an approval mark whose answer text begins with «Одобряю» but whose place holds the answer «Переделай этап 1»
When exit 5 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1720 — a record outside the record directories gives no approval

Given an approval mark whose place is a record outside the record directories, the one `RT_FLOW_TRANSCRIPT` named when `plan-red` ran, holding a well-formed approving answer
When an edit of the engine is made
Then it is refused as no approval

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1721 — an approval for another plan commit counts as none

Given an approval mark naming plan commit A with its answer in place, and the branch rewritten so that commit B adds the plan
When an edit of the engine is made
Then it is refused, and the refusal names the move: ask the owner again and run `plan-red`

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1724 — a check that changes a tracked file does not match

Given a done step 1.1 whose check edits a tracked file and then prints the expected line
When the PR of the task is opened
Then the opening is refused naming step 1.1 and the changed file

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1725 — a check failing on the network names the network

Given a done step 1.1 whose check reads the hosting while the network is down
When the PR of the task is opened
Then the opening is refused naming step 1.1 and the network as the cause

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1726 — a task folder changed since the plan commit refuses the step

Given a check of step 1.1 that matches, and a file of the task folder other than the progress changed since the commit of the plan
When `step 1.1` is run
Then the step is refused with its reason, and the progress keeps step 1.1 not done

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1728 — an approval mark with no place counts as none outside the closed list

Given an approval mark written before this work, with an answer and no place, on a branch outside `words.legacyBranches`, and the same mark on a branch of that list
When an edit of the engine is made on each
Then the first is refused as no approval, and the second passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1729 — two working copies on one branch share the latest measurement

Given two working copies on one branch, a mark of step 1.1 written by a matching `step 1.1` in the first, and a check of step 1.1 that does not match in the second
When `step 1.1` is run in the second copy, and then exit 7 is measured in the first
Then the mark of step 1.1 is gone, and exit 7 in the first copy is unmet

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1730 — a record removed by retention cleanup is refused with the move

Given an approved plan and an approval mark whose record the retention cleanup of the harness removed
When an edit of the engine is made
Then it is refused, and the refusal names the move: ask the owner again and run `plan-red`

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1731 — a done mark and a forged mark written past the guard refuse the PR

Given a progress that marks step 1.1 done, written by a script the guard does not see, a mark of step 1.1 written past the engine, and a check of step 1.1 that does not match
When the PR of the task is opened
Then the opening is refused naming step 1.1, its expected result and what it got

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1732 — every done step matching lets the PR open

Given a task whose every done step matches
When the PR of the task is opened
Then the opening is not refused by the final rerun

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1733 — the final rerun reads a taken-apart folder from the history

Given a task folder taken apart by its commit, its plan and progress in the history, and a done step 1.1 whose check does not match
When the PR of the task is opened
Then the opening is refused naming step 1.1

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1734 — an approval given in another working copy is found

Given an approval mark whose place is a record in the record directory of another working copy of the repository, holding «Одобряю план RT-2» after both roles, and a plan naming the engine in a footprint row marked «(правится)»
When an edit of the engine is made in this copy
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1735 — a write into the session records is refused

Given the record directories of the working copies
When a shell command appends a line to a session record there, and Write puts a session record there
Then both are refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1737 — a write into the memory next to the session records passes

Given the record directory of this working copy with its memory directory
When Write puts a file into the memory directory
Then the guard lets it through

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1738 — a plan in progress is approved again by the red output of its own mark

Given a plan whose checks are green now, and an approval mark of the same commit and fingerprint with no place
And a record where the owner chose «Одобряю plan.md RT-2» after both roles
When `plan-red` runs
Then it runs no check and writes the mark with the place of the new answer and the old red output
And with a mark of another commit and the work committed after the plan it runs the checks on the tree of the plan commit and writes the mark

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1749 — a rebuilt plan is measured on the tree of its commit and gets the mark

Given a plan whose checks are green on the branch, the work committed after the plan commit
And a record where the owner chose «Одобряю plan.md RT-2» after both roles
When `plan-red` runs
Then it says the checks run on the tree of the plan commit in a temporary worktree, both checks are red, and the mark is written
And after the run git lists no worktree but the repository and the temporary directory is empty

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1750 — a worktree that cannot be made is a refusal with its reason

Given the branch past its plan commit and a system temporary directory that does not exist
When `plan-red` runs
Then it refuses with «the tree of the plan commit could not be made» and the reason, runs no check and writes no mark

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1751 — at the plan commit with a clean tree the checks run in place

Given HEAD at the plan commit and no tracked file changed
When `plan-red` runs
Then it says the checks run in place, at the plan commit

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1739 — a check that reads the progress matches on the final rerun

Given a step whose check counts the steps not begun in the progress, measured while one step was not begun
And the task folder taken apart after every step was marked done
When the final rerun runs
Then the step matches: its check reads the progress before the commit that marked the step done

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1794 — the final rerun reads the replacement lines of the last progress

Given a step whose check in the plan does not match
And a replacement line of that step written in the commit that marks the step done
When the final rerun runs
Then the step matches by the replaced check
And a replacement taken away by a later commit is not brought back
And of two replacement lines for one step the later one is taken
And a replacement of an earlier version, taken away by the commit that marks the step, is not brought back
And the later one of two replacement lines also decides the mark of the step

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1740 — the final rerun runs on the node the tree pins

Given a tree whose `.nvmrc` names a version installed in the nvm directory, and a session on another node
When the PR opens and the final rerun runs
Then the engine runs on the pinned node; without `.nvmrc` it runs on the node of the session

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1736 — a step command that does not match leaves the progress as it was

Given a progress whose step 1.1 is current, and a check of step 1.1 that does not match
When `step 1.1` is run
Then the progress keeps step 1.1 current and not done, and no mark of step 1.1 lies in the directory of the marks

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1822 — the step command measures a step after the folder is taken apart

Given a branch whose task folder is taken apart, and steps 1.1 and 1.2 the last progress marks done with no marks
When `step 1.1` and `step 1.2` are run
Then each matches and writes its mark, step 1.2 on the progress as it stood when it was measured
And after each run the folder and the record of the run are gone, a file the check wrote into it included
And `step --done` measures the done steps the same way
When another live run holds the folder put back and `step 1.1` is run
Then it is refused with the number of that run, and the mark of step 1.1 stays

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1823 — a step the history does not mark done gets the revert move

Given a branch whose task folder is taken apart, and step 1.3 the last progress does not mark done
When `step 1.3` is run
Then it is refused with the move `git revert --no-edit <the commit that took the folder apart>`
And a number the plan does not name is refused as such, with no move and no folder put back
And the step guard lets that command through, and the command brings the folder back

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1824 — a start of the engine cleans the folder of a dead run only

Given a step run on a taken-apart folder that put the folder back
When the engine starts while the run lives
Then the folder stays
When the run is killed and the engine starts again
Then the folder and the record of the run are gone
And a folder whose file was edited after a killed run stays, and the engine names it on stderr
And a folder a killed run left with a file missing is removed
And a folder the head holds stays under a record of a dead run

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1825 — the final rerun keeps a mark on one mismatch

Given two done steps with marks: one matches only on its second run, one never matches
When the final rerun runs
Then the first matches on the second run and keeps its mark, the second runs twice and loses its mark
And a step past its limit runs once
And with the budget spent no step runs twice, and a step that did not match loses its mark
And on a taken-apart folder the second run of a group reads the progress of its own group again

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1826 — the line of an unmatched step names its command, output and errors

Given a done step whose check prints four lines and an error and exits 3
When the final rerun runs
Then under its line stand its command, the last three lines of its output and its error line
And a check that counts the lines of a pipe shows the failure line fed to its last command

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.
