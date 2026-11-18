# Binding — a mark is measured again, not believed

A statement of the agreement and the place where it will be carried out. None of it is carried out
yet: each line names the planned anchor, the code it builds on today and the scenarios.

## The step

- **On a match the engine marks the step done in the progress itself, next to writing its mark.** — not carried out yet; planned in `projects/agent-kit/assets/checks/flow-step.mjs:measureStep`, which writes and drops the mark today through `projects/agent-kit/assets/task-flow/source/marks.mjs:open`; scenarios `SC-AK-1702`, `SC-AK-1726`, `SC-AK-1736`
- **An edit that newly marks done a step of a plan with checks is refused, whatever mark lies on disk.** — not carried out yet; planned in `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProgress`, which today lets the edit through when `stepMark` of `projects/agent-kit/assets/checks/flow-guard-run.mjs:guardContext` finds a mark; the steps the edit marks done are found by `projects/agent-kit/assets/checks/flow-guard.mjs:newlyDone`; scenario `SC-AK-1703`
- **Whether a plan has checks, and which, is read from the commit that added the plan, never from the working copy.** — not carried out yet; today `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProgress` reads the plan of the working copy through `ctx.read`; the commit is found by `projects/agent-kit/assets/checks/flow-step.mjs:planOfBranch`; scenario `SC-AK-1716`
- **A replacement quote is searched in the record directories of every working copy.** — not carried out yet; today `projects/agent-kit/assets/checks/flow-step.mjs:replacedCheck` asks `projects/agent-kit/assets/task-flow/source/owner.mjs:open`, which reads the one record `RT_FLOW_TRANSCRIPT` names; scenarios `SC-AK-1723`, `SC-AK-1727`
- **The marks are kept by branch, and the latest measurement of a step in any working copy is the one that holds.** — `projects/agent-kit/assets/task-flow/source/marks.mjs:marksDir` — the common directory of git, one per repository; `projects/agent-kit/assets/task-flow/measure/progress.mjs:done` reads the mark by branch; scenario `SC-AK-1729`

## The final rerun

- **The PR of a task does not open until every done step matches on the final rerun.** — not carried out yet; planned as a delivery guard on the opening of a PR, next to `projects/agent-kit/assets/hooks/git-guard-delivery.sh`; the rerun is `projects/agent-kit/assets/checks/flow-step.mjs:runStepCommand` over `projects/agent-kit/assets/checks/flow-step.mjs:doneSteps`; scenarios `SC-AK-1731`, `SC-AK-1732`
- **The refusal of the PR names every step that did not match, with its expected result and what it got.** — not carried out yet; the lines exist in `projects/agent-kit/assets/checks/flow-step.mjs:runStepCommand`; scenarios `SC-AK-1706`, `SC-AK-1707`, `SC-AK-1731`
- **The final rerun reads the plan and the progress from the history when the task folder is already taken apart.** — not carried out yet; `projects/agent-kit/assets/checks/flow-step.mjs:doneSteps` reads the history without the folder today, while `projects/agent-kit/assets/checks/flow-step.mjs:changedSincePlan` compares the files of the folder with the commit of the plan; scenario `SC-AK-1733`
- **A check that changes a tracked file does not match.** — not carried out yet; planned next to `projects/agent-kit/assets/checks/flow-step.mjs:runCheck`; scenario `SC-AK-1724`
- **A check that fails on the network does not match, and the refusal names the network as the cause.** — not carried out yet; planned next to `projects/agent-kit/assets/checks/flow-step.mjs:runCheck`; scenario `SC-AK-1725`
- **A step past its limit of 540 seconds, or whose command does not run, does not match on the final rerun.** — `projects/agent-kit/assets/checks/flow-step.mjs:runCheck` — the limit `projects/agent-kit/assets/checks/flow-step.mjs:STEP_LIMIT_MS` and the code of a command that does not run; the guard of the PR that reads them is not written yet; scenarios `SC-AK-1704`, `SC-AK-1705`

## The approval

- **An edit of the description and the engine needs the owner's approving answer found at the place the approval mark names.** — not carried out yet; planned in `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected`, which today asks `approved` from `projects/agent-kit/assets/checks/flow-guard-run.mjs:guardContext`; the place is written by `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed`; scenario `SC-AK-1708`
- **An approval mark whose place holds no approving answer counts as no approval.** — not carried out yet; the test of the answer exists as `projects/agent-kit/assets/checks/flow-plan.mjs:approvingAnswer`, the record is read by `projects/agent-kit/assets/checks/flow-plan.mjs:readRecord`; scenario `SC-AK-1709`
- **An approval given in any working copy of the repository holds in every other.** — not carried out yet; the record directories are planned to be found from the copies `git worktree list` names, next to `projects/agent-kit/assets/checks/flow-guard-run.mjs:guardContext`; scenario `SC-AK-1734`
- **A record outside the record directories gives no approval, the one `RT_FLOW_TRANSCRIPT` names included.** — not carried out yet; planned in `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed` and `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected`; scenario `SC-AK-1720`
- **An approval holds only for the plan commit it names.** — not carried out yet; the mark carries `plan` today from `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed`, and nothing compares it; scenario `SC-AK-1721`
- **An approval mark that names no place counts as no approval outside `words.legacyBranches`.** — not carried out yet; the closed list is read today in `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected`; scenario `SC-AK-1728`
- **An answer that can no longer be found at its place is refused, and the refusal names the move: ask the owner again and run `plan-red`.** — not carried out yet; planned in `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected`; the text maps to the action `edit_flow_description` in `projects/agent-kit/assets/hooks/flow-step-guard.sh:verdict`; scenarios `SC-AK-1710`, `SC-AK-1721`, `SC-AK-1730`
- **Exit 5 confirms the approval at its place as the guard does, and does not read the answer from the mark.** — not carried out yet; today `projects/agent-kit/assets/task-flow/measure/plan.mjs:approved` reads `mark.answer`; scenario `SC-AK-1718`
- **The session records in the record directories are written by no tool call and no shell command the guard reads.** — not carried out yet; planned next to the directory of the marks in `projects/agent-kit/assets/checks/flow-guard.mjs:judgeCall` and `projects/agent-kit/assets/checks/flow-guard.mjs:shellWrites`; the text maps to the action `write_marks` in `projects/agent-kit/assets/hooks/flow-step-guard.sh:verdict`; scenarios `SC-AK-1735`, `SC-AK-1737`

## The replay of the model hooks

No replay of the model hooks lies in the tree today; it is planned as a command next to
`projects/agent-kit/tests/turn-replay.test.sh`.

- **The judge's prompt holds the text of the hook and only the `turns` and `next` of the fixture.** — not carried out yet; scenario `SC-AK-1711`
- **The judge runs outside the tree with no tools, settings, hooks, MCP servers or memory, on the model the hook uses in production.** — not carried out yet; planned as `claude -p` with tools, settings and MCP turned off, run from a temporary directory; the model is read from the hook's entry in `.claude/settings.json`; scenario `SC-AK-1711`
- **The script compares the judge's verdict with the expected verdicts after the judge answered.** — not carried out yet; reads `projects/agent-kit/tests/turn-replay.expected.json`; scenario `SC-AK-1712`
- **A judge answer that is not one verdict, `allow` or `block`, is a mismatch.** — not carried out yet; scenario `SC-AK-1713`
- **The verdicts are taken only from the judge's answers in the same run.** — not carried out yet; the files `projects/agent-kit/tests/fixtures/turn-replay/judge-verdicts.turn-judge.json` and `projects/agent-kit/tests/fixtures/turn-replay/judge-verdicts.ask-judge.json` are removed by the same work; scenario `SC-AK-1714`
- **The replay runs by hand and as a plan step, not in the set before a push.** — not carried out yet; the set is printed by `rt_push_checks` in `.claude/rt-kit/project.sh`, and the replay is not added to it
