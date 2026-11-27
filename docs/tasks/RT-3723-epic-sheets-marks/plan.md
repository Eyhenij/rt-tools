# Plan

**Task:** RT-3723 · **Branch:** RT-3723-epic-sheets-marks
**Behaviour:** unchanged — only the text of the epic plan and one archive record change, no code; the owner: «продолжай»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the epic of phone sheets has every task merged into its branch, and the engine does not see them merged:
  the plan marks them «влита», the row of RT-3617 is numbered «1а», which the engine does not read
  (`tools/task-flow/measure/epic-text.mjs:14`), RT-3706 and RT-3709 have no rows; the local branches
  RT-3531 and RT-3709 hold commits outside the epic branch, and exit 13 reads the local tip first.
- **This task reaches:** the engine reads five merged tasks of the epic, and nothing of this machine holds the epic
  back from its PR into the main branch.
- **Sign:** `node tools/task-flow-script.mjs measure` on `RT-3530-phone-sheets` after the PR of RT-3723 is merged
  shows exit 12 met; the owner sees five rows «влито» in `docs/plans/phone-sheets.md`.
- **Milestone G of the epic:** the epic merged into the main branch.
- **Metric:** нет: the marks of the plan were written in a form the engine does not read.

## Decision

No decision: the change edits two texts and removes two local branches, it adds no symbol.

## Task footprint

| What               | Where                                            |
| ------------------ | ------------------------------------------------ |
| Plans (правится)   | `docs/plans/phone-sheets.md`                     |
| Archive (правится) | `docs/archive/RT-3709-sheet-code-lazy-weight.md` |
| Rules              | `.claude/skills/task-flow/`                      |

## Stages

### 1. The merged tasks are marked, the archive record is whole, stale branches are gone

- **Steps:**
    1. Number the rows of the epic plan by digits, mark every merged task «влито» and add the rows of RT-3706 and RT-3709
       Check: `node -e "import('./tools/task-flow/measure/epic-text.mjs').then(m=>console.log(m.epicPlan(require('fs').readFileSync('docs/plans/phone-sheets.md','utf8')).rows.filter(r=>r.merged).length))"` → >= 5
    2. Bring the archive record of RT-3709 whole from its last local commit, with the line on the replaced check of step 3.2
       Check: `git diff --quiet 1fb585865 -- docs/archive/RT-3709-sheet-code-lazy-weight.md` → exit 0
    3. Remove the local branches RT-3531 and RT-3709, whose work is in the epic branch; the local branch RT-3706 stays until the PR of the epic
       Check: `git branch --list 'RT-3531-*' 'RT-3709-*' | wc -l | tr -d ' '` → <= 0
- **Readiness sign:** the three checks match.

## What this work does not do

- It does not open the PR of the epic into the main branch: that is the next state of the epic, right after the
  merge of RT-3723.
