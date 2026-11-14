# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 5 of 5 — stages 1–3 and 5 done, stage 4 moved to epic RT-3313 by the owner's word;
  knip exits with code 0 with the three kit files in `ignoreIssues`
- **Done:** task returned to the epic by the owner's word «Верни в эпик», branch from the epic
  branch, board column; the knip findings sorted; the plan read by both roles and approved, with
  the owner's answers «Снимать export руками», «В конце check:all», «Написать тесты e2e»
- **Next step:** `check:all`, then the folder taken apart and the push set before the push
- **Waiting for the owner:** nothing
- **PR:** not open yet

## Steps

- [x] 1.1 Name the secondary entries of the kit in `knip.json` by `src/lib/components/*/index.ts`
- [x] 1.2 Name the 13 lib barrels by exact paths in `ignore`, the storage client types, the six used packages, `graphify` and the editor duplicate in `knip.json`
- [x] 1.3 Move the `.storybook` type imports from `playwright` to `@playwright/test`
- [x] 2.1 Remove `express` and the 15 dev packages from `package.json` and the lockfile
- [x] 2.2 Rewrite the three rule texts that name faker
- [x] 3.1 Delete `projects/ui-kit-v2/src/lib/components/index.ts`, `hooksSectionByMatcher` and `TTreeCommandKind`
- [x] 3.2 Drop `export` from the in-file exports and types outside the three kit files under approval
- [x] 3.3 Write a test in each end-to-end suite the PR check demands for the changed code
- [x] 4.1 Show the owner the Figma frames of the PDF viewer and the tabs and write the approval into `approvals.md`
- [x] 4.2 Drop `export` from the five exports and one type of `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts` and `rt-tabs.motion.ts`
- [x] 4.3 Measure the showcase of both components against the frames and write the owner's approval of the showcase into `approvals.md`
- [x] 5.1 Add `check:unused` as the last step of `check:all` and rewrite its line in `CLAUDE.md` and `README.md`

## Decisions along the way

- **Stage 4 moved to epic RT-3313 by the owner's word «заводи задачи на все эти случаи и выноси в
  отдельный эпик».** Steps 4.2 and 4.3 are marked closed because they were moved out, not because
  they were done. The export drop of step 4.2 is reverted: the three kit files are back to the epic
  tip content, and `approvals.md` is removed, since the branch no longer changes a visible kit file.
  The three files go into `ignoreIssues` of `knip.json` until the last task of RT-3313 drops their
  `export` and the exception. Without that, knip and `check:all` would be red.
- **Step 4.3: the match of the Figma copy with the showcase is 28 of 35 numbers, and the seven
  misses are older than this task.** Measured on an own showcase at port 6017 against the Tabs
  component and the PDF viewer variants: an unselected tab 30 against 32, the tab strip 33 against
  35, the PDF bar ground `#161616` against `#1c1c1c`, its title 24 against 20, the file name 16/500
  against 14/400, the download label white against dark. The task drops `export` only, so no number
  moved by it; which side is fixed is the owner's decision by the rule `mockups`.
- **Step 5.1: the first `check:all` with knip was red on the lint of the admin suite.** The new
  test SC-MB-432 held a condition and a branch inside the test; rewritten without them, the test
  green again (3 of 3), `check:all` green — 358 tasks, the knip step in its output.
- **Step 3.1: `byKey` of `projects/agent-kit/src/lib/order.ts` is deleted too.** Its only caller
  was `hooksSectionByMatcher`; left alone, it would be the next unused export.
- **Step 3.3: the tests check that the kit draws its icons where the changed code runs.** The
  admin test walks three list sections by clicks — the list page, the list store and the address
  reading lose `export` here; the entry test walks the records screen. Scenarios `SC-MB-432` and
  `SC-AUTH-118`.
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

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — stages 1–3 done and step 5.1 committed: knip exits with code 0; the new
- **Next step:** step 4.3 — the showcase of the tabs and the PDF viewer against their references,
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3310-knip-findings/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3310-knip-findings/progress.md
 M knip.json
 M projects/ui-kit-v2/src/lib/components/pdf-viewer/rt-pdf-viewer.output.ts
 M projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.keys.ts
 M projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.motion.ts
?? docs/plans/kit-figma-copy-match.md
```

### Commits over the main branch

```
18e023666 chore(rt:agent-kit): таблица входов набора записана по вершине задачи RT-3310
02f51e08f docs(rt:ui-kit-v2): запись архива и находки задачи RT-3310
93f8d7821 test(rt:message-bus): тест значков панели списка без условий внутри теста
f0195779f docs(rt:ui-kit-v2): этапы 3 и 4.2 задачи RT-3310 отмечены в progress
04006e6de chore(rt:ui-kit-v2): knip — последний шаг check:all
54b3dc88f refactor(rt:ui-kit-v2): вкладки и просмотр PDF не выдают наружу то, что нужно только им
4f320a07b refactor(rt:ui-kit-v2): код без потребителя убран, export снят там, где символ нужен только своему файлу
df7fe4b33 chore(rt:ui-kit-v2): express и 15 пакетов без потребителя убраны из корня
0fe7ef500 chore(rt:ui-kit-v2): knip видит точки входа кита и знает, что дерево использует без импорта
c5689138e docs(rt:ui-kit-v2): план задачи RT-3310 одобрен владельцем
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
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
