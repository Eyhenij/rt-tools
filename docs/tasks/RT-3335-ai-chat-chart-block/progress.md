# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 5 — The block
- **Done:** branch `RT-3335-ai-chat-chart-block` taken from `RT-2750-rt-chart` (a chain: PR #3386
  of RT-2750 is open into the epic branch); the task is in progress and assigned; the grill holds
  the exploration and the decisions; the body of #3335 is rewritten away from echarts; the
  agreement `docs/specs/ui-kit-v2/proposed/ai-chat-chart/` holds 17 rules and SC-UKV-1341…1359,
  its 15 open questions closed by assumption
- **Next step:** 3.1 — the block component over the checked spec and its data.
  The branch RT-2750 below waits for main to fix the hook test SC-AK-569 broken by #3387.
- **Uncommitted:** no
- **Waiting for the owner:** no; the mockup and the plan are approved: «Одобряю макет и план RT-3335»
- **PR:** not open yet; the chain base is PR #3386

## Steps

- [x] 1.1 Draw the block in the kit Figma file: title row, the ten kinds, pending, invalid, empty, full
- [x] 1.2 Measure the frames and ask the owner to approve the mockup through the parent session
- [x] 2.1 Create the entry `ai-chat-chart` and its barrel
- [x] 2.2 Write the spec types, the exported JSON schema and the hand-written check
- [x] 2.3 Write the mapping of the ten kinds onto `IRtChart` with the formats
- [x] 2.4 Add `ajv` 8.20.0, already in the lockfile, as an exact dev dependency for the schema test
- [x] 2.5 Cover the check, the schema and the mapping with unit tests by scenario id
- [>] 3.1 Write the block component: title row, subtitle, axis names, notice, placeholder, empty state
- [ ] 3.2 Add full screen through the kit dialog and the PNG download
- [ ] 3.3 Add the provider with the `toText` factory and the kit labels in eight languages
- [ ] 3.4 Cover the block with component tests by scenario id
- [ ] 4.1 Write the stories: one per kind, pending, invalid, empty, both themes, narrow feed, and an
- [ ] 4.2 Take the snapshot references and match the showcase with the mockup
- [ ] 4.3 Ask the owner to approve the showcase through the parent session
- [ ] 5.1 Merge the agreement into the ai-chat subdomain spec and fix the scenario index
- [ ] 5.2 Bring the README and the CONTEXT of the chat up to date
- [ ] 5.3 Run the push gate

## Decisions along the way

- **`product-strategist` findings went into the agreement.** Negative bars are accepted by `bar`
  too; a hierarchy path ending on a node keeps its value there, so the schema never accepts a shape
  the block refuses; the spec may arrive parsed; the end-of-call sign is out of scope and became a
  finding of the epic. Affected stage of the plan: none yet, the plan is not written.
- **`spec-critic` findings 2 and 3 are decided without new drawing in `rt-chart`.** A zero bar is
  not drawn, and the zero stands in the hint and the copy; the axis names stand above and under the
  chart, not at the axes. The task keeps `rt-chart` as it is. Affected stage of the plan: none yet.

- **The mockup was redrawn on the owner's remark «почему блоки с графиками прижаты к левому краю
  … где макеты для широких экранов».** The chart drawing copied from the RT-2750 frame kept its
  328 px width; its parts now stretch with the block. Frames at 360, 420 and 760, the dark theme
  and full screen; measured: zero gap at the right edge in every block, the chat header subtitle
  cut instead of running 42 px under the icons. Affected stage of the plan: 1.

## Sessions

### 2026-11-18

- Branch taken, task #3335 moved to work and assigned to the machine account.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3335-ai-chat-chart-block

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 5 — The block
- **Next step:** 3.1 — the block component over the checked spec and its data.
- **PR:** not open yet; the chain base is PR #3386

The progress in full — `docs/tasks/RT-3335-ai-chat-chart-block/progress.md`; the plan lies next to it.

### Uncommitted

```
?? projects/ui-kit-v2/src/ai-chat-chart/lib/ai-chat-chart.check.spec.ts
?? projects/ui-kit-v2/src/ai-chat-chart/lib/ai-chat-chart.data.spec.ts
?? projects/ui-kit-v2/src/ai-chat-chart/lib/ai-chat-chart.samples.ts
```

### Commits over the main branch

```
7094274a1 chore(rt:ui-kit-v2): ajv 8.20.0 для теста схемы графика
88dd1aca3 feat(rt:ui-kit-v2): спецификация графика переводится в данные rt-chart
80a417cc3 feat(rt:ui-kit-v2): проверка спецификации графика и её JSON-схема
d321f59f8 Merge branch 'RT-2750-rt-chart' into RT-3335-ai-chat-chart-block
aa3cbd0fa Merge remote-tracking branch 'origin/main' into RT-2750-rt-chart
6e04209a2 feat(rt:ui-kit-v2): вход ai-chat-chart с моделью спецификации графика
fe92619a6 docs(rt:ui-kit-v2): план и макет RT-3335 одобрены владельцем
303b84094 docs(rt:ui-kit-v2): находка о красных тестах хуков в main
4a8b44771 Merge remote-tracking branch 'origin/main' into RT-2750-rt-chart
d9c4a85f3 docs(rt:ui-kit-v2): договорённость RT-3335 по замечаниям критика
a4a2557ab docs(rt:ui-kit-v2): следующий шаг RT-3335 после починки main
1e9c4e926 docs(rt:ui-kit-v2): решения по замечаниям ролей в прогрессе RT-3335
6363d2f8b docs(rt:ui-kit-v2): находки RT-3335 о протоколе чата
9d240fe50 docs(rt:ui-kit-v2): договорённость RT-3335 по замечаниям о вехе эпика
725ba5048 docs(rt:ui-kit-v2): договорённость RT-3335 записана, критика идёт
ef231fc3e docs(rt:ui-kit-v2): договорённость о блоке графика в ответе чата
fada9db2e docs(rt:ui-kit-v2): разбор RT-3335 закрыт допущениями
f5c3fa184 docs(rt:ui-kit-v2): первые находки разбора RT-3335
01682fd3f docs(rt:ui-kit-v2): папка задачи RT-3335 — блок графика в ответе чата
7a5970758 docs(rt:ui-kit-v2): находка о проверке открытия PR задачи эпика
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
