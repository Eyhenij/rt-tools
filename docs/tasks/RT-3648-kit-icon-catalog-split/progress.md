# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Набор значков объявляется данными и меняется на ходу
- **Done:** этап 1 и шаги 2.1–2.3 прошли свои проверки
- **Next step:** шаг 2.4: история витрины с переключением набора и play-тестом SC-UKV-1887
- **Uncommitted:** nothing
- **PR:** not open yet

## Steps

- [x] 1.1 Таблица пар живёт только в переходном файле, а в ките значок называют именем кита
- [x] 1.2 Переходный скрипт заменяет старые имена в коде приложения и едет в пакете
- [x] 2.1 Наборы объявляются в provideRtIcons, а реестр берёт недостающий рисунок из запасного
- [x] 2.2 Служба и директива меняют набор у уже нарисованных значков и кнопок
- [x] 2.3 Диалог, подтверждение меню и aside получают набор той части, откуда их открыли
- [>] 2.4 Витрина показывает переключение набора у всего приложения и у части страницы
- [ ] 3.1 Описание поведения, документация и README называют новую систему и все ломающие переносы
- [ ] 3.2 Порог переписан, а тесты кита и соседних пакетов зелёные
- [ ] 3.3 Пробная сборка приложения измерена, а RT-3684 закрыта как влитая в эту задачу

## Decisions along the way

## Sessions

### 2026-11-26

- Ветка отведена от ветки RT-3678, потому что расчёт веса опирается на исправленную проверку.
- Первый план (таблица в icon/catalog) владелец не одобрил. Новое направление: одни имена, одна задача вместе с RT-3684, старые имена удаляются сразу.
- Роль, проверявшая первый план, запустила `fetch-material-icons.mjs --help`: скрипт не разбирает ключи и перезаписал рисунки. Правки отложены в stash `rt3648-accidental-material-redownload`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3648-kit-icon-catalog-split

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Имена значков одни, таблица пар уходит из кита
- **Next step:** шаг 1.2: переходный скрипт, загрузчик рисунков и проверка таблицы с тестами
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3648-kit-icon-catalog-split/progress.md`; the plan lies next to it.

### Uncommitted

```
?? projects/ui-kit-v2/migrations/rename-icon-names.mjs
?? tools/tests/rename-icon-names.test.sh
```

### Commits over the main branch

```
0e1917d6a feat(rt:ui-kit-v2): значки в ките называются только именами кита, перевода старых имён нет (RT-3648)
f75dbe5ef docs(rt:ui-kit-v2): одобренный план RT-3648 — единые имена значков и смена наборов на ходу (RT-3648)
f3a282469 docs(rt:ui-kit-v2): разбор RT-3648 — слово владельца о переписи логики значков и расчёт таблицы (RT-3648)
2ffd21bc6 docs(rt:ui-kit-v2): разбор правил по RT-3646 ждёт слова владельца (RT-3678)
89dfeae31 docs(rt:ui-kit-v2): решения после пересчёта веса и разбор правил по RT-3678 (RT-3678)
9acb30cda docs(rt:ui-kit-v2): папка задачи RT-3678 разобрана в архивную запись (RT-3678)
568562c94 docs(rt:ui-kit-v2): план эпика после второго круга ревью (RT-3678)
a88fb6f4b fix(rt:ui-kit-v2): проверка веса после первого круга ревью (RT-3678)
cd60580e7 docs(rt:ui-kit-v2): пересчитанный вес кита записан в план эпика, этап RT-3678 закрыт (RT-3678)
652b85fb2 fix(rt:ui-kit-v2): проверка веса связывает файлы кита, как сборка приложения, и не считает стили дважды (RT-3678)
8a9863aab docs(rt:ui-kit-v2): папка задачи RT-3678 — разбор и одобренный план проверки веса без двойного счёта (RT-3678)
eda38f37f Merge branch 'RT-3641-kit-presets-by-demand' of origin with main
675e9c84b [RT-3646] Кит: диалог подтверждения menu грузится при первом подтверждении (#3677)
7895f6128 Merge branch 'main' into RT-3641-kit-presets-by-demand
b44d9471b docs(rt:ui-kit-v2): папка задачи RT-3646 разобрана в архивную запись (RT-3646)
73da63330 chore(rt:ui-kit-v2): порог веса пересчитан после слияния ветки эпика (RT-3646)
0aeabe577 Merge branch 'RT-3641-kit-presets-by-demand' into RT-3646-kit-menu-lazy-confirm
c315de61b [RT-3645] Кит: нижний лист popover грузится при первом открытии (#3669)
b70047846 chore(rt:ui-kit-v2): порог веса пересчитан после правок второго круга (RT-3646)
4263e9907 fix(rt:ui-kit-v2): диалог подтверждения меню после второго круга ревью (RT-3646)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
