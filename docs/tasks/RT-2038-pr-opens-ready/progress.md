# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — a chain merged out of order
- **Done:** stage 1 — the pipeline wakes only for a PR into the main branch; stage 2 — the law,
  the two rules and the two patterns name where the draft applies and where the PR opens ready;
  stage 3 — the chain pattern names the branch left behind a merge out of order
- **Next step:** stage 4 — the layout, the checks, the marks in the intake, row 10 of the epic
  plan, the description of the past, taking the folder apart and the PR
- **Uncommitted:** the pipeline file, six resources of the package and this file
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The draft stays for the PR of an epic into the main branch** — the records asked to remove it
  everywhere, and the owner's reason for removing it does not hold there: a run is waited for on
  that PR. Affected stage of the plan: 2.
- **The footprint of the plan missed the rule of the rollout** — `rules/deploy-flow.github.md`
  says which PRs the pipeline wakes for, and without an edit there the rule and the pipeline would
  say different things. Affected stage of the plan: 2.

## Sessions

### 2026-09-11

- The owner named the state of the pipeline and decided: no trigger on a push into a branch, a PR
  into an epic branch opens ready, the run is for the main branch.
- Five of the six records are one proposal split across five resources; the sixth is on its own and
  is about merging a chain out of order.
- Six resources of the layer were edited: the law of delivery, the rules of the rollout, of the
  queue and of work conduct, and the three patterns — of the PR, of closing and of the chain.
- Two of them stood at the weight limit for prose and were compressed; in the closing pattern one
  section stood twice, the copies said different things about the guard, and they were merged.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-worktree-2
**Branch:** RT-2038-pr-opens-ready

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — the pipeline wakes only for a PR into the main branch
- **Next step:** stage 1 — the trigger of the pipeline
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2038-pr-opens-ready/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .github/workflows/ci.yml
 M docs/tasks/RT-2038-pr-opens-ready/progress.md
 M projects/agent-kit/assets/laws/delivery.md
 M projects/agent-kit/assets/patterns/git-workflow-pr.github.md
 M projects/agent-kit/assets/patterns/task-flow-close.md
 M projects/agent-kit/assets/rules/deploy-flow.github.md
 M projects/agent-kit/assets/rules/git-workflow.github.md
 M projects/agent-kit/assets/rules/task-flow.md
?? docs/tasks/RT-2041-ambiguous-names-unwired/
```

### Commits over the main branch

```
e63122d66 docs: заведена папка задачи RT-2038
b4f3e90ff [RT-2055] Аудит ярусов читает объявленные имена либ (#2063)
45d7f7fec docs: строка эпика о девятой задаче и разложенное после слияния
dd1d57a51 Merge remote-tracking branch 'origin/RT-2028-cargo-intake' into RT-2055-lib-names-declared
6b314f2e7 [RT-2037] Разрозненные правки правил и паттернов: одиннадцать записей приёмника (#2062)
85fe9d8b6 docs: папка задачи RT-2055 разобрана
e9f15d699 fix(rt:agent-kit): аудит ярусов читает объявленное имя либы, а не выводит формулой
118d4707d docs: заведена папка задачи RT-2055
239c7f871 docs: папка задачи RT-2037 разобрана
4696daf66 docs(rt:agent-kit): компаньон назван четвёртым местом устаревшего, право процедуры — двумя промахами
3fe59ed27 docs(rt:agent-kit): статья закона о старшинстве проверки и четыре статьи правил
f0a5e9c36 Merge remote-tracking branch 'origin/RT-2028-cargo-intake' into RT-2037-misc-rules-fixes
aa7af439a [RT-2036] Отправка называет блоки, которые сочла уехавшими (#2061)
4d926b3da docs(rt:agent-kit): правило поставки говорит о пустом дереве и о переносе основания
c53be50bd fix(rt:agent-kit): страж второго сервера спрашивает дерево, кто поднимает стенды
ba0c18ef7 docs: заведена папка задачи RT-2037
51a6ea299 Merge remote-tracking branch 'origin/RT-2028-cargo-intake' into RT-2036-cargo-send-silent
8c04876f3 [RT-2035] Путь плана эпика читают одним ходом команда и аудит (#2059)
0d8ff3701 docs: папка задачи RT-2036 разобрана
a0f4c2bc5 fix(rt:agent-kit): отправка называет блоки, которые сочла уехавшими
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
