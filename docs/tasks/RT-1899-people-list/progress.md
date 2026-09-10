# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — Чтение записей в приёмнике
- **Done:** этап 1 — договорённость о разделе и три сценария к ней
- **Next step:** операция чтения записей в приёмнике, закрытая правом `accounts:read`
- **Uncommitted:** нет
- **Waiting for the owner:** слово о том, как фикс прав попадёт в главную — вариант первый или второй
- **PR:** ещё не открыт

## Steps

- [x] 1.1 договорённость о разделе: что показывает список и чем закрыт
- [x] 1.2 сценарии на список, отбор и отказ без права
- [>] 2.1 чтение записей в приёмнике: операция закрыта правом `accounts:read`
- [ ] 2.2 тесты на операцию: без права отказ, с правом список
- [ ] 3.1 раздел админки: пункт меню, адрес, экран списка
- [ ] 3.2 тесты экрана
- [ ] 4.1 договорённость влита в описание домена
- [ ] 4.2 сквозной тест на раздел

## Decisions along the way

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
- **Stage:** 2 of 4 — Чтение записей в приёмнике
- **Next step:** операция чтения записей в приёмнике, закрытая правом `accounts:read`
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
