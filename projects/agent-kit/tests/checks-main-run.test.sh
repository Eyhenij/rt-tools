#!/usr/bin/env bash
# Сценарии команды «последний запуск CI главной ветки одной строкой».
#
# Двойник хостинга — общий, из lib-board.sh: запуск главной ветки он отдаёт по имени файла
# конвейера. Сеть не трогается: строка команды судится по тому, что сценарий положил в окружение.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: последний запуск главной ветки одной строкой"

. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

BOARD_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
board_config "$BOARD_CONFIG"

main_run() {
    (cd "$BOARD_TREE" && GH_BIN="$BOARD_TREE/gh" node tools/main-run.mjs 2>&1)
}
main_run_code() {
    (cd "$BOARD_TREE" && GH_BIN="$BOARD_TREE/gh" node tools/main-run.mjs > /dev/null 2>&1)
    printf '%s' "$?"
}
on_push() {
    printf '%s\n' 'on:' '    push:' '        branches:' '            - main' '    pull_request:' \
        'jobs:' '    main:' '        steps:' '            - name: Lint' \
        > "$BOARD_TREE/.github/workflows/ci.yml"
}

# --- SC-AK-1106 — одна строка о последнем запуске главной ветки -------------------------------

# Конвейер дерева на push в главную не встаёт: запуска нет, и строка говорит об этом, а не молчит.
export STUB_MAIN_RUN='{"id":7,"status":"completed","conclusion":"failure","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/7"}'
report "SC-AK-1106 — конвейер без push: строка о непрочитанном" "$(main_run | grep -c 'was not read — the pipeline does not wake on a push to «main»')" 1
report "SC-AK-1106 — конвейер без push: код выхода 0" "$(main_run_code)" 0

on_push
report "SC-AK-1106 — красный назван коммитом, днём и адресом" "$(main_run | grep -c '«main» is RED on abcdef01 of 2026-09-10: merges on top go out unchecked — https://probe/runs/7')" 1
report "SC-AK-1106 — красный: код выхода 1" "$(main_run_code)" 1

export STUB_MAIN_RUN='{"id":8,"status":"completed","conclusion":"cancelled","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/8"}'
export STUB_JOBS=0
report "SC-AK-1106 — вытесненный назван" "$(main_run | grep -c 'was pushed out of the queue and never checked the merge — https://probe/runs/8')" 1
report "SC-AK-1106 — вытесненный: код выхода 1" "$(main_run_code)" 1
unset STUB_JOBS

export STUB_MAIN_RUN='{"id":9,"status":"completed","conclusion":"success","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/9"}'
report "SC-AK-1106 — зелёный назван коммитом и днём" "$(main_run | grep -c '«main» is green on abcdef01 of 2026-09-10')" 1
report "SC-AK-1106 — зелёный: код выхода 0" "$(main_run_code)" 0

export STUB_MAIN_RUN='{"id":10,"status":"in_progress","conclusion":null,"sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/10"}'
report "SC-AK-1106 — идущий назван с адресом" "$(main_run | grep -c '«main» is being checked on abcdef01 — https://probe/runs/10')" 1

export STUB_MAIN_RUN=''
report "SC-AK-1106 — без единого запуска сказано так" "$(main_run | grep -c '«main» has no run yet')" 1
report "SC-AK-1106 — без единого запуска: код выхода 0" "$(main_run_code)" 0

# Файла конвейера нет: читать нечего, и строка говорит об этом.
board_config "${BOARD_CONFIG/.github\/workflows\/ci.yml/.github\/workflows\/nope.yml}"
report "SC-AK-1106 — без файла конвейера: строка о непрочитанном" "$(main_run | grep -c 'was not read — the tree has no pipeline file')" 1
board_config "$BOARD_CONFIG"

# Хостинг не отвечает: строка говорит, что запуск не прочитан, и не падает.
cat > "$BOARD_TREE/gh" <<'STUB'
#!/usr/bin/env bash
printf 'dial tcp: no such host\n' >&2
exit 1
STUB
report "SC-AK-1106 — без сети: строка о непрочитанном" "$(main_run | grep -c 'main-run: the main branch run was not read — ')" 1
report "SC-AK-1106 — без сети: код выхода 0" "$(main_run_code)" 0

rm -rf "$BOARD_TREE"

suite_result "последний запуск главной ветки одной строкой"
