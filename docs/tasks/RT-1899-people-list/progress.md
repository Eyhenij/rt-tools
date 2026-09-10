# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Раздел админки
- **Done:** этапы 1 и 2 — договорённость о разделе и операция чтения, закрытая правом; 42 теста домена зелёные, без права и без сборки строки красных 3
- **Next step:** этап 3 — раздел админки: пункт меню, адрес, экран списка
- **Uncommitted:** нет
- **Waiting for the owner:** ничего
- **PR:** ещё не открыт

## Steps

- [x] 1.1 договорённость о разделе: что показывает список и чем закрыт
- [x] 1.2 сценарии на список, отбор и отказ без права
- [x] 2.1 чтение записей в приёмнике: операция закрыта правом `accounts:read`
- [x] 2.2 тесты на операцию: без права отказ, с правом список
- [ ] 3.1 раздел админки: пункт меню, адрес, экран списка
- [ ] 3.2 тесты экрана
- [ ] 4.1 договорённость влита в описание домена
- [ ] 4.2 сквозной тест на раздел

## Decisions along the way

- **Строка ответа собирается отдельным вызовом, а не выборкой в запросе** — пустая роль законное
  состояние, и то, во что она превращается в ответе, проверяется вызовом, без базы. Слова «роли нет»
  в приёмник не попали: их скажет экран, иначе подпись жила бы в двух местах. Affected stage of the
  plan: 2.
- **Список не режется страницами** — людей у приёмника десятки, отбора и порядка раздел пока не
  просит. Придут — придут вместе с ними, а не заранее пустым доводом. Affected stage of the plan: 2.
- **Задача взята, пока фикс прав ждёт слова владельца** — ждать чужого шага работой не считается,
  следующая задача берётся из плана эпика. Affected stage of the plan: 1.

## Sessions

### 2026-09-10

- Ветка отведена, папка заведена, план записан.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-1899-people-list

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Раздел админки
- **Next step:** этап 3 — раздел админки: пункт меню, адрес, экран списка
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-1899-people-list/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-1899-people-list/progress.md
?? docs/tasks/RT-2014-sql-guard-migrate-file/
```

### Commits over the main branch

```
511d8e50f docs(rt:message-bus): договорённость о разделе со списком людей
07303994d docs(rt:message-bus): папка задачи RT-1899 заведена
66b1afeec Merge remote-tracking branch 'origin/main' into RT-1896-access-rights
f8a9d63c2 [RT-2018] Вход открывает разделы: миграция прав возвращает доступ (#2022)
0a0ad1586 docs(rt:message-bus): папка ветки эпика RT-1896 заведена
21f196bdb docs(rt:message-bus): папка задачи RT-2018 разобрана
19b44f6cd fix(rt:message-bus): миграция прав возвращает доступ тем, у кого он был
d88caeaec docs(rt:message-bus): папка задачи RT-2018 заведена
53e5ec426 Merge remote-tracking branch 'origin/main' into RT-1896-access-rights
9ed15dac6 docs: замысел эпика RT-1896 называет свою ветку и находку
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
