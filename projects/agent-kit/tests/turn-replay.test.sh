#!/usr/bin/env bash
# Записанные ходы: ходы, которые кончились зря, и законные концы хода, прогнанные через хук на Stop.
#
# Каждый ход лежит фикстурой в `fixtures/turn-replay/`: роль записи, время, имя вызова, код ответа и
# слово владельца — меткой класса или короткой фразой со словом остановки. `turn-replay-lib.mjs`
# собирает из фикстуры запись разговора, хук `turn-exit-guard.sh` читает её на дереве фикстуры в
# названном состоянии сценария, а движок называет случай отпуска. Ожидаемое стоит здесь, рядом со
# строкой случая: фикстура — только записанный ход, и субагент, который судит её по тексту хука
# модели, ожидаемого не видит. Строка случая начинается с группы плана `replay:`.
#
# Хуки модели (`turn-judge.md`, `ask-judge.md`) модель здесь не зовёт: набор проверяет их текст, а
# вердикты модели на тех же фикстурах сверяет `judge-replay.mjs`: судья без инструментов, сверка после.
#
# Дерево сценария, RT_REPLAY_LAID и RT_REPLAY_EDITION — в `turn-replay-tree.sh`, общем с набором дня.
REPLAY_EDITION="${RT_REPLAY_EDITION:-}" REPLAY_LAID="${RT_REPLAY_LAID:-}"
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "записанные ходы"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$TESTS/../../.." && pwd)"
FIXTURES="$TESTS/fixtures/turn-replay"
# Путь без ссылок: разложенный движок сверяет свой путь с путём запуска, а `/var` на macOS — ссылка.
WORK="$(cd "$(mktemp -d)" && pwd -P)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

. "$TESTS/turn-replay-tree.sh"

for tree in request taken stage archived handed epicEnd outside; do
    build_tree "$tree" >/dev/null
done

ENGINE="$ASSETS/checks/task-flow-script.mjs"

# Вход хука на Stop для фикстуры: запись разговора собирается заново, кэш хостинга и журнал
# прошлого случая снимаются, метки шагов и одобрения остаются — они часть состояния дерева.
stop_input() {
    local fixture="$FIXTURES/$1.json" tree="$WORK/$2" record="$WORK/$1.jsonl" role
    rm -rf "$tree/.git/rt-kit/cache" "$tree/.git/rt-kit/turn-exit.log" "$tree/.git/rt-kit/refusals-in-row"
    node "$TESTS/turn-replay-lib.mjs" "$fixture" "$record"
    role="$(jq -r '.agent // empty' "$fixture")"
    jq -n --arg p "$record" --arg d "$tree" --arg r "$role" \
        '{session_id:"replay",transcript_path:$p,cwd:$d,stop_hook_active:false} + (if $r == "" then {} else {agent_type:$r} end)'
}

run_hook() { (cd "$WORK/$2" && CLAUDE_PROJECT_DIR="$WORK/$2" "$HOOKS/turn-exit-guard.sh" <<< "$1" 2>/dev/null); }

# Ход держится, и отказ называет каждое из слов.
hold() {
    local fixture="$1" tree="$2" label="$3" input out got name
    shift 3
    input="$(stop_input "$fixture" "$tree")"
    out="$(run_hook "$input" "$tree")"
    got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    report "$label — ход держится" "${got:-PASS}" BLOCK
    for name in "$@"; do
        case "$(printf '%s' "$out" | jq -r '.reason // ""' 2>/dev/null)" in
            *"$name"*) report "$label — отказ называет $name" есть есть ;;
            *) report "$label — отказ называет $name" нет есть ;;
        esac
    done
}

# Ход отпущен, и движок называет случай отпуска.
release() {
    local fixture="$1" tree="$2" label="$3" log="$4" input out got
    input="$(stop_input "$fixture" "$tree")"
    out="$(run_hook "$input" "$tree")"
    [ -z "$out" ] && got=PASS || got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    report "$label — ход отпущен" "$got" PASS
    got="$(cd "$WORK/$tree" && node "$(engine_of "$tree")" verdict <<< "$input" 2>/dev/null | jq -r '.release // .block' 2>/dev/null)"
    report "$label — случай отпуска «${log}»" "$got" "$log"
}

# Записанное слово остановки: одна строка на сообщение — хук молчит, а движок называет его случай.
stopped() {
    local fixture="$1" tree="$2" label="$3" input out got
    input="$(stop_input "$fixture" "$tree")"
    out="$(run_hook "$input" "$tree")"
    got="$(cd "$WORK/$tree" && node "$(engine_of "$tree")" verdict <<< "$input" 2>/dev/null | jq -r '.release // .block' 2>/dev/null)"
    [ -z "$out" ] || got="хук держит: $out"
    report "$label" "$got" 'a stop word of the owner'
}

STAGE='этап-идёт'
STEP='step 1.2'

# --- виды остановки ---------------------------------------------------------------------------------
hold 1446-report-after-commit stage "replay: SC-AK-1446 — отчёт вместо следующего шага, после коммита" "$STAGE" "$STEP"
hold 1446-report-after-edit stage "replay: SC-AK-1446 — отчёт вместо следующего шага, после правки" "$STAGE" "$STEP"
hold 1447-announced-intent stage "replay: SC-AK-1447 — объявленное намерение вместо действия" "$STAGE" "$STEP"
hold 1448-waits-for-ci handed "replay: SC-AK-1448 — ожидание чужого шага: CI отданной работы" 'работа-отдана' 'take the next task of the epic'
hold 1448-waits-for-neighbour stage "replay: SC-AK-1448 — ожидание чужого шага: соседняя сессия" "$STAGE" "$STEP"
hold 1448-waits-for-background stage "replay: SC-AK-1448 — ожидание чужого шага: фоновая задача" "$STAGE" "$STEP"
hold 1449-milestone-branch taken "replay: SC-AK-1449 — остановка на вехе «ветка создана»" 'задача-взята' 'write the plan'
hold 1450-answer-mid-work stage "replay: SC-AK-1450 — ответ владельцу посреди работы" "$STAGE" "$STEP"
hold 1451-asks-what-rules-answer stage "replay: SC-AK-1451 — вопрос, на который правила уже отвечают" "$STAGE" "$STEP"
hold 1452-window-handover stage "replay: SC-AK-1452 — остановка на окне после сжатия" "$STAGE" "$STEP"
hold 1453-standing-order-merge handed "replay: SC-AK-1453 — остановка против постоянного указания" 'работа-отдана' 'take the next task of the epic'
hold 1454-offers-new-session stage "replay: SC-AK-1454 — предложение новой сессии для своего шага" "$STAGE" "$STEP"

# Тупик RT-3304: папка разобрана, отправку запрещает другая проверка. Отказ называет меню владельцу,
# а меню, которое хук меню задержал второй раз подряд, отпускает ход.
hold 1455-deadlock-push-refused archived "replay: SC-AK-1455 — тупик RT-3304: отказ называет меню владельцу" 'папка-разобрана' '«отложить RT-101»' '«подскажу путь»'
release 1455-deadlock-menus-held archived "replay: SC-AK-1455 — тупик RT-3304: меню задержано второй раз подряд" 'the menu did not reach the owner'

# --- шесть живых ходов RT-3276 ----------------------------------------------------------------------
release 1456-rt3276-question stage "replay: SC-AK-1456 — RT-3276: вопрос в сессии без записи" 'no write to the tree, or a branch outside the scenario'
stopped 1457-rt3276-not-now stage "replay: SC-AK-1913 — RT-3276: «не сейчас» отпускает ход (SC-AK-1457)"
stopped 1458-rt3276-stop stage "replay: SC-AK-1913 — RT-3276: «стоп» отпускает ход (SC-AK-1458)"
release 1459-rt3276-abuse stage "replay: SC-AK-1459 — RT-3276: ругань без поручения" 'no write to the tree, or a branch outside the scenario'
stopped 1460-rt3276-menu-after-refusal archived "replay: SC-AK-1460 — RT-3276: меню после отказа, ответ «стоп»"
hold 1461-rt3276-promise stage "replay: SC-AK-1461 — RT-3276: обещание без запуска" "$STAGE" "$STEP"

# --- законные концы хода ----------------------------------------------------------------------------
release 1462-epic-end epicEnd "replay: SC-AK-1462 — конец эпика по истории последнего закрытого эпика" 'the end of the scenario'
stopped 1548-stop-hold stage "replay: SC-AK-1913 — записанное слово «Стой» отпускает ход (SC-AK-1548)"
stopped 1548-wait-for-suite stage "replay: SC-AK-1913 — записанное слово «жди конца набора» отпускает ход (SC-AK-1548)"
stopped 1548-wait-for-neighbour handed "replay: SC-AK-1913 — записанное слово «жди соседа» отпускает ход (SC-AK-1548)"
stopped 1548-stop-at-point stage "replay: SC-AK-1913 — записанное слово «Остановись на логической точке» отпускает ход (SC-AK-1548)"
stopped 1548-not-now taken "replay: SC-AK-1913 — записанное слово «Не сейчас» отпускает ход (SC-AK-1548)"

# Остановка — состояние над словами записи: по ходу на каждую строку таблицы «Переходы» эпика RT-3602.
I='the owner interrupted the turn'
stopped 2012-row1-stop-inside stage "replay: SC-AK-2012 строка 1 — «я же сказал стоп» отпускает ход"
release 2012-row1-esc stage "replay: SC-AK-2012 строка 1 — Esc отпускает ход" "$I"
hold 2012-row2-esc-then-question stage "replay: SC-AK-2012 строка 2 — Esc и вопрос через секунду: судится вопрос" "$STAGE" "$STEP"
release 2012-row3-refusal-esc stage "replay: SC-AK-2012 строка 3 — отказ от вызова с меткой Esc отпускает ход" "$I"
hold 2012-row4-stop-then-order stage "replay: SC-AK-2012 строка 4 — «хватит тупить, чини» держит ход" "$STAGE" "$STEP"
for n in question abuse incident; do stopped "2012-row5-stop-then-$n" stage "replay: SC-AK-2012 строка 5 — «стоп», потом $n: остановка стоит"; done
hold 2012-row6-stop-then-merge stage "replay: SC-AK-2012 строка 6 — «стоп», потом «вливай»: ход держится" "$STAGE" "$STEP"
hold 2012-row6-stop-then-complaint stage "replay: SC-AK-2012 строка 6 — «стоп», потом жалоба «почему ты стоишь?»: ход держится" "$STAGE" "$STEP"
stopped 2012-row7-stop-then-no-preference stage "replay: SC-AK-2012 строка 7 — «стоп», потом «без предпочтения»: остановка стоит"

# Разбор промаха: движок держит ход по этапу, а отправку судит хук модели.
hold 1932-incident-not-sent stage "replay: SC-AK-1932 — разбор записан и не отправлен" "$STAGE" "$STEP"
hold 1932-incident-sent stage "replay: SC-AK-1932 — разбор записан и отправлен" "$STAGE" "$STEP"
hold 1932-incident-send-refused stage "replay: SC-AK-1932 — отправка разбора отбита проверкой слов" "$STAGE" "$STEP"
hold 1932-incident-no-role stage "replay: SC-AK-1932 — разбор записан мимо роли" "$STAGE" "$STEP"
hold 1932-incident-night stage "replay: SC-AK-1932 — ночью разбор записан в утренний список" "$STAGE" "$STEP"

# --- хуки модели: их текст ----------------------------------------------------------------------------
TURN_JUDGE="$ASSETS/hooks/turn-judge.md"
ASK_JUDGE="$ASSETS/hooks/ask-judge.md"
[ -n "$LAID" ] && TURN_JUDGE="$ROOT/.claude/hooks/turn-judge.md" && ASK_JUDGE="$ROOT/.claude/hooks/ask-judge.md"
has() { grep -qF -- "$2" "$1" && echo есть || echo нет; }
report "replay: SC-AK-1451 — хук модели на Stop держит вопрос с готовым ответом" "$(has "$TURN_JUDGE" 'asks the owner something already answered in the conversation')" есть
report "replay: SC-AK-1451 — хук модели на Stop не судит открытую работу" "$(has "$TURN_JUDGE" 'Open work is not yours to judge')" есть
report "replay: SC-AK-1932 — хук модели на Stop держит разбор без отправки" "$(has "$TURN_JUDGE" 'wrote an incident record and the turn did not run `agent-kit propose`')" есть
report "replay: SC-AK-1932 — отклонённая запросом отправка называется владельцу" "$(has "$TURN_JUDGE" 'a permission prompt refused counts when the reply names the unsent record')" есть
report "replay: SC-AK-1932 — отбитая отправка не считается отправкой" "$(has "$TURN_JUDGE" 'A run whose output refuses this record (`отбито … <its file>`) does not')" есть
report "replay: SC-AK-1932 — отправка, которой не провести, называется владельцу" "$(has "$TURN_JUDGE" 'So does one the agent cannot carry through')" есть
report "replay: SC-AK-1932 — разбор мимо роли держится" "$(has "$TURN_JUDGE" 'the transcript shows no call of the role `cargo-writer`')" есть
report "replay: SC-AK-1932 — ночью без названной отправки ход не держится" "$(has "$TURN_JUDGE" 'the boundary of an autonomous session that named no send')" есть
report "replay: SC-AK-1455 — хук меню пропускает меню отказа проверки выхода" "$(has "$ASK_JUDGE" 'The question is the menu named by a refusal of the exit check')" есть
report "replay: SC-AK-1455 — меню отказа — ровно два варианта" "$(has "$ASK_JUDGE" 'The options are exactly two: «отложить RT-N» with the task number')" есть
report "replay: SC-AK-1842 — хук меню пропускает «подскажу путь» и вопрос о пути" "$(has "$ASK_JUDGE" 'answered that menu with a bare «подскажу путь»')" есть
report "replay: SC-AK-1841 — хук модели на Stop отпускает ожидание своей фоновой задачи" "$(has "$TURN_JUDGE" 'A background task the session started still runs')" есть
report "replay: SC-AK-1912 — хук модели на Stop отпускает по слову остановки" "$(has "$TURN_JUDGE" "a word to stop or to wait — «стоп»")" есть
report "replay: SC-AK-2012 — хук модели на Stop держит остановку до рабочего приказа" "$(has "$TURN_JUDGE" 'the stop holds until a working order')" есть
report "replay: SC-AK-1470 — хук меню задерживает вариант, который снимает проверку" "$(has "$ASK_JUDGE" 'removes, disables or weakens a hook or a check')" есть
report "replay: SC-AK-1470 — и в меню отказа проверки выхода" "$(has "$ASK_JUDGE" 'Hold it in any menu, the menu of')" есть
report "replay: SC-AK-1933 — хук модели на Stop держит реплику не на языке владельца" "$(has "$TURN_JUDGE" "The final reply is not in the owner's language")" есть
report "replay: SC-AK-1933 — команда и её вывод языком не судятся" "$(has "$TURN_JUDGE" 'are judged in no language')" есть
report "replay: SC-AK-1933 — запись отвечает не на языке владельца" \
    "$(jq -r '[.turns[].say // empty | select(test("[А-я]") | not)] | length' "$FIXTURES/1933-owner-language.json")" 1
report "replay: SC-AK-1934 — хук меню держит вопрос не на языке владельца" "$(has "$ASK_JUDGE" "The question or its options are not in the owner's language")" есть
report "replay: SC-AK-1934 — выбор продукта уходит владельцу" "$(has "$ASK_JUDGE" 'what the product sanitizes or allows is a product')" есть
report "replay: SC-AK-1934 — запись спрашивает, что продукт оставляет после очистки" \
    "$(jq -r '[.turns[].menu // empty | select(.[0] | test("очистки"))] | length' "$FIXTURES/1934-question-product-choice.json")" 1
report "replay: SC-AK-1939 — хук меню держит меню, где работа вся у владельца" "$(has "$ASK_JUDGE" 'Every option hands the work to the owner')" есть
report "replay: SC-AK-1939 — меню отказа проверки выхода таким не считается" "$(has "$ASK_JUDGE" 'The menu of the exit check is not')" есть
report "replay: SC-AK-1939 — запись несёт отказ с готовым ходом и меню без хода" \
    "$(jq -r '[.turns[] | select((.says // "" | test("Assemble the task folder")) or (.menu // [] | index("Солью сам")))] | length' "$FIXTURES/1939-menu-hands-work-over.json")" 2
hold 1470-menu-lifts-check archived "replay: SC-AK-1470 — меню задержано один раз — ход держится" 'папка-разобрана'
report "replay: SC-AK-1470 — фикстура несёт меню отказа с таким вариантом" \
    "$(jq -r '[.turns[] | select(.menu) | .menu[] | select(test("снять проверку"))] | length' "$FIXTURES/1470-menu-lifts-check.json")" 1
report "replay: SC-AK-1911 — хук меню пускает одобрение плана, который правит проверку" "$(has "$ASK_JUDGE" 'The approval of a plan is never held, a plan that changes a hook or a check included')" есть
report "replay: SC-AK-1911 — запрет на снятие проверки не задевает решение владельца" "$(has "$ASK_JUDGE" 'An option that only records the owner'"'"'s decision is not such an option')" есть
report "replay: SC-AK-1911 — одобрение без плана и ролей держится" "$(has "$ASK_JUDGE" 'Without the plan or without both roles the option is held')" есть
report "replay: SC-AK-1951 — лёгкий план отпускается без вызова ролей" "$(has "$ASK_JUDGE" 'with a line `**Path:** light` or `**Путь:** лёгкий`')" есть
report "replay: SC-AK-1951 — только в дереве, назвавшем команду ролей" "$(has "$ASK_JUDGE" 'names `planRolesCommand`: the engine asks that command')" есть
report "replay: SC-AK-1951 — список держания знает лёгкий план" "$(has "$ASK_JUDGE" 'The light plan of the list above needs no roles, only the file')" есть
report "replay: SC-AK-1951 — ответ, отказанный до ролей, повторного меню не держит" "$(has "$ASK_JUDGE" 'An answer `plan-red` refused for the missing calls is no approval yet')" есть
report "replay: SC-AK-1914 — план эпика держанию без папки задачи не подлежит" "$(has "$ASK_JUDGE" 'An option approves the plan of a task, not the plan of an epic')" есть
report "replay: SC-AK-1914 — фикстура несёт одобрение с приписанным снятием проверки" \
    "$(jq -r '[.turns[] | select(.menu) | .menu[] | select(test("turn the check of marks off"))] | length' "$FIXTURES/1914-approval-appends-lift-held.json")" 1

# --- прогон судьи: ему нечем читать ожидаемое ---------------------------------------------------------
JUDGE="$TESTS/judge-replay.mjs"
judge_js() { (cd "$WORK" && node --input-type=module -e "import * as j from '$JUDGE'; $1"); }
PROMPT="$(judge_js "import {readFileSync} from 'node:fs'; console.log(j.promptOf('HOOK TEXT', JSON.parse(readFileSync('$FIXTURES/1450-answer-mid-work.json','utf8'))))")"
leaks="$(printf '%s' "$PROMPT" | grep -cE 'SC-AK-1450|1450-answer-mid-work|"case"|"kind"|an answer to the owner in the middle')"
report "replay: SC-AK-1711 — подсказка судьи без имени файла, case и kind" "$leaks" 0
report "replay: SC-AK-1711 — подсказка несёт ходы фикстуры" "$(printf '%s' "$PROMPT" | grep -c '"turns"')" 1
CMD="$(judge_js "console.log(JSON.stringify(j.judgeCommand({cwd:'/tmp/judge-x'})))")"
report "replay: SC-AK-1711 — судья без инструментов, источников настроек и MCP" \
    "$(printf '%s' "$CMD" | jq -r '.args as $a | [($a | index("--tools") != null), ($a[($a | index("--tools")) + 1] == ""), ($a | index("--setting-sources") != null), ($a | index("--strict-mcp-config") != null), ($a | index("--no-session-persistence") != null)] | all')" true
report "replay: SC-AK-1711 — судья работает вне дерева" "$(printf '%s' "$CMD" | jq -r '.cwd' | grep -c "^$ROOT")" 0

# Фальшивый судья отвечает словом из переменной.
J="$WORK/judge"
mkdir -p "$J/fixtures" "$J/hooks"
cp "$FIXTURES/1450-answer-mid-work.json" "$J/fixtures/a.json"
printf '%s\n' 'turn judge text' > "$J/hooks/turn-judge.md"
printf '%s\n' 'ask judge text' > "$J/hooks/ask-judge.md"
printf '%s\n' '{ "a.json": { "judge": "block" } }' > "$J/expected.json"
run_replay() {
    RT_JUDGE_RUNNER="cat > /dev/null; printf '%s' '$1'" judge_js \
        "console.log(JSON.stringify(j.replay({root:'$J', fixtures:'$J/fixtures', hooksDir:'$J/hooks', expectedFile:'$J/expected.json'})))"
}
report "replay: SC-AK-1712 — совпавший вердикт засчитан" "$(run_replay block | jq -r '.[0].ok')" true
report "replay: SC-AK-1712 — несовпавший вердикт назван" "$(run_replay allow | jq -r '.[0] | "\(.ok) \(.want) \(.got)"')" 'false block allow'
report "replay: SC-AK-1713 — ответ с обоими словами — не вердикт" "$(run_replay 'allow or block' | jq -r '.[0] | "\(.ok) \(.got)"')" 'false null'
report "replay: SC-AK-1713 — ответ без вердикта — не совпадение" "$(run_replay 'не знаю' | jq -r '.[0].ok')" false
printf '%s\n' '{ "a.json": { "judge": "block" } }' > "$J/fixtures/judge-verdicts.turn-judge.json"
report "replay: SC-AK-1714 — старый файл вердиктов не читается, считается ответ этого прогона" "$(run_replay allow | jq -r '.[0].got')" allow
report "replay: SC-AK-1714 — в каталоге фикстур нет файлов вердиктов прошлых прогонов" "$(ls "$FIXTURES" | grep -c '^judge-verdicts')" 0

# SC-AK-1941 — судья, который не запустился, — не расхождение: повтор встаёт на первом вызове
cp "$FIXTURES/1450-answer-mid-work.json" "$J/fixtures/b.json"
printf '%s\n' '{ "a.json": { "judge": "block" }, "b.json": { "judge": "block" } }' > "$J/two.json"
dead_replay() {
    RT_JUDGE_RUNNER="cat > /dev/null; echo вызов >> '$J/calls'; $1" judge_js \
        "try { console.log(JSON.stringify(j.replay({root:'$J', fixtures:'$J/fixtures', hooksDir:'$J/hooks', expectedFile:'$J/two.json'}))) } catch (e) { console.log(e instanceof j.JudgeDidNotRun ? 'не запустился: ' + e.message : 'иная ошибка: ' + e.message) }"
}
: > "$J/calls"
got="$(dead_replay "echo 'Invalid API key · Please run /login'; exit 1")"
report "replay: SC-AK-1941 — судья не запустился: ответ назван" \
    "$(printf '%s' "$got" | grep -c '^не запустился: .*a.json: exit 1 · Invalid API key')" 1
report "replay: SC-AK-1941 — судья не запустился: второго вызова нет" "$(grep -c вызов "$J/calls")" 1
: > "$J/calls"; report "replay: SC-AK-1941 — судья не запустился: пустой ответ с кодом 0 дважды — тоже" \
    "$(dead_replay 'exit 0' 2>/dev/null | grep -c '^не запустился: .*an empty answer')" 1
report "replay: SC-AK-1941 — пустой ответ с кодом 0 спрошен ещё раз, один" "$(grep -c вызов "$J/calls")" 2
report "replay: SC-AK-1941 — ответ без вердикта дважды — по-прежнему расхождение" \
    "$(dead_replay "printf 'не знаю'" 2>/dev/null | jq -r 'map(.ok) | any')" false
: > "$J/calls"; report "replay: SC-AK-1941 — ответ без вердикта спрошен ещё раз, строка retry на stderr" \
    "$(dead_replay "printf 'не знаю'" 2>&1 >/dev/null | grep -c '^retry ')/$(grep -c вызов "$J/calls")" '2/4'
: > "$J/calls"; rm -f "$J/calls.1"; report "replay: SC-AK-1941 — после ответа без вердикта засчитан второй ответ" \
    "$(dead_replay "[ -s '$J/calls.1' ] && echo block || { echo 1 > '$J/calls.1'; echo 'не знаю'; }" 2>/dev/null | jq -r 'map(.ok) | all')/$(grep -c вызов "$J/calls")" 'true/3'
: > "$J/calls"; report "replay: SC-AK-1941 — неверный вердикт не спрошен ещё раз" \
    "$(dead_replay 'printf allow' | jq -r 'map(.ok) | any')/$(grep -c вызов "$J/calls")" 'false/2'
printf '%s\n' '{ "a.json": { "judge": "block", "ask": "block" } }' > "$J/mixed.json"
KEYED="$(RT_JUDGE_RUNNER='cat >/dev/null; echo block' judge_js "console.log(j.replay({root:'$J', fixtures:'$J/fixtures', hooksDir:'$J/hooks', expectedFile:'$J/mixed.json', hook:'ask'}).map((r) => r.key).join(' '))")"
report "replay: SC-AK-2020 — ключ оставляет пары одного хука" "$KEYED" ask
RT_JUDGE_RUNNER='cat >/dev/null; echo block' node "$JUDGE" --key asks > "$J/empty.txt" 2>&1
report "replay: SC-AK-2020 — ключ без пар — не зелёный прогон" "$?/$(grep -c '^judge replay: 0 of 0 match' "$J/empty.txt")" '1/1'
RT_JUDGE_RUNNER='cat >/dev/null; echo block' node "$JUDGE" --key --model haiku > "$J/novalue.txt" 2>&1
report "replay: SC-AK-2020 — флаг без значения отказан до вызовов" "$?/$(grep -c 'needs a value' "$J/novalue.txt")" '1/1'
report "replay: SC-AK-2020 — хук меню пускает влитие ветки задачи по ключу" "$(has "$ASK_JUDGE" 'wins over the item of a walk around a check only')/$(has "$ASK_JUDGE" 'also only records the decision')" есть/есть
RT_JUDGE_RUNNER="cat > /dev/null; echo 'Please run /login'; exit 1" node "$JUDGE" > "$J/out.txt" 2>&1
report "replay: SC-AK-1941 — судья не запустился: код вызова 2, и ответ напечатан" "$?/$(grep -c 'Please run /login' "$J/out.txt")" '2/1'

# --- судья как хук: стенограмма на диске, инструменты агент-хука, секунды ----------------------------
mkdir -p "$J/.claude"
printf '%s\n' '{ "hooks": { "Stop": [ { "hooks": [ { "type": "agent", "prompt": "Follow .claude/hooks/turn-judge.md. The hook input: $ARGUMENTS", "timeout": 120 } ] } ] } }' \
    > "$J/.claude/settings.json"
AS_HOOK="$(RT_JUDGE_RUNNER="p=\$(cat); printf '%s' \"\$p\" > '$J/hook-prompt.txt'; t=\$(printf '%s' \"\$p\" | grep -o '\"transcript_path\":\"[^\"]*\"' | cut -d'\"' -f4); cp \"\$t\" '$J/hook-record.jsonl'; printf '%s' '{\"ok\": false}'" \
    judge_js "console.log(JSON.stringify(j.replayAsHook({root:'$J', fixtures:'$J/fixtures', expectedFile:'$J/expected.json'})))")"
report "replay: SC-AK-1756 — ответ {\"ok\": false} засчитан как block" "$(printf '%s' "$AS_HOOK" | jq -r '.[0] | "\(.ok) \(.got)"')" 'true block'
report "replay: SC-AK-1756 — у случая есть секунды" "$(printf '%s' "$AS_HOOK" | jq -r '.[0].seconds | type')" number
report "replay: SC-AK-1756 — подсказка — объявление хука с входом хука" \
    "$(grep -c '^Follow .claude/hooks/turn-judge.md. The hook input: {' "$J/hook-prompt.txt")" 1
report "replay: SC-AK-1756 — стенограмма на диске несёт ход" "$(grep -c '"type":"assistant"' "$J/hook-record.jsonl" | awk '{print ($1 > 0)}')" 1
HCMD="$(judge_js "console.log(JSON.stringify(j.asHookCommand({cwd:'/tmp/judge-x'})))")"
report "replay: SC-AK-1756 — у судьи инструменты агент-хука" \
    "$(printf '%s' "$HCMD" | jq -r '.args as $a | $a[($a | index("--tools")) + 1]')" 'Read,Grep,Glob'

# --- объявление судьи в его файле: шаблон первого круга — тот же, что в тексте судьи -------------------------------
DECLARED="$(grep -m1 'rt-hook-agent' "$ASSETS/hooks/turn-judge.md")"
OWNER_IN_TEXT="$(grep -A2 'it is called `OWNER` below' "$ASSETS/hooks/turn-judge.md" | sed -n '3s/^    //p')"
OWNER_DECLARED="$(printf '%s' "$DECLARED" | grep -o '`[^`]*enqueue[^`]*`' | tr -d '`')"
report "replay: SC-AK-1758 — шаблон первого круга в объявлении совпадает с OWNER текста" \
    "$([ -z "$OWNER_DECLARED" ] || [ "$OWNER_DECLARED" = "$OWNER_IN_TEXT" ] && echo совпадает || echo расходится)" совпадает
report "replay: SC-AK-1758 — шаблон OWNER в тексте найден" "$([ -n "$OWNER_IN_TEXT" ] && echo есть || echo нет)" есть
report "replay: SC-AK-1758 — the declaration of the judge file carries the first-round template" "$([ -n "$OWNER_DECLARED" ] && echo есть || echo нет)" есть

# --- отметка Esc: запись владельца — слово, блоб запроса с той же отметкой — нет ---------------------------
ESC_USER='{"parentUuid":"p1","promptId":"q1","type":"user","message":{"role":"user","content":[{"type":"text","text":"[Request interrupted by user]"}]},"timestamp":"2026-11-14T01:36:30.000Z"}'
ESC_BLOB='{"type":"api-request-blob","sessionId":"s1","message":{"role":"user","content":[{"tool_use_id":"t1","type":"tool_result","content":"x"},{"type":"text","text":"[Request interrupted by user]"},{"type":"text","text":"новое слово"}]}}'
report "replay: SC-AK-1839 — OWNER судьи берёт отметку Esc из записи владельца" \
    "$(printf '%s\n' "$ESC_USER" | grep -cE "$OWNER_IN_TEXT")" 1
report "replay: SC-AK-1839 — OWNER судьи не берёт отметку из блоба запроса" \
    "$(printf '%s\n' "$ESC_BLOB" | grep -cE "$OWNER_IN_TEXT")" 0
report "replay: SC-AK-1839 — судья: поручение за секунду до Esc ничего не поручает" \
    "$(grep -c 'one sent a second before the mark included' "$ASSETS/hooks/turn-judge.md")" 1

# --- живой счёт: объявление, ветка, таймаут без длительности -----------------------------------------
L="$WORK/live"
mkdir -p "$L/tree/.claude" "$L/records"
(cd "$L/tree" && git init -q -b live-branch && git config user.email t@t && git config user.name t \
    && printf '%s\n' '{ "hooks": { "Stop": [ { "hooks": [ { "type": "agent", "prompt": "NEW turn-judge prompt", "timeout": 120 } ] } ] } }' > .claude/settings.json \
    && git add -A && git -c commit.gpgsign=false commit -qm init)
node -e "
const t0 = Date.now() + 3600e3, at = (s) => new Date(t0 + s * 1000).toISOString();
const run = (cmd, ms) => ms === undefined ? { command: cmd } : { command: cmd, durationMs: ms };
const sum = (s, info, branch = 'live-branch', errors = []) => ({ type: 'system', subtype: 'stop_hook_summary', timestamp: at(s), gitBranch: branch, hookInfos: [info], hookErrors: errors });
const rows = [
  { type: 'assistant', timestamp: at(0) }, sum(20, run('NEW turn-judge prompt', 20000)),
  { type: 'assistant', timestamp: at(100) }, sum(225, run('NEW turn-judge prompt')),
  { type: 'assistant', timestamp: at(500) }, sum(540, run('NEW turn-judge prompt'), 'live-branch', ['BLOCKED by turn-judge: x']),
  { type: 'assistant', timestamp: at(600) }, sum(630, run('NEW turn-judge prompt'), 'live-branch', ['BLOCKED by turn-exit-guard: x']),
  { type: 'assistant', timestamp: at(300) }, sum(310, run('OLD turn-judge prompt', 9000)),
  { type: 'assistant', timestamp: at(400) }, sum(410, run('NEW turn-judge prompt', 9000), 'other-branch'),
];
require('fs').writeFileSync('$L/records/s.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
"
LIVE="$(judge_js "console.log(JSON.stringify(j.liveRuns('$L/tree', '$L/records')))")"
report "replay: SC-AK-1757 — считаются только запуски объявления на ветке, снятый хостом — нет" "$(printf '%s' "$LIVE" | jq -r '.runs')" 3
report "replay: SC-AK-1757 — запуск без длительности и без отказа дольше таймаута — таймаут" "$(printf '%s' "$LIVE" | jq -r '.timeouts')" 1
report "replay: SC-AK-1757 — время без длительности — от последней записи до сводки" "$(printf '%s' "$LIVE" | jq -r '.median')" 40

suite_result "записанные ходы"
