# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Обёртки витрины и порог
- **Done:** план одобрен словом «Одобряю plan.md RT-3483», plan-red: 1.1 → 92, 1.2 → 12, 1.3 → 102
- **Next step:** матрицы просмотрщиков, обёртки меню, комментарии без декоратора
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Кнопки витрины с типом, шаблоны обёрток без геттеров
- [x] 1.2 У каждой обёртки витрины свой файл и шаблон, комментарии без декоратора; тесты кита и правил линтера зелёные
- [>] 1.3 Проверка Angular Doctor зелёная на новом пороге, другие правила не выросли, наборы проверок дерева зелёные

## Decisions along the way

## Sessions

### 23.11.2026

- Задача 7 эпика (RT-3482) вынесена в эпик RT-3522, шаблоны гибридных деревьев — в эпик RT-3524:
  «не делай больших изменений в этом эпике, выноси в новый эпик».
- Ревью плана: проверки шагов считают находки по выводу инструмента, а не по порогу; матрицы —
  по одному компоненту случая, чтобы разбиение не дало новых `component-file-set-mismatch`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3483-ngdoctor-showcase-wrappers

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Обёртки витрины и порог
- **Next step:** матрицы просмотрщиков, обёртки меню, комментарии без декоратора
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3483-ngdoctor-showcase-wrappers/progress.md`; the plan lies next to it.

### Uncommitted

```
 M aside/rt-aside.tokens.ts
 M dialog/rt-dialog.tokens.ts
 M pdf-viewer/stories/component/test-pdf-viewer-case.component.html
 M pdf-viewer/stories/component/test-pdf-viewer-matrix.component.ts
 M radius/rt-radius.directive.ts
 M ../../../../../tools/eslint-rules/rules/require-host-bem-block.ts
?? pdf-viewer/stories/component/test-pdf-viewer-case.component.ts
```

### Commits over the main branch

```
37b74a66c chore(rt:ui-kit-v2): кнопки витрины с типом, обёртки без геттеров в шаблоне (RT-3483)
0d2d5fb21 docs(rt:ui-kit-v2): прогресс RT-3483 отмечает текущий шаг (RT-3483)
1dd02c591 docs(rt:ui-kit-v2): прогресс RT-3483 — план одобрен, этап начат (RT-3483)
e6810de7a docs(rt:ui-kit-v2): план RT-3483 — кнопки, геттеры и файлы обёрток витрины (RT-3483)
2b02ff25b docs(rt:ui-kit-v2): разбор RT-3483 — кнопки, геттеры и файлы обёрток витрины (RT-3483)
c8e319ff6 docs(rt:ui-kit-v2): задача RT-3482 вынесена в эпик RT-3522, находки ревью правил по RT-3518 (RT-3483)
0d48ab8a7 docs(rt:ui-kit-v2): согласие владельца «без вида» в архивной записи RT-3518 (RT-3518)
c862eb514 docs(rt:ui-kit-v2): папка задачи RT-3518 разобрана в архивную запись (RT-3518)
2769420d1 Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3518-ngdoctor-oxlint-tree-run
993fd3b1b chore(rt:ui-kit-v2): правки после второго круга ревью (RT-3518)
b6f8745d3 chore(rt:ui-kit-v2): правки после первого круга ревью (RT-3518)
806cbf689 chore(rt:ui-kit-v2): проверка Angular Doctor проходит по файлам дерева после скана (RT-3518)
c03071132 docs(rt:ui-kit-v2): прогресс RT-3518 — план одобрен, этап начат (RT-3518)
6935b99db docs(rt:ui-kit-v2): находки ревью правил по RT-3514 рядом с планом эпика (RT-3518)
188d9528f docs(rt:ui-kit-v2): план RT-3518 — проход Angular Doctor по файлам дерева (RT-3518)
c9d8cbdb4 [RT-3514] Проверка Angular Doctor краснеет, когда источник находок замолчал (#3520)
537cecc11 docs(rt:ui-kit-v2): разбор RT-3518 — проверка Angular Doctor видит потерянный файл дерева (RT-3518)
0b41d644d test(rt:ui-kit-v2): сценарии образца не зависят от локали (RT-3514)
bd497a1e1 docs(rt:ui-kit-v2): папка задачи RT-3514 разобрана в архивную запись (RT-3514)
7a8cf54a6 Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3514-ngdoctor-source-liveness
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
