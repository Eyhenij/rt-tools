# Plan

**Task:** RT-3284 · **Branch:** RT-3284-push-marks-by-what-step-reads
**Behaviour:** unchanged — «исправляй это сейчас же»: the edit touches the marks of the push set, not application code

## Points

- **A:** a commit of texts over a tree the set judged green runs the whole set again, 16 minutes.
- **This task reaches:** after such a commit the builder steps pass from their former marks; the
  checks of texts and of the tree run again.
- **Sign:** the scenarios of the marks and the list of steps the run ahead names as green already.
- **Milestone G of the epic:** an epic of several tasks reaches `main` with no false refusals.
- **Metric:** нет: отметка шага пропадала от любого текстового коммита.

## Task footprint

| What  | Where                                         |
| ----- | --------------------------------------------- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`       |
| Code  | `projects/agent-kit/assets/hooks/`            |
| Code  | `.claude/rt-kit/project.sh`                   |
| Code  | `projects/agent-kit/tests/`                   |

## What counts as done

- A check whose profile names the paths it does not read keeps its mark over a commit of those
  paths alone.
- A check with no such declaration loses its mark on any change of the tree, as before.
- A commit of code drops the mark of every check.

## Stages

### 1. A mark keyed by what the check reads

- **Steps:**
    1. Key a mark by the part of the tree the profile names for the check
    2. Name the paths the builder steps of this tree do not read
    3. Add the scenarios and the spec rule
    4. Lay the hooks out
- **Readiness sign:** the scenario file ends with no failed line.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-nothing-new.test.sh` — the last line names zero failures.

## What this work does not do

- Keeping a mark over a merge of the base: the base stays in the key.
- Moving the set into the pipeline: task RT-3273.
