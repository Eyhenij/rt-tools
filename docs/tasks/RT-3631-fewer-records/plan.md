# План

**Task:** RT-3631 · **Branch:** RT-3631-fewer-records
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md`
**Behaviour:** unchanged — кода приложений, кита и пакетов с экранами работа не трогает. Меняются движок хода из пакета правил и команда этого дерева.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** этап из нескольких шагов отмечается вызовом на шаг или циклом оболочки, архивную запись исполнитель пишет заново. Журнал 21–25.11: записи — 1070 правок из 3148, из них архив — 42 правки и 5,9 минуты; `step` — 148 вызовов, 62 из них циклом.
- **B1 — этап одним вызовом.** Признак: `node tools/task-flow-script.mjs step N` меряет рядом шаги этапа N, печатает строку на каждый и отмечает совпавшие подряд от первого неотмеченного шага плана. Совпавший, перед которым в плане есть неотмеченный, — своего этапа или прежнего — назван «совпал, не отмечен: раньше N.M». Код 0 — совпали все измеренные. Нет такого этапа или папка разобрана — отказ.
- **B2 — запись строится из тела PR.** Признак: `npm run task:archive -- <тело> --title '<заголовок PR>'` пишет `docs/archive/<ветка>.md` и убирает папку задачи. Из тела — «Чем подтверждено» и «Оставшийся шаг»; из папки дословно — просьба, вопросы и ответы, решения разбора и хода работы, согласия владельца по киту и каждая строка хода со словом владельца; из метки одобрения — ответ, которым владелец одобрил план.
- **Веха G эпика:** не больше 30 минут активной работы на мелкую задачу. Верхняя граница этой задачи — 5,9 минуты записей за пять дней на все ветки: доли минуты на ветку. Веху она не двигает. Минуты стоят в движке — `step`, `plan-red`, `measure` и `plan-check` вместе 129 за те же дни, из них `plan-red` 44, — и в чтении плана ролями, медиана 13 минут на ветку. Этого состава в эпике нет.
- **Цена:** запись длиннее написанной руками в 1,3–1,96 раза на шести задачах эпика из семи (у RT-3640 0,94), зато без исполнителя. «Цена» решения пишется пунктом хода работы до команды, без него отказ. Раздел «Что вне задачи» теряется там, где его нет в «Оставшемся шаге»; цикл велит писать его туда.
- **Metric:** правок `Write` и `Edit` под `docs/archive/` на закрытую задачу, вниз с 1 до 0: вызовы инструментов в журналах, делённые на записи, добавленные в `docs/archive/` за те же дни. Меряется на вехе эпика.

## Как устроено

- **Этап в движке.** `step N` без точки: шаги плана с номером этапа N, у которых нет отметки `[x]` с зелёной меткой; нет таких — меряются все. Идут через `measureSteps`, но отметку в ход работы ставит не каждый замер, а общий разбор после всех: по всему плану, подряд от первого неотмеченного шага, пока шаг этапа совпал. Метка на диск пишется каждому совпавшему, как сейчас; `[x]` с меткой не меряется и назван «не мерился». Шаг `[x]`, не совпавший в перемере, остаётся `[x]` без метки, как у `--done`. Новый файл `checks/flow-stage.mjs`; `flow-step.mjs` стоит на 497 строках из 500.
- **Действие этапа в `flow.js` не меняется**: от него производны шесть текстов, а этап называет строка употребления движка и правило.
- **Команда записи** — дерева, `tools/archive-record.mjs`. Ветка и папка — из git, номер — из имени ветки, эпик — из плана в `docs/plans/`, где стоит строка таблицы `| … | RT-N — …`; такого плана нет или их два — запись без слов об эпике. Дата — день запуска. Решения хода работы — раздел «Решения по ходу» или «Decisions along the way», в нём пункт «Цена». Отменённое решение разбора исполнитель называет там же до команды: это пишет `archive-record`.
- **Слово владельца в ходе работы** — пункт списка или абзац с «ёлочками» и одним из слов `recommended`, `владел…`, `одобряю`, `the owner`; целиком, в порядке файла, кроме «Where we stand», «Где мы», Handover и блоков кода. Ответ одобрения — поле `answer` метки ветки, метки нет — строка об этом в записи.
- **Файлы папки.** `approvals.md` идёт дословно: по нему `check-kit-approval` судит правку кита после разбора. Иной файл, кроме разбора, плана и хода работы, — отказ с его именем.
- **Из тела отбрасываются** строка `Closes`, подвал «🤖 …» и строка `E2E-skip:`.
- **Отказы, после которых ничего не записано и не убрано:** тела нет или в нём нет нужного раздела, в разборе нет просьбы, в ходе нет раздела решений или пункта «Цена», запись уже стоит, в папке есть правки, неотслеживаемый или чужой файл, папки в коммите нет, `--title` пуст.
- **Папка уходит с диска и из индекса**, запись добавлена в индекс, коммит за исполнителем. Отбор требования, которое переходит в спеку, стоит до команды — порядок `task-flow-archive` прежний.
- **Порядок закрытия:** набор зелёный → тело PR готово целиком → команда → коммит → отправка → PR тем же телом.
- **Образец хода работы** теряет строку «Uncommitted» и пример из `task-flow-resume` вместе с ней: её не читает никто, а git отвечает сам. «Done» и «PR» остаются: вторая обязательна с конца этапов.

## След задачи

| Что                  | Где |
| -------------------- | --- |
| Specs (правится)     | `docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md`, `docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md`, `docs/specs/agent-kit/turn-guards/flow-script/step-mark/implementation.md`, `docs/specs/agent-kit/turn-guards/flow-script/spec.md` |
| Laws                 | `docs/constitution/work-conduct.md`, `docs/constitution/project-documentation.md` |
| Rules (правится)     | `.claude/skills/archive-record/SKILL.md`, `.claude/skills/task-delivery-loop-run/SKILL.md`, `.claude/skills/task-delivery-loop/pitfalls.md`, `projects/agent-kit/assets/pitfalls/task-flow-resume.md` |
| Code (правится)      | `projects/agent-kit/assets/checks/flow-stage.mjs`, `projects/agent-kit/assets/checks/flow-step.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/samples/tasks/_template/progress.md`, `tools/archive-record.mjs`, `package.json` |
| Tests (правится)     | `projects/agent-kit/tests/flow-stage.test.sh`, `tools/tests/archive-record.test.sh` |
| Настройки (правится) | раскладка пакета: `tools/flow-stage.mjs` |
| Записи (правится)    | `docs/plans/delivery-speed.md`, `docs/plans/delivery-speed-findings.md` |

Выпуск пакета идёт своим порядком, версии в ветке нет.

## Что считается сделанным

- Этап: все совпали — код 0 и все отмечены; первый не совпал — ни одной отметки, код 1, и правка хода работы после него проходит защиту; средний не совпал — отмечены до него; открыт шаг прежнего этапа — ни одной отметки, и правка хода проходит защиту; отмечены все — перемеряны все; отметка `[x]` без зелёной метки меряется снова; этапа нет, папка разобрана, шаг без проверки — отказ; `step N.M` и `step --done` прежние.
- Запись: каждый раздел дословен и в одном порядке; слово владельца из хода работы, которого нет в разборе, стоит в записи; каждый отказ не пишет и не убирает ничего; папки нет ни на диске, ни в индексе; `step --done --pr` после коммита меряет её из истории; задача вне эпика.
- Живые вызовы: этап этой ветки; запись в клоне на семи задачах эпика из их настоящих папок и тел PR, число знаков рядом с написанной руками, и каждая цитата владельца из написанной руками записи есть в собранной. Папкам, где нет раздела решений или «Цены», в клоне дописан раздел с тем, что несла написанная руками.

## Этапы

### 1. Движок

- **Steps:**
    1. Сценарии этапа зелёные, у каждого случая свой
       Check: `bash -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/flow-stage.test.sh 2>&1) || exit 1; n() { printf "%s\n" "$out" | grep -c "^  ok .*$1"; }; for w in "every step of the stage is marked" "a first step that did not match marks none" "an edit of the progress passes the guard after it" "a middle step that did not match" "matched, not marked" "an open step of an earlier stage" "all marked are measured again" "a mark without a green one" "no such stage" "a taken-apart folder" "a step with no check" "one step as before"; do [ "$(n "$w")" -ge 1 ] || exit 1; done'` → exit 0
    2. Прежние сценарии движка зелёные, раскладка сходится
       Check: `bash -c 'test -s tools/flow-stage.mjs || exit 1; for t in task-flow-script task-flow-script-steps task-flow-script-node task-flow-script-archive task-flow-script-merge flow-step-guard flow-plan-forms turn-entry-load work-steps-guard; do bash projects/agent-kit/tests/$t.test.sh >/dev/null 2>&1 || exit 1; done; pnpm -s run agent-kit:check >/dev/null 2>&1'` → exit 0
- **Readiness sign:** `step N` отмечает этап и не запирает ход работы.
- **Verified by:** `bash projects/agent-kit/tests/flow-stage.test.sh` — последняя строка без провалов.

### 2. Архивная запись

- **Steps:**
    1. Сценарии команды записи зелёные, у каждого отказа свой
       Check: `bash -c 'out=$(VERBOSE=1 bash tools/tests/archive-record.test.sh 2>&1) || exit 1; n() { printf "%s\n" "$out" | grep -c "^  ok .*$1"; }; for w in "the request word for word" "the answers of the grill" "the decisions of the grill and of the progress" "the owner word of the progress" "a word the grill holds is not repeated" "the answer of the approval" "no approval mark" "the approvals of the kit" "the sections of the body" "the folder leaves the disk and the index" "the rerun after the commit" "no section in the body" "no request in the grill" "no decisions in the progress" "no price among the decisions" "the record already stands" "an edit in the folder" "an untracked file in the folder" "a foreign file in the folder" "a refusal writes nothing" "the epic by its plan" "outside an epic" "the footer is dropped"; do [ "$(n "$w")" -ge 1 ] || exit 1; done'` → exit 0
- **Readiness sign:** запись строится одним вызовом, и слова владельца в ней.
- **Verified by:** `bash tools/tests/archive-record.test.sh` — последняя строка без провалов.

### 3. Спека, тексты и живая проверка

- **Steps:**
    1. Спека называет этап, цикл и правило записи — команду, образец без лишней строки
       Check: `bash -c 'grep -q "step <N>" docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md && grep -q "step <N>" docs/specs/agent-kit/turn-guards/flow-script/spec.md && grep -q "task:archive" .claude/skills/archive-record/SKILL.md && grep -q "task:archive" .claude/skills/task-delivery-loop-run/SKILL.md && grep -q "task:archive" .claude/skills/task-delivery-loop/pitfalls.md && grep -q "task:archive" package.json && ! grep -q "Uncommitted" docs/tasks/_template/progress.md && grep -q "PR:" docs/tasks/_template/progress.md && node tools/check-specs.mjs >/dev/null && node tools/check-spec-coverage.mjs >/dev/null && node tools/check-doc-paths.mjs >/dev/null && node tools/check-file-size.mjs >/dev/null && node tools/check-glossary.mjs >/dev/null'` → exit 0
    2. Живые вызовы и мутанты стоят в ходе работы
       Check: `bash -c 'p=docs/tasks/RT-3631-fewer-records/progress.md; grep -qE "^- \*\*Живой этап:\*\* .*step [0-9]+([^.0-9].*)?, код 0" $p && [ "$(grep -E "^- \*\*Запись RT-36[0-9]{2}:\*\* [0-9]+ знаков, рукой [0-9]+, цитат ([1-9][0-9]*) из \1( |$)" $p | grep -oE "RT-36[0-9]{2}" | sort -u | wc -l)" -ge 7 ] && grep -qE "^- \*\*Мутанты:\*\* ([1-9][0-9]*) из \1( |$)" $p'` → exit 0
- **Readiness sign:** движок, спека, цикл и образец говорят одно; числа взяты из запусков, запись ложится коммитом раньше отметки шага.
- **Verified by:** `node tools/check-specs.mjs` — код 0.

## Чего эта работа не делает

- Не ставит строки «State», «Stage» и «Next step» движком: 5,1 минуты за пять дней, состояние могло бы обогнать измеренное, а «Next step» затирал бы осмысленный.
- Не уменьшает число коммитов из одних записей: разбор, план, удаление старого архива и разбор папки остаются своими.
- Не трогает `measure`, `plan-red` и чтение плана ролями — там минуты, но это своя задача и слово владельца.
- Не хранит таблицы ролей: они в теле PR на хостинге; находка 8 ревью RT-3625 этим закрыта.
- Не правит вторую строку «State» передачи при сжатии — находка ревью RT-3628.
- Не переносит команду записи в пакет: правило `archive-record` — этого дерева.
