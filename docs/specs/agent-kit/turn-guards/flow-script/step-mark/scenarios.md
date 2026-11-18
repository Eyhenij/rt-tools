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

### SC-AK-1723 — a replacement quote from an earlier session is found

Given a decision replacing the check of step 1.1, quoting a message the owner typed in an earlier session of another working copy, the replacement matching
When `step 1.1` is run in a new session
Then the step matches and is marked done

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

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

### SC-AK-1727 — a replacement whose quote the owner never typed is refused

Given a decision replacing the check of step 1.1 whose quote stands in no message the owner typed in any record of the record directories
When `step 1.1` is run
Then the step is refused naming the quote that was not found

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
And with a mark of another commit it runs the checks and refuses them as green

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1739 — a check that reads the progress matches on the final rerun

Given a step whose check counts the steps not begun in the progress, measured while one step was not begun
And the task folder taken apart after every step was marked done
When the final rerun runs
Then the step matches: its check reads the progress before the commit that marked the step done

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
