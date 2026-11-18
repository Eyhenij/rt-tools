# Plan

**Task:** RT-3332 · **Branch:** RT-3332-step-mark-signature
**Draft:** `docs/specs/agent-kit/proposed/step-mark-remeasure/`
**Behaviour:** changes

## Points

- **A:** a plan step can stand marked done with nobody having measured it: the guard believes a mark
  file written past the engine, and a forged approval mark also opens edits of the flow description
  and the engine. The judge of recorded turns can read the expected verdicts.
- **This task reaches:** only the engine marks a step done, right after it measured it; a hand mark
  is refused; before the PR opens every done step is measured once more, so a mark written past the
  engine stops the PR; an approval counts only when the owner's answer stands in a session record of
  this repository; the judge of recorded turns has nothing to read the answers with.
- **Sign:** a live probe in the laid-out tree (stage 5): a mark written by `node -e` plus a hand `[x]`
  is refused, and the turn-exit verdict on this branch stays under 75 seconds. The owner sees both
  lines in the PR.
- **Milestone G of the epic:** a working day with fewer than five refusals per hundred commands and
  no dead end the executor cannot leave by itself. The task adds no wait at the turn end (exit 7
  keeps reading marks) and no owner-only dead end (an approval is found from any copy); it makes the
  step marks the milestone relies on mean what they say.
- **Metric:** нет: метку шага и метку одобрения можно было записать мимо движка.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/proposed/step-mark-remeasure/`, `docs/specs/agent-kit/turn-guards/flow-script/` (guard/, replay/) |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/verifiability.md`, `docs/constitution/delivery.md` |
| Rules | `.claude/skills/task-flow-plan/`, `.claude/skills/testing/`; the texts that tell to mark a step by hand: `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/defaults/turn-map.md`, `projects/agent-kit/assets/pitfalls/task-flow-start.md` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-guard.mjs`, `projects/agent-kit/assets/checks/flow-guard-run.mjs`, `projects/agent-kit/assets/checks/flow-step.mjs`, `projects/agent-kit/assets/checks/flow-plan.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/task-flow/` |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

The probe `docs/tasks/RT-3332-step-mark-signature/probe.sh` goes in the commit of the plan; run now
it prints «probe: forged mark let step 1.2 through». Measured while writing the plan: the guard suite 36 s, `task-flow-script-steps` 8 s,
`task-flow-script` 9 s, `turn-replay` 34 s. The final rerun runs once per PR under the 1800-second
PreToolUse limit; no hook limit changes.

## What counts as done

- Every live scenario of the agreement stands in a test title: SC-AK-1702…1737 without the removed
  1715, 1717, 1719, 1722 — 32 ids.
- The suites `flow-step-guard`, `task-flow-script-steps`, `task-flow-script` and `turn-replay` are
  green.
- The agreement is merged into `docs/specs/agent-kit/turn-guards/flow-script/` and the package is
  laid out.

## Stages

### 1. The judge of recorded turns has nothing to read the answers with

Rules: the group «The replay of the model hooks».

- **Steps:**
    1. The replay command builds the prompt from the hook text and the turns only, runs the judge with no tools outside the tree and compares after the answer
       Check: `bash projects/agent-kit/tests/turn-replay.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1711|1712|1713|1714)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 4
- **Readiness sign:** the replay suite is green, and the judge's prompt holds no `case`, `kind` or file name.
- **Verified by:** `bash projects/agent-kit/tests/turn-replay.test.sh` — the last line ends with «0 провалов».

### 2. Only the engine marks a step done

Rules: the engine marks `[x]` and the next `[>]`; a hand mark is refused; the plan is read from its
commit.

- **Steps:**
    1. The plan and its checks are read from the commit that added the plan, never from the working copy
       Check: `bash projects/agent-kit/tests/flow-step-guard.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1716|1726)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 2
    2. step N.M on a match marks the step done and the next one current, and leaves the progress as it was on a mismatch
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1702|1723|1727|1729|1736)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 5
    3. The guard refuses an edit that newly marks a step done in a plan with checks, whatever mark lies on disk
       Check: `bash projects/agent-kit/tests/flow-step-guard.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1703" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    4. The texts that tell to mark a step in the progress by hand say that step N.M marks it
       Check: `grep -lE 'mark it in the progress|marked done after' projects/agent-kit/assets/task-flow/flow.md projects/agent-kit/assets/rules/task-flow.md projects/agent-kit/assets/defaults/turn-map.md projects/agent-kit/assets/pitfalls/task-flow-start.md | wc -l | tr -d ' '` → = 0
- **Readiness sign:** a hand `[x]` is refused; `step` marks the progress itself, and no text tells otherwise.
- **Verified by:** `bash projects/agent-kit/tests/flow-step-guard.test.sh` — «0 провалов».

### 3. Every done step is measured once more before the PR opens

Rules: the final rerun.

- **Steps:**
    1. Opening a PR runs step --done over all done steps and refuses on any mismatch, naming the step, expected and got
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1704|1705|1706|1707|1724|1725|1731|1732|1733)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 9
- **Readiness sign:** a mark and an `[x]` written by a script stop the PR.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script-steps.test.sh` — «0 провалов».

### 4. The approval is confirmed in the records of this repository

Rules: the group «The approval».

- **Steps:**
    1. plan-red writes the place of the answer and the plan commit, from the record directories of this repository's copies only
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1720|1728|1734)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 3
    2. The guard of the description confirms the answer at its place and the plan commit, and refuses writes into the session records, not into the memory
       Check: `bash projects/agent-kit/tests/flow-step-guard.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-(1708|1709|1710|1721|1730|1735|1737)" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 7
    3. Exit 5 confirms the approval at its place as the guard does
       Check: `bash projects/agent-kit/tests/task-flow-script.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1718" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
- **Readiness sign:** a forged approval mark opens no edit of the engine and meets no exit 5.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — «0 провалов».

### 5. The agreement merges, the package is laid out, the probe runs live

- **Steps:**
    1. The agreement is merged into the flow-script spec, SC-AK-1411 and SC-AK-1414 rewritten with their tests
       Check: `test ! -d docs/specs/agent-kit/proposed/step-mark-remeasure && node tools/check-specs.mjs >/dev/null; echo $?` → `0`
    2. Every live scenario of the agreement stands in a test
       Check: `grep -rhE "^[^#]*SC-AK-17(0[2-9]|1[0-9]|2[0-9]|3[0-7])" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | grep -vE '1715|1717|1719|1722' | sort -u | wc -l | tr -d ' '` → = 32
    3. The package is built and laid out
       Check: `NX_DAEMON=false pnpm run -s agent-kit:check >/dev/null 2>&1 && bash docs/tasks/RT-3332-step-mark-signature/probe.sh` → `probe: forged refused, verdict under 75 s`
    4. The live probe: a forged mark with a hand done mark is refused, a write into the memory passes, and the measurement of the state stays under 75 seconds
       Check: `bash docs/tasks/RT-3332-step-mark-signature/probe.sh` → `probe: forged refused, verdict under 75 s`
- **Readiness sign:** the spec is in force, every suite above is green, the probe prints its line.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- A session record forged by a script that computes its path itself is not detected: the same user
  writes it.
- Exit 7 keeps reading the marks; a script past the guard is caught by the rerun when the PR opens
  by `gh pr create`. A PR opened past that command (the API, the browser), and a step marked after
  the PR opened, are not measured again: the pipeline does not run for a PR into the epic branch.
- A check that stopped matching because later stages changed its files stops the PR: the step is
  measured again after the fix, or replaced by the owner's quote. The checks of this plan are a
  green suite plus a count of scenario ids, which later stages only grow into.
- An answer removed by the harness cleanup of old records is asked again: the cleanup period is
  longer than a task.
- The engine requiring the epic PR while tasks remain — task RT-3395.
