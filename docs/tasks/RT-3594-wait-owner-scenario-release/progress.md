# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Сценарий перед выпуском и тексты
- **Done:** разбор записан; план прочли product-strategist и goal-critic пять кругов, последний без находок;
  владелец одобрил план 27.11 ответом меню «Одобряю план RT-3594». RT-3584 вернулась в эпик RT-3602 и влита
  сюда PR #3733; `step 2` после влития отметил 2.11 — 14 из 14
- **Next step:** этап 3 (`step 3`), живая проверка, круги ревью, набор, PR в ветку эпика RT-3602; после выпуска
  кита — задача RT-3721 (ночь по слову владельца и отпуск ночи без работы)
- **PR:** not open yet

## Steps

- [x] 1.1 Сборщик записи пишет запуск фоновой команды, вызов Monitor, уведомление задачи и слово только в очереди
- [x] 1.2 Построение дерева сценария вынесено в общий файл
- [x] 1.3 Общий файл берёт хуки и движок из папки пакета
- [x] 1.4 Набор записанных ходов подключает общий файл
- [x] 1.5 Прогон судьи берёт фикстуры по началу имени
- [x] 2.1 Цепочка дня лежит файлом данных
- [x] 2.2 Ночью при границе впереди отказ конца хода не называет меню владельцу
- [x] 2.3 Одобрение плана, который правит проверку, после ролей проходит
- [x] 2.4 Отказов конца хода после Esc 10:54 один
- [x] 2.5 Вызов работы без слова владельца после Esc отказан
- [x] 2.6 Вызовы в ходах по слову владельца проходят
- [x] 2.7 Monitor по своему фоновому отказан
- [x] 2.8 Конец хода после ответа меню отпущен по фоновому
- [x] 2.9 На пакете 0.41.1 отказов после Esc больше одного, контрольная точка зелёная
- [x] 2.10 На пакете 0.39.0 цепочка держит ночью и одобрение сообщением, контрольная точка зелёная
- [x] 2.11 Судья вопросов даёт ожидаемый вердикт на вопросах утра два прогона подряд
- [x] 3.1 Процесс публикации гоняет оба набора на собранном издании после раскладки и до первого коммита
- [x] 3.2 Оба набора зелёные на Linux на свежесобранном издании
- [x] 3.3 Журнал называет RT-3594 под ненапечатанным выпуском
- [x] 3.4 Сценарий SC-AK-2018 стоит в спеке записанных ходов
- [x] 3.5 Привязка спека называет набор дня
- [x] 3.6 Карточки RT-3593 и RT-3584 называют свою часть цепочки

## Decisions along the way

- **В цепочку ложатся и вызовы правки, которые считает `session.wrote`** — без Edit, Write и команд правки до
  10:54 ночные и утренние концы хода отпускает случай «правок не было», и отрезки ночи и утра судятся не на той
  истории; находка product-strategist пятого круга, после одобрения плана. Отступление от строки «Вход» плана
  («прочие из 803 вызовов окна не ложатся»). Affected stage of the plan: 2.
- **Режим издания берёт хуки прямо из `<папка>/assets/hooks`, без раскладки по дереву** — хуки находят движок
  рядом, в `../checks` (`owner-stop-call-guard.sh:64`, `monitor-stream-guard.sh:48`, `turn-exit-guard.sh:71`), как
  в исходниках пакета; раскладка `assets/checks` в `tools/` дерева лишняя. Отказ от строки «Устройство» плана о
  соответствии папок. Affected stage of the plan: 1.
- **Время записи сдвигается к минуте прогона** — движок судит фоновое по часам (`measure/session.mjs:163`,
  `BACKGROUND_BOUND` 90 минут): фоновое трёхдневной давности для него зависло. `turn-replay-lib.mjs` с `<upto>`
  берёт ходы до точки и сдвигает время так, что точка стоит на минуте прогона. Affected stage of the plan: 1.
- **Набор ловит переменные издания до `lib.sh`** — `lib.sh` снимает все `RT_*`, и `RT_REPLAY_LAID` в
  `turn-replay.test.sh` до этой правки не работал ни разу. Оба набора берут `RT_REPLAY_EDITION` и `RT_REPLAY_LAID`
  в свои переменные до подключения. Affected stage of the plan: 1.
- **Путь издания раскрывается без ссылок** — движок издания сверяет `import.meta.url` с путём запуска, и во
  временной папке macOS (`/var` → `/private/var`) молча не работает: на 0.41.1 набор давал ноль отказов и пустой
  вердикт. `turn-replay-tree.sh` берёт путь издания через `pwd -P`. Affected stage of the plan: 2.
- **Каждая запись получает `uuid`** — plan-red ищет одобрение по `uuid` записей; без него дерево одобрения
  отказано. Affected stage of the plan: 2.
- **Цепочка дня — 630 точек, файл 660 строк при пределе 700** — набор дня идёт 36 с. Affected stage of the plan: 2.
- **Шаг 2.11 заблокирован** — судья вопросов на `2411-morning-held-4.json` и `2411-morning-held-5.json` пускал
  вопрос «влить ветку, которая меняет счёт одобрения, или отложить задачу» в 1 и в 2 прогонах из 4: текст судьи
  для такого вопроса двусмысленный. Правку текста судьи ask-judge сам держит как ослабление проверки; находка
  перенесена в карточку RT-3584 эпика RT-3714 условием готовности. Affected stage of the plan: 2.
- 27.11 предел ночи набора дня теперь `limit RT-3721`, не `limit RT-3584`: ночная часть ушла задачей RT-3721
  словом владельца в меню «Судья сейчас, ночь после»; RT-3584 вернулась в эпик RT-3602 словом «Вернуть в RT-3602».
- 27.11 раздел выпуска называет RT-3584 по вехе G эпика: её строка стоит под `[Unreleased]` журнала рядом с
  RT-3594.
- 27.11 перед выпуском текст судьи вопросов перемеряется на главной ветке по строке плана эпика: «Перед каждым
  выпуском `judge-replay.mjs --key ask` гоняется один раз на главной ветке, без условия»; итог — рядом с итогом
  выпуска.
- Превышение «No decision» плана: `projects/agent-kit/tests/turn-replay-tree.sh` — построение дерева сценария
  вынесено в общий файл шагом 1.2, его берут оба набора.
- Превышение «No decision» плана: `projects/agent-kit/tests/owner-waits-replay.test.sh` — набор цепочки дня,
  шаги этапа 2 и 3.1–3.2 гоняют его.
- Превышение «No decision» плана: `projects/agent-kit/tests/turn-replay-lib.mjs:noticeText` — сборщик записи
  пишет уведомление задачи, шаг 1.1.
- Превышение «No decision» плана: `projects/agent-kit/tests/turn-replay-lib.mjs:startOf` — запуск фоновой команды
  в записи, шаг 1.1.
- Превышение «No decision» плана: `projects/agent-kit/tests/turn-replay-lib.mjs:callInput` — вызов `Monitor` и
  слово в очереди в записи, шаг 1.1.
- Превышение «No decision» плана: `projects/agent-kit/tests/turn-replay-lib.mjs:chainTurns` — цепочка дня по
  файлу данных, шаг 2.1.

## Sessions

### 2026-11-27

- Задача взята после слияния RT-3674 (#3710) в ветку эпика; ветка от `RT-3602-owner-stop-holds`.
- Эпик RT-3714 заведён: карточка, подзадачи RT-3593 и RT-3584, ветка с планом из рабочей копии — `task:new --epic`
  не отправил её из чистого клона: проверка путей там красная.
- 27.11 после влития RT-3584 (#3733): `step 2` — 2.11 совпал, 14 из 14; `step 3` — 6 из 6, в том числе 3.2: оба
  набора зелёные на Linux в Docker на свежесобранном издании. Живая проверка — этот шаг 3.2: набор дня и
  записанные ходы на собранном издании, как их гоняет процесс публикации. Ветка ушла на хост 27.11 с `--no-pr`
  (`c762768f1`) как база PR RT-3584; таблица входов набора записана заново после слияния main.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/epic-3471-merge
**Branch:** RT-3594-wait-owner-scenario-release

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Цепочка дня 24.11
- **Next step:** этап 2 — файл цепочки дня из записи 24.11 и набор `owner-waits-replay.test.sh`. Этап 1: `step 1`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3594-wait-owner-scenario-release/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../../../../../.github/workflows/publish-agent-kit.yml
 M spec.md
 M ../../../../../tasks/RT-3594-wait-owner-scenario-release/progress.md
 M ../../../../../../projects/agent-kit/tests/turn-replay-lib.mjs
 M ../../../../../../projects/agent-kit/tests/turn-replay-tree.sh
 M ../../../../../../projects/agent-kit/tests/turn-replay.expected.json
 M ../../../../../../projects/agent-kit/tests/turn-replay.test.sh
?? ../../../../../../projects/agent-kit/tests/fixtures/owner-waits/
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-1.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-2.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-3.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-4.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-5.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-roles-after-1.json
?? ../../../../../../projects/agent-kit/tests/fixtures/turn-replay/2411-morning-roles-after-2.json
?? ../../../../../../projects/agent-kit/tests/owner-waits-replay.test.sh
```

### Commits over the main branch

```
633cb8ecc test(rt:agent-kit): сборщик записи и общее дерево сценария для цепочки дня (RT-3594)
44858fbcc docs(rt:agent-kit): план RT-3594 одобрен владельцем
20f8314f0 docs(rt:agent-kit): разбор и ход работы RT-3594, задачи 5–6 перенесены в эпик RT-3714
3dd8488e9 docs(rt:agent-kit): находки разбора правил RT-3674 записаны рядом с планом эпика (RT-3594)
8c2b99686 docs(rt:agent-kit): задача 3 эпика влита, задача 4 идёт (RT-3594)
d8bd62ada [RT-3674] Monitor со строкой на каждый шаг своей фоновой команды отказан (#3710)
c84ac76d2 docs(rt:agent-kit): папка задачи RT-3674 разобрана в архивную запись (RT-3674)
da3360d8b docs(rt:agent-kit): ход работы называет отменённое (RT-3674)
f28714d4e docs(rt:agent-kit): ход работы называет цену задачи (RT-3674)
8c4023212 fix(rt:agent-kit): отсев хука Monitor без слов tee и perl (RT-3674)
c52db07e0 fix(rt:agent-kit): отказ Monitor по своему фоновому после второго круга ревью (RT-3674)
6b987bf94 fix(rt:agent-kit): отказ Monitor по своему фоновому после первого круга ревью (RT-3674)
4dc9f4edc docs(rt:agent-kit): план эпика называет итог задачи 3, находки RT-3691 записаны (RT-3674)
c5f7f1520 docs(rt:agent-kit): ход работы называет расхождения кода с решением плана (RT-3674)
232fe8f16 docs(rt:agent-kit): спеки и файл правила называют отказ Monitor по своему фоновому, пакет разложен (RT-3674)
421bee742 feat(rt:agent-kit): хук отказывает Monitor, который печатает строку на каждый шаг своего фонового (RT-3674)
3393209a8 feat(rt:agent-kit): движок судит Monitor, который печатает строку на каждый шаг своего фонового (RT-3674)
5427ae649 docs(rt:agent-kit): план RT-3674 одобрен владельцем
0cf5de700 docs(rt:agent-kit): разбор и ход работы RT-3674
76bbafb6c docs(rt:agent-kit): задача 2 эпика влита, задача 3 идёт (RT-3674)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
