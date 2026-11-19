# Plan

**Task:** RT-3352 · **Branch:** RT-3352-consent-by-prompt
**Behaviour:** changes
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`

## Points

- **A:** the engine looks for the owner's words in the session records in two places: a replaced
  step check counts only when the owner typed its quote, and a row «шаг владельца «…»» of the epic
  plan blocks its task only when the owner typed the quote. An answer given in a menu or on another
  machine is not found, and the step stands.
- **This task reaches:** the owner says yes in the window on the edit itself. An edit of the
  progress that adds or changes a replacement line, and an edit of the epic plan that sets or
  changes «шаг владельца», get the decision `ask`; the engine reads no quote after that.
- **Sign:** `owner.said(` stands in no file of the engine and its checks; a replacement without a
  quote is measured; the two edits are answered with `ask`, not with a refusal.
- **Milestone G of the epic:** a working day with fewer than five refusals per hundred commands and
  no dead end the executor cannot leave by himself. A yes not found in the records is such a dead
  end.
- **Metric:** нет: ремонт — согласие владельца больше не ищется по словам.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/` |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/turn-conduct/` |
| Code (правится) | `projects/agent-kit/assets/task-flow/` |
| Code (правится) | `projects/agent-kit/assets/checks/` |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- No file under `projects/agent-kit/assets/task-flow` and `projects/agent-kit/assets/checks` calls
  `owner.said(`; the stop word stays.
- A replacement line without a quote is measured; a row naming the owner's step is skipped without
  a typed quote.
- An edit of a replacement line and an edit of «шаг владельца» are answered with `ask`.
- The spec articles say so, and the package is laid out.

## Stages

### 1. The engine reads no quote

Rules: a replacement line of the progress counts as written; a row naming the owner's step is
blocked; the measurer `ownerStep` and its menu cause go away, with the scenario SC-AK-1441; the
menu of SC-AK-1445 is built from the cause `forbidden`.

- **Steps:**
    1. The replacement of a step check is measured without a quote
       Check: `bash projects/agent-kit/tests/task-flow-script-steps.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1743" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    2. A row naming the owner's step is blocked without a quote
       Check: `bash projects/agent-kit/tests/task-flow-script.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1744" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    3. No file of the engine and its checks calls owner.said
       Check: `bash projects/agent-kit/tests/turn-exit-guard.test.sh >/dev/null && { grep -rn 'owner\.said(' projects/agent-kit/assets/task-flow projects/agent-kit/assets/checks || true; } | wc -l | tr -d ' '` → = 0
- **Readiness sign:** a replacement whose quote the owner never typed is measured, and a row
  «шаг владельца «…»» whose quote nobody typed is skipped.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` and
  `bash projects/agent-kit/tests/task-flow-script-steps.test.sh` — «0 провалов».

### 2. The two edits are asked in the window

Rules: an edit of the progress that adds or changes a replacement line, and an edit of the epic
plan that sets or changes «шаг владельца» on a row, are answered with `ask` from the decision table.
An edit that lifts «шаг владельца» from a row, or removes a replacement line, gets no window.

- **Steps:**
    1. The engine names both edits, the hook gives them actions of their own
       Check: `bash projects/agent-kit/tests/flow-step-guard.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-174[56]" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 2
    2. The decision table answers both with ask
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --validate >/dev/null && grep -c '"decision": "ask"' projects/agent-kit/assets/checks/decision-table.json | tr -d ' '` → = 15
- **Readiness sign:** the hook prints `permissionDecision` `ask` on both edits, and the probes of
  the decision table pass.
- **Verified by:** `bash projects/agent-kit/tests/flow-step-guard.test.sh` — «0 провалов»;
  `node projects/agent-kit/assets/checks/decision-table.mjs --validate` — exit 0.

### 3. The texts and the layout

- **Steps:**
    1. The spec articles name the window, not the quote
       Check: `{ grep -rn 'whose quote stands in a message the owner typed\|A replacement quote is searched\|ownerStep\|SC-AK-1441\|When the next step is the owner' docs/specs/agent-kit/turn-guards/flow-script || true; } | wc -l | tr -d ' '` → = 0
    2. The spec article of the replacement names the window
       Check: `grep -c 'replaced only by a decision in the progress the owner allowed in the window' docs/specs/agent-kit/turn-guards/flow-script/spec.md | tr -d ' '` → = 1
    3. The rule turn-conduct names the menu by a refusal, not by the owner's step
       Check: `{ grep -n "The owner's step, or another guard\|the menu of the owner's step" projects/agent-kit/assets/rules/turn-conduct.md || true; } | wc -l | tr -d ' '` → = 0
    4. The laid-out engine is the package one
       Check: `tail -n +2 tools/task-flow/measure/epic.mjs | cmp -s - projects/agent-kit/assets/task-flow/measure/epic.mjs && { grep -rn 'owner\.said(' tools/task-flow tools/flow-step.mjs || true; } | wc -l | tr -d ' '` → = 0
- **Readiness sign:** `pnpm run agent-kit:check` is green.
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` — exit 0.

## What this work does not do

- «отложено» keeps being judged by the owner's last word naming the task: it reads no
  `owner.said`, and the card does not name it.
- The stop word of the owner is read as before.
- A live window of the host on an Edit call is not checked in this tree: the documentation of the
  hooks says `ask` shows it. The PR says so as not checked.
- The window waits for a person: in a run without the owner the edit stands until they answer, the
  same price the 13 windows of RT-3271 pay. The report of the milestone does not count an
  unanswered window as a dead end — a task of its own.
- A replacement line or a row «шаг владельца» brought by `git apply`, a patch or a merge passes no
  window: the guard judges the edit tool and the shell writes it knows. Until now the quote read at
  the measurement caught every path; after this work the window at the edit is the only gate.
- The reader `said` of the session records stays: the forecast of refusals reads it.
