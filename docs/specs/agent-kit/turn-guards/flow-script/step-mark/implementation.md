# Binding — a mark is measured again, not believed

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

## The step

- **On a match the engine marks the step done in the progress itself, next to writing its mark.** — `projects/agent-kit/assets/checks/flow-step.mjs:markedProgress` — the done mark and the next current one; `projects/agent-kit/assets/checks/flow-step.mjs:measureStep` — the write on a match; scenarios `SC-AK-1702`, `SC-AK-1726`, `SC-AK-1736`
- **An edit that newly marks done a step of a plan with checks is refused, whatever mark lies on disk.** — `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProgress` — the refusal; `projects/agent-kit/assets/checks/flow-guard.mjs:newlyDone` — the steps the edit marks done; scenario `SC-AK-1703`
- **Whether a plan has checks, and which, is read from the commit that added the plan, never from the working copy.** — `projects/agent-kit/assets/checks/flow-guard-run.mjs:guardContext` — `committed`, the text of the oldest commit that added the file; scenario `SC-AK-1716`
- **A replacement quote is searched in the record directories of every working copy.** — `projects/agent-kit/assets/checks/flow-step.mjs:replacedCheck` — the quote; `projects/agent-kit/assets/task-flow/source/records.mjs:openAt` — `said`, the search over the records; scenarios `SC-AK-1723`, `SC-AK-1727`
- **The marks are kept by branch, and the latest measurement of a step in any working copy is the one that holds.** — `projects/agent-kit/assets/task-flow/source/marks.mjs:marksDir` — the common directory of git, one per repository; `projects/agent-kit/assets/task-flow/measure/progress.mjs:done` reads the mark by branch; scenario `SC-AK-1729`

## The final rerun

- **The PR of a task does not open until every done step matches on the final rerun.** — `projects/agent-kit/assets/hooks/git-guard-delivery-rerun.sh:rt_delivery_rerun` — the fact `steps_remeasured` of the opening; `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` — the rerun over `projects/agent-kit/assets/checks/flow-step.mjs:doneSteps`; scenarios `SC-AK-1731`, `SC-AK-1732`
- **The refusal of the PR names every step that did not match, with its expected result and what it got.** — `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` — a line per step; scenarios `SC-AK-1706`, `SC-AK-1707`, `SC-AK-1731`
- **The final rerun reads the plan and the progress from the history when the task folder is already taken apart.** — `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` — the folder restored from the commit before the one that removed it; scenario `SC-AK-1733`
- **A check that changes a tracked file does not match.** — `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` — the tracked changes before and after each check; scenario `SC-AK-1724`
- **A check that fails on the network does not match, and the refusal names the network as the cause.** — `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` — the cause named after the line of the step; scenario `SC-AK-1725`
- **A step past its limit of 540 seconds, or whose command does not run, does not match on the final rerun.** — `projects/agent-kit/assets/checks/flow-step.mjs:runCheck` — the limit `projects/agent-kit/assets/checks/flow-step.mjs:STEP_LIMIT_MS` and the code of a command that does not run; scenarios `SC-AK-1704`, `SC-AK-1705`

## The approval

- **An edit of the description and the engine needs the owner's approving answer found at the place the approval mark names.** — `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected` — the refusal; `projects/agent-kit/assets/task-flow/source/records.mjs:approvalFault` — the answer at its place; the place is written by `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed`; scenario `SC-AK-1708`
- **An approval mark whose place holds no approving answer counts as no approval.** — `projects/agent-kit/assets/task-flow/source/records.mjs:approvalFault` — the entry at the place; `projects/agent-kit/assets/checks/flow-plan.mjs:approvingEntry` — the same test when the mark is written; scenario `SC-AK-1709`
- **An approval given in any working copy of the repository holds in every other.** — `projects/agent-kit/assets/task-flow/source/records.mjs:openAt` — the record directories of the copies `git worktree list` names; scenario `SC-AK-1734`
- **A record outside the record directories gives no approval, the one `RT_FLOW_TRANSCRIPT` names included.** — `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed` — the record of the answer; `projects/agent-kit/assets/task-flow/source/records.mjs:approvalFault` — the record of the mark; scenarios `SC-AK-1411`, `SC-AK-1720`
- **An approval holds only for the plan commit it names.** — `projects/agent-kit/assets/task-flow/source/records.mjs:approvalFault` — the commit of the mark against the oldest commit that added the plan; scenario `SC-AK-1721`
- **An approval mark that names no place counts as no approval outside `words.legacyBranches`.** — `projects/agent-kit/assets/task-flow/source/records.mjs:approvalFault` — the place; `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected` — the closed list; scenario `SC-AK-1728`
- **`plan-red` on a plan whose approval mark names the same commit and fingerprint takes the red output from that mark.** — `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed` — the red output of the mark in place of the runs; scenario `SC-AK-1738`
- **An answer that can no longer be found at its place is refused, and the refusal names the move: ask the owner again and run `plan-red`.** — `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected` — the move after the reason; the text maps to the action `edit_flow_description` in `projects/agent-kit/assets/hooks/flow-step-guard.sh:verdict`; scenarios `SC-AK-1710`, `SC-AK-1721`, `SC-AK-1730`
- **Exit 5 confirms the approval at its place as the guard does, and does not read the answer from the mark.** — `projects/agent-kit/assets/task-flow/measure/plan.mjs:approved` — `approvalFault` of the source `records`; scenario `SC-AK-1718`
- **The session records in the record directories are written by no tool call and no shell command the guard reads.** — `projects/agent-kit/assets/checks/flow-guard.mjs:judgeCall` — a write by a tool; `projects/agent-kit/assets/checks/flow-guard.mjs:judgeShell` — a write named in the command; the text maps to the action `write_marks` in `projects/agent-kit/assets/hooks/flow-step-guard.sh:verdict`; scenarios `SC-AK-1735`, `SC-AK-1737`

## The replay of the model hooks

- **The judge's prompt holds the text of the hook and only the `turns` and `next` of the fixture.** — `projects/agent-kit/tests/judge-replay.mjs:promptOf`; scenario `SC-AK-1711`
- **The judge runs outside the tree with no tools, settings, hooks, MCP servers or memory, on the model the hook uses in production.** — `projects/agent-kit/tests/judge-replay.mjs:judgeCommand` — the call and its temporary directory; `projects/agent-kit/tests/judge-replay.mjs:hookModel` — the model of the hook's settings entry; scenario `SC-AK-1711`
- **The script compares the judge's verdict with the expected verdicts after the judge answered.** — `projects/agent-kit/tests/judge-replay.mjs:replay` — reads `projects/agent-kit/tests/turn-replay.expected.json` after the answer; scenario `SC-AK-1712`
- **A judge answer that is not one verdict, `allow` or `block`, is a mismatch.** — `projects/agent-kit/tests/judge-replay.mjs:verdictOf`; scenario `SC-AK-1713`
- **The verdicts are taken only from the judge's answers in the same run.** — `projects/agent-kit/tests/judge-replay.mjs:replay` — no verdict file is read; scenario `SC-AK-1714`
- **The replay runs by hand and as a plan step, not in the set before a push.** — `projects/agent-kit/tests/judge-replay.mjs:replay` — run by hand; the set is printed by `rt_push_checks` in `.claude/rt-kit/project.sh`, and the replay is not in it
