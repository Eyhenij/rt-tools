# Grill

## The owner request

The work came from the session of a consumer application, not from the owner directly. Its order,
verbatim except the consumer's name and task numbers, replaced by «[приложение]» and «[задача]»: the
kits never name their consumers.

> Задача кита для [приложение] [задача]: на узком экране фильтры списка прячутся за кнопку, кнопка
> открывает панель фильтров. Заведи задачу RT по правилам этого репозитория и ветку под неё.
>
> Макет одобрен владельцем 30.10.2026 словами «Одобряю (Рекомендую)». Кадры в библиотеке RT-Tools DS
> (`vyV42sJXccfKNG8yFSCpSL`):
>
> - панель: node-id 7349-4846 «Телефон · Aside · фильтры». Шапка `Aside Header` с заголовком
>   «Фильтры», стрелкой назад, без надзаголовка и без «actions». Под ней поля Select «Статус» и
>   «Оплата». Подвал `Aside Footer` вида between: «Сбросить» и «Применить»;
> - полоса инструментов: node-id 7349-5090 «Телефон · Toolbar · фильтры за кнопкой», ширина 375.
>   Кнопка фильтров — Icon Button со значком filter и свойством Indicator: включённый фильтр показан
>   точкой в углу значка. Точка не обрезается рамками полосы.
>
> Порядок — правило `kit-approval` этого репозитория: одобрение макета в файл одобрений; найти в
> ките, что уже есть, и собрать из готового; истории витрины на каждое состояние — фильтр выключен,
> фильтр включён с точкой, панель открыта; сверка витрины с кадрами `tools/kit-match.mjs`; адрес
> витрины и итог сверки владельцу, вопрос об одобрении витрины; после второго одобрения пуш, PR,
> слияние и выпуск — только по слову владельца о каждом.
>
> Готово, когда выпущена версия кита с кнопкой и панелью фильтров. Её номер нужно прислать обратно:
> [приложение] поднимет кит до неё в задачах [задача] и [задача].

## What the tree already has

- `rt-toolbar` with three template slots; on a narrow screen its left slot flows into a column
  (`projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md`).
- `rt-icon-button` with the input `indicator` — a dot top-right, modifier
  `rt-icon-button--has-indicator`, element `__indicator`
  (`projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.ts:225`).
- `rt-aside` with `header/` and `footer/` components; the header has `title`, `overline`,
  `subtitle`, `closable` (`projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.ts:88`).
- No open RT epic covers phone list filters: RT-2860 is about one filter logic for the tables.

## What the rules already say

- `kit-approval`: mockup approval first, then the code and every state in the showcase, a match
  of numbers N of N, a second approval of the showcase; push, PR and release only after both.
- `git-workflow`: work outside an epic only by the owner's word about that work.

## Questions and answers

**Задача кита RT для [задача] (фильтры за кнопкой на узком экране): открытого эпика RT под неё нет —
RT-2860 про единый фильтр таблиц, не про телефон. Заводить её вне эпика, как RT-3000 и RT-2987?**
Options: «Да, вне эпика (Рекомендую)», «Под эпик RT-2860». The owner chose: «Да, вне эпика (Рекомендую)».

The mockup questions were asked in the consumer's session; the owner approved the frames there:
«Одобряю (Рекомендую)».

## Decisions

- **The other questions of the start are closed by the order itself.** Behaviour of the kit changes
  (a new narrow-screen state); one task; not part of it — the consumer's screens and its own
  upgrade of the kit; closed when a kit version with the button and the panel is released; the sample is the
  approved frames 7349-4846 and 7349-5090.
- **A separate working copy `rt-filters-mobile`.** The main copy stands on RT-3000 with its
  uncommitted files, and the order says not to touch RT-3000.

- **The title of `rt-aside-header` stands on one line with the back arrow.** The consumer's
  session changed the Figma component Aside Header (4658:3234) by the owner's word «Исправь макет и
  компонент (Рекомендую)»: the heading block got a minimal height of 32, bound to the back button
  size, and its content is centred vertically; without an overline the middle of the title and of
  the arrow are both at 40 from the top of the header. Frame 7349-4846 uses this component now. The
  code does the same: the heading block of `rt-aside-header` gets `min-height` equal to the back
  button size and centres its content vertically; the match goes by the new frame.

## What is left unclear

- Whether the kit gets a ready-made wrapper or only the showcase composition of ready parts —
  decided by the exploration of the kit, written in the plan.
