# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 3 из 3 — живые запуски; план одобрен владельцем: «Одобряю plan.md RT-3417 (Recommended)»
- **Done:** разбор, план, режимы `--as-hook`, `--pad`, `--live`, сценарии SC-AK-1756–1757, уточнённый текст судьи; база — 188 запусков с длительностью, медиана 37,1 с, 12 таймаутов; перед стенограммой в 270 МБ медиана 17,1 с, 0 расхождений
- **Next step:** шаг 3.1 — набрать не меньше 10 живых запусков после коммита правки
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Шаги

- [x] 1.1 The expected verdicts hold the promises with no work
- [x] 1.2 The judge run as the hook gives the expected verdicts on the text as it stands
- [x] 2.1 The edited judge gives the expected verdicts in front of a real session record
- [x] 2.2 The edited judge stays within 20 s at the median with no divergence
- [>] 3.1 The live runs on this branch after the edit stay within the bound

## Решения по ходу

- **Время уходит на размер стенограммы, а не на модель и круги.** Калибровка `--as-hook` на нынешнем
  тексте: на коротких стенограммах медиана 11,6 с на модели по умолчанию, живой хук на стенограмме
  в 273 МБ — 37 с. Затронут этап 2: резать надо чтение большой стенограммы.
- **Судья на нынешнем тексте неустойчив.** Ход 1451 («шаг закоммичен, продолжать или
  остановиться?» после поручения) в трёх прогонах дал два отказа и один пропуск, шаг 1.2 — 2
  расхождения из 16. Текст судьи называет обещание и объявление, но не вопрос «продолжать ли» при
  невыполненном поручении. Уточнение входит в правку текста; правила, что держать и что отпускать,
  остаются. Затронуты шаги 1.2 и 2.1–2.2.
- **Текст судьи уточнён до снятия шага 1.2.** Вторая калибровка на нынешнем тексте качнулась на
  других ходах: 1447 (объявление после части работы) пропущен, 1449 (отчёт с выводами) отказан.
  Уточнены четыре места: объявление после части работы — отказ; отчёт без объявления — пропуск;
  успешный вызов команды показывает своё состояние; вопрос «продолжать ли» — уже отвеченный.
  Хвост чтения сокращён с 40 записей до 20. Шаг 1.2 снят на уточнённом тексте: 0 расхождений.
- **Запись 1456 получила настоящий вывод команды.** Перед большой стенограммой судья отказал ходу
  «в ветке план и первый шаг»: вывод `git log` в прогоне был словом `done` и утверждения не
  показывал. Изъян записи, не судьи: у вызова появилось необязательное поле `out`, спек прогона
  назвал его. Шаг 2.1 снят после этого: 0 расхождений.
- **Готовый прогон расширяется, а не пишется новый.** В дереве уже есть `judge-replay.mjs` и 27 записанных ходов; стратег нашёл это до одобрения плана, первая редакция плана писала дубль.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3417-stop-hook-time

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 из 3 — прогон судьи как хука; план одобрен владельцем: «Одобряю plan.md RT-3417 (Recommended)»
- **Next step:** ключи `judge` для 1447 и 1461, режимы `--as-hook`, `--pad`, `--live` в `judge-replay.mjs`, сценарий в спеке
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3417-stop-hook-time/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/turn-guards/flow-script/step-mark/implementation.md
 M docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md
 M docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md
 M docs/tasks/RT-3417-stop-hook-time/progress.md
 M projects/agent-kit/tests/judge-replay.mjs
 M projects/agent-kit/tests/turn-replay-lib.mjs
 M projects/agent-kit/tests/turn-replay.expected.json
 M projects/agent-kit/tests/turn-replay.test.sh
```

### Commits over the main branch

```
76aceccf1 docs(rt:agent-kit): ход работы RT-3417
128e032c1 docs(rt:agent-kit): план RT-3417
40dbf2d6a docs(rt:agent-kit): папка задачи RT-3417, разбор
1e92dd8e0 docs(rt:agent-kit): отметка «влито» у RT-3276 в плане эпика
1e1b85942 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3410-six-long-rules-fit
2bd26550c docs(rt:agent-kit): границы шести правил и база метрики после второго круга ревью (RT-3410)
bddf737da [RT-3276] Проверки разговора отданы модели: неделя после замены измерена (#3424)
d38ed4d42 docs(rt:agent-kit): папка задачи RT-3410 разобрана
fe8b4c337 docs(rt:agent-kit): границы и исключения шести правил после первого круга ревью (RT-3410)
69ed59b63 docs(rt:agent-kit): смысл шести ужатых правил возвращён по пересказу
9c64afde7 docs(rt:agent-kit): шесть длинных правил ужаты до заявлений статей
114f448ae docs(rt:agent-kit): ход работы RT-3410
1e1eefdcc docs(rt:agent-kit): ход работы RT-3410
12b826329 docs(rt:agent-kit): план RT-3410, проба и сверка смысла
227aa2239 docs(rt:agent-kit): папка задачи RT-3410, разбор
8975d92e3 docs(rt:agent-kit): отметка «влито» у RT-3404 в плане эпика
37d057310 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3276-conversation-checks
ce2bc11a3 docs(rt:agent-kit): неделя после замены по первому срабатыванию хука, после второго круга ревью (RT-3276)
44dae938b docs(rt:agent-kit): строгий счёт недели после замены, после первого круга ревью (RT-3276)
5e50d8d3b [RT-3404] Конец эпика доходит до PR эпика без отметки последней задачи (#3416)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
