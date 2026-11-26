# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 1 из 1 — сервер пробы живёт всю пробу
- **Done:** задача, ветка от вершины эпика `2949acbc3`, разбор с опытом, план
- **Next step:** чтение плана ролями, одобрение
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Сервер пробы переживает задержку
- [ ] 1.2 Медленный старт сервера не меняет решения
- [ ] 1.3 Сервер без порта валит пробу словами
- [ ] 1.4 Умерший сервер назван словами
- [ ] 1.5 Три сверки разом сходятся
- [ ] 1.6 Набор таблицы решений зелёный
- [ ] 1.7 Разложенная таблица сходится с пакетом

## Decisions along the way

## Sessions

### 26.11.2026

- Прогон CI 45747355409 на PR 3681: SC-AK-1563, «rows 1017, mismatch 3». Опыт: `sleep 11` после запуска
  сервера в четырёх пробах — «rows 1017, mismatch 4», те же слова; без задержки — mismatch 0.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3683-dev-server-probes

### Where we stand at the minute of the compaction

- **State:** `договорённость-записана`
- **Stage:** 1 из 1 — сервер пробы живёт всю пробу
- **Next step:** чтение плана ролями, одобрение
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3683-dev-server-probes/progress.md`; the plan lies next to it.

### Uncommitted

```
?? docs/tasks/RT-3683-dev-server-probes/variant.mjs
```

### Commits over the main branch

```
515dbfc8e docs(rt:agent-kit): разбор и план RT-3683 (RT-3683)
2949acbc3 docs(rt:agent-kit): находки ревью правил по RT-3676 (RT-3624)
49c6dcc1d docs(rt:agent-kit): план эпика отмечает влитую RT-3676 (RT-3624)
1410487f8 [RT-3676] Слияние main в эпик RT-3624 укладывается в пределы длины (#3679)
8ea8ffedf docs(rt:agent-kit): папка RT-3676 разобрана в архив (RT-3676)
fa8227262 docs(rt:agent-kit): ход работы RT-3676 после чтения тела (RT-3676)
417e17f81 docs(rt:agent-kit): этапы RT-3676 кончились (RT-3676)
22e1de6e7 docs(rt:agent-kit): ход работы RT-3676 после набора (RT-3676)
c1df245ad fix(rt:agent-kit): образец плана и указания цикла после второго круга ревью (RT-3676)
8c1416a49 docs(rt:agent-kit): записи архива старше недели удалены (RT-3676)
050a87234 fix(rt:agent-kit): образец плана и запас правила после первого круга ревью (RT-3676)
4823b70ac fix(rt:agent-kit): слияние main в эпик укладывается в пределы длины (RT-3676)
dca42b407 docs(rt:agent-kit): разбор и план RT-3676 после трёх чтений ролями (RT-3676)
85a168b21 chore(rt:agent-kit): главная слита в ветку эпика (RT-3624)
d403e217d docs(rt:agent-kit): план эпика отмечает влитую RT-3631, находки ревью правил по ней (RT-3624)
2a9d392ae [RT-3631] Этап отмечается одним вызовом, архивная запись строится командой (#3667)
d64996a58 docs(rt:agent-kit): папка RT-3631 разобрана в архив (RT-3631)
4bbf8eeba docs(rt:agent-kit): ход работы RT-3631 после чтения тела (RT-3631)
55f71e799 docs(rt:agent-kit): ещё одна запись архива старше недели удалена (RT-3631)
3f2b08663 fix(rt:agent-kit): этап и архивная запись после второго круга ревью (RT-3631)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
