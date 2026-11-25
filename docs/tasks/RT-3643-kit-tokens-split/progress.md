# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 1 of 1 — Раздельная поставка токенов
- **Done:** скрипт разрезания, разбиение входного файла и экспорты написаны в рабочей копии, не закоммичены
- **Next step:** план прошёл product-strategist и goal-critic (три круга, низкие замечания списаны); получить одобрение владельца, прогнать plan-red при убранном коде, затем сценарии, спека и порог
- **Uncommitted:** `_index.scss`, `_index-head.scss`, `_index-tail.scss`, `tools/build-tokens-split.mjs`, правки `package.json`, `projects/ui-kit-v2/package.json`, порог веса
- **PR:** not open yet

## Steps

- [x] 1.1 Входной файл стилей режется на голову, местный кусок темы и хвост
- [x] 1.2 Скрипт режет полный файл на базу и местные куски
- [x] 1.3 Сценарии проверяют состав обоих файлов, порядок, повтор плотности в конце местных кусков, отказ при испорченном входе и размер полного файла
- [x] 1.4 Порог веса знает новые файлы
- [x] 1.5 Пакет экспортирует новые файлы
- [x] 1.6 Спека и её сценарии описывают порядок подключения и кому нужен местный кусок
- [x] 1.7 README называет, кому нужен `tokens.scope.css`

## Decisions along the way

- **В базу копируется правило корня с набором Material и тёмной темой.** Ревью показало: это самое частое сочетание, оно выигрывает весом, а не местом, и без копии база его молча теряла. База стала 163241 байт вместо 158996, облегчение 456707 байт, обе части вместе на 8135 байт больше полного файла. Числа плана (159 КБ, 460952, 3890) устарели, план после записи не правится. Affected stage of the plan: 1.
- **Режутся два файла, а не три** — набор Material весит около 23 КБ и остаётся в базе; тяжелы местные куски темы. Affected stage of the plan: 1.

## Sessions

### 2026-11-25

- Полный `tokens.css` побайтно равен пакету 0.52.0 после разбиения входного файла: 619948 байт.
- База 158996 байт, местные куски вместе с плотностью 464842 байта.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3643-kit-tokens-split

### Where we stand at the minute of the compaction

- **State:** `договорённость-записана`
- **Stage:** 1 of 1 — Раздельная поставка токенов
- **Next step:** показать план ролям и владельцу, прогнать plan-red при убранном коде, затем сценарии, спека и порог
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3643-kit-tokens-split/progress.md`; the plan lies next to it.

### Uncommitted

```
 M package.json
 M projects/ui-kit-v2/package.json
 M projects/ui-kit-v2/src/styles/_index.scss
 M tools/kit-weight-threshold.json
?? projects/ui-kit-v2/src/styles/_index-head.scss
?? projects/ui-kit-v2/src/styles/_index-tail.scss
?? tools/build-tokens-split.mjs
```

### Commits over the main branch

```
258840658 docs(rt:ui-kit-v2): папка задачи RT-3643 — разбор, план и ход работы раздельной поставки токенов (RT-3643)
4c072a489 docs(rt:ui-kit-v2): папка задачи RT-3642 разобрана в архивную запись (RT-3642)
b431b0eaf [RT-3642] Кит: сторож веса частей и стилей на старте потребителя (#3653)
c7ad09619 fix(rt:ui-kit-v2): сторож веса берёт esbuild из @angular/build, свой пакет не заводится (RT-3642)
f5a01531e ci(rt:ui-kit-v2): шаг конвейера «Kit weight» объявлен в наборе перед пушем (RT-3642)
639780d9f docs(rt:ui-kit-v2): ход работы RT-3642 — шаги отмечены, ревью пройдены (RT-3642)
bad589716 docs(rt:ui-kit-v2): ход работы RT-3642 — последний шаг идёт (RT-3642)
123727072 fix(rt:ui-kit-v2): сторож веса кита после второго круга ревью (RT-3642)
b302568d1 fix(rt:ui-kit-v2): сторож веса кита после первого круга ревью (RT-3642)
2085367c2 feat(rt:ui-kit-v2): проверка веса частей кита на старте потребителя и файлов токенов (RT-3642)
8be9e5588 docs(rt:ui-kit-v2): папка задачи RT-3642 — разбор, план и ход работы сторожа веса кита (RT-3642)
5db648502 docs(rt:ui-kit-v2): план эпика RT-3641 — пресеты и темы кита по требованию, вес под контролем
dfa7fea71 chore(rt:docs): истёкшие записи архива удалены (RT-3641)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
