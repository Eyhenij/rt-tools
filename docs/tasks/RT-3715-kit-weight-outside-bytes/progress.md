# Progress

## Where we stand

- **State:** `замысел-записан`
- **Stage:** 1 of 2 — Кеш значка без shareReplay
- **Done:** разбор и план, одобрен владельцем 27.11, plan-red поставил отметку.
- **Next step:** этап 1, шаг 1.1: переписать кеш значка.
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Кеш файла значка пишется на AsyncSubject, импорт shareReplay убран
- [x] 1.2 Тесты значка проходят без правок
- [x] 1.3 Порог веса кита переписан и сходится со сборкой
- [>] 2.1 Байты и gzip по файлам приложения после правки записаны в плане эпика и сравнены с остатком 13000

## Decisions along the way

- Ответ владельца 27.11 в меню вместе с первым одобрением плана: «Замерить откат». В этой задаче собирается временная
  копия без двух ленивых загрузок, и числа пишутся в план эпика. Код кита откатом не меняется.
- План переписывался до первой отправки, владелец одобрял его трижды. Причины: форма ожидаемого результата в проверке,
  две проверки, зелёные до работы, запрет линтера на подписку внутри метода и рост порога веса кита на 121 байт.

## Handover

- **Работа:** RT-3715, ветка `RT-3715-kit-weight-outside-bytes` от ветки `RT-3682-kit-weight-growth-causes`; база PR —
  она же (каскад, PR 3717).
- **Эпик:** RT-3694, задача 2 из 6.
- Разбор правил по RT-3682 лежит в `docs/plans/kit-weight-remainder-rules-review-3682.md` и ждёт слова владельца.
- Временные копии в scratchpad: `st-1cfbf35d9`, `st-cafe965b1`, `st-c315de61b`, `st-675e9c84b`, `probe-sheet`,
  `probe-icon`.
- Запас stash `rt3715-icon-cache-first-variant` (909f85dc4) — первый вариант кеша, отвергнут линтером; он не нужен.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3715-kit-weight-outside-bytes

### Where we stand at the minute of the compaction

- **State:** `замысел-записан`
- **Stage:** 1 of 2 — Кеш значка без shareReplay
- **Next step:** этап 1, шаг 1.1: переписать кеш значка.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3715-kit-weight-outside-bytes/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3715-kit-weight-outside-bytes/progress.md
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts
 M tools/kit-weight-threshold.json
```

### Commits over the main branch

```
b169ca4a2 docs(rt:ui-kit-v2): ход работы RT-3715, начат этап 1 (RT-3715)
9665bab53 docs(rt:ui-kit-v2): разбор и план RT-3715, разбор правил по RT-3682 (RT-3715)
2ff1fb39b docs(rt:ui-kit-v2): разбор папки задачи RT-3682 (RT-3682)
38550e3b0 docs(rt:ui-kit-v2): цена и отмены в ходе работы RT-3682 (RT-3682)
dfd79af0b docs(rt:ui-kit-v2): расхождение gzip в точке A названо как есть (RT-3682)
bcc3b6f30 docs(rt:ui-kit-v2): записи о весе кита после второго круга ревью (RT-3682)
2dae46730 chore(rt:agent-kit): убраны просроченные записи архива (RT-3682)
4f0ff0b41 docs(rt:ui-kit-v2): записи о весе кита после первого круга ревью (RT-3682)
1f901bd18 docs(rt:ui-kit-v2): решения по строкам веса и новые задачи эпика (RT-3682)
85d7ddfc3 docs(rt:ui-kit-v2): связи начальных кусков и ход работы RT-3682 (RT-3682)
e9abc3582 docs(rt:ui-kit-v2): возвратимые байты веса кита (RT-3682)
c1af20b54 docs(rt:ui-kit-v2): причины роста веса кита против 0.51.0 (RT-3682)
c9759e8a8 docs(rt:ui-kit-v2): веса кита по восьми состояниям и пробное приложение (RT-3682)
ad08606ed docs(rt:ui-kit-v2): ход работы RT-3682, начат этап 1 (RT-3682)
e9ea6ba53 docs(rt:ui-kit-v2): план RT-3682 — причины роста веса кита против 0.51.0 (RT-3682)
99f19f81b docs(rt:ui-kit-v2): разбор RT-3682, разбор правил по закрытию RT-3641 и назначение копии на RT-3694 (RT-3682)
1cfbf35d9 Merge remote-tracking branch 'origin/main' into RT-3694-kit-weight-remainder
73695cb8c docs(rt:ui-kit-v2): план эпика RT-3694 — остаток веса 0.52.0 и пресеты по маршруту (RT-3694)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
