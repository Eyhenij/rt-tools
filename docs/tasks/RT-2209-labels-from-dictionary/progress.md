# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** все три сделаны
- **Done:** задача взята, план записан. Этап 1: соглашение —
  `docs/specs/message-bus/proposed/admin-labels/`, семь правил и четыре сценария SC-MB-402…405.
  Этап 2: английский набор подписей, служба словаря и проба на неё. Этап 3: оболочка берёт
  подписи из словаря, подпись пункта меню стала ключом, переключатель языка меняет подписи
  админки вместе с китовыми. Все четыре сценария закрыты тестами и вышли из долгов спек
- **Next step:** влить соглашение в спеку домена, привести тексты к сделанному, прогнать набор
- **Uncommitted:** нет
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **Эпик назначен копии `rt-tools` словом владельца «веди RT-2208».** Строка вписана в таблицу
  назначений, и проверка теперь пропускает работу по этому эпику.

## Sessions

### 2026-09-18

- Владелец спросил, почему тексты приёмника всё ещё на двух языках. Измерение записано в план
  эпика: 55 строк разметки с русским текстом в 12 шаблонах из 33, обращений к словарю ноль, мест
  с русским текстом на броске отказа 70.
- Найдено при слиянии главной ветки: две ветки взяли одни и те же номера сценариев
  SC-AK-1113…1116. Перенумерованы те, что влились вторыми; наборы зелёные.
- Набор общего слоя админки гоняет не Jest, а Vitest: один файл выбирается позиционным доводом
  (`nx test <проект> -- <часть имени>`), довод `--testFile` этот бегун не знает.
- Проба заголовка вкладки упала на правке: имя приложения пошло из словаря, а он читает язык из
  браузерного хранилища. Спеке добавлены `provideRtUtils()` и `provideRtStorage()`.
- Русские строки остались в шаблонах оболочки только в комментариях — их 18; в самой разметке
  ноль. Довод плана считает и комментарии, поэтому измерение сделано с вырезанием комментариев.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2209-labels-from-dictionary

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — ключ, словарь и загрузчик
- **Next step:** этап 2 — пространство ключей, два набора подписей и загрузчик рядом с тем,
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2209-labels-from-dictionary/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-2209-labels-from-dictionary/plan.md
 M libs/message-bus-admin/common/core/util/src/index.ts
A  libs/message-bus-admin/common/core/util/src/lib/admin-labels-en.ts
A  libs/message-bus-admin/common/core/util/src/lib/admin-text.service.spec.ts
AM libs/message-bus-admin/common/core/util/src/lib/admin-text.service.ts
```

### Commits over the main branch

```
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
