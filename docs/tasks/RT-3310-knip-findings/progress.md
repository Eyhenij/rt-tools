# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — stage 1 done: knip names one file, `express` with 15 packages, 51 exports
  and 14 types
- **Done:** task returned to the epic by the owner's word «Верни в эпик», branch from the epic
  branch, board column; the knip findings sorted; the plan read by both roles and approved, with
  the owner's answers «Снимать export руками», «В конце check:all», «Написать тесты e2e»
- **Next step:** step 2.1 — `express` and the 15 packages out of `package.json` and the lockfile
- **Waiting for the owner:** nothing until stage 4, where the Figma frames go to them
- **PR:** not open yet

## Steps

- [x] 1.1 Name the secondary entries of the kit in `knip.json` by `src/lib/components/*/index.ts`
- [x] 1.2 Name the 13 lib barrels by exact paths in `ignore`, the storage client types, the six used packages, `graphify` and the editor duplicate in `knip.json`
- [x] 1.3 Move the `.storybook` type imports from `playwright` to `@playwright/test`
- [>] 2.1 Remove `express` and the 15 dev packages from `package.json` and the lockfile
- [ ] 2.2 Rewrite the three rule texts that name faker
- [ ] 3.1 Delete `projects/ui-kit-v2/src/lib/components/index.ts`, `hooksSectionByMatcher` and `TTreeCommandKind`
- [ ] 3.2 Drop `export` from the in-file exports and types outside the three kit files under approval
- [ ] 3.3 Write a test in each end-to-end suite the PR check demands for the changed code
- [ ] 4.1 Show the owner the Figma frames of the PDF viewer and the tabs and write the approval into `approvals.md`
- [ ] 4.2 Drop `export` from the five exports and one type of `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts` and `rt-tabs.motion.ts`
- [ ] 4.3 Measure the showcase of both components against the frames and write the owner's approval of the showcase into `approvals.md`
- [ ] 5.1 Add `check:unused` as the last step of `check:all` and rewrite its line in `CLAUDE.md` and `README.md`

## Decisions along the way

- **Step 1.2: the barrels and the storage client types go into `ignoreFiles`, not `ignore`.**
  `ignoreFiles` lifts only the «unused file» finding; `ignore` would hide every finding inside
  those files, an unused export of a barrel included.
- **Stage 1 sign: the three `.storybook` files are typechecked by a direct call.** The showcase
  `tsconfig.json` includes only `preview.ts` and `main.ts` of that directory, so the plan's
  `tsc -p` does not read them. Checked by `tsc --ignoreConfig --strict --allowImportingTsExtensions
  --module nodenext` over the three files: clean, `Page` now has its type.

## Sessions

### 2026-11-14

- Task RT-3310 returned to epic RT-3232 by the owner's word; main merged into the epic branch
  (`4421b9389`), the full push set green, the epic branch pushed.
- The findings were sorted by an exploration session against the tree: every file, package and
  export named with the place that uses it or the reason it is safe to drop.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3310-knip-findings

### Where we stand at the minute of the compaction

- **State:** `задача-взята`
- **Stage:** 0 of 3 — the plan is written and waits for the roles and the owner's approval
- **Next step:** the roles `product-strategist` and `goal-critic` on the plan, then the owner's
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3310-knip-findings/progress.md`; the plan lies next to it.

### Uncommitted

```
?? docs/tasks/RT-3310-knip-findings/plan.md
```

### Commits over the main branch

```
a818f92ec docs(rt:ui-kit-v2): папка задачи RT-3310 — находки knip
4421b9389 Merge remote-tracking branch 'origin/main' into RT-3232-remove-ui-kit-v1
2fe032243 [RT-3308] Остатки первого кита убраны, в дереве есть knip (#3312)
d6dab3905 docs(rt:ui-kit-v2): третья задача эпика — RT-3310, находка о проверке e2e
07a5c4a38 test(rt:message-bus): каждый раздел верхнего ряда админки рисует свой значок
dda17a31a docs(rt:ui-kit-v2): находки задачи RT-3308 рядом с планом эпика
96ee0dd95 refactor(rt:ui-kit-v2): замечания ролей — название SC-UKV-531, комментарии историй, настройки knip
b3e716276 docs(rt:ui-kit-v2): папка задачи RT-3308 разобрана в запись архива
2c5a8676f docs(rt:ui-kit-v2): команда check:unused названа в CLAUDE.md и README
d1918ae99 chore(rt:ui-kit-v2): в дереве есть knip — поиск файлов и зависимостей без потребителя
0f8b9ae21 refactor(rt:ui-kit-v2): слово first-kit ушло из имён второго кита
393ce6f82 refactor(rt:agent-kit): остатки первого кита — набор признаков, две зависимости, спек снимков
98d68078e docs(rt:ui-kit-v2): папка задачи RT-3308 — остатки первого кита и knip
e1bcfafbd Merge remote-tracking branch 'origin/main' into RT-3232-remove-ui-kit-v1
05cfece33 [RT-3304] Первый кит удалён вместе с витриной, проверками и выпуском (#3307)
3bb56b00c fix(rt:agent-kit): наблюдения агента во вложенных каталогах не входят в таблицу входов набора
443ec213a chore(rt:agent-kit): лимиты времени набора отправки сняты по слову владельца
603461390 docs(rt:agent-kit): находки эпика RT-3232 по задаче RT-3304
937715e68 fix(rt:agent-kit): наблюдения агента не входят в таблицу входов набора
8ecda2246 chore(rt:agent-kit): таблица входов набора записана по вершине задачи RT-3304
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
