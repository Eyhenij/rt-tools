# Grill

**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/guard/`

## The owner request

> поправь конфликты https://github.com/Eyhenij/rt-tools/pull/3689

The owner's word of 27.11.2026. The PR of the epic RT-3686 into the main branch conflicted with its
base.

## What the tree already has

- The merge of the main branch gave three conflicts: the laid-out guard `.claude/hooks/flow-step-guard.sh`,
  the table `.claude/rt-kit/assignments.md` and the history of the guard's spec. All three are resolved
  by the merge commit of 27.11.2026 in the epic branch.
- After the merge the spec check names one divergence: the identifier SC-AK-2004 stands twice. The
  epic branch gave it to the scenario «the guard judges a call on a machine without `timeout`» in
  `docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md`; the main branch gave it to the
  scenario «a queued message the record writes again counts once» in
  `docs/specs/agent-kit/work-result/scenarios.md`.
- The epic branch names the number in four files: the scenarios, the companion and the history of the
  guard's spec, one line each, and 24 lines of `projects/agent-kit/tests/flow-step-guard.test.sh`.
- `pnpm run spec:next-id SC-AK` answers: taken up to 2020, the next free is SC-AK-2021.

## What the rules already say

- `spec-driven`: a scenario number is issued once; a scenario and its test title change together.
- `git-workflow-merge`: after a merge of the base the text checks run, and a green build says
  nothing about them.
- `git-workflow`: a merge needing repairs goes into the epic branch alone, the repairs into the task
  branch from that tip.

**Tasks of the grill:** 1

## Questions and answers

**Номер сценария SC-AK-2004 занят дважды; страж разрешает правку набора только с папкой задачи и
планом. Как поступить?** (27.11.2026)
«Вести по ходу задачи (Recommended)»

**По правилам нужна новая задача в эпике RT-3686. Заводить?** (27.11.2026)
«Завести задачу в эпике (Recommended)»

## Decisions

- **The scenario of the epic branch takes the new number, SC-AK-2021** — the main branch is the
  reviewed base, and its number is already named by its archive record. Rejected: renumbering the
  scenario of the main branch — it would rewrite the texts of a merged work.

## What is left unclear

- None.
