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
- **Readiness sign:** шаги измерены
'
TA_DONE2='# Ход работы

## Шаги

- [x] 1.1 Первый
- [x] 1.2 Второй
- [>] 1.3 Третий
'

# --- SC-AK-1822 — команда шага на разобранной папке ставит отметку ---------------------------------
TA="$(ta_repo arc-step "$TA_PLAN" "$TA_DONE2")"
got="$(ta_engine "$TA" step 1.1)"
report "archive: SC-AK-1822 — шаг на разобранной папке совпал" "$(printf '%s' "$got" | grep -c '· совпало code=0')" 1
report "archive: SC-AK-1822 — метка шага записана" "$(ta_mark "$TA" 1.1)" 'есть'
report "archive: SC-AK-1822 — после замера папки снова нет" "$(ta_folder "$TA")" 'нет'
got="$(ta_engine "$TA" step 1.2)"
report "archive: SC-AK-1822 — шаг меряется на ходе работы своего замера" "$(printf '%s' "$got" | grep -c '· совпало code=0')" 1
report "archive: SC-AK-1822 — записи о возврате после замера нет" "$(test -e "$TA/.git/rt-kit-restored.json" && echo есть || echo нет)" 'нет'

# --- SC-AK-1823 — шаг, который история не отмечает сделанным, получает ход отката ------------------
removed="$(cd "$TA" && git rev-parse HEAD)"
got="$(ta_engine "$TA" step 1.3)"
report "archive: SC-AK-1823 — несделанный в истории шаг отказан ходом отката" \
    "$(printf '%s' "$got" | grep -c "not marked done in the history.*git revert --no-edit $removed.* code=1")" 1
input="$(jq -cn --arg c "git revert --no-edit $removed" --arg d "$TA" '{session_id:"tests",tool_name:"Bash",cwd:$d,tool_input:{command:$c}}')"
report "archive: SC-AK-1823 — проверка шагов ход отката не отказывает" \
    "$(cd "$TA" && printf '%s' "$input" | node "$TA_ENGINE" guard 2>&1)" ''
(cd "$TA" && "${TA_G[@]}" revert --no-edit "$removed" >/dev/null)
report "archive: SC-AK-1823 — ход отката возвращает папку" "$(ta_folder "$TA")" 'есть'

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
ta_engine "$TB" states >/dev/null
report "archive: SC-AK-1824 — правленый файл возвращённой папки не убран" "$(ta_folder "$TB")" 'есть'
rm -rf "$TB/docs/tasks/RT-6-arc"

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
- **Readiness sign:** шаги измерены
PLAN
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть со второго раза\n- [x] 1.2 Не совпасть никогда\n' > docs/tasks/RT-6-arc/progress.md
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
rm -f "$TA_FLIP"
printf '{"matched":true}\n' > "$TC/.git/rt-kit/steps/RT-6-arc/1.1.json"
got="$(cd "$TC" && RT_FLOW_RERUN_BUDGET_MS=1 RT_FLOW_STEP_LIMIT_MS=5000 node "$TA_ENGINE" step --done --pr 2>&1; printf ' code=%s' "$?")"
report "archive: SC-AK-1825 — бюджет вышел — второго прогона нет, метка снята" \
    "$(printf '%s' "$got" | grep -c '^    runs: once')|$(ta_mark "$TC" 1.1)" '2|нет'
rm -f "$TA_FLIP"

# --- SC-AK-1833 — шаг, не совпавший дважды на разобранной папке: ход отката и номер в отказе -------
(cd "$TC" && git rm -q -r docs/tasks/RT-6-arc && "${TA_G[@]}" commit -q -m "folder taken apart")
removed="$(cd "$TC" && git rev-parse HEAD)"
got="$(ta_engine "$TC" step --done --pr)"
report "archive: SC-AK-1833 — перемер разобранной папки называет ход отката" \
    "$(printf '%s' "$got" | grep -c "^step: 1.2 did not match.*git revert --no-edit $removed")" 1
got="$(cd "$TC" && node --input-type=module -e "
import { buildModel } from '$TESTS/../assets/checks/flow-model.mjs';
import { archivedStep, holdReason } from '$TESTS/../assets/checks/flow-verdict.mjs';
import { open as openGit } from '$TESTS/../assets/task-flow/source/git.mjs';
import { open as openMarks } from '$TESTS/../assets/task-flow/source/marks.mjs';
const model = buildModel('$TESTS/../assets/task-flow/flow.js');
const step = archivedStep(openGit(), openMarks(), 'docs/tasks/RT-6-arc', 'RT-6-arc');
console.log(holdReason(model, { state: 'этап-идёт', index: 7, reason: null }, step));
" 2>&1)"
report "archive: SC-AK-1833 — отказ конца хода без папки называет номер шага" \
    "$(printf '%s' "$got" | grep -c 'task-flow-script.mjs step 1.2`')" 1
report "archive: SC-AK-1833 — отказ называет ход отката и не пишет «step N.M»" \
    "$(printf '%s' "$got" | grep -c "git revert --no-edit $removed")|$(printf '%s' "$got" | grep -c 'step N.M')" '1|0'

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: шаг после разбора папки"
fi
