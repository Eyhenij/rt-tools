# Ход работ

## Где стоим

Переписывается каждым заходом, не дописывается.

- **Состояние:** `этап-идёт`
- **Этап:** 2 из 2 — Главная подтягивается в ветку эпика по мере слияний
- **Сделано:** ветка лежит на хостинге и несёт вершину главной; этап 1 закрыт. Слияния RT-1977,
  RT-1978 и подъём версии первого кита влиты.
- **Следующий шаг:** отвести ветку задачи RT-1878 от этой ветки — прокрутка первого кита.
- **Не закоммичено:** ничего.
- **Ждём владельца:** ничего. Задача RT-1992 закрыта как заведённая по ошибке: эталоны переписки
  привязаны к машине, и на бегунке конвейера прогон зелёный.
- **Заявка:** не открывается — ветка эпика заявкой не отдаётся, пока задачи эпика не влиты.

## Решения по ходу

- **Ветка эпика заведена посреди эпика, а не в его начале.** Требование пришло с работой RT-1921,
  когда шесть задач эпика уже были влиты от главной. Затронут этап плана: 1.
- **Папка задачи заведена ветке, которая работой не является.** Страж хода судит по имени ветки.
  Написано, чем ветка является. Затронут этап плана: ни один.
- **Задача RT-1993 отдана другому разработчику.** Строка 6.3 замысла эпика и договорённость о
  доставке шрифта лежат в её ветке, а не в главной. Затронут этап плана: ни один.

## Заходы

### 2026-09-09

- Ветка заведена от главной и отправлена на хостинг.
- После слияний заявок 1990 и 1991 вершина главной влита в ветку местно.

### 2026-09-10

- Вершина главной влита и отправлена: `git merge-base --is-ancestor origin/main
origin/RT-1870-one-kit` проходит. Этап 1 закрыт.
- Заведена карточка RT-2015 — папки заведённых задач копятся вне индекса. В работу не взята,
  папка снята.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-1870-one-kit

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 из 2 — Главная подтягивается в ветку эпика по мере слияний
- **Next step:** отвести ветку задачи RT-1878 от этой ветки — прокрутка первого кита.

The progress in full — `docs/tasks/RT-1870-one-kit/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
f5ef6ff36 Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
d373b433c [RT-2102] Рабочий стол не рисует панель, для которой не объявлен шаблон (#2128)
5d4db1852 docs(rt:ui-kit-v2): папка задачи RT-2102 разобрана
21fe46f7f docs(rt:ui-kit-v2): край без слота списка написан на странице обзора, эталоны сходятся
701a06ec7 fix(rt:ui-kit-v2): рабочий стол не рисует панель, для которой не объявлен шаблон
6c3d741e7 docs(rt:ui-kit-v2): папка задачи RT-2102 заведена, разбор и план записаны
af04b5342 Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
f64ef92a7 [RT-1951] Страница с входами во всех семействах зовётся одним именем (#2126)
87bd0b9bf Merge branch 'RT-1870-one-kit' into RT-1951-playground-one-name
a4e376624 Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
14c3c05a5 docs(rt:ui-kit-v2): папка задачи RT-1951 разобрана
9c60400cf docs(rt:ui-kit-v2): этап 3 RT-1951 закрыт — панель инструментов названа причиной
dc023923c feat(rt:ui-kit-v2): семейство без страницы входов названо причиной, а не молчанием
5bc70e26f docs(rt:ui-kit-v2): этап 2 RT-1951 закрыт — страница входов зовётся одним именем
553ee1053 Revert "test(rt:ui-kit-v2): четыре эталона поля ввода сняты заново по измерению"
6668f7ade refactor(rt:ui-kit-v2): страница с входами везде зовётся Playground
24d0f3981 Merge branch 'RT-2117-composer-refs-stale' into RT-1951-playground-one-name
71c0b7ef5 Merge branch 'RT-1870-one-kit' into RT-1951-playground-one-name
3b798f6b4 docs(rt:ui-kit-v2): папка задачи RT-2117 разобрана
a9b0a4786 docs(rt:ui-kit-v2): папка задачи RT-2117 заведена, разбор и план записаны
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
