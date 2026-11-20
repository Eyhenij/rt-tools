# Plan

**Task:** RT-3446 · **Branch:** RT-3446-remeasure-reads-replacements
**Behaviour:** unchanged — код приложений не меняется. Меняется перемер шагов плана перед PR: он читает замены проверок из последней версии хода работы. Слово владельца: «Починить движок отдельной задачей (Recommended)».

## Points

- **A:** the rerun before the PR gives each done step the progress as it stood before the first
  commit that marks the step done. A replacement of the check lies in the same commit as the marks
  when the work is committed once, so the rerun measures the original check of the plan. On RT-3420
  four steps of thirteen gave «exit 1, 0» and the gate refused the PR. The case is measured by the
  scenario of this plan: the replacement and the marks in one commit, the folder taken apart.
- **This task reaches:** a replacement of a step check, written in the progress at any commit of the
  branch, is read by the rerun before the PR. A check that reads the progress still sees it before
  the first mark.
- **Sign:** the scenario `SC-AK-1794` passes, `SC-AK-1739` and `SC-AK-1733` still pass, and the PR
  of RT-3420 opens once the epic branch that carries this fix is merged into its branch and the
  package is laid out there. That last move belongs to RT-3420 and follows the merge of this task.
- **Milestone G of the epic:** no dead end. A refusal of the PR that the executor cannot lift
  without the owner is a dead end: it stops every task whose plan check needed a replacement.
- **Metric:** нет: перемер перед PR не видел замену проверки, это ремонт, а не улучшение правила.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/task-flow-plan/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-step.mjs` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script-steps.test.sh` |
| Code (правится) | `docs/specs/agent-kit/turn-guards/flow-script/step-mark/` |
| Code (правится) | `tools/flow-step.mjs` — разложенная копия, её пишет раскладка |

## What counts as done

- The rerun before the PR puts the replacement lines of the last version of the progress in the
  history into the progress of the run, in place of the replacement lines of the version the rest
  of the run uses. A replacement taken away stays away, and the later of two replacements wins.
- A step whose check was replaced in the commit of its mark matches on the rerun.
- A step whose check reads the progress still sees the progress before its first mark.
- The description of the final rerun carries the rule and the scenario `SC-AK-1794`.
- The laid-out copy matches the package.

## Stages

### 1. The rerun reads the replacements

Rules: the rerun chooses for each group of steps the version of the progress before the first mark.
After that choice every replacement line of that version is dropped and the replacement lines of
the last version in the history are put in their place. So a replacement written before the mark is
not doubled, a replacement the owner later took away stays away, and two replacements of one step
give the later one. The helper is a function of its own, named `withReplacements`, and it takes the
lines from the history of the branch, never from the working copy. A folder that was not taken apart
is not restored and the helper is not called. The scenario builds the case of RT-3420: a plan check
that cannot match, its replacement and the marks in one commit, the folder taken apart; two more
cases hold a replacement taken away and two replacements of one step.

- **Steps:**
    1. The rerun adds the replacement lines of the last progress to the chosen version
       Check: `grep -c 'withReplacements' projects/agent-kit/assets/checks/flow-step.mjs | cat` → >= 1
    2. The scenario of the replacement and the marks in one commit passes
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script-steps.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1794' | cat` → >= 1
- **Readiness sign:** the two counts hold, and `SC-AK-1733`, `SC-AK-1739` pass as before.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script-steps.test.sh` — 0 failures;
  `bash projects/agent-kit/tests/task-flow-script.test.sh` — 0 failures.

### 2. The description and the layout

Rules: the rule of the final rerun says that the replacement lines come from the last version; the
scenario `SC-AK-1794` stands in the scenarios of the same description with its test. The package is
built and laid out.

- **Steps:**
    1. The description carries the rule of the replacement lines
       Check: `grep -c 'replacement lines' docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md | cat` → >= 1
    2. The description carries the scenario
       Check: `grep -c 'SC-AK-1794' docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md | cat` → >= 1
    3. The laid-out copy carries the helper
       Check: `grep -c 'withReplacements' tools/flow-step.mjs | cat` → >= 1
- **Readiness sign:** the three counts hold.
- **Verified by:** `pnpm run agent-kit:check` — exit 0; `node tools/check-specs.mjs` — no divergence.

## What this work does not do

- The plan checks of other tasks are not rewritten: a check that cannot match is repaired by a
  replacement, and this fix lets the rerun read it.
- The refusal of a PR for a step that never matched stays as it is.
