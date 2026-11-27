# Plan

**Task:** RT-3594 · **Branch:** RT-3594-wait-owner-scenario-release
**Behaviour:** unchanged — задача добавляет сценарий набора и шаг процесса публикации; хуки и движок не меняются

## Points

- **A:** 24.11 одна сессия прошла тупик 0.39 целиком: ночью с 01:28 до 07:37 по местному времени стояла на меню
  проверки выхода, утром судья вопросов задержал пять вопросов: три одобрения планов RT-3584 и RT-3591, которые
  правят проверки, и два о влитии правки одобрения, днём после Esc в 10:54 ход двенадцать раз держала проверка
  конца хода. Правки ночи и утра вышли в 0.39.1 и 0.40.0, правки дня лежат в ветке эпика. Каждая прошла свой
  набор; цепочкой эту запись не прогонял никто, и процесс публикации кита наборов хуков не запускает.
- **This task reaches:** запись сессии 24.11 с 01:15 до 11:13 — одна цепочка в наборе: ночь, одобрение плана,
  который правит проверку, отпуск и остановка хода словом, Esc и `Monitor` по своему фоновому. На каждой точке
  судят хук конца хода, запрет вызовов после остановки и запрет `Monitor`. Та же цепочка на изданиях 0.39.0 и
  0.41.1 печатает числа «было» рядом с контрольной строкой. Процесс публикации гоняет набор на собранном издании
  после раскладки и до коммита версии: красный набор останавливает выпуск.
- **Sign:** `bash projects/agent-kit/tests/owner-waits-replay.test.sh` — зелёный, его строки называют каждую
  метрику; с `RT_REPLAY_EDITION` на пакетах 0.39.0 и 0.41.1 он красный на своих отрезках и зелёный на
  контрольной точке; шаг набора стоит в `.github/workflows/publish-agent-kit.yml` после раскладки и раньше
  первого коммита. Владелец видит в журнале выпуска строку RT-3594 и метрику.
- **Milestone G of the epic:** версия кита в npm с RT-3672, RT-3673, RT-3674 и RT-3594 в её разделе
  `projects/agent-kit/CHANGELOG.md`, набор RT-3594 зелёный.
- **Metric:** выпуск двигает дневной отрезок: отказов конца хода после Esc 10:54 — число 0.41.1 → 1, вниз (в
  записи было 12); вызов работы без слова владельца после Esc — 0.41.1 пропускает → отказан; `Monitor` по своему
  фоновому — 0.41.1 пропускает → отказан. Держатся: меню владельцу ночью при синтетической строке «Автономно до:»
  впереди — нет, на 0.39.0 было; одобрение плана, который правит проверку, после ролей сообщением — проходит, на
  0.39.0 его держал движок; то же одобрение кнопкой — проходит, на 0.39.0 его держал судья вопросов, и судит его
  шаг плана `judge-replay.mjs`, а не барьер; ложных отказов среди 57 вызовов после Esc 10:54 в ходах по слову
  владельца — 0.

## Decision

No decision: кода пакета и дерева задача не пишет — правка лежит в наборах и инструментах
`projects/agent-kit/tests/`, в их файлах данных, в шаге процесса публикации и в строке журнала.

- **Устройство.** `projects/agent-kit/tests/turn-replay-lib.mjs` пишет запись хода, теперь и запуск фоновой
  команды, вызов `Monitor`, уведомление задачи и слово владельца только в очереди (`enqueue` и `remove` без
  записи пользователя). Построение дерева сценария выносится из `turn-replay.test.sh` в
  `projects/agent-kit/tests/turn-replay-tree.sh` без правки: оно нужно двум наборам, а `turn-replay.test.sh`
  стоит на 475 строках при пределе 500; копию отказывает `check-dupes`. Там же переменная
  `RT_REPLAY_EDITION=<папка пакета>`: путь один раз становится абсолютным; дерево сценария берёт `assets/hooks` в
  `.claude/hooks`, `assets/checks` в `tools/`, `assets/task-flow` в `tools/task-flow`; хук, которого нет в
  издании, не зовётся, и набор печатает строку «нет в издании: <хук>». Новый набор
  `projects/agent-kit/tests/owner-waits-replay.test.sh` идёт по цепочке: на конце каждого хода зовёт хук на
  Stop, на каждом вызове — хуки `PreToolUse`, и печатает строку на каждую точку со значением: «без меню» или
  «меню», «пускает» или «держит», «отказан» или «пропущен», число отказов. Точка, которую держит предел другой
  задачи, печатается строкой `limit <задача> — <точка>` вне счёта. Точки — строки файла данных
  `projects/agent-kit/tests/fixtures/owner-waits/2411-day.json`; новая точка добавляет строку и не правит набор.
  `projects/agent-kit/tests/judge-replay.mjs` получает довод `--only <начало имени>`: судья зовётся на фикстурах
  с этим началом.
- **Вход.** Запись сессии 24.11 с 01:15 до 11:13 по местному времени. Ночь: дерево в `задача-взята` на RT-3583,
  список к утру со строкой «Граница: до слова владельца», три отказа конца хода с 01:28 и меню в 01:30. Утро:
  Esc в 07:38, слово «Исправляй это прямо сейчас в текущем эпике», вызовы ролей и последняя запись плана RT-3584,
  вопросы одобрения в 07:49 и 07:50, вопросы о влитии правки в 07:55 и 07:56, ответы меню свободным текстом в
  07:51 и 07:59, роли и правка плана RT-3591, вопрос одобрения в 08:35. День: слово «не двигайся дальше … пока не
  скажу» в 09:38, фоновое в 10:51:39, `Monitor` в 10:53:52, 19 меток Esc, 14 уведомлений, `/stop` и вопрос только
  в очереди, ответ меню свободным текстом в 11:10:26, фоновое в 11:11:57, конец хода в 11:13:20. Слова владельца
  лежат дословно, брань заменена нейтральным словом того же строения, пути — без имени пользователя. В цепочку
  ложатся все 54 конца хода окна, все слова владельца, метки Esc и уведомления, все вызовы вопросов, запуски
  фонового и `Monitor`, и все 57 вызовов после Esc 10:54; прочие из 803 вызовов окна не ложатся. В записи все
  вызовы после Esc шли в ходах по слову владельца: отказ Stop хода не открывает. Синтетические точки помечены в
  файле полем `synthetic`: строка «Автономно до:», которую набор пишет на время прогона плюс 12 часов, — граница
  из записи к любому прогону уже в прошлом; вызовы ролей после последней записи плана; одобрение сообщением
  «Одобряю план RT-3584»; вызов `Bash` с правкой в ходе, который разбудило уведомление после Esc. Синтетический
  вызов судится на копии записи до его места, ответвлением: в основную цепочку он не ложится, и следующие точки
  его не видят. Сценарий SC-AK-2018.
- **Судья вопросов.** Хук модели набор не зовёт. Пять задержанных вопросов утра ложатся фикстурами
  `projects/agent-kit/tests/fixtures/turn-replay/2411-morning-held-*.json`: три одобрения с ролями до последней
  записи плана ждут `block`, как велит текст судьи, два вопроса о влитии ждут `allow`. Два вопроса одобрения с
  ролями после записи — фикстуры `2411-morning-roles-after-*.json`, ждут `allow`. Вердикты — в
  `turn-replay.expected.json`; их судит `judge-replay.mjs --only 2411-` шагом плана, двумя прогонами подряд.
- **Границы.** Хуки, движок и таблица решений не меняются; случаи и ожидания `turn-replay.test.sh` не меняются;
  порядок процесса публикации — подъём версии, сборка, раскладка, коммит, тег, публикация — стоит, новый шаг
  идёт после раскладки и до первого коммита; выпуск — из главной ветки после PR эпика.
- **Объём.** `turn-replay-lib.mjs` плюс 45 строк; `turn-replay.test.sh` до 340; `turn-replay-tree.sh` до 220;
  `owner-waits-replay.test.sh` до 280; `judge-replay.mjs` плюс 10; файл цепочки до 700 строк; семь фикстур судьи
  до 60 строк каждая; процесс публикации плюс 12; журнал плюс 3; новых зависимостей ноль. Время набора дня — до
  60 с на этой машине; больше — решение в ходе работы с числом.

## Task footprint

| What | Where |
| --- | --- |
| Code (правится) | `projects/agent-kit/tests/turn-replay-lib.mjs`, `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/turn-replay-tree.sh`, `projects/agent-kit/tests/owner-waits-replay.test.sh`, `projects/agent-kit/tests/judge-replay.mjs` |
| Test data (правится) | `projects/agent-kit/tests/fixtures/owner-waits/`, `projects/agent-kit/tests/fixtures/turn-replay/`, `projects/agent-kit/tests/turn-replay.expected.json` |
| Pipeline (правится) | `.github/workflows/publish-agent-kit.yml` |
| Journal (правится) | `projects/agent-kit/CHANGELOG.md` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/replay/` |
| Cards (правятся) | RT-3593, RT-3584 — условие готовности |
| Laws | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/package-release/`, `.claude/skills/agent-kit-source/`, `.claude/skills/testing/` |
| Epic plan | `docs/plans/owner-stop-holds.md` |

## What counts as done

- `bash projects/agent-kit/tests/owner-waits-replay.test.sh` зелёный: ночью при синтетической строке
  «Автономно до:» впереди отказ конца хода не называет меню, а ночь из записи печатается строкой
  `limit RT-3584`; одобрение плана, который правит проверку, после ролей проходит кнопкой и сообщением; после
  Esc 10:54 отказ конца хода один; вызов работы без слова владельца после Esc отказан; вызовы в ходах по слову
  владельца проходят; `Monitor` 10:53:52 отказан; конец хода 11:13:20 отпущен по фоновому.
- На пакете 0.41.1 набор печатает отказов конца хода после Esc больше одного, на пакете 0.39.0 он держит ночью и
  одобрение сообщением; на обоих контрольная точка 11:13:20 зелёная.
- `judge-replay.mjs --only 2411-` даёт ожидаемый вердикт на семи вопросах утра два прогона подряд.
- `bash projects/agent-kit/tests/turn-replay.test.sh` зелёный, как до правки.
- Процесс публикации гоняет оба набора на собранном издании после раскладки и до первого коммита; оба набора
  зелёные на Linux на свежесобранном издании.
- В карточках RT-3593 и RT-3584 стоит условие «Готово, когда их часть стоит строками в
  `owner-waits-replay.test.sh`».
- После этапов, шагами конца эпика: PR эпика влит в главную ветку; исполнитель запускает выпуск патча кита из
  главной ветки с метрикой; `npm view @rt-tools/agent-kit version` называет новую версию, её раздел журнала
  называет RT-3672, RT-3673, RT-3674 и RT-3594. В копии сессии на `origin/main` разложенный
  `monitor-stream-guard.sh` на вводе `Monitor` с `tail -f` по своему фоновому отвечает
  `BLOCKED by monitor-stream-guard`. Итог пишется в план эпика.

## Stages

### 1. Запись и дерево для цепочки

- **Steps:**
    1. Сборщик записи пишет запуск фоновой команды, вызов Monitor, уведомление задачи и слово только в очереди
       Check: `grep -c 'task-notification' projects/agent-kit/tests/turn-replay-lib.mjs` → >= 1
    2. Построение дерева сценария вынесено в общий файл
       Check: `grep -c '^build_tree()' projects/agent-kit/tests/turn-replay-tree.sh` → = 1
    3. Общий файл берёт хуки и движок из папки пакета
       Check: `grep -c 'RT_REPLAY_EDITION' projects/agent-kit/tests/turn-replay-tree.sh` → >= 1
    4. Набор записанных ходов подключает общий файл
       Check: `grep -c 'turn-replay-tree.sh' projects/agent-kit/tests/turn-replay.test.sh` → >= 1
    5. Прогон судьи берёт фикстуры по началу имени
       Check: `grep -c "'--only'" projects/agent-kit/tests/judge-replay.mjs` → >= 1
- **Readiness sign:** записанные ходы идут на общем дереве с теми же ожиданиями.
- **Verified by:** `bash projects/agent-kit/tests/turn-replay.test.sh` — последняя строка «0 провалов».

### 2. Цепочка дня 24.11

- **Steps:**
    1. Цепочка дня лежит файлом данных
       Check: `jq '[.points[] | select(.kind == "notice")] | length' projects/agent-kit/tests/fixtures/owner-waits/2411-day.json` → >= 14
    2. Ночью при границе впереди отказ конца хода не называет меню владельцу
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — ночь при границе впереди +без меню'` → = 1
    3. Одобрение плана, который правит проверку, после ролей проходит
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — одобрение после ролей.* +пускает'` → = 2
    4. Отказов конца хода после Esc 10:54 один
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — отказов конца хода после Esc +1$'` → = 1
    5. Вызов работы без слова владельца после Esc отказан
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — вызов без слова владельца после Esc +отказан'` → = 1
    6. Вызовы в ходах по слову владельца проходят
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — ложных отказов по слову владельца +0$'` → = 1
    7. Monitor по своему фоновому отказан
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — Monitor 10:53:52 +отказан'` → = 1
    8. Конец хода после ответа меню отпущен по фоновому
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1 | grep -cE '^  ok +SC-AK-2018 — 11:13:20 +отпущен по фоновому'` → = 1
    9. На пакете 0.41.1 отказов после Esc больше одного, контрольная точка зелёная
       Check: `set -o pipefail; d=$(mktemp -d); (cd "$d" && npm pack -q @rt-tools/agent-kit@0.41.1 >/dev/null && tar xzf rt-tools-agent-kit-0.41.1.tgz); { VERBOSE=1 RT_REPLAY_EDITION="$d/package" bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1; true; } | grep -cE '^  FAIL +SC-AK-2018 — отказов конца хода после Esc +получили ([2-9]|[1-9][0-9]),|^  ok +SC-AK-2018 — 11:13:20 +отпущен по фоновому'` → = 2
    10. На пакете 0.39.0 цепочка держит ночью и одобрение сообщением, контрольная точка зелёная
       Check: `set -o pipefail; d=$(mktemp -d); (cd "$d" && npm pack -q @rt-tools/agent-kit@0.39.0 >/dev/null && tar xzf rt-tools-agent-kit-0.39.0.tgz); { VERBOSE=1 RT_REPLAY_EDITION="$d/package" bash projects/agent-kit/tests/owner-waits-replay.test.sh 2>&1; true; } | grep -cE '^  FAIL +SC-AK-2018 — (ночь при границе впереди +получили меню|одобрение после ролей, сообщение +получили держит),|^  ok +SC-AK-2018 — 11:13:20 +отпущен по фоновому'` → = 3
    11. Судья вопросов даёт ожидаемый вердикт на вопросах утра два прогона подряд
       Check: `set -o pipefail; for i in 1 2; do node projects/agent-kit/tests/judge-replay.mjs --only 2411- 2>&1; done | grep -cE '^ok 2411-morning-'` → = 14
- **Readiness sign:** набор дня зелёный, каждая метрика плана стоит в нём строкой, а на 0.39.0 и 0.41.1 он
  красный на своих отрезках при зелёной контрольной точке.
- **Verified by:** `bash projects/agent-kit/tests/owner-waits-replay.test.sh` — последняя строка «0 провалов».

### 3. Сценарий перед выпуском и тексты

- **Steps:**
    1. Процесс публикации гоняет оба набора на собранном издании после раскладки и до первого коммита
       Check: `awk '/Lay out the new edition/ && !l {l=NR} /RT_REPLAY_EDITION=dist\/agent-kit/ && /owner-waits-replay.test.sh/ && !s {s=NR} /RT_REPLAY_EDITION=dist\/agent-kit/ && /turn-replay.test.sh/ && !t {t=NR} /add-and-commit/ && !c {c=NR} END {print (l && s && t && l < s && l < t && s < c && t < c) ? 1 : 0}' .github/workflows/publish-agent-kit.yml` → = 1
    2. Оба набора зелёные на Linux на свежесобранном издании
       Check: `set -o pipefail; rm -rf dist/agent-kit && pnpm run -s build:agent-kit --skip-nx-cache >/dev/null && docker run --rm -v "$PWD":/w -w /w node:22 bash -c 'apt-get -qq update >/dev/null && apt-get -qq install -y jq >/dev/null && RT_REPLAY_EDITION=dist/agent-kit bash projects/agent-kit/tests/owner-waits-replay.test.sh && RT_REPLAY_EDITION=dist/agent-kit bash projects/agent-kit/tests/turn-replay.test.sh' 2>&1 | grep -c '0 провалов'` → = 2
    3. Журнал называет RT-3594 под ненапечатанным выпуском
       Check: `set -o pipefail; sed -n '/^## \[Unreleased\]/,/^#\{1,2\} \[/p' projects/agent-kit/CHANGELOG.md | grep -c 'RT-3594'` → >= 1
    4. Сценарий SC-AK-2018 стоит в спеке записанных ходов
       Check: `grep -c '^### SC-AK-2018' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md` → = 1
    5. Привязка спека называет набор дня
       Check: `grep -c 'owner-waits-replay.test.sh' docs/specs/agent-kit/turn-guards/flow-script/replay/implementation.md` → >= 1
    6. Карточки RT-3593 и RT-3584 называют свою часть цепочки
       Check: `set -o pipefail; for n in 3593 3584; do GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/$n --jq .body; done | grep -c 'owner-waits-replay.test.sh'` → >= 2
- **Readiness sign:** выпуск без зелёной цепочки дня на собранном издании не уходит, журнал выпуска называет
  задачу, спек называет сценарий, а вынесенные части цепочки названы в карточках их задач.
- **Verified by:** `node tools/check-specs.mjs` — выход 0.

## What this work does not do

- Меню застревания кнопками и ночной отпуск хода — задачи RT-3593 и RT-3584 эпика RT-3714, перенесённые словом
  владельца 27.11. Ночь со строкой из записи, «Граница: до слова владельца», в наборе печатается строкой
  `limit RT-3584`: её отпуск — часть RT-3584. Эти части цепочки добавляют их задачи.
- Хуки и движок не правятся: красная точка цепочки — находка, а не правка этой задачи.
- Судья вопросов — хук модели — перед выпуском не судится: его вердикты на вопросах утра проверяет шаг плана
  `judge-replay.mjs --only 2411-`. Барьер выпуска держит ту часть одобрения, которую судит `turn-exit-guard`.
- После отказа цепочка идёт дальше по записанной истории, а не по той, которую дали бы новые хуки: после отказа
  `Monitor` в 10:53:52 агент не получил бы четырнадцати уведомлений. Это вывод, а не мера: разбудит ли ход
  уведомление, решает хост. Каждая точка судится на состоянии, которое дала запись.
- Судью конца хода `turn-judge.md` набор не зовёт; метрика отказов считает `turn-exit-guard`.
- Главную копию задача не обновляет: живую проверку хука в сессии главной копии даёт её обновление, которое
  делает владелец или исполнитель по его слову.
