# Grill

**Spec:** `docs/specs/agent-kit/proposed/step-mark-remeasure/`

## The owner request

> Принять сейчас, подпись — отдельной задачей (Recommended)

The owner's answer in the approval menu of the plan of RT-3329, 15.11.2026. The task card
(issue #3332) names the work: sign the step mark with a key the agent has no access to, check the
signature in the work-conduct guard, and keep the expected verdicts of the model hooks where the
replaying subagent cannot reach them.

## What the tree already has

- **Marks.** `projects/agent-kit/assets/task-flow/source/marks.mjs:marksDir` puts them under the
  common git directory, `rt-kit/steps/<branch>/<N.M>.json` and `rt-kit/approval/<branch>.json`.
  Plain JSON, no signature.
- **Writers.** `checks/flow-step.mjs:settleStep` writes a step mark after the check of the step
  matched. `checks/flow-plan.mjs` writes the approval mark after the owner's answer is found.
- **Readers.** `checks/flow-guard-run.mjs:guardContext` gives the guard `stepMark` and `approved`.
  `checks/flow-guard.mjs:judgeProgress` refuses a step marked done without a mark.
  `judgeProtected` lets an edit of the flow description and the engine through only with the
  approval mark. `task-flow/measure/progress.mjs` and `measure/plan.mjs` read the marks for exits
  5 and 7.
- **The guard on the marks directory.** `checks/flow-guard.mjs:judgeCall` and `judgeShell` judge
  the command text: a redirect, `tee`, `cp` and the like naming the marks path. A command naming
  the engine script passes. A script that computes the path itself is not seen.
- **Keys.** None for the marks. Hooks run as the same user on the same filesystem as the agent:
  whatever a hook reads, the agent reads too.
- **Expected verdicts.** `projects/agent-kit/tests/turn-replay.expected.json` lies in the tree.
  The replaying subagent is told not to read it by a sentence in its prompt.
- **Specs.** `docs/specs/agent-kit/turn-guards/flow-script/` (the marks, SC-AK-1365…1392),
  `docs/specs/agent-kit/work-steps/`, `docs/specs/agent-kit/turn-guards/flow-script/replay/`.

## What the rules already say

The work-conduct law: every step of a plan carries a check, and the engine writes the mark of the
step. Nothing in the laws or rules names a secret or a process boundary.

## Questions and answers

**Where does the boundary for a key the agent cannot read run, when hooks run as the same user?**
The owner, 18.11.2026: «Это ты писал этот ебаный план и ты сейчас спрашиваешь у меня как тебе
выкручиваться?» The decision is the executor's.

**Where do the expected verdicts go?** The owner: «Читай предыдущий ответ».

## Decisions

- **No key: the guard measures the step again when it reads the mark.** A mark becomes a cache,
  not a proof: the guard reruns the step's check from the plan and lets the `x` through only on a
  match. A forged mark then gives nothing. Rejected: a service under a separate OS user — it needs
  the owner's `sudo`, and the owner told the executor to decide without them; the macOS keychain
  with a confirmation — a window on every step.
- **The approval mark is checked against the owner's answer in the session record, not trusted.**
  The guard of the flow description reads the answer itself; the mark only names where it is.
- **The model-hook replay runs with no tools, not by a subagent with file access.** The judge gets
  the recorded turn in the prompt and has nothing to read the expected verdicts with; the
  comparison runs after, in the script. Rejected: moving the file — the same user reads it
  anywhere.

## What is left unclear

- How long the rerun of a step check takes on the heaviest step of the current plans: measured in
  the plan stage, before the code.
