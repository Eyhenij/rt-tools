# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Проверка правки после слияния главной
- **Done:** папка поставки и план; код задачи в ветке `RT-3528-toolbar-filters-route`
- **Next step:** живая проверка витрины на 1079, 1080 и 375
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Живая проверка витрины на 1079, 1080 и 375
- [x] 1.2 Круг ревью тремя ролями по диффу после слияния
- [>] 2.1 PR задачи в ветку эпика открыт, в теле `Closes #3528`
- [ ] 2.2 PR задачи влит в ветку эпика
- [ ] 3.1 PR эпика в `main` влит
- [ ] 3.2 `CONTEXT.md` полосы в главной описывает режим
- [ ] 3.3 Выпуск кита minor из главной

## Decisions along the way

## Sessions

### 2026-11-24

- Ветка поставки взята от `RT-3528-toolbar-filters-route` по слову владельца «Новый план на
  поставку».
- План прочитан ролями `product-strategist` и `goal-critic`; их находки вошли в план до
  одобрения: проверка правки после слияния, признак по содержимому пакета, проверка слияний,
  `CONTEXT.md` в главной.
- План одобрен владельцем: «Одобряю план RT-3528»; отметка одобрения записана, проверки плана
  красные на коммите плана.
- Живая проверка после слияния главной: витрина 6007, закреплённый Chrome, рамки iframe. На 1080
  в строке 2 отбора, кнопки фильтров нет; на 1079 и 375 отборов в строке 0, кнопка фильтров
  последняя в ряду, отступ от правого края 12, прокрутки нет. На 375 панель приложения
  (`#/(ro:filters)`) и панель кита совпали: рамка 0,0,375×812, поля 24,104,327×140, «Сбросить»
  24,748,118×40, «Применить» 219,748,132×40 — те же числа, что до переноса тела на
  `rtAsideContent`; фокус панели приложения на блоке полей.
- Круг ревью после слияния главной: `qa-engineer`, `product-strategist` и `goal-critic` по диффу
  ветки против ветки эпика. Исправлено: маршрутная панель, закрытая расширением места с фокусом
  внутри, отдавала фокус странице — теперь он уходит в поле полосы, как у панели кита (SC-UKV-1097,
  тест падает без правки); тест SC-UKV-1094 проверяет начальный фокус на блоке полей. Живьём: на
  1079 фокус в полях и `#/(ro:filters)`, после 1080 `#/` и фокус на выборе в полосе. Исправлено в
  плане эпика: признак B называл чужие номера SC-UKV-1710…1716. Списано с причиной: выпуск, PR и
  `CONTEXT.md` в главной — это этапы 2 и 3 плана; ширина `rt-select` в левой части и попутные правки
  названы в теле PR.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/formfield-undefined-inputs-7ce857
**Branch:** RT-3528-toolbar-filters-delivery

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Проверка правки после слияния главной
- **Next step:** живая проверка витрины на 1079, 1080 и 375
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3528-toolbar-filters-delivery/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/toolbar-filters/implementation.md
 M docs/specs/ui-kit-v2/toolbar-filters/scenarios.md
 M docs/tasks/RT-3528-toolbar-filters-delivery/progress.md
 M projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/toolbar/filters-route-aside/rt-toolbar-filters-route-aside.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/filters-route-aside/rt-toolbar-filters-route-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar-filters-hub.spec.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar-filters.spec.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.model.ts
```

### Commits over the main branch

```
1667fbccf docs(rt:ui-kit-v2): папка поставки RT-3528 — план на PR, слияние и выпуск (RT-3528)
8ceb2b4f4 fix(rt:ui-kit-v2): панель отборов на шаблоне тела панели кита, проверка Angular Doctor и свободные номера сценариев после слияния главной (RT-3528)
c3f58eda3 Merge remote-tracking branch 'origin/RT-3566-toolbar-filters-app-route' into RT-3528-toolbar-filters-route
2c4917b1a Merge remote-tracking branch 'origin/main' into RT-3566-toolbar-filters-app-route
81098565e Merge remote-tracking branch 'origin/RT-3566-toolbar-filters-app-route' into RT-3528-toolbar-filters-route
87ffe3729 docs(rt:ui-kit-v2): план эпика RT-3566 называет одобрения словами владельца (RT-3566)
c90db31b2 docs(rt:ui-kit-v2): папка задачи о панели отборов маршрутом разобрана в архив (RT-3528)
ab4313449 Merge remote-tracking branch 'origin/RT-3566-toolbar-filters-app-route' into RT-3528-toolbar-filters-route
57bb8c8e0 docs: записи архива старше недели удалены (RT-3566)
35d7f5f4b docs(rt:ui-kit-v2): эпик RT-3566 — панель отборов полосы маршрутом приложения
22a6bad1f docs(rt:ui-kit-v2): ход работы RT-3528 — заведён эпик RT-3566 (RT-3528)
342cdf1f8 docs(rt:ui-kit-v2): ход работы RT-3528 — набор зелёный, отправка стоит (RT-3528)
ded25b611 docs: записи архива старше недели удалены (RT-3528)
336884089 Merge remote-tracking branch 'origin/main' into RT-3528-toolbar-filters-route
544b67d5e fix(rt:agent-kit): сценарии стража выхода из хода не читают общую временную папку машины (RT-3528)
a86569104 test(rt:auth): выбор языка страницы входа открывается шторкой на телефоне (RT-3528)
29f2f4103 test(rt:message-bus): кнопки полосы списка на узком экране стоят у правого края (RT-3528)
b1219943c fix(rt:agent-kit): проверка путей пропускает черновик под игнором и с кириллическим именем (RT-3528)
8924262e2 fix(rt:ui-kit-v2): шаблоны обёртки витрины маршрутной панели в своих файлах (RT-3528)
b82ca40cb fix(rt:ui-kit-v2): панель отборов в маршруте не закрывается до замера места после второго круга ревью (RT-3528)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
