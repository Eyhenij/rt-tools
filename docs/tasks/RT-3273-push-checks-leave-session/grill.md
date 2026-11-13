# Grill

## The owner request

> исправляй флоу проверок чтобы не гонять лишнее

> переделай план эпика: смена способа первой

Said on 13.11.2026, after the push set ran 34 minutes on a change that needed one and a half. The
card of the task, written the same day: «Быстрые проверки — линтеры, формат, текст коммита —
перенести в обычные git-хуки. Долгие — сборку, тесты, сквозные наборы — оставить конвейеру на
хостинге, в том числе для PR в ветку эпика. Набор внутри сессии убрать.»

## What the tree already has

- The git hook `.husky/pre-push` calls `.claude/hooks/pre-push.sh`, and that one runs the whole push
  set through `push-set.sh`: the light checks and the heavy steps alike.
- The session guard `git-guard-push-tests.sh` runs the same set before a `git push` of the agent.
  The same set is run twice per push: once by the session, once by git.
- The run ahead `git-guard-push-ahead.sh` runs the set outside the guard and writes marks.
- `.github/workflows/ci.yml` wakes only for a PR into `main`. A PR into the epic branch gets no run.
- The runner is one and stands on the owner's machine.
- Measured on 13.11.2026: the light checks of the set take about 78 seconds; the snapshots of the
  second kit 448–471 seconds, the admin suite 252, the auth stand and suite 46, the scenarios of the
  rules package 1018.

## What the rules already say

- Rule `git-workflow`: «The push gate set is never narrower than the pipeline set.» This task
  reverses the article: the heavy steps leave the push and stay in the pipeline only.
- Rule `git-workflow`: «What checks a PR whose base is not the main branch is asked before the first
  PR of an epic opens.» The answer becomes: the pipeline.

## Questions and answers

**What to do first in the epic?**
«переделай план эпика: смена способа первой»

## Decisions

- **The push runs the light checks alone; the heavy steps run in the pipeline for every PR into the
  epic branch and into `main`.** The card says so. Rejected: keeping a narrowed heavy set on the
  push — it stays inside the session and dies with it.
- **The session guard stops running the set; the git hook runs the light checks.** Two layers ran
  the same set twice. Rejected: the session guard alone — a push from a terminal goes past it.

## What is left unclear

- How long one pipeline run on the single runner takes for a PR into the epic branch. It is
  measured on the first such PR; it does not block the work, the run happens outside the session.
