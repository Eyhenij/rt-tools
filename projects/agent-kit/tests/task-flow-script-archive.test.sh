#!/usr/bin/env bash
# Сценарии движка task flow после разбора папки задачи: команда шага, ход отката, прерванный запуск,
# второй прогон перед PR и отказ конца хода. Подключается из `task-flow-script.test.sh`; отдельно —
# с `TF_ALONE=1`.
if [ -z "${TESTS:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_DIR="$(mktemp -d)"
    TF_ALONE=1
fi

TA_G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)
TA_ENGINE="$TESTS/../assets/checks/task-flow-script.mjs"

# Репозиторий ветки RT-6-arc: план из $2, ход работы из $3; папка разобрана последним коммитом.
ta_repo() {
    local dir="$TF_DIR/$1"
    (
        git -c init.defaultBranch=main init -q "$dir" && cd "$dir" || exit 1
        printf 'tracked\n' > tracked.txt
        git add tracked.txt && "${TA_G[@]}" commit -q -m start
        git update-ref refs/remotes/origin/main HEAD
        git checkout -q -b RT-6-arc
        mkdir -p docs/tasks/RT-6-arc
        printf '%s' "$2" > docs/tasks/RT-6-arc/plan.md
        printf 'один\n' > docs/tasks/RT-6-arc/probe.txt
        printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Первый\n- [>] 1.2 Второй\n- [ ] 1.3 Третий\n' > docs/tasks/RT-6-arc/progress.md
        git add -A && "${TA_G[@]}" commit -q -m plan
        printf '%s' "$3" > docs/tasks/RT-6-arc/progress.md
        git add -A && "${TA_G[@]}" commit -q -m progress
        git rm -q -r docs/tasks/RT-6-arc && "${TA_G[@]}" commit -q -m "folder taken apart"
    )
    printf '%s' "$dir"
}
ta_engine() { # $1 — каталог; дальше — доводы движка; печатает вывод и код
    local dir="$1" out code
    shift
    out="$(cd "$dir" && RT_FLOW_STEP_LIMIT_MS="${TA_LIMIT:-5000}" node "$TA_ENGINE" "$@" 2>&1)"
    code=$?
    printf '%s code=%s' "$out" "$code"
}
ta_folder() { test -d "$1/docs/tasks/RT-6-arc" && echo есть || echo нет; }
ta_mark() { test -e "$1/.git/rt-kit/steps/RT-6-arc/$2.json" && echo есть || echo нет; }

TA_PLAN='# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Первый
       Check: `cat docs/tasks/RT-6-arc/probe.txt` → `один`
    2. Второй
       Check: `grep -c '"'"'^- \[ \]'"'"' docs/tasks/RT-6-arc/progress.md` → = 1
    3. Третий
       Check: `sleep 3; echo готово` → `готово`
    4. Четвёртый
       Check: `cat docs/tasks/RT-6-arc/probe.txt | tee docs/tasks/RT-6-arc/out.log` → `один`
- **Readiness sign:** шаги измерены
'
TA_DONE2='# Ход работы

## Шаги

- [x] 1.1 Первый
- [x] 1.2 Второй
- [>] 1.3 Третий
- [x] 1.4 Четвёртый
'
ta_dead_pid() { bash -c 'echo $$'; }

# --- SC-AK-1822 — команда шага на разобранной папке ставит отметку ---------------------------------
TA="$(ta_repo arc-step "$TA_PLAN" "$TA_DONE2")"
got="$(ta_engine "$TA" step 1.1)"
report "archive: SC-AK-1822 — шаг на разобранной папке совпал" "$(printf '%s' "$got" | grep -c '· совпало code=0')" 1
report "archive: SC-AK-1822 — метка шага записана" "$(ta_mark "$TA" 1.1)" 'есть'
report "archive: SC-AK-1822 — после замера папки снова нет" "$(ta_folder "$TA")" 'нет'
got="$(ta_engine "$TA" step 1.2)"
report "archive: SC-AK-1822 — шаг меряется на ходе работы своего замера" "$(printf '%s' "$got" | grep -c '· совпало code=0')" 1
report "archive: SC-AK-1822 — записи о возврате после замера нет" "$(test -e "$TA/.git/rt-kit-restored.json" && echo есть || echo нет)" 'нет'
got="$(ta_engine "$TA" step 1.4)"
report "archive: SC-AK-1822 — проверка написала файл в папку, папки после всё равно нет" "$(printf '%s' "$got" | grep -c '· совпало code=0')|$(ta_folder "$TA")" '1|нет'
report "archive: SC-AK-1822 — следующий шаг после такого запуска меряется" "$(ta_engine "$TA" step 1.1 | grep -c '· совпало code=0')" 1
got="$(ta_engine "$TA" step --done)"
report "archive: SC-AK-1822 — step --done на разобранной папке меряет сделанные шаги" "$(printf '%s' "$got" | grep -c 'matched 3 code=0')" 1

# --- SC-AK-1823 — шаг, который история не отмечает сделанным, получает ход отката ------------------
removed="$(cd "$TA" && git rev-parse HEAD)"
got="$(ta_engine "$TA" step 1.3)"
report "archive: SC-AK-1823 — несделанный в истории шаг отказан ходом отката" \
    "$(printf '%s' "$got" | grep -c "not marked done in the history.*git revert --no-edit $removed.* code=1")" 1
report "archive: SC-AK-1823 — номер, которого план не знает, отказан без хода отката" \
    "$(ta_engine "$TA" step 9.9 | grep -c 'plan names no step 9.9 code=1')|$(ta_folder "$TA")" '1|нет'
input="$(jq -cn --arg c "git revert --no-edit $removed" --arg d "$TA" '{session_id:"tests",tool_name:"Bash",cwd:$d,tool_input:{command:$c}}')"
report "archive: SC-AK-1823 — проверка шагов ход отката не отказывает" \
    "$(cd "$TA" && printf '%s' "$input" | node "$TA_ENGINE" guard 2>&1)" ''
(cd "$TA" && "${TA_G[@]}" revert --no-edit "$removed" >/dev/null)
report "archive: SC-AK-1823 — ход отката возвращает папку" "$(ta_folder "$TA")" 'есть'
# Запись мёртвого запуска при папке у вершины: старт движка папку не трогает.
printf '{"pid":%s,"root":"%s","folder":"docs/tasks/RT-6-arc","files":{}}\n' "$(ta_dead_pid)" "$TA" > "$TA/.git/rt-kit-restored.json"
ta_engine "$TA" states >/dev/null
report "archive: SC-AK-1824 — папка у вершины не убирается по записи мёртвого запуска" "$(ta_folder "$TA")" 'есть'

# --- SC-AK-1824 — старт движка чистит папку мёртвого запуска и не трогает живой -------------------
TB="$(ta_repo arc-broken "$TA_PLAN" "$TA_DONE2")"
ta_broken_run() { # запускает шаг 1.3 в фоне и ждёт записи о возврате; печатает номер процесса
    (cd "$TB" && RT_FLOW_STEP_LIMIT_MS=20000 exec node "$TA_ENGINE" step 1.3) >/dev/null 2>&1 &
    local i
    for i in $(seq 50); do [ -e "$TB/.git/rt-kit-restored.json" ] && break; sleep 0.1; done
    jq -r .pid "$TB/.git/rt-kit-restored.json"
}
# Ход работы истории отмечает 1.3 сделанным, чтобы шаг пошёл, а не был отказан.
(cd "$TB" && "${TA_G[@]}" revert --no-edit HEAD >/dev/null && printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Первый\n- [x] 1.2 Второй\n- [x] 1.3 Третий\n' > docs/tasks/RT-6-arc/progress.md \
    && git add -A && "${TA_G[@]}" commit -q -m done && git rm -q -r docs/tasks/RT-6-arc && "${TA_G[@]}" commit -q -m "taken apart again")
pid="$(ta_broken_run)"
ta_engine "$TB" states >/dev/null
report "archive: SC-AK-1824 — старт движка во время живого запуска папку не трогает" "$(ta_folder "$TB")" 'есть'
mkdir -p "$TB/.git/rt-kit/steps/RT-6-arc" && printf '{"matched":true}\n' > "$TB/.git/rt-kit/steps/RT-6-arc/1.1.json"
got="$(ta_engine "$TB" step 1.1)"
report "archive: SC-AK-1822 — второй шаг во время живого запуска отказан, его метка цела" \
    "$(printf '%s' "$got" | grep -c "put back by the live run $pid.* code=1")|$(ta_mark "$TB" 1.1)" '1|есть'
kill -9 "$pid" 2>/dev/null
wait 2>/dev/null
report "archive: SC-AK-1824 — оборванный запуск оставил папку" "$(ta_folder "$TB")" 'есть'
ta_engine "$TB" states >/dev/null
report "archive: SC-AK-1824 — старт движка убрал папку мёртвого запуска" "$(ta_folder "$TB")" 'нет'
report "archive: SC-AK-1824 — запись о возврате убрана" "$(test -e "$TB/.git/rt-kit-restored.json" && echo есть || echo нет)" 'нет'
pid="$(ta_broken_run)"
kill -9 "$pid" 2>/dev/null
wait 2>/dev/null
printf 'правка\n' >> "$TB/docs/tasks/RT-6-arc/probe.txt"
got="$(ta_engine "$TB" states 2>&1)"
report "archive: SC-AK-1824 — правленый файл возвращённой папки не убран, и это названо" \
    "$(ta_folder "$TB")|$(printf '%s' "$got" | grep -c 'left by a broken step run')" 'есть|1'
rm -rf "$TB/docs/tasks/RT-6-arc"
# Обрыв посреди возврата: части файлов нет, остальные — как их записал запуск.
pid="$(ta_broken_run)"
kill -9 "$pid" 2>/dev/null
wait 2>/dev/null
rm -f "$TB/docs/tasks/RT-6-arc/probe.txt"
ta_engine "$TB" states >/dev/null
report "archive: SC-AK-1824 — неполная папка оборванного возврата убрана" "$(ta_folder "$TB")" 'нет'

# --- SC-AK-1825, SC-AK-1826 — перемер перед PR: второй прогон и подробности несовпавшего ------------
TC="$TF_DIR/arc-rerun"
TA_FLIP="$TF_DIR/arc-flip"
(
    git -c init.defaultBranch=main init -q "$TC" && cd "$TC" || exit 1
    printf 'tracked\n' > tracked.txt
    git add tracked.txt && "${TA_G[@]}" commit -q -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-6-arc
    mkdir -p docs/tasks/RT-6-arc
    cat > docs/tasks/RT-6-arc/plan.md <<PLAN
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Совпасть со второго раза
       Check: \`if [ -e $TA_FLIP ]; then echo да; else touch $TA_FLIP; echo нет; fi\` → \`да\`
    2. Не совпасть никогда
       Check: \`echo a; echo b; echo c; echo d; echo ошибка >&2; exit 3\` → exit 0
    3. Выйти за предел
       Check: \`sleep 8\` → exit 0
- **Readiness sign:** шаги измерены
PLAN
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть со второго раза\n- [x] 1.2 Не совпасть никогда\n- [x] 1.3 Выйти за предел\n' > docs/tasks/RT-6-arc/progress.md
    git add -A && "${TA_G[@]}" commit -q -m plan
    mkdir -p .git/rt-kit/steps/RT-6-arc
    printf '{"matched":true}\n' > .git/rt-kit/steps/RT-6-arc/1.1.json
    printf '{"matched":true}\n' > .git/rt-kit/steps/RT-6-arc/1.2.json
)
got="$(ta_engine "$TC" step --done --pr)"
report "archive: SC-AK-1825 — шаг, совпавший со второго прогона, совпал" "$(printf '%s' "$got" | grep -c '^1.1 .*· совпало')" 1
report "archive: SC-AK-1825 — второй прогон назван" "$(printf '%s' "$got" | grep -c 'matched on the second run')" 1
report "archive: SC-AK-1825 — метка шага, совпавшего со второго раза, цела" "$(ta_mark "$TC" 1.1)" 'есть'
report "archive: SC-AK-1825 — шаг, не совпавший дважды, потерял метку" "$(ta_mark "$TC" 1.2)" 'нет'
report "archive: SC-AK-1825 — несовпавший шаг шёл дважды" "$(printf '%s' "$got" | grep -c '^    runs: twice')" 1
report "archive: SC-AK-1826 — строка несовпавшего шага называет команду" "$(printf '%s' "$got" | grep -c '^    command: echo a; echo b')" 1
report "archive: SC-AK-1826 — три последние строки вывода" "$(printf '%s' "$got" | grep -cE '^    output: [bcd]$')" 3
report "archive: SC-AK-1826 — последние строки ошибок" "$(printf '%s' "$got" | grep -c '^    errors: ошибка$')" 1
report "archive: SC-AK-1825 — шаг за пределом шёл один раз" "$(printf '%s' "$got" | grep -A1 '^1.3 .*ran out' | grep -c '^    runs: once')" 1
rm -f "$TA_FLIP"
printf '{"matched":true}\n' > "$TC/.git/rt-kit/steps/RT-6-arc/1.1.json"
got="$(cd "$TC" && RT_FLOW_RERUN_BUDGET_MS=1 RT_FLOW_STEP_LIMIT_MS=5000 node "$TA_ENGINE" step --done --pr 2>&1; printf ' code=%s' "$?")"
report "archive: SC-AK-1825 — бюджет вышел — второго прогона нет, метка снята" \
    "$(printf '%s' "$got" | grep -c '^    runs: once')|$(ta_mark "$TC" 1.1)" '3|нет'
rm -f "$TA_FLIP"

# Группы версий хода работы: второй прогон пишет ход работы своей группы заново. Проверка 1.1
# совпадает со второго раза и только на ходе работы до своей отметки; 1.2 и 1.3 идут на поздней версии.
TD="$TF_DIR/arc-groups"
TA_FLIP2="$TF_DIR/arc-flip-2"
(
    git -c init.defaultBranch=main init -q "$TD" && cd "$TD" || exit 1
    printf 'tracked\n' > tracked.txt
    git add tracked.txt && "${TA_G[@]}" commit -q -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-7-grp
    mkdir -p docs/tasks/RT-7-grp
    cat > docs/tasks/RT-7-grp/plan.md <<PLAN
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Не видеть своей отметки
       Check: \`[ -e $TA_FLIP2 ] || { touch $TA_FLIP2; exit 1; }; grep -c '^- \\[x\\] 1.1' docs/tasks/RT-7-grp/progress.md || true\` → = 0
    2. Видеть отметку 1.1
       Check: \`grep -c '^- \\[x\\] 1.1' docs/tasks/RT-7-grp/progress.md\` → = 1
    3. Упасть в середине конвейера
       Check: \`printf 'ok 1\\nFAIL 2 сломалось\\nok 3\\n' | grep -c '^ok 2'\` → >= 1
- **Readiness sign:** шаги измерены
PLAN
    printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Не видеть своей отметки\n- [ ] 1.2 Видеть отметку 1.1\n- [ ] 1.3 Упасть в середине конвейера\n' > docs/tasks/RT-7-grp/progress.md
    git add -A && "${TA_G[@]}" commit -q -m plan
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Не видеть своей отметки\n- [>] 1.2 Видеть отметку 1.1\n- [ ] 1.3 Упасть в середине конвейера\n' > docs/tasks/RT-7-grp/progress.md
    git add -A && "${TA_G[@]}" commit -q -m one
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Не видеть своей отметки\n- [x] 1.2 Видеть отметку 1.1\n- [x] 1.3 Упасть в середине конвейера\n' > docs/tasks/RT-7-grp/progress.md
    git add -A && "${TA_G[@]}" commit -q -m all
    git rm -q -r docs/tasks/RT-7-grp && "${TA_G[@]}" commit -q -m "folder taken apart"
)
got="$(ta_engine "$TD" step --done --pr)"
report "archive: SC-AK-1825 — второй прогон идёт на ходе работы своей группы" \
    "$(printf '%s' "$got" | grep -A1 '^1.1 .*· совпало' | grep -c 'matched on the second run')|$(printf '%s' "$got" | grep -c '^1.2 .*· совпало')" '1|1'
report "archive: SC-AK-1826 — у конвейера видна строка провала до последней команды" \
    "$(printf '%s' "$got" | grep -c '^    before the last pipe: FAIL 2 сломалось$')" 1
rm -f "$TA_FLIP2"

# --- SC-AK-1833 — шаг, не совпавший дважды на разобранной папке: ход отката и номер в отказе -------
(cd "$TC" && git rm -q -r docs/tasks/RT-6-arc && "${TA_G[@]}" commit -q -m "folder taken apart")
removed="$(cd "$TC" && git rev-parse HEAD)"
got="$(ta_engine "$TC" step --done --pr)"
report "archive: SC-AK-1833 — перемер разобранной папки называет ход отката" \
    "$(printf '%s' "$got" | grep -c "^step: 1.2, 1.3 did not match.*git revert --no-edit $removed")" 1
# Настоящее суждение конца хода: копия описания без шести первых состояний, чтобы ветка стояла в
# «этап-идёт» без хостинга; в записи сессии есть правка, чтобы ход не отпустила пустая сессия.
mkdir -p "$TF_DIR/flowcopy" && cp -R "$TESTS/../assets/task-flow" "$TESTS/../assets/checks" "$TF_DIR/flowcopy/"
node -e '
const fs = require("fs");
const file = process.argv[1];
const text = fs.readFileSync(file, "utf8");
fs.writeFileSync(file, text.slice(0, text.indexOf("    request: {")) + text.slice(text.indexOf("    stage: {")));
' "$TF_DIR/flowcopy/task-flow/flow.js"
printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","id":"e1","name":"Edit","input":{"file_path":"x"}}]}}' > "$TF_DIR/arc-record.jsonl"
ta_verdict() { (cd "$1" && printf '{"transcript_path":"%s"}' "$TF_DIR/arc-record.jsonl" | node "$TA_ENGINE" verdict --flow "$TF_DIR/flowcopy/task-flow/flow.js" 2>&1); }
got="$(ta_verdict "$TC")"
report "archive: SC-AK-1833 — отказ конца хода без папки называет номер шага и ход отката" \
    "$(printf '%s' "$got" | grep -c 'task-flow-script.mjs step 1.2`')|$(printf '%s' "$got" | grep -c "git revert --no-edit $removed")" '1|1'
report "archive: SC-AK-1833 — отказ без папки не пишет «step N.M»" "$(printf '%s' "$got" | grep -c 'step N.M')" 0
(cd "$TC" && "${TA_G[@]}" revert --no-edit "$removed" >/dev/null)
got="$(ta_verdict "$TC")"
report "archive: SC-AK-1833 — после хода отката отказ называет номер шага, не «step N.M»" \
    "$(printf '%s' "$got" | grep -c 'task-flow-script.mjs step 1.2`')|$(printf '%s' "$got" | grep -c 'step N.M')" '1|0'
# Хук открытия PR называет номера несовпавших шагов, а не «step N.M».
got="$(
    unmet() { printf '%s\n' "$3"; }
    rt_hooks_dir="$TESTS/../assets/hooks" root="$TC" RT_FLOW_STEP_LIMIT_MS=5000
    export RT_FLOW_STEP_LIMIT_MS
    . "$TESTS/../assets/hooks/git-guard-delivery-rerun.sh"
    rt_delivery_rerun
)"
report "archive: SC-AK-1833 — отказ открытия PR называет шаги по номерам" \
    "$(printf '%s' "$got" | grep -c 'task-flow-script.mjs step 1.2`, `node tools/task-flow-script.mjs step 1.3`')|$(printf '%s' "$got" | grep -c 'step N.M')" '1|0'
rm -f "$TA_FLIP"

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: шаг после разбора папки"
fi
