# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The list draws the kit's page strip
- **Done:** `rt-pagination` draws the first kit's strip in the material preset through `--rt-pagination-*`
- **Next step:** the list draws `rt-pagination`
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Give `rt-pagination` its own properties for the page box, the current page, the arrows, the range label and the page size field, defaults equal to today's values
- [x] 1.2 Give the material preset `--rt-pagination-*` values measured from the first kit
- [x] 1.3 Show the pair of presets in the page strip's stories
- [>] 2.1 Put `rt-pagination` into the list in place of its own strip, with the list's page sizes and the first kit's page after a size change
- [ ] 2.2 Remove `rt-data-list-pagination` with its spec and the logic nothing calls any more
- [ ] 2.3 Move the list's specs to the kit strip's anchors
- [ ] 3.1 Look at the diverged frames and re-take them in the image
- [x] 3.2 Move the page strip from «out of scope» to the rules of the spec, with its binding
- [>] 3.3 Open the PR into RT-2330 as a draft

## Decisions along the way

- **The page numbers follow the kit's rule, not the first kit's.** The kit shows the first, the last and the neighbours of the open page; the first kit showed all of them up to six. The owner asked the table to use the kit's components. Affected stage: 2.

- **The page strip's stories already show the pair of presets.** `Presets` existed, so step 1.3 needed no new story. Affected stage: 1.
- **The page size label no longer wraps in both presets.** «На странице:» broke into two lines in a narrow strip. Affected stage: 1.

## Sessions

### 2026-09-24

- The epic took main: the side-menu conflict resolved, eleven first-kit frames re-taken, the changelog split, ten archive records pruned. RT-2330 took the epic.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2332-data-list-pagination-kit

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The list draws the kit's page strip
- **Next step:** the list draws `rt-pagination`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2332-data-list-pagination-kit/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/table-full-port/implementation.md
 M docs/specs/ui-kit-v2/table-full-port/scenarios.md
 M docs/specs/ui-kit-v2/table-full-port/spec.md
 M projects/ui-kit-v2/.storybook/showcase-labels.ru.ts
 M projects/ui-kit-v2/src/lib/components/data-list/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/data-list/index.ts
D  projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.html
D  projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.scss
D  projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.spec.ts
D  projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.ts
 M projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts
 M projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.html
 M projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts
 M projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.html
 M projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.ts
 M projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts
 M projects/ui-kit-v2/src/styles/_semantic.scss
 M projects/ui-kit-v2/src/styles/tokens.light-forms.mjs
 M projects/ui-kit-v2/src/styles/tokens.source.mjs
```

### Commits over the main branch

```
2458fc629 feat(rt:ui-kit-v2): полоса страниц кита рисует полосу первого кита в материальном наборе
c98eebfc3 docs: папка задачи RT-2332 заведена, план записан
7d11f5c6f Merge branch 'RT-1870-one-kit' into RT-2330-data-list-table-kit-one-look-rest
d9df65753 chore: журнал первого кита разделён по длине, записи архива старше недели убраны
e4826f002 Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
e35aadcb7 Merge remote-tracking branch 'origin/RT-1870-one-kit' into RT-2330-data-list-table-kit-one-look-rest
2a588b8f9 docs(rt:ui-kit-v2): круглые кнопки над таблицей вошли в договорённость о виде первого кита
45d64c545 fix(rt:ui-kit-v2): ручка цвета подписи флажка названа по образцу второго кита
c6373f7cd test(rt:ui-kit-v2): эталоны флажка, переключателя и списка первого кита сняты заново
f7ab97d8e fix(rt:ui-kit-v2): кнопки панели списка первого кита круглые с подъёмом, флажок в шрифте окружения
c9f144bba fix(rt:ui-kit-v2): включённый переключатель материального набора в цвете темы
ab759a04e [RT-2324] Панель колонок, темы, значки и вид поля таблицы второго кита — по первому киту (#2328)
3d817589b refactor(rt:ui-kit-v2): шаблон обёртки списка первого кита в своём файле
83db0aa2c fix(rt:ui-kit-v2): значки колонок в историях списка первого кита из набора кита
85756a751 feat(rt:ui-kit-v2): значок почты в материальном наборе и проверки перед отправкой
29a993788 feat(rt:ui-kit-v2): значки материального набора толщиной 700 и залитые, как у первого кита
a51ca771a refactor(rt:ui-kit-v2): раздел витрины таблицы первого кита назван Material Dynamic List
37dcac4df fix(rt:ui-kit-v2): тянутая колонка в панели настройки держит вид плашки
381712876 fix(rt:ui-kit-v2): имя заливки плашки панели колонок укорочено до item-bg
7f099f619 feat(rt:ui-kit-v2): панель колонок таблицы первого кита в его виде
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
