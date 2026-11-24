# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — этапы сделаны, шаги 1.1–2.11 отмечены командой `step`
- **Done:** план одобрен владельцем («Одобряю план RT-3592»), отметка plan-red записана; движок,
  наборы, тексты, спеки и раскладка
- **Next step:** два круга ревью, правки каждого круга одним коммитом
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Случай отпуска по слову остановки в описании сценария
- [x] 1.2 Случаи набора проверки выхода
- [x] 1.3 Записанные ходы остановки отпускаются
- [x] 1.4 Ключи слов остановки законны в описании
- [x] 2.1 Правило хода называет слово остановки выходом
- [x] 2.2 Проверка карты хода знает выход по слову
- [x] 2.3 Карта хода называет выход по слову
- [x] 2.4 Судья хода знает слово остановки
- [x] 2.5 Случаи в спеке выхода
- [x] 2.6 Случаи в спеке записанных ходов
- [x] 2.7 Пакет разложен в дерево
- [x] 2.8 Миссия называет слово остановки
- [x] 2.9 Правило записанных ходов обращено
- [x] 2.10 Правило ночи, команда ночи и ловушки возврата называют слово остановки
- [x] 2.11 Спек шагов работы называет слово остановки

## Decisions along the way

- **План переписан по двум ролям до вопроса об одобрении.** Роли нашли места, где 0.39 тоже
  убрал слово: удержание CI (`measure/ci.mjs`), передачу `saysStop` мерам, прогноз, правило
  `turn-conduct`, карту хода и её проверку, ключи языка описания. Все вошли в состав работ.
  Порог записанных ходов поднят с 2 до 7: `saysStop` 0.38, прогнанный 24.11 по текстам фикстур
  1548-*, 1457 и 1458, отпускает все семь.
- **План отменяет прежнее решение владельца.** Спек миссии записывает выбор владельца 22.11
  «Ожидание и убрать «стоп»». Слово 24.11 «в версии 0.38… рабочий процесс… Ты… вообще его
  сломал» и это решение расходятся. Вопрос об одобрении плана называет отмену прямо: решает
  владелец.
- **Обратная правка `7fa326285` целиком не ложится.** `git apply --check` обратного диффа отказал
  в восьми файлах: после RT-3419 их меняли. Слово остановки возвращается вручную по тексту 0.38.
- **`source/owner.mjs` не тронут.** Файла нет в составе работ, и проверка шагов правку отказала. В
  нём меняется только комментарий, и он верен: отметка Esc — слово владельца.
- **Вне состава работ, но в той же правке:** комментарий `turn-exit-guard.sh`, строка глоссария
  «Exit check», ловушка `task-flow-start` и спеки входа в заход, языка описания, прогноза и счёта
  пропущенных остановок. Каждый из них называл Esc единственной остановкой.
- **Слова владельца 24.11 не отпускают ход и после правки.** «не двигайся дальше…» не начинается со
  слова остановки из списка 0.38. План обещает список 0.38 дословно, список не расширен.

## Live check

- 24.11, разложенный движок на записи с правкой файла и словом владельца в конце, команда
  `task-flow-script.mjs verdict`. «Стоп, на сегодня хватит» — отпуск «a stop word of the owner».
  «хватит останавливаться, продолжай» и «Стой, не туда — делай RT-12» — ход держится. Отметка Esc —
  отпуск «the owner interrupted the turn». «не двигайся дальше пока не скажу» — ход держится.
- 24.11, судья хода по тексту `turn-judge.md`, субагент вместо модели хука: лимит CLI исчерпан до
  25.11 12:00. Шесть ходов. «Стоп, на сегодня хватит», «не сейчас» в ответе на вопрос, «подожди» и
  Esc — отпуск. «хватит останавливаться, продолжай» с обещанием и «Стой, не туда — делай RT-13» без
  вызовов — отказ.
- Наборы `turn-exit-guard`, `turn-exit-guard-foreign`, `turn-replay`, `flow-language`,
  `flow-language-sync` и `flow-language-override` — 0 провалов на итоговом коде.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/epic-3471-merge
**Branch:** RT-3592-owner-word-releases-turn

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — Слово остановки отпускает ход
- **Next step:** 1.1 — случай `stopWord` в описании сценария
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3592-owner-word-releases-turn/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3592-owner-word-releases-turn/progress.md
 M projects/agent-kit/assets/checks/check-turn-map.mjs
 M projects/agent-kit/assets/checks/flow-data.mjs
 M projects/agent-kit/assets/checks/flow-forecast.mjs
 M projects/agent-kit/assets/checks/task-flow-script.mjs
 M projects/agent-kit/assets/commands/night.md
 M projects/agent-kit/assets/defaults/turn-map.md
 M projects/agent-kit/assets/hooks/turn-judge.md
 M projects/agent-kit/assets/pitfalls/task-flow-resume.md
 M projects/agent-kit/assets/rules/autonomous-work.md
 M projects/agent-kit/assets/rules/turn-conduct.md
 M projects/agent-kit/assets/task-flow/flow.js
 M projects/agent-kit/assets/task-flow/flow.md
 M projects/agent-kit/assets/task-flow/measure/ci.mjs
 M projects/agent-kit/assets/task-flow/measure/owner.mjs
?? docs/tasks/RT-3563-no-look-in-plan/
?? docs/tasks/RT-3565-outside-epic-exit/
?? docs/tasks/RT-3571-night-no-questions/
?? docs/tasks/RT-3572-night-no-permission-prompt/
?? docs/tasks/RT-3573-night-exit-no-menu/
```

### Commits over the main branch

```
934c54258 docs(rt:agent-kit): план и ход работы RT-3592
b18028e80 Merge branch 'RT-3591-judge-passes-owner-decision' into RT-3592-owner-word-releases-turn
d756b3efb fix(rt:agent-kit): судья вопросов пускает план эпика и держит приписанное действие после второго круга ревью (RT-3591)
82c432d0e Merge branch 'RT-3591-judge-passes-owner-decision' into RT-3592-owner-word-releases-turn
ca608a79c fix(rt:agent-kit): судья вопросов после второго круга ревью (RT-3591)
c8710e0e0 docs(rt:agent-kit): разбор RT-3592
73abdd2fa fix(rt:agent-kit): судья вопросов после первого круга ревью (RT-3591)
e1bcc44ae fix(rt:agent-kit): судья вопросов пускает решение владельца, даже если оно меняет проверку (RT-3591)
a72c21d08 docs(rt:agent-kit): план и ход работы RT-3591
97552e0ee docs(rt:agent-kit): разбор RT-3591
f4c58a200 Merge RT-3535-plan-approval-one-voice into RT-3591-judge-passes-owner-decision
7408b8899 docs(rt:agent-kit): план эпика RT-3590 и строка назначения копии
da835ade5 docs(rt:agent-kit): записи архива старше недели удалены (RT-3535)
57b11b078 docs(rt:agent-kit): папка задачи разобрана в архив (RT-3535)
9bdb7789d fix(rt:agent-kit): правило одобрения после второго круга ревью (RT-3535)
d1fdf5bd4 fix(rt:agent-kit): правило одобрения после первого круга ревью (RT-3535)
07b85c208 docs(rt:agent-kit): спек движка называет одно правило одобрения, пакет разложен (RT-3535)
d02a15cda fix(rt:agent-kit): одобрение плана засчитывается одним правилом для меню и чата (RT-3535)
007ba0318 docs(rt:agent-kit): ход работы RT-3535 с шагами плана
a40dc74ae docs(rt:agent-kit): разбор, план и ход работы RT-3535
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
