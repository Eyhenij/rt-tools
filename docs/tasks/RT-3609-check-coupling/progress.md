# Ход работы

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Проверка вживую
- **Done:** план одобрен владельцем 24.11: «Одобряю план RT-3609». Шесть модулей команды, набор на 128 случаев,
  описание, список долга из 83 записей. Все шаги измерены.
- **Next step:** два круга ревью.
- **Uncommitted:** нет
- **PR:** not open yet

## Live check

- Команда на дереве: модулей 3771, связей 9795, циклов 2, циклов блоков 3, обходов 78.
- Ветка против базы: модулей 3765 → 3771, связей 9785 → 9795, циклов 2 → 2, циклов блоков 3 → 3, обходов 78 → 78.
  `check-coupling.mjs` исходящие 0 → 6, `coupling-judge.mjs` 0 → 1, у остальных четырёх новых модулей 0 → 0.
- Время с базой 3 секунды. При загрузке машины соседними наборами (load 233) — 16 секунд.
- Прошлые слияния: `819535a12242`, `798bcbd73fe0`, `b66e3a8eb83f` отказаны, `b498977b3e1a` пропущено.
- Все наборы пакета зелёные: `bash projects/agent-kit/tests/run.sh`.

## Steps

- [x] 1.1 Граф читает каждую форму импорта и подключения и не читает комментарий и текст
- [x] 1.2 Цикл модулей находится в любом виде файлов, цикл блоков — без цикла файлов
- [x] 1.3 Обход входа находится, в том числе мимо объявленного; неизбежный и законный не находятся
- [x] 1.4 По модулю печатаются входящие, исходящие, обходы и доля отданного без потребителя
- [x] 2.1 С базой печатается «было → стало» по модулям, блокам и дереву, с `--at` — по прошлой ревизии
- [x] 2.2 Новый цикл модулей и блоков отказан и при ослабленной веткой настройке, старый пропущен
- [x] 2.3 Новый обход отказан; старый импорт не становится новым от нового входа и от ушедшей связи
- [x] 2.4 Рост сверх названного отказан; план читается из истории; работа, приехавшая слиянием, не судится
- [x] 2.5 Своя запись долга не снимает отказ, слово владельца снимает; запись без причины и без нарушения отказана
- [x] 3.1 Команда на дереве выходит с нулём и называет циклы, циклы блоков и обходы числом
- [x] 3.2 Прежней проверки циклов нет, и её не зовёт ничто
- [x] 3.3 Набор перед отправкой зовёт команду с базой один раз
- [x] 3.4 CI зовёт команду с базой, соответствие CI и набора сходится
- [x] 3.5 Описание, сценарии и привязки команды на месте
- [x] 3.6 Правило, таблица приёмов и файл привязок называют команду
- [x] 3.7 Счёта руками в таблице приёмов нет
- [x] 4.1 Команда с базой на этой ветке не отказывает и печатает «было → стало»
- [x] 4.2 Время с базой не больше пяти секунд
- [x] 4.3 Прошлые слияния с нарушением отказаны, чистое пропущено
- [x] 4.4 Отказ прошлого слияния называет сам цикл

## Decisions along the way

- **Записи долга ссылаются на RT-3618.** Слово владельца 24.11 о задаче долга: «Завести вне эпика». Affected
  stage of the plan: 3.
- **Проверка шага 3.2 заменена:** `test ! -f tools/check-cycles.mjs && cat package.json .github/workflows/ci.yml .claude/rt-kit/project.sh .claude/rt-kit/checks.json .claude/rt-kit/push-inputs.json | grep -c 'check-cycles' || true` → = 0
- **Проверка шага 3.7 заменена:** `test -f tools/check-coupling.mjs && grep -cE 'read by hand|until the tree has a command' projects/agent-kit/assets/patterns/code-design-choose.md || true` → = 0
- **Почему заменены.** `grep -c` при нуле совпадений выходит с кодом 1, и проверка шага читает это как отказ. Команда и
  ожидаемое число прежние, добавлено `|| true`.

## Sessions

### 24.11

- План прочитан ролями трижды, держащие находки внесены, черновик кода зелёный на 125 случаях.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/epic-3471-merge
**Branch:** RT-3609-check-coupling

### Where we stand at the minute of the compaction

- **State:** `замысел-записан`
- **Stage:** 1 of 4 — Граф и числа
- **Next step:** модули графа и чисел из черновика в пакет, набор `check-coupling.test.sh`.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3609-check-coupling/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/rt-kit/checks.json
 M .claude/rt-kit/defaults/push.sh
 M .claude/rt-kit/project.sh
 M .claude/skills/code-design-choose/SKILL.md
 M .claude/skills/code-design/SKILL.md
 M .github/workflows/ci.yml
 M package.json
 M projects/agent-kit/assets/checks/rt-kit-checks.config.mjs
 M projects/agent-kit/assets/defaults/push.sh
 M projects/agent-kit/assets/patterns/code-design-choose.md
 M projects/agent-kit/assets/rules/code-design.md
D  tools/check-cycles.mjs
 M tools/rt-kit-checks.config.mjs
?? projects/agent-kit/assets/checks/check-coupling.mjs
?? projects/agent-kit/assets/checks/coupling-graph.mjs
?? projects/agent-kit/assets/checks/coupling-judge.mjs
?? projects/agent-kit/assets/checks/coupling-numbers.mjs
?? projects/agent-kit/assets/checks/coupling-plan.mjs
?? projects/agent-kit/assets/checks/coupling-read.mjs
?? projects/agent-kit/tests/check-coupling.test.sh
```

### Commits over the main branch

```
1b129061f docs(rt:agent-kit): ход работы над измерением зацепления начат (RT-3609)
c2d726242 docs(rt:agent-kit): план измерения зацепления одобрен владельцем (RT-3609)
ac39553e5 docs(rt:agent-kit): разбор задачи об измерении зацепления (RT-3609)
1f1a75a76 [RT-3608] Правило проектирования кода приходит до записи разбора и плана (#3614)
8c7f13ee9 docs(rt:agent-kit): папка задачи о правиле проектирования разобрана в архив (RT-3608)
096e7763f fix(rt:agent-kit): правило проектирования после второго круга ревью (RT-3608)
661dbcdd0 docs(rt:agent-kit): точка B плана эпика приведена к решению владельца (RT-3608)
713e89605 fix(rt:agent-kit): правило проектирования после первого круга ревью (RT-3608)
f339749b3 feat(rt:agent-kit): правило проектирования кода и таблица приёмов (RT-3608)
e609f4a89 feat(rt:agent-kit): правило проектирования приходит на разборе, плане и коде (RT-3608)
bd9335eb0 docs(rt:agent-kit): план задачи о правиле проектирования кода (RT-3608)
f9ed1077b docs(rt:agent-kit): разбор задачи о правиле проектирования кода (RT-3608)
457eb6fbc docs(rt:agent-kit): номера задач в плане эпика RT-3603
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
