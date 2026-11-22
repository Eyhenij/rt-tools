# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** 4 из 4 — этапы кончились, идёт ревью
- **Done:** четыре этапа, шаги 1.1–4.2 отмечены командой; все наборы пакета зелёные («ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»); `check-specs`, `check:spec-coverage`, `check-doc-paths`, `check-file-size`, `agent-kit:check` — код 0. Живая проверка: прогноз `forecast --days 8 --until 2026-11-22` на одном окне записей — старый движок (копия d48d13372) 169 удержанных остановок из 1006, новый — 153 из 1010
- **Next step:** коммит первого круга, затем второй круг ревью
- **Uncommitted:** правки первого круга
- **Первый круг ревью:** `qa-engineer`, `product-strategist`, `goal-critic`. Исправлено:
  сообщение, набранное во время хода (запись очереди), — слово владельца; Esc через ≤5 с после
  поручения его доставляет; Esc снимает удержание CI; `turn-judge` знает отметку Esc (текст, шапка,
  `.claude/settings.json`); образец сервера сужен (`storybook build`, пути `.storybook`, поиск — не
  сервер; `nx run …:serve`, `stand/up.mjs` — сервер); агент старше границы не зависший; запрет другой
  проверки дважды — раньше зависшей задачи; прогноз не считает зависшую задачу меню; сценарий 1841
  связан с мерами; правило без «stop word». Списано в находки
  `docs/plans/checks-rework-4-findings-RT-3419.md`: чтение `task_status` (файл вне следа), ключи
  чужих надстроек, цепочка `serve:* && …`, привязки к общим словам. Принято как есть: ожидание не
  отпускает ход в `работа-отдана` — после PR работа идёт, пока CI работает (слово владельца 21.11);
  «подскажу путь» без текста ведёт к одному вопросу о пути
- **PR:** not open yet

## Шаги

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 The bound of the wait is 90 minutes, and the hold names a hung task
- [x] 1.2 A CI watch is a wait, a server is none
- [x] 1.3 A read notice with no step holds the stop and names the step
- [x] 2.1 The hook on a branch in `этап-идёт` holds the turn after «стоп» and releases it after Esc
- [x] 2.2 The engine and its tests hold no stop word
- [x] 3.1 The hold names the new menu and the free field
- [x] 3.2 The model checks name the new menu and no stop word
- [x] 3.3 `turn-judge` lets a turn end on a wait for its own background task
- [x] 4.1 The rules and the texts of the package name no stop word and no bound of twenty minutes
- [x] 4.2 The descriptions hold no removed scenario

## Решения по ходу

- **Ветка в цепочке от RT-3468.** Ночная цепочка: RT-3469 → RT-3423 → RT-3434 → RT-3425 →
  RT-3468 → RT-3419.
- **Номера сценариев SC-AK-1838–1842.** Меньшие номера взяты планами задач ниже по цепочке.
- **Сравнение числа читает пробелы впереди.** Проверка шага 3.2 с `wc -l` не совпадала при выводе
  «       0»: движок срезал пробелы только справа. Починено в `flow-data.mjs:compareExpected`,
  сценарий SC-AK-1843. Этап 3.
- **SC-AK-1445 убран, меню держит SC-AK-1842.** Заголовки тестов 1445 переименованы в 1842.
- **Ход через хук мерится на ветке фикстуры в первом состоянии.** Шаг 2.1 держит «стоп» в
  `этап-идёт` на уровне вердикта (`decide`), а через хук — на ветке фикстуры: случаи отпуска от
  состояния не зависят. Этап 2.
- **План одобрен 22.11 меню:** «Одобряю план RT-3419». Решения сессии, названные владельцу в
  вопросе: граница 90 минут и пункт меню «подскажу путь».
- **Задача переопределена 22.11.** Владелец: команда, которая даёт право ничего не делать, не
  нужна; нужно право дождаться CI или долгого процесса и продолжить шаг. Выбор в меню — «Ожидание
  и убрать «стоп»». Прежний план о сообщении из очереди снят: «стоп» больше ничего не отпускает.
- **Роли на первом плане 21.11.** Первый план правил три проверки, которые после «стоп» не
  отказывают, и не видел «стоп», набранный во время хода. План переписан на источник слова
  владельца.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3419-stop-word-releases-task

### Where we stand at the minute of the compaction

- **State:** `задача-взята`
- **Stage:** нет — план написан и закоммичен, роли его прочли; одобрение владельца утром
- **Next step:** утром — «Одобряю план RT-3419» и `plan-red`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3419-stop-word-releases-task/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
ca8e96e44 docs(rt:agent-kit): находки разбора правил после RT-3468 — в файл находок эпика (RT-3419)
e61c6ec6c Merge branch 'RT-3468-foreign-refusal-not-idle' into RT-3419-stop-word-releases-task
09f093a33 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3468-foreign-refusal-not-idle
0d5d213e0 [RT-3425] Влитая база со старой папкой не откатывает разобранную задачу (#3505)
5540f9e58 docs(rt:agent-kit): папка задачи о чужом отказе остановки разобрана в архив (RT-3468)
ffdb405e9 docs(rt:agent-kit): удержание по CI вынесено из описания выхода из хода в свой поддомен (RT-3468)
f2e750c04 Revert "docs(rt:agent-kit): папка задачи о чужом отказе остановки разобрана в архив (RT-3468)"
29d004272 docs(rt:agent-kit): папка задачи о чужом отказе остановки разобрана в архив (RT-3468)
9dbdad497 fix(rt:agent-kit): копия сессии из входа хука и правило плана о черновиках — правки после второго круга ревью (RT-3468)
ef7ccc885 fix(rt:agent-kit): чужой отказ и черновик своей копии — правки после первого круга ревью (RT-3468)
4127f5704 docs(rt:agent-kit): описание проверки выхода из хода — чужой отказ остановки и меню после отказа движка (RT-3468)
76865bd14 fix(rt:agent-kit): проверка черновика не судит черновик ветки, взятой в другой копии (RT-3468)
8b89b850a fix(rt:agent-kit): отказ чужой проверки остановки не зовёт меню простоя (RT-3468)
fc75f30c2 docs(rt:agent-kit): находки разбора правил после RT-3425 — в файл находок эпика (RT-3468)
414f47d57 docs(rt:agent-kit): ход работы RT-3468 — план одобрен, шаги плана в ходе работы (RT-3468)
83bfee9d4 docs(rt:agent-kit): находка о выходе следа без диапазона коммитов в адресе (RT-3468)
e6611cd02 Merge branch 'RT-3425-flow-reads-branch-line' into RT-3468-foreign-refusal-not-idle
ba46f1f06 docs(rt:agent-kit): папка задачи о чтении удалённого файла после влитой базы разобрана в архив (RT-3425)
26d8d3a60 fix(rt:agent-kit): собственный разбор ветки первым — правки после второго круга ревью (RT-3425)
43d7630ca docs(rt:agent-kit): ход работы RT-3425 — живая проверка после первого круга (RT-3425)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
