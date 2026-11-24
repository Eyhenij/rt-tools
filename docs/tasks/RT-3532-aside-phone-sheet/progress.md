# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — Асайд-шторка в коде
- **Done:** план одобрен, макет одобрен владельцем («Одобряю макет», 9 кадров, ряд RT-3532 на
  странице «Bottom Sheet»); замер кадров: пересечений 0, центры кнопок шапки на 56 px во всех семи
  кадрах шторки, выбранная вкладка кадра 24 по центру с отклонением 0,5 px
- **Next step:** шторка асайда в сервисе до 480 точек
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Нарисовать кадры асайда-шторки во всех местах кита и вопроса, показать владельцу сужения вопроса, получить одобрение макета
- [x] 2.1 Открывать асайд шторкой до 480 точек в сервисе и пяти местах кита
- [x] 2.2 Дать асайду-шторке шапку и подвал шторки
- [x] 2.3 Закрывать асайд-шторку свайпом, «×» и полосой, с вопросом внизу
- [x] 2.4 Вести Escape, фокус и шторку из шторки по правилам шторок
- [x] 2.5 Переписать прежние обещания асайда на ширину от 481 точки
- [>] 2.6 Проверить вживую асайд приложения на ширине 375
- [ ] 3.1 Завести истории асайда-шторки на ширине 375 и 600
- [ ] 3.2 Снять эталоны историй асайда-шторки
- [ ] 3.3 Сверить витрину с макетом по числам
- [ ] 3.4 Показать витрину владельцу и получить одобрение
- [ ] 4.1 Влить договорённость в спеки кита
- [ ] 4.2 Записать шторку до 480 точек в мобильный вид спеки асайда
- [ ] 4.3 Переписать описание асайда под шторку на телефоне

## Decisions along the way

- **План переписан до одобрения по ревью двух ролей** — проверки по именам в коде заменены
  прогоном тестов и счётом сценариев, добавлены шаги прежних обещаний, асайда приложения и
  сверки чисел. Второй круг ревью плана: сценарий 1858 вошёл в шаг 2.1, проверка спеки асайда
  смотрит только мобильный вид, эталоны считаются без снимков других ширин — восемь историй.
  Affected stage of the plan: все. Четыре коммита плана сведены в один (`--soft`, ветка не
  отправлена): движок берёт план из коммита, который его добавил.
- **Вкладки асайда-шторки — карусель, как чипы периода** — владелец при показе макета: «прикинь
  как на дейтпикере в ботомшите чипы листаются и затеняются когда не влазят и листаются
  каруселькой». Правило дописано в договорённость, SC-UKV-1832 обещает карусель. Affected stage of
  the plan: 2 (шаг 2.4).
- **Карточка #3532 говорит «существующее окно несохранённых изменений»** — владелец позже выбрал
  вопрос внизу, как у шторки; карточка правится при открытии PR.

## Sessions

### 2026-11-24

- Задача взята после слияния PR #3620 (RT-3617) в ветку эпика, коммит 7be51f391.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-3532-aside-phone-sheet

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — Асайд-шторка в коде
- **Next step:** шторка асайда в сервисе до 480 точек
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3532-aside-phone-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3532-aside-phone-sheet/progress.md
 M projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.html
 M projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside-ref.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside-sheet.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.scss
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.model.ts
 M projects/ui-kit-v2/src/lib/components/container/rt-container.component.ts
 M projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts
 M projects/ui-kit-v2/src/lib/components/container/rt-route-aside.unsaved.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/filters-aside/rt-toolbar-filters-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.model.ts
?? projects/ui-kit-v2/src/lib/components/aside/rt-aside-sheet-tabs.ts
?? projects/ui-kit-v2/src/lib/components/container/rt-route-aside-sheet.spec.ts
```

### Commits over the main branch

```
c1c5b4e5b test(rt:ui-kit-v2): сценарии асайда-шторки шагов 2.1 и 2.2 — открытие до 480 точек в службе и пяти местах кита, шапка и подвал шторки (RT-3532)
d576dcbef feat(rt:ui-kit-v2): асайд до 480 точек открывается шторкой кита во всю высоту — служба, правая панель рамки, шапка и подвал шторки (RT-3532)
89d32716d docs(rt:ui-kit-v2): макет асайда-шторки одобрен владельцем, вкладки каруселью (RT-3532)
5032cddb5 docs(rt:ui-kit-v2): план RT-3532 одобрен владельцем, проверки красные до работы (RT-3532)
874b8f32c docs(rt:ui-kit-v2): план RT-3532 — макет, асайд-шторка в коде, витрина, тексты; проверки прогоном тестов и счётом сценариев (RT-3532)
a2e9d8e3d docs(rt:ui-kit-v2): договорённость асайда-шторки после ревью критика, сценарии до SC-UKV-1862 (RT-3532)
26fde5fbb docs(rt:ui-kit-v2): договорённость асайда-шторки на телефоне, сценарии SC-UKV-1802…1846 (RT-3532)
523eaad1a docs(rt:ui-kit-v2): папка задачи RT-3532 — разбор асайда-шторки на телефоне (RT-3532)
7be51f391 [RT-3617] Шторки на телефоне: правки владельца — карусель чипов, высота шести недель, вкладки без скачка, высота по клавиатуре и по содержимому (#3620)
9c533fbc5 docs(rt:ui-kit-v2): папка задачи RT-3617 разобрана в запись архива (RT-3617)
fc6b5b036 docs(rt:ui-kit-v2): проверка шага 1.3 RT-3617 заменена в ходе работы — в плане она без кавычек (RT-3617)
a613324cd docs(rt:ui-kit-v2): разбор просьбы RT-3617 — в виде на момент плана, ответ владельца о высоте — в ходе работы (RT-3617)
8609dccb0 Revert "docs(rt:ui-kit-v2): папка задачи RT-3617 разобрана в запись архива (RT-3617)"
c682f4cb6 docs(rt:ui-kit-v2): сценарий высоты длинной шторки называет файл своей истории (RT-3617)
75b6c63c8 docs(rt:ui-kit-v2): папка задачи RT-3617 разобрана в запись архива (RT-3617)
a0f21bd9a fix(rt:ui-kit-v2): правки шторок после второго круга ревью (RT-3617)
957458824 fix(rt:ui-kit-v2): правки шторок после первого круга ревью (RT-3617)
78adf73d6 docs(rt:ui-kit-v2): макеты правок шторок и витрина одобрены владельцем, шаги этапа закрыты (RT-3617)
ca6a1175c fix(rt:ui-kit-v2): шторка встаёт во всю высоту, только пока показана экранная клавиатура (RT-3531)
16d88125e fix(rt:ui-kit-v2): календарь в шторке держит высоту шести недель, месяц покороче по центру (RT-3531)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
