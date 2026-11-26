# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Описание, вес и план эпика
- **Done:** все шаги трёх этапов прошли свои проверки; смена набора проверена вживую; RT-3684 закрыта
- **Next step:** решение о категориях значков, живая проверка и два круга ревью
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

## Sessions

### 2026-11-26

- Ветка отведена от ветки RT-3678, потому что расчёт веса опирается на исправленную проверку.
- Первый план (таблица в icon/catalog) владелец не одобрил. Новое направление: одни имена, одна задача вместе с RT-3684, старые имена удаляются сразу.
- Живая проверка этапа 2, закреплённый Chrome, история `Atoms/Icon/IconSet`: play-тест прошёл. В конце приложение рисует `#rt-icon-cog` и `#rt-icon-trash`, часть — `#rt-icon-material-cog` и `#rt-icon-material-trash`. Ручное переключение: «Все: material» меняет значок и кнопку приложения и части, переключатель части возвращает ей `kit`. Символы есть в спрайте, значки 20×20 и 16×16, у material линии заметно жирнее. Файлов значков запрошено 4: по одному на `cog` и `trash` из `kit` и `material`, повторов нет.
- Роль, проверявшая первый план, запустила `fetch-material-icons.mjs --help`: скрипт не разбирает ключи и перезаписал рисунки. Правки отложены в stash `rt3648-accidental-material-redownload`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3648-kit-icon-catalog-split

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Описание, вес и план эпика
- **Next step:** шаг 3.2: порог веса, сборки приложений, тесты кита и соседних пакетов
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3648-kit-icon-catalog-split/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/icon-material-names/spec.md
 M projects/ui-kit-v2/README.md
 M projects/ui-kit-v2/src/lib/components/icon/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.logic.ts
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon.providers.ts
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts
 M tools/kit-weight-threshold.json
```

### Commits over the main branch

```
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
652b85fb2 fix(rt:ui-kit-v2): проверка веса связывает файлы кита, как сборка приложения, и не считает стили дважды (RT-3678)
8a9863aab docs(rt:ui-kit-v2): папка задачи RT-3678 — разбор и одобренный план проверки веса без двойного счёта (RT-3678)
eda38f37f Merge branch 'RT-3641-kit-presets-by-demand' of origin with main
675e9c84b [RT-3646] Кит: диалог подтверждения menu грузится при первом подтверждении (#3677)
7895f6128 Merge branch 'main' into RT-3641-kit-presets-by-demand
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
