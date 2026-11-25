# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 3 — движок
- **Done:** разбор, план одобрен
- **Next step:** `flow-stage.mjs` и сценарии этапа
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Сценарии этапа зелёные, у каждого случая свой
- [x] 1.2 Прежние сценарии движка зелёные, раскладка сходится
- [>] 2.1 Сценарии команды записи зелёные, у каждого отказа свой
- [ ] 3.1 Спека называет этап, цикл и правило записи — команду, образец без лишней строки
- [ ] 3.2 Живые вызовы и мутанты стоят в ходе работы

## Decisions along the way

- **Находки третьего чтения идут в код, а не в план.** План одобрен с ними в меню. Этап плана: 1, 2 и 3.
    - Код 1, когда совпавший шаг остался неотмеченным: код 0 прочли бы как отмеченный этап.
    - Файл, который держит коммит плана, уходит с папкой и строкой в выводе; отказ — только прочим. Без этого папка
      со скриптами плана запиралась бы: их удаление отбивает движок.
    - Слова владельца сравниваются без учёта регистра; пункт не повторяется, когда все его цитаты есть в разборе.
    - В живой проверке в клон дописываются только заголовок раздела решений и пункт «Цена» без цитат; метки одобрения
      копируются; цитата, которой нет ни в папке, ни в теле, ни в метке, в счёт не входит и названа.

## Sessions

### 25.11.2026

- Правки файлов по журналам 21–25.11: 3148, записи 1070; коммитов эпика 80, из одних записей 47.
- План читали роли трижды: блокирующих 3, 2 и 0. «Одобряю план RT-3631 (Recommended)».
- **Живой этап:** этап 1 этой ветки вызовом `step 1`, код 0; измерено 2, отмечено 2, 172 секунды.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3631-fewer-records

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 из 3 — движок
- **Next step:** `flow-stage.mjs` и сценарии этапа
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3631-fewer-records/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../../../docs/tasks/RT-3631-fewer-records/progress.md
 M flow-step.mjs
 M task-flow-script.mjs
?? flow-stage.mjs
```

### Commits over the main branch

```
7fba5cd23 docs(rt:agent-kit): ход работы RT-3631, план одобрен (RT-3631)
e5c393966 docs(rt:agent-kit): план RT-3631 после двух чтений ролями (RT-3631)
939a1b8c2 docs(rt:agent-kit): разбор RT-3631, находки ревью правил по RT-3628 (RT-3631)
9059c4b69 docs(rt:agent-kit): папка RT-3628 разобрана в архив (RT-3628)
5e12910aa fix(rt:agent-kit): вопрос о PR до набора после второго круга ревью (RT-3628)
44ddba695 docs(rt:agent-kit): записи архива старше недели удалены (RT-3628)
5e3232cab fix(rt:agent-kit): готовность PR до набора после первого круга ревью (RT-3628)
55af55c43 docs(rt:agent-kit): этапы RT-3628 кончились (RT-3628)
474c043d6 test(rt:agent-kit): форма ветки, несколько веток эпика и одна строка в цепочке (RT-3628)
e21cef278 fix(rt:agent-kit): карточка, которой хостинг не знает, основу не судит (RT-3628)
ba5ed2b44 docs(rt:agent-kit): цикл и план эпика называют готовность PR до набора (RT-3628)
493ceb16d feat(rt:agent-kit): набор не начинается, пока PR не откроется (RT-3628)
b3de83103 docs(rt:agent-kit): ход работы RT-3628, план одобрен (RT-3628)
290ab7600 docs(rt:agent-kit): план RT-3628 (RT-3628)
880cf5d1c docs(rt:agent-kit): разбор RT-3628, находки ревью правил по RT-3627 (RT-3628)
46545ad70 [RT-3627] Задача, чей разбор дал одну, заводится без эпика (#3654)
32b460d3d docs(rt:agent-kit): папка RT-3627 разобрана в архив (RT-3627)
0276f6f2c fix(rt:agent-kit): единственная задача разбора после второго круга ревью (RT-3627)
2fc1938fe docs(rt:agent-kit): запись архива старше недели удалена (RT-3627)
d3ebc2bd8 fix(rt:agent-kit): единственная задача разбора после первого круга ревью (RT-3627)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
