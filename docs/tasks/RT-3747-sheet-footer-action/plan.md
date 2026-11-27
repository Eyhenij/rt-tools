# Plan

**Task:** RT-3747 · **Branch:** RT-3747-sheet-footer-action
**Spec:** `docs/specs/ui-kit-v2/sheet-header-cards/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** у `rt-bottom-sheet` одно место для кнопок справа в шапке (`[sheetAction]`) и подвал-строка
  (`[sheetFooter]` или свой шаблон подвала); главной кнопке на всю ширину и справке над ней места нет.
- **This task reaches:** у шторки есть подвал главного действия — кнопка на всю ширину, справка над
  ней по центру — и место справа в шапке держит несколько круглых кнопок-значков с зазором 8. Ни один
  потребитель кита вида не меняет: на новые места их переводят RT-3748 и RT-3749.
- **Sign:** истории `Organisms/Aside/BottomSheet` «Главное действие в подвале» и «Значки в шапке» в
  витрине на ширине 375 совпадают с кадрами макета 8736:1906 и 8736:1990 по числам
  (`node tools/kit-match.mjs numbers`), владелец одобрил витрину.
- **Milestone G of the epic:** все правки эпика RT-3746 влиты в главную ветку и готовы к выпуску кита.
- **Metric:** нет: новая возможность шторки, не правка правила или проверки.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:sheetPrimary` — место главной кнопки в подвале, вне выбора между своим шаблоном подвала и `[sheetFooter]`; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:sheetInfo` — место справки над ней; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.scss:&__primary` и `:&__info` — их раскладка и порядок; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.scss:&__action` — зазор кнопок шапки |
| Dependencies | новых направлений нет: места — разметка и стили самой шторки |
| Coupling | `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts` исходящих 8 → 8: класс не меняется |
| Patterns | Проекция содержимого по селектору — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:sheetAction`, тот же приём для двух новых мест; отброшено: вход-шаблон — шаблоны у шторки заменяют шапку и подвал целиком, а здесь нужно место рядом с ними |
| Terms | «главное действие шторки» — кнопка подвала на всю ширину; «справка подвала» — строка над ней по центру; «кнопки-значки шапки» — `rt-icon-button` `variant="secondary"` `radius="full"` шага `md`, как «×»; определены в спеке `sheet-header-cards` этой задачей |
| Input | разметка потребителя: узел `sheetPrimary`, узел `sheetInfo`, оба, ни одного; вместе с `[sheetFooter]`, своим шаблоном подвала или узлом подвала асайда. Порядок в подвале: справка, затем узлы подвала потребителя и асайда, главная кнопка последней (`order`). Ни одного узла — подвал спрятан, как сейчас. Сценарии SC-UKV-1923…1926, `rt-bottom-sheet-footer-action.spec.ts` |
| Bounds | `[sheetAction]`, `[sheetFooter]`, `rtSheetHeader`, `rtSheetFooter` и вид всех шторок кита не меняются; правило спеки «The action of a sheet stands on the right of its header» остаётся до RT-3748 |
| Priority | вид существующих потребителей выше новой раскладки: место, ломающее прежний подвал, правится в пользу прежнего вида |
| Budget | `rt-bottom-sheet.component.html` плюс 8, `.scss` плюс 40, новый спек до 140 строк, истории плюс 80; новых файлов кода: 0, новых зависимостей: 0 |

## Task footprint

| What             | Where                                                 |
| ---------------- | ----------------------------------------------------- |
| Specs (правится) | `docs/specs/ui-kit-v2/sheet-header-cards/`            |
| Laws             | `docs/constitution/mockups.md`                        |
| Rules            | `.claude/skills/kit-approval/`                        |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/bottom-sheet/` |
| Code (правится)  | `tools/kit-weight-threshold.json`                     |

## What counts as done

- У шторки есть места `[sheetPrimary]` и `[sheetInfo]`: кнопка на всю ширину подвала, справка над ней
  по центру; они видны и рядом со своим шаблоном подвала; подвал без узлов спрятан, как сейчас.
- Место справа в шапке держит несколько кнопок-значков с зазором 8, заголовок остаётся по центру.
- Истории витрины совпадают с кадрами макета по числам, прежние шторки не сдвинулись, владелец одобрил
  витрину.

## Stages

### 1. Места шторки

- **Steps:**
    1. Места `[sheetInfo]` и `[sheetPrimary]` в подвале шторки вне выбора своего шаблона и зазор места шапки
       Check: `grep -c 'select="\[sheetPrimary\]"\|select="\[sheetInfo\]"' projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html` → = 2
    2. Тесты мест: кнопка и справка в подвале, рядом со своим шаблоном подвала, порядок узлов, подвал без узлов спрятан
       Check: `test -f projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-footer-action.spec.ts && pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testPathPatterns=rt-bottom-sheet-footer-action` → exit 0
    3. Описание шторки `CONTEXT.md` — новые места
       Check: `grep -c sheetPrimary projects/ui-kit-v2/src/lib/components/bottom-sheet/CONTEXT.md` → >= 1
- **Readiness sign:** тесты шторки зелёные, описание называет места.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testPathPatterns=bottom-sheet` — выход 0.

### 2. Спека

- **Steps:**
    1. Правило о местах подвала и кнопках-значках шапки, сценарии SC-UKV-1923…1926, строки `implementation.md`
       Check: `node tools/check-specs.mjs && grep -c '^### SC-UKV-192[3-6]' docs/specs/ui-kit-v2/sheet-header-cards/scenarios.md` → = 4
- **Readiness sign:** спека называет новые места и вид кнопок-значков, сценарии связаны с тестами.
- **Verified by:** `node tools/check-specs.mjs` — выход 0.

### 3. Витрина и сверка с макетом

- **Steps:**
    1. Истории «Главное действие в подвале» и «Значки в шапке» в `Organisms/Aside/BottomSheet`
       Check: `grep -c 'export const' projects/ui-kit-v2/src/lib/components/bottom-sheet/stories/bottom-sheet.stories.ts` → = 3
    2. Замер историй на ширине 375 против кадров 8736:1906 и 8736:1990
       Check: `node tools/kit-match.mjs numbers docs/tasks/RT-3747-sheet-footer-action/match/figma.json docs/tasks/RT-3747-sheet-footer-action/match/showcase.json` → exit 0
    3. Шторки отборов страницы, даты и асайда до и после — без сдвига
       Check: `node tools/kit-match.mjs numbers docs/tasks/RT-3747-sheet-footer-action/match/before.json docs/tasks/RT-3747-sheet-footer-action/match/after.json` → exit 0
    4. Снимки новых историй
       Check: `test -s projects/ui-kit-v2/.storybook/__snapshots__/organisms-aside-bottomsheet--footer-action.png && test -s projects/ui-kit-v2/.storybook/__snapshots__/organisms-aside-bottomsheet--header-icons.png` → exit 0
- **Readiness sign:** числа совпали, прежние шторки не сдвинулись, снимки сняты, витрина показана
  владельцу.
- **Verified by:** `node tools/kit-match.mjs numbers` — все числа равны.

## What this work does not do

- Поля кита — период, дата и время, выбор нескольких, динамический выбор, отборы страницы — на новые
  места не переходят: RT-3748. Там же входы `rtPopoverSheetPrimary` и `rtPopoverSheetInfo` у шторки
  панели выбора, её нижний отступ при подвале и правило спеки о действии в шапке.
- Асайд-шторка: RT-3749.
