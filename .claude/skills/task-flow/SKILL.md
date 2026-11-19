---
name: task-flow
kind: rule
law: work-conduct
description: Rule under the work-conduct law — the work states. Load at the start of any work, on any edit of a task folder and on return to unfinished work. Its parts: task-flow-plan, -owner, -handover. Patterns task-flow-start, -graph.
---
<!-- rt-kit v0.37.0 · rules/task-flow.md · 296e027db38f · правится надстройкой, не здесь -->

# Work conduct — the states

Rule under the law `docs/constitution/work-conduct.md`. Cold part: `pitfalls.md`, `pitfalls-2.md`.

## Work states

<!-- flow:states -->
| State | Exit | Mandatory action | Pattern |
| --- | --- | --- | --- |
| `просьба-не-разобрана` | `measure.grill.written` | explore the tree, then ask the questions | `task-flow-start` |
| `эпик-заведён` | `measure.epic.declared` | take the epic branch from the main branch; the epic card moves with the first task | `epic-flow-declare` |
| `разбор-закрыт` | `measure.agreement.named` | write the product agreement, or the reason there is none | `task-flow-start` |
| `договорённость-записана` | `measure.task.taken` | create the task, the branch from the epic branch, and the folder | `task-flow-start` |
| `задача-взята` | `measure.plan.approved` | write the plan | `task-flow-start` |
| `замысел-записан` | `measure.progress.mirrors` | do the first stage | `task-flow-start` |
| `этап-идёт` | `measure.progress.done` | finish the stage: `step N.M` measures each step and marks it done | `task-flow-resume` |
| `этапы-кончились` | `measure.footprint.touched` | merge the agreement, bring the texts up to date, run the suite | `task-flow-close` |
| `разбор-кончился` | `measure.folder.archived` | take the folder apart by the last commit | `task-flow-archive` |
| `папка-разобрана` | `measure.pr.handed` | the work queue audit, then open the PR | `task-flow-close` |
| `работа-отдана` | `measure.epic.nextTaken` | send the rules review to the background, then take the next task of the epic | `task-flow-archive` |
| `влито` | `measure.epic.mergedMarked` | mark the task merged in the epic plan by the branch of the next task | `task-flow-resume` |
| `задачи-эпика-кончились` | `measure.epic.finished` | open the PR of the epic into the main branch | `task-flow-close` |
<!-- /flow:states -->

## How the law applies here

- **A state line never stands ahead of the measured state.**
- **A refusal by state names the mandatory action of that state.**
- **Only a word from the list counts as a state name.**
