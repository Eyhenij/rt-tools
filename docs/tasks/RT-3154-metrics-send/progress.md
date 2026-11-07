# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — Тексты и проверка на стенде
- **Done:** строка дня, команда `send`, запуск из проверок и сессий, отказ правки наблюдений
- **Next step:** разбор папки, набор, PR
- **Uncommitted:** нет
- **Waiting for the owner:** нет, #3162, #3163 и #3164 на ревью, работа идёт стопкой
- **PR:** not open yet

## Steps

The steps of the plan, all of them, with a mark each. Rewritten by every turn that moves the work.

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Собрать карту чисел дня из наблюдений
- [x] 1.2 Заменить чужие имена словом `own`
- [x] 1.3 Перенести учёт итогов в общий каталог git
- [x] 2.1 Добавить ключ `send` в конфиг
- [x] 2.2 Написать метку, замок и признак копии
- [x] 2.3 Написать команду `agent-kit send`
- [x] 2.4 Остановить попытки при отказанном токене
- [x] 3.1 Запускать отправку из записи наблюдения
- [x] 3.2 Запускать отправку в начале и конце сессии
- [x] 3.3 Назвать сбой в `agent-kit doctor` и в начале сессии
- [x] 3.4 Отказать прямую правку каталога наблюдений
- [x] 4.1 Обновить статьи спек пакета из договорённости
- [x] 4.2 Снять метки с покрытых сценариев
- [x] 4.3 Проверить отправку на настоящем стенде

## Decisions along the way

- Причина сбоя едет числом `sendFault` со следующей дошедшей строкой, отдельной записи в приёмнике нет.
- Тихий запуск соблюдает 15 минут и останавливается на отказанном токене. Команда человека пробует всегда.
- Тестовая подстановка команды пакета судит запуск. Саму отправку судит `metric-send.spec.ts`.
- Находки ролей закрыты вне плана: общий каталог меток передачи, замок учёта, числа дерева в метке, `send.try`, команда основной копии, статьи договорённости без кода.
- Строка не уходит только при корне или адресе дерева в ключах: последнее звено пути дало бы ложный отказ.

## Session log

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-3049-push
**Branch:** RT-3154-metrics-send

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Тексты и проверка на стенде
- **Next step:** проверка на стенде, роли, архив, набор, PR
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3154-metrics-send/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/proposed/metrics/scenarios.md
 M projects/agent-kit/assets/hooks/metric-marks.sh
 M projects/agent-kit/assets/hooks/metric-send-start.sh
 M projects/agent-kit/assets/hooks/observe.sh
 M projects/agent-kit/assets/hooks/rule-source-guard.sh
 M projects/agent-kit/src/lib/cargo.ts
 M projects/agent-kit/src/lib/metric-lines.ts
 M projects/agent-kit/src/lib/metric-send.ts
 M projects/agent-kit/src/lib/outcomes.ts
 M projects/agent-kit/src/lib/ship.ts
?? docs/archive/RT-3154-metrics-send.md
?? projects/agent-kit/src/lib/file-lock.ts
```

### Commits over the main branch

```
68c517348 feat(rt:agent-kit): числа уходят без команды человека
5f04901d8 feat(rt:agent-kit): команда send шлёт строки дня
25fbfc7b6 docs(rt:agent-kit): папка задачи RT-3154
31bd90ef5 docs(rt:message-bus): папка задачи RT-3155 разобрана в запись архива
76ba46e5d fix(rt:message-bus): голова строки дня не несёт слов из дерева
a799a5ac0 feat(rt:message-bus): приёмник хранит числа метрик по дням
93354a7f0 docs(rt:message-bus): папка задачи RT-3155 заполнена
2c10bff1a docs(rt:message-bus): папка задачи RT-3155
fba69eb0f docs(rt:agent-kit): брань от человека записана как признак плохой работы
6c210359f feat(rt:agent-kit): три дня на правку после слияния и шире образцы правок
78d9c92cb fix(rt:agent-kit): вторая проверка ролей по записи метрик
0699d5230 refactor(rt:agent-kit): длинные файлы разнесены по соседним
2e41ee939 docs(rt:agent-kit): папка задачи RT-3153 разобрана в запись архива
335a33cc2 fix(rt:agent-kit): находки ролей по записи метрик
3bd9c9ba3 test(rt:agent-kit): состав полей отказа дополнен признаком и правилом
8c58a31b1 feat(rt:agent-kit): отчёт считает роли, экзамены и правила
1aa68ff77 feat(rt:agent-kit): отчёт считает главную метрику
c1b9f01b6 feat(rt:agent-kit): передача на ревью и правки владельца
1a4523562 feat(rt:agent-kit): отчёт считает запуски и потерянные минуты
4b5c6f9eb feat(rt:agent-kit): отчёт считает пустые отказы проверок
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
