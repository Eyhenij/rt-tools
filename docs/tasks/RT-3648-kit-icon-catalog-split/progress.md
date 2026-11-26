# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Описание, вес и план эпика
- **Done:** все шаги трёх этапов прошли свои проверки; смена набора проверена вживую; RT-3684 закрыта
- **Next step:** набор перед отправкой, затем разбор папки задачи и запрос на вливание
- **Uncommitted:** nothing
- **PR:** not open yet

## Steps

- [x] 1.1 Таблица пар живёт только в переходном файле, а в ките значок называют именем кита
- [x] 1.2 Переходный скрипт заменяет старые имена в коде приложения и едет в пакете
- [x] 2.1 Наборы объявляются в provideRtIcons, а реестр берёт недостающий рисунок из запасного
- [x] 2.2 Служба и директива меняют набор у уже нарисованных значков и кнопок
- [x] 2.3 Диалог, подтверждение меню и aside получают набор той части, откуда их открыли
- [x] 2.4 Витрина показывает переключение набора у всего приложения и у части страницы
- [x] 3.1 Описание поведения, документация и README называют новую систему и все ломающие переносы
- [x] 3.2 Порог переписан, а тесты кита и соседних пакетов зелёные
- [x] 3.3 Пробная сборка приложения измерена, а RT-3684 закрыта как влитая в эту задачу

## Decisions along the way

- Предупреждения о значках и наборах стали сообщениями для разработчика: в рабочей сборке приложения их тексты выпадают, выбор рисунков от этого не меняется. Так же устроены остальные предупреждения кита. С ними порог был бы 187728 байт, выше предела плана 186000; без них записано 185418 байт, gzip 46408.

- Пробная сборка показала: таблица категорий значков приезжала в любое приложение со значком, а при разборе считалось, что сборка вырежет её сама. По слову владельца «Да, убрать» правила категорий переписаны без вызовов на верхнем уровне файла. Приложение только со значком и кнопкой: 29719 → 28721 байт. Порог веса переписан: 185452 байта, gzip 46402.

- `projects/ui-kit-v2/migrations/rename-icon-names.mjs`, `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.logic.ts`, `projects/ui-kit-v2/src/lib/components/icon/stories/component/test-icon-sets.component.ts`, `projects/ui-kit-v2/src/lib/components/icon/stories/icon-sets.stories.ts` — превышение списка модулей: скрипт замены назван в плане словами, чистая логика наборов вынесена из реестра, история переключения нужна шагу 2.4.
- Новых файлов кода: 14 при бюджете 10 — превышение: к плану добавились тесты правил наборов и проверки скриптов, чистая логика наборов и история витрины.
- `projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts` исходящих 3 → 4 — превышение: панель берёт набор значков части, откуда её открыли.
- `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts` исходящих 3 → 4 — превышение: диалог берёт набор значков части, откуда его открыли.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.ts` исходящих 0 → 1 — превышение: директива проверяет имя набора службой наборов.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts` исходящих 0 → 2 — превышение: служба читает объявленные наборы из реестра и их разбор из чистой логики.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.logic.ts` исходящих 0 → 3 — превышение: разбор наборов берёт встроенные наборы, приставки символов и тип имени.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.ts` исходящих 0 → 1 — превышение: перечень набора material типизирован именами кита.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.ts` исходящих 7 → 8 — превышение: значок узнаёт свой набор у службы наборов.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon.providers.ts` исходящих 3 → 5 — превышение: настройка наборов собирается чистой логикой и отдаётся реестру.
- `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts` исходящих 4 → 5 — превышение: реестр берёт адреса и проверку файла из чистой логики наборов.

## Sessions

### 2026-11-26

- Ветка отведена от ветки RT-3678, потому что расчёт веса опирается на исправленную проверку.
- Первый план (таблица в icon/catalog) владелец не одобрил. Новое направление: одни имена, одна задача вместе с RT-3684, старые имена удаляются сразу.
- Живая проверка этапа 2, закреплённый Chrome, история `Atoms/Icon/IconSet`: play-тест прошёл. В конце приложение рисует `#rt-icon-cog` и `#rt-icon-trash`, часть — `#rt-icon-material-cog` и `#rt-icon-material-trash`. Ручное переключение: «Все: material» меняет значок и кнопку приложения и части, переключатель части возвращает ей `kit`. Символы есть в спрайте, значки 20×20 и 16×16, у material линии заметно жирнее. Файлов значков запрошено 4: по одному на `cog` и `trash` из `kit` и `material`, повторов нет.
- Роль, проверявшая первый план, запустила `fetch-material-icons.mjs --help`: скрипт не разбирает ключи и перезаписал рисунки. Правки отложены в stash `rt3648-accidental-material-redownload`.

- Первый круг ревью. Исправлено: значок кнопки `rt-speed-menu` по умолчанию под `font`; общий символ залитого и контурного рисунка; ответ 200 со страницей вместо файла не вёл в запасной набор; aside с `injector` вне фокуса части и без входа `iconSet`; скрипт замены менял теги со своим `font`; проверка имён не ловила пару от имени кита; README, описание и план эпика. Сценарии 1888–1891. После правок: 4445 тестов кита, линтер и knip зелёные, вес 185750.
- Не исправлено, потому что так решено планом: открытое окно набора не меняет; шаблон вне части берёт набор по месту объявления (то же для `ng-content`) — записано в описании; признак material сильнее `default`. Вес не вернулся к 0.51.0: это задача эпика, остаток записан в плане эпика.

- Второй круг ревью. Исправлено: кнопка, перерисованная во время загрузки нового набора, теряла значок; aside, открытый из `effect`, открывался снова на смене набора части; пустой и незнакомый `iconSet` окна; меню вкладки у точки нажатия не брало набор части; SVG с расширенным `DOCTYPE` считался отказом; скрипт замены пропускал атрибуты без кавычек; `zoom_in` в примере и витрине `speed-menu`; в README — `info`, что видно без замены имён и пример `provideRtIcons`; устаревшие пометки в плане эпика. Сценарии 1892–1894 краснеют без исправлений. `.storybook/main.ts` назван в плане, но менять его код не понадобилось: переписан только комментарий о двух наборах. Вес 185830.
- Не исправлено по решению плана: открытое окно набора не меняет; диалог берёт часть по фокусу (ограничение Safari названо в README); `default` слабее признака material. Не сделано: часть `button` вне набора проверки веса — это отдельное решение о проверке.

- Ветка эпика с влитой RT-3678 взята в ветку, файлы от этого не изменились. В настройках четырёх приложений поменялся вызов `provideRtIcons`, поэтому добавлены сквозные тесты SC-MB-459 и SC-AUTH-122: у каждого значка на экране есть символ в спрайте. Оба набора зелёные.

- Первый набор перед отправкой был красным в трёх местах. README кита вышел за предел длины: разделы о наборах значков и о переходе с первого кита перенесены в `projects/ui-kit-v2/ICONS.md`, файл добавлен в состав пакета. Шаблон обёртки витрины вынесен в свой файл. В angular-doctor убрана лишняя копия в разборе наборов и добавлены тесты службы наборов; порог поднят на одну обёртку витрины `test-icon-sets`, как у прежних обёрток. Вес стал 185800 байт, порог и план эпика переписаны.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3648-kit-icon-catalog-split

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Описание, вес и план эпика
- **Next step:** второй круг ревью
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3648-kit-icon-catalog-split/progress.md`; the plan lies next to it.

### Uncommitted

```
M  docs/plans/kit-presets-by-demand.md
M  docs/specs/ui-kit-v2/icon-material-names/implementation.md
M  docs/specs/ui-kit-v2/icon-material-names/scenarios.md
M  docs/specs/ui-kit-v2/icon-material-names/spec.md
M  docs/tasks/RT-3648-kit-icon-catalog-split/progress.md
M  projects/ui-kit-v2/.storybook/main.ts
M  projects/ui-kit-v2/README.md
M  projects/ui-kit-v2/migrations/rename-icon-names.mjs
M  projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts
M  projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts
M  projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-icon-set.spec.ts
M  projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts
M  projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.spec.ts
M  projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts
M  projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.logic.ts
M  projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts
M  projects/ui-kit-v2/src/lib/components/speed-menu/Overview.mdx
M  projects/ui-kit-v2/src/lib/components/speed-menu/stories/component/test-speed-menu.component.ts
M  projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu.component.html
M  projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu.component.ts
```

### Commits over the main branch

```
d6f07dc43 docs(rt:ui-kit-v2): расхождения с планом по новым файлам и связям названы с причинами (RT-3648)
ccfe5b904 fix(rt:ui-kit-v2): значки и наборы после первого круга ревью (RT-3648)
79dd4c8c3 fix(rt:ui-kit-v2): таблица категорий значков не приезжает в приложение без неё (RT-3648)
fc1470343 docs(rt:ui-kit-v2): результаты пробной сборки приложения записаны в план эпика (RT-3648)
e4a084a7e fix(rt:ui-kit-v2): предупреждения о наборах значков остаются разработчику, порог веса переписан (RT-3648)
c1f529f24 docs(rt:ui-kit-v2): описание единых имён значков и наборов, ломающие переносы названы (RT-3648)
584c7d387 feat(rt:ui-kit-v2): витрина показывает смену набора значков на ходу (RT-3648)
3eceb5295 feat(rt:ui-kit-v2): окна и панели получают набор значков той части, откуда их открыли (RT-3648)
4214d73d8 feat(rt:ui-kit-v2): набор значков меняется на ходу у приложения и у части страницы (RT-3648)
3edfc6ab5 feat(rt:ui-kit-v2): наборы значков объявляются данными, недостающий рисунок берётся из запасного (RT-3648)
29f81b7a7 feat(rt:ui-kit-v2): переходный скрипт имён значков и проверка наборов (RT-3648)
0e1917d6a feat(rt:ui-kit-v2): значки в ките называются только именами кита, перевода старых имён нет (RT-3648)
f75dbe5ef docs(rt:ui-kit-v2): одобренный план RT-3648 — единые имена значков и смена наборов на ходу (RT-3648)
f3a282469 docs(rt:ui-kit-v2): разбор RT-3648 — слово владельца о переписи логики значков и расчёт таблицы (RT-3648)
2ffd21bc6 docs(rt:ui-kit-v2): разбор правил по RT-3646 ждёт слова владельца (RT-3678)
89dfeae31 docs(rt:ui-kit-v2): решения после пересчёта веса и разбор правил по RT-3678 (RT-3678)
9acb30cda docs(rt:ui-kit-v2): папка задачи RT-3678 разобрана в архивную запись (RT-3678)
568562c94 docs(rt:ui-kit-v2): план эпика после второго круга ревью (RT-3678)
a88fb6f4b fix(rt:ui-kit-v2): проверка веса после первого круга ревью (RT-3678)
cd60580e7 docs(rt:ui-kit-v2): пересчитанный вес кита записан в план эпика, этап RT-3678 закрыт (RT-3678)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
