# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 4 из 4 — сделан
- **Done:** все четыре этапа сделаны. Столбцы и общий слой списка берут подписи производными от
  выбора языка; шесть разделов переведены целиком — списки, панели, заголовки маршрутов, сторы и
  мапперы. Старого способа в админке не осталось, и сама его функция убрана. Слова строк собирают
  экраны: состояние груза — общей помощницей, роль, пустой вход, права роли и вопросы перед
  необратимым действием — каждый экран у себя. Чистый пайп рода скила убран. Сквозной тест
  SC-MB-407 принят подстановкой: слово состояния, возвращённое постоянной, красит его. Описания
  списка и оболочки правлены под сделанное, сценарий SC-MB-149 переписан — он обещал русские
  заголовки при английском выборе
- **Next step:** записать закрытую работу в архив, разобрать папку задачи и открыть PR на ветку
  RT-2210
- **Uncommitted:** нет
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **Своей договорённости у задачи нет.** Правила словаря приняты описанием оболочки первой
  задачей эпика.

## Sessions

### 2026-09-18

- Задача взята после того, как RT-2210 ушла в PR #2239. Ветка стоит на ветке RT-2210: разделы
  пишут в те же наборы подписей, и от ветки эпика они разошлись бы на каждом ключе.
- Измерение перед планом: русского текста в шаблонах админки ноль, а вызовов старого способа 212
  — работа вся в коде экранов, не в разметке.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2211-section-screens-from-dictionary

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 4 — разделы по одному
- **Next step:** этап 3 — списки, панели и заголовки маршрутов шести разделов, вместе с мапперами:
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2211-section-screens-from-dictionary/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
565464d4b feat(rt:message-bus): общий слой списка спрашивает словарь на каждой отрисовке
59d25853f feat(rt:message-bus): столбцы всех разделов названы ключами словаря
e612048cf feat(rt:message-bus): подпись столбца названа ключом словаря
f7dc2cc45 docs(rt:message-bus): задача RT-2211 взята, план записан
3604c06ba docs(rt:message-bus): папка задачи RT-2210 разобрана
3861e3c01 feat(rt:message-bus): экраны входа берут подписи из словаря
550c2dd4d docs(rt:message-bus): задача RT-2210 взята, план записан
01c397dc9 Merge branch 'RT-2208-receiver-texts-keys' into RT-2209-labels-from-dictionary
6dc74979b Merge remote-tracking branch 'origin/main' into RT-2208-receiver-texts-keys
1ed106794 docs(rt:message-bus): папка задачи RT-2209 разобрана
3d9c91d8a docs(rt:message-bus): соглашение о словаре подписей влито в спеку оболочки
a343b6051 feat(rt:message-bus): оболочка админки берёт подписи из словаря
e5ff997b0 feat(rt:message-bus): словарь подписей админки на двух языках
ccc1383d4 docs(rt:message-bus): соглашение о словаре подписей админки
a941a79e7 docs(rt:message-bus): задача RT-2209 взята, план записан
2f1aa8cf5 fix(rt:agent-kit): номера сценариев проверки выхода из хода разведены с занятыми
ecd780f39 docs(rt:agent-kit): копии rt-tools назначен эпик RT-2208
aa5b3755d merge origin/main: таблица назначений и уборка архива
8aa17b9a5 docs(rt:message-bus): в план эпика записано измерение на 18 сентября
0db507176 docs(rt:message-bus): заведён эпик RT-2208 — ключи и переводы текстов приёмника
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
