# Findings of RT-3419 — a wait of a long task instead of a stop word

The continuation of `docs/plans/checks-rework-4-findings.md`, which reached the length limit. Here
are the review findings of RT-3419 that lie outside the footprint of its approved plan. Each waits
for the owner's decision: a task of its own or none.

## RT-3419 — a wait of the session's own long task instead of a stop word

- **An agent that handed its report back ends with no event the record reads.** The host writes
  its end as an `attachment` of the kind `task_status` with the status `completed`; the session
  source reads only `<task-notification>`. On 18.11 one such role stood open for 391 stops. RT-3419
  leaves agents out of the hung tasks, so past the bound such an agent counts as no task.
  **Address:** `projects/agent-kit/assets/task-flow/source/session.mjs:taskOver` reads a
  `task_status` with a final status as the end of the task, with a scenario.
  **Metric:** stops with an agent open past its report, from 391 over 14–22.11 down to 0.
- **A tree whose override names the removed release case loses the exit guard with no message.**
  The word keys `stop`, `stopExcept` and `holdAfter` are retired in RT-3419 itself: the model reads
  them as nothing and the engine names them. The release case `stopWord` is not: an override that
  removes it by `null` is refused by `flow-override.mjs` (outside the footprint), «null removes
  nothing», and one that sets it names the gone measurer `measure.owner.saidStop`. Then the exit
  guard fails open. This tree has no such override. **Address:**
  `projects/agent-kit/assets/checks/flow-override.mjs:mergeOverride` drops a retired release key
  with a line, as `flow-data.mjs:retiredLines` does for the words. **Metric:** trees on the new
  edition whose exit guard fails open, down to 0.
- **The bindings of two model-check cases name common words.** `ask-judge.md:bare` and
  `turn-judge.md:notice` pass the anchor check while the case they bind is gone. **Address:**
  an anchor the check finds only in the case itself, or a marker comment next to the case.

## Rules review after RT-3419 — skill-curator, 22.11

Five proposals of the role; each waits for the owner's decision.

- **Done steps are measured again before the folder is taken apart.** A fix of the second round
  named the retired word keys on purpose, and the check of step 2.2 gave 4 instead of 0. It showed
  only on the refusal to open the PR and cost a revert of the taking-apart, a replaced check and a
  second taking-apart: three commits. **Address:** package,
  `projects/agent-kit/assets/patterns/task-flow-archive.md` and the cold part
  `projects/agent-kit/assets/pitfalls/task-flow-archive.md`, state `разбор-кончился`: its entry
  also runs `task-flow-script.mjs step --done` over all done steps; tree — the line
  `node tools/task-flow-script.mjs step --done` in block 11–12 of
  `.claude/skills/task-delivery-loop-run/SKILL.md`. **Metric:** PR-opening refusals by a step
  measured again, down to 0.
- **A redefined task keeps `[RT-N]` in its title.** The card title was rewritten when the task was
  redefined and the number was lost; the delivery check named it only when the PR opened.
  **Address:** package, «Common misses» in `projects/agent-kit/assets/pitfalls/task-flow-start.md`.
  **Metric:** `task_title_numbered` refusals when a PR opens, down.
- **The PR body is read by the check by the headings of the profile.** The critic's table stood
  under a heading copied from the previous PR of the chain and did not count under «Цель». The
  paragraph «the body is not checked by a machine» in
  `projects/agent-kit/assets/pitfalls/git-workflow-pr-body.github.md` is out of date.
  **Address:** replace the paragraph with a rule about `RT_PULL_BODY_SECTION`,
  `RT_PULL_POINTS_SECTION` and `RT_PULL_GOAL_SECTION`; optionally the refusal of
  `git-guard-delivery-body.sh` names the goal heading. **Metric:** `pr_create_thin_body` refusals,
  down.
- **The loop rule diverges from the step check.** The article says «A finding about the diff is
  never parked in a file», while `flow-step-guard` refuses an edit of a file outside the plan's
  footprint, and the finding went to the findings file. **Address:** tree,
  `.claude/skills/task-delivery-loop/SKILL.md` and the line of its `implementation.md`: an edit the
  step check refuses goes to the epic's findings file with an address and a metric and is named in
  the PR body. **Metric:** divergences of the rule and the check, 1 → 0.
- **A finding about the host's behaviour is counted from the records before the fix.** Round one
  added the Esc delivery rule of 5 seconds by reasoning; round two counted 17 marks and removed it.
  **Address:** tree, the article «A finding is checked against the code before it is fixed» of the
  rule `task-delivery-loop`: a finding about what the host sends or writes is checked against the
  machine's records, and the number goes into the round's commit. **Metric:** fixes of a round
  removed by the next round, down.
- **No edit:** a call of the push set with a tail after it — the rule `task-delivery-loop-run`
  already forbids it; the check worked as meant.
