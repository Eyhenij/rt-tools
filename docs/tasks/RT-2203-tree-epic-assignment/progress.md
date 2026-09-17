# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — запрет чужого эпика и просрочки
- **Done:** этап 1 сделан: таблица назначений `.claude/rt-kit/assignments.md` в истории, имя копии
  в `.claude/rt-kit/tree-name` вне истории, чтение того и другого — `node tools/tree-assignment.mjs`,
  хук начала сессии печатает его вместо устаревшего файла. Этап 2 сделан: запрет стоит на всех
  трёх вызовах, которыми берут работу — ветка, заведение задачи под эпиком, перенос карточки в
  рабочую колонку, — и на назначении, эпик которого уже закрыт. Набор
  `guard-tree-assignment.test.sh` — 19 ok
- **Next step:** этап 3 — статья правила про назначение рабочей копии, привязки в описании,
  замена строки «не проверяется»; вход в описания сейчас не знает трёх новых файлов
- **Uncommitted:** папка задачи
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **Работа вне эпика — по слову владельца.** Он сказал: «нужно записывать назначенный эпик для
  каждого рабочего дерева в одном файле», и выбрал строгость — запрещать чужой эпик и просрочку.
- **Файл назначений в главной ветке, имя копии вне истории.** Так требует закон о ведении работ;
  пути машины в репозиторий не пишутся.

## Sessions

### 2026-09-17

- Задача заведена после разбора сегодняшнего промаха: работа была взята по эпику, которого владелец
  не давал. Разбор — `.claude/rt-kit/postmortems/2026-09-17-epic-taken-without-checking-who-ordered-it.md`.
- Отказ по закрытому эпику не работал: `.open // empty` в jq отдаёт правую часть и на `false`,
  то есть ровно на том состоянии, ради которого отказ написан. Нашёл это сценарий SC-AK-1115.
- Этап 2 проверен вживую: попытка отвести ветку RT-2209 отбита — «no epic is assigned to the copy
  «rt-tools»». Набор `guard-tree-assignment.test.sh` — 19 ok.
- Этап 1: команда различает три состояния — строки для копии нет, эпик копии не назначен,
  назначение есть. Сейчас в обеих копиях прочерк: кто что ведёт, говорит владелец.
- Измерено до плана: в копии `rt-tools` назначение называет эпик RT-907, все семь его задач
  закрыты; во второй рабочей копии файла назначения нет вовсе.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2203-tree-epic-assignment

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — запрет чужого эпика и просрочки
- **Next step:** доделать этап 2 — запрет на заведении задачи и переносе карточки, отказ по
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2203-tree-epic-assignment/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/hooks/git-guard-tree-assignment.sh
A  .claude/hooks/tree-assignment-guard.sh
 M projects/agent-kit/assets/checks/tree-assignment.mjs
 M projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh
A  projects/agent-kit/assets/hooks/tree-assignment-guard.sh
 M projects/agent-kit/tests/guard-tree-assignment.test.sh
 M tools/tree-assignment.mjs
```

### Commits over the main branch

```
e5f9e2626 feat(rt:agent-kit): проверка поставки запрещает ветку чужого эпика
4303e1aff feat(rt:agent-kit): назначенный эпик рабочей копии читается из одного файла
7c2f44362 docs(rt:agent-kit): папка задачи RT-2203 заведена, план записан
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
