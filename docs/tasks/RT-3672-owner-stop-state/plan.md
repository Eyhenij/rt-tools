# Plan

**Task:** RT-3672 · **Branch:** RT-3672-owner-stop-state
**Behaviour:** unchanged — правится движок задач пакета правил, код приложений не трогается; слово владельца: «Бери RT-3602»

## Points

- **A:** остановку снимает любое следующее сообщение владельца. Вопрос, брань и «пиши инцидент» возвращают работу.
  CI держит ход и после «стоп». «блин, стоп», «не двигайся дальше … пока не скажу», «Остановить работу» и «Стоп.
  Сначала напиши инцидент» остановкой не считаются, а «хватит тупить, чини» считается. Судья хода читает брань после
  «стоп» как «почему стоишь», проверки черновика, совести и пометки груза остановку не читают.
- **This task reaches:** после «стоп» или Esc ход отпускается, пока владелец не даст рабочий приказ. Вопрос, брань и
  «пиши инцидент» исполняются, работа не возобновляется. Движок, удержание CI, судья хода, прогноз и три проверки на
  конце хода судят одно состояние.
- **Sign:** случаи SC-AK-2010–2013 в наборах; повтор судьи хода на записанных ходах «стоп → вопрос, брань, инцидент,
  вливай»; вердикт движка на записи 24.11, обрезанной после «пиши инцидент», до правки и после.
- **Milestone G of the epic:** версия кита в npm с номерами задач 1–3 в разделе `projects/agent-kit/CHANGELOG.md`,
  набор RT-3594 зелёный.
- **Metric:** нет: остановку снимало любое следующее сообщение владельца.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/task-flow/source/owner.mjs:wordsOf` — слова владельца записи по порядку: идёт по записям через `wordOf` и берёт время записи, если оно есть; виды — набранное, из очереди, Esc, ответ меню, текст отказа от вызова. `projects/agent-kit/assets/task-flow/measure/owner.mjs:stopStands` — проходит слова по переходам и отвечает, стоит ли остановка и чем поставлена; `saidStop` и `interrupted` читают его. `projects/agent-kit/assets/task-flow/measure/ci.mjs:hold` спрашивает `stopStands` первым. `projects/agent-kit/assets/checks/flow-forecast.mjs:forecastCopies` даёт двойнику владельца те же слова. `projects/agent-kit/assets/checks/task-flow-script.mjs` получает команду `stop`, её зовут `.claude/hooks/git-guard-draft-ready.sh`, `projects/agent-kit/assets/hooks/conscience-guard.sh` и `.claude/hooks/cargo-mark-guard.sh` |
| Dependencies | мера читает источник через `owner.words()` и не импортирует его; источник импортирует `record-count.mjs`, как сейчас; `ci.mjs` импортирует меру, как сейчас; три хука зовут `task-flow-script.mjs stop` процессом и ничего не импортируют; обратно никто не ходит |
| Coupling | `projects/agent-kit/assets/task-flow/measure/owner.mjs` исходящие 0 → 0; `projects/agent-kit/assets/task-flow/source/owner.mjs` исходящие 0 → 0; `projects/agent-kit/assets/task-flow/measure/ci.mjs` исходящие 2 → 2; `projects/agent-kit/assets/checks/flow-forecast.mjs` исходящие 3 → 3; `projects/agent-kit/assets/checks/task-flow-script.mjs` исходящие 11 → 11 |
| Patterns | State — `projects/agent-kit/assets/task-flow/measure/owner.mjs:stopStands`, остановка — состояние над словами записи, а не последнее слово; внутри сообщения решает последний сигнал: слово остановки или рабочий приказ. Отброшено: дописать слова в `words.stop` — следующее сообщение всё равно снимало бы остановку; таблица переходов в `flow.js` — раздел `words` принимает только списки, поэтому переходы — код `stopStands`, слова — данные описания |
| Terms | новых слов глоссария нет: «рабочий приказ» — слово списка `words.resume`, только прямые приказы: список плана эпика, «чини», «сделай» и приказы из `words.stopExcept`; выражение `words.nudge` источником приказов не служит, «сначала», «спрашивать», «спрашивай» и «asking» приказом не считаются; слова сравниваются целым словом; в части сообщения со словом `words.stay` («без предпочтения», «инцидент», «разбор», «приёмник») приказ не считается и остановку не снимает, а слово остановки в ней остановку ставит; части делятся знаками «.», «,», «;» и словами «и», «затем», «потом»; его называет спек выхода |
| Input | слова владельца записи сессии: набранное, из очереди, Esc, сообщение после метки Esc быстрее 2 секунд, ответ меню, отказ от вызова с отметкой Esc и с текстом, «без предпочтения»; `/stop` из очереди, как 24.11 в 03:56:51; уведомление и сообщение соседней сессии словом не считаются. SC-AK-2010, `projects/agent-kit/tests/turn-exit-guard-stop.test.sh`; SC-AK-2012, `projects/agent-kit/tests/turn-replay.test.sh` |
| Bounds | `approvalOf` не меняется; записи отпусков «a stop word of the owner» и «the owner interrupted the turn» остаются; отпуск конца сценария, роли и молчащего хоста не меняется; протокол хуков Stop не меняется; три хука зовут `stop` только после своих условий отказа; отказ судьи хода за приказанное и не сделанное при остановке остаётся; таблица решений `tools/decision-table.json` не меняется |
| Priority | надёжность остановки выше удержания хода: в сомнении остановка стоит. Цена: незнакомый приказ после «стоп» ход не держит |
| Budget | `projects/agent-kit/assets/task-flow/measure/owner.mjs` до 170; `projects/agent-kit/assets/task-flow/source/owner.mjs` плюс 25; `projects/agent-kit/assets/task-flow/measure/ci.mjs` плюс 6; `projects/agent-kit/assets/task-flow/flow.js` плюс 25; `projects/agent-kit/assets/checks/flow-data.mjs` плюс 4; `projects/agent-kit/assets/checks/flow-forecast.mjs` плюс 6; `projects/agent-kit/assets/checks/task-flow-script.mjs` плюс 20; `.claude/hooks/git-guard-draft-ready.sh` плюс 15; `projects/agent-kit/assets/hooks/conscience-guard.sh` плюс 10; `.claude/hooks/cargo-mark-guard.sh` плюс 10; `projects/agent-kit/assets/rules/turn-conduct.md` плюс 0, текст не длиннее 24 000 знаков; `projects/agent-kit/tests/turn-exit-guard.test.sh` до 500; `projects/agent-kit/tests/turn-replay.test.sh` до 500; новых файлов кода: 1; новых зависимостей: 0 |

## Task footprint

| What | Where |
| ---- | ----- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/owner.mjs`, `projects/agent-kit/assets/task-flow/measure/owner.mjs`, `projects/agent-kit/assets/task-flow/measure/ci.mjs`, `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/checks/flow-data.mjs`, `projects/agent-kit/assets/checks/flow-forecast.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/hooks/turn-judge.md`, `projects/agent-kit/assets/hooks/conscience-guard.sh`, `.claude/hooks/git-guard-draft-ready.sh`, `.claude/hooks/cargo-mark-guard.sh` |
| Rules (правится) | `projects/agent-kit/assets/rules/turn-conduct.md`, `projects/agent-kit/assets/defaults/turn-map.md`, `.claude/skills/turn-conduct/implementation.md` |
| Tests (правится) | `projects/agent-kit/tests/turn-exit-guard-stop.test.sh`, `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-exit-lib.sh`, `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/turn-replay.expected.json`, `projects/agent-kit/tests/fixtures/turn-replay/`, `projects/agent-kit/tests/conscience-guard.test.sh`, `projects/agent-kit/tests/cargo-mark-guard.test.sh`, `tools/tests/git-guard-draft-ready.test.sh` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/mission/`, `docs/specs/agent-kit/turn-guards/flow-script/exit/`, `docs/specs/agent-kit/turn-guards/flow-script/exit-ci/`, `docs/specs/agent-kit/turn-guards/flow-script/replay/` |
| Layout (правится) | `tools/task-flow/source/owner.mjs`, `tools/task-flow/measure/owner.mjs`, `tools/task-flow/measure/ci.mjs`, `tools/task-flow/flow.js`, `tools/task-flow/flow.md`, `tools/flow-data.mjs`, `tools/flow-forecast.mjs`, `tools/task-flow-script.mjs`, `.claude/hooks/turn-judge.md`, `.claude/hooks/conscience-guard.sh`, `.claude/skills/turn-conduct/SKILL.md`, `.claude/rt-kit/defaults/turn-map.md` |
| Decision table | `tools/decision-table.json`, `projects/agent-kit/assets/checks/decision-table.json` |
| Epic plan | `docs/plans/owner-stop-holds.md` |

## What counts as done

- Остановка считается проходом по словам владельца записи по таблице «Переходы» плана эпика, а не по последнему слову.
  Внутри сообщения решает последний сигнал. Слова `words.stop` ставят остановку в начале сообщения, слова
  `words.stopInside` — в любом месте; слово с «не» перед ним сигналом не считается.
- «блин, стоп», «я же сказал стоп», «не двигайся дальше … пока не скажу», «Остановить работу», «стоп, пиши инцидент» и
  «Стоп. Сначала напиши инцидент» ставят остановку. «хватит тупить, чини», «подожди CI и вливай», «вливай и подожди CI» и «вливай, не жди CI»
  её не ставят. Сообщение после метки Esc быстрее 2 секунд судится само.
- Вопрос, брань и «пиши инцидент» остановку не снимают: ни «Стоп. Почему ты всё ещё работаешь?!», ни «какого хрена ты
  не остановился», ни «ну что там с CI?». Снимают рабочий приказ, выбор работы в меню и одобрение плана; «не вливай
  пока» не снимает. «пиши инцидент на это поведение и отправляй в приёмник» (24.11, 04:01:21) не снимает, а «отправь
  отчёт об инциденте в приёмник, затем продолжай работу по эпику» снимает. «без
  предпочтения» и меню без ответа остановку не трогают. `/stop` из очереди ставит остановку.
- Пока остановка стоит, удержание CI ход не держит: ни красный запуск, ни идущий, ни свежая вершина.
- Судья хода, прогноз, проверки черновика, совести и пометки груза судят то же состояние. Судья хода не читает брань
  после «стоп» как приказ продолжать.
- Замер до правки и после записан в ход работы: вердикты движка на записи 24.11, обрезанной на 04:04:40, — отказов
  конца хода с 04:02:37 по 04:04:31 было 6, станет 0; прогноз пропущенных остановок за 7 дней; сколько первых слов
  после Esc записи 24.11 снимает остановку; повтор судьи хода на прежних записанных ходах до правки.

## Stages

### 1. Остановка — состояние по записи

- **Steps:**
    1. Замер до правки записан в ход работы
       Check: `grep -c '^- Замер до правки:' docs/tasks/RT-3672-owner-stop-state/progress.md` → = 1
    2. Источник отдаёт слова владельца по порядку с временем и видом
       Check: `grep -c 'export function wordsOf' projects/agent-kit/assets/task-flow/source/owner.mjs` → = 1
    3. Мера проходит слова по таблице переходов
       Check: `grep -c 'export function stopStands' projects/agent-kit/assets/task-flow/measure/owner.mjs` → = 1
    4. Слова снятия, остановки внутри фразы и ответа без выбора в описании
       Check: `grep -cE '^    (resume|stopInside|stay):' projects/agent-kit/assets/task-flow/flow.js` → = 3
    5. Удержание CI не перекрывает остановку
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh 2>&1 | grep -cE '^  ok +[a-z-]+: SC-AK-2011'` → >= 3
    6. Случаи набора остановки на каждую строку «Переходы»
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh 2>&1 | grep -oE 'SC-AK-2010 строка [1-7]' | sort -u | wc -l | tr -d ' '` → = 7
    7. Прежние случаи слова остановки называют новое удержание CI
       Check: `grep -c '«стоп» снимает и красный запуск' projects/agent-kit/tests/turn-exit-guard.test.sh` → = 1
    8. Записанные ходы на каждую строку «Переходы»
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/turn-replay.test.sh 2>&1 | grep -oE 'SC-AK-2012 строка [1-7]' | sort -u | wc -l | tr -d ' '` → = 7
    9. Прогноз читает те же слова владельца
       Check: `grep -c 'words: ()' projects/agent-kit/assets/checks/flow-forecast.mjs` → = 1
- **Readiness sign:** остановка держится до рабочего приказа в мере, в случаях отпуска, в удержании CI и в прогнозе.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard-night.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard-wait.test.sh`,
  `bash projects/agent-kit/tests/turn-replay.test.sh`,
  `bash projects/agent-kit/tests/flow-language.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script-forecast.test.sh` — 0 провалов.

### 2. Вторые судьи

- **Steps:**
    1. Команда движка отвечает, стоит ли остановка
       Check: `grep -c "'forecast', 'stop'\]" projects/agent-kit/assets/checks/task-flow-script.mjs` → = 1
    2. Проверка снятия черновика отпускает ход при остановке
       Check: `grep -c 'SC-AK-2013' tools/tests/git-guard-draft-ready.test.sh` → >= 2
    3. Проверка совести отпускает ход при остановке
       Check: `grep -c 'SC-AK-2013' projects/agent-kit/tests/conscience-guard.test.sh` → >= 2
    4. Проверка пометки груза отпускает ход при остановке
       Check: `grep -c 'SC-AK-2013' projects/agent-kit/tests/cargo-mark-guard.test.sh` → >= 2
    5. Судья хода держит остановку до рабочего приказа
       Check: `grep -c 'until a working order' projects/agent-kit/assets/hooks/turn-judge.md` → >= 1
    6. Записанные ходы «стоп → вопрос, брань, инцидент, вливай» с ожидаемым вердиктом судьи
       Check: `grep -c -- '-stop-then-' projects/agent-kit/tests/turn-replay.expected.json` → >= 4
    7. Правило хода называет то же
       Check: `grep -c 'until a working order' projects/agent-kit/assets/rules/turn-conduct.md` → >= 1
    8. Карта хода называет то же
       Check: `grep -q 'their last message begins with it' projects/agent-kit/assets/defaults/turn-map.md` → exit 1
    9. Файл правила хода для дерева называет то же
       Check: `grep -qE "owner's last (message|entry)" .claude/skills/turn-conduct/implementation.md` → exit 1
- **Readiness sign:** судья хода, правило, карта и три проверки на конце хода судят одно состояние.
- **Verified by:** `bash tools/tests/git-guard-draft-ready.test.sh`,
  `bash projects/agent-kit/tests/conscience-guard.test.sh`,
  `bash projects/agent-kit/tests/cargo-mark-guard.test.sh`,
  `bash projects/agent-kit/tests/turn-replay.test.sh`,
  `bash projects/agent-kit/tests/checks-turn-map.test.sh` — 0 провалов.

### 3. Спек, раскладка и замер после

- **Steps:**
    1. Миссия называет остановку до рабочего приказа
       Check: `grep -q 'the later message cancels it' docs/specs/agent-kit/turn-guards/mission/spec.md` → exit 1
    2. Спек выхода называет переходы и проверки на конце хода
       Check: `grep -cE '^### SC-AK-(2010|2013) ' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` → = 2
    3. Спек удержания CI называет остановку
       Check: `grep -q 'and nothing else' docs/specs/agent-kit/turn-guards/flow-script/exit-ci/spec.md` → exit 1
    4. Спек записанных ходов называет формы записи
       Check: `grep -c '^### SC-AK-2012 ' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md` → = 1
    5. Пакет разложен в дерево
       Check: `grep -c 'export function stopStands' tools/task-flow/measure/owner.mjs` → = 1
    6. Замер после правки записан в ход работы
       Check: `grep -c '^- Замер после правки:' docs/tasks/RT-3672-owner-stop-state/progress.md` → = 1
- **Readiness sign:** миссия, спеки и раскладка совпадают с кодом; вердикт на записи 24.11 после правки — отпуск.
- **Verified by:** `node tools/flow-sync.mjs --check`, `node tools/check-specs.mjs`, `node tools/check-file-size.mjs`
  и `node dist/agent-kit/bin/agent-kit.js sync --check` — без отказов; после раскладки
  `node projects/agent-kit/tests/judge-replay.mjs` — последняя строка «judge replay: N of N match».

## What this work does not do

- Отказ вызовов после остановки без слова владельца и снятие фонового, запущенного до неё, — RT-3673.
- Отказ `Monitor` со строкой на каждый шаг — RT-3674.
- Запись 24.11 целиком как случай набора, сценарий «работа ждёт владельца» и счёт ходов с ответом после Esc — RT-3594.
- Меню застревания кнопками и вариант «остановить работу» в нём — RT-3593, выходит после выпуска задач 1–3.
- Отпуск хода строкой «Работа ночи кончилась» — RT-3584.
- Остановка не переживает новую сессию и передачу: запись читается одной сессии.
