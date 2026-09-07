#!/usr/bin/env bash
# Сценарии гарда перезапуска: упавшее задание не перезапускается, пока его журнал не прочитан.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард перезапуска"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

# Имя файла берётся у mktemp, а не у счётчика: функция зовётся в подстановке команд, то есть в
# подоболочке, и счётчик в ней инкрементируется своей копией — все записи легли бы в один файл.
transcript() {
    local path
    path="$(mktemp "$TURNS/turn-XXXXXX")"
    : >"$path"
    for line in "$@"; do printf '%s\n' "$line" >>"$path"; done
    printf '%s' "$path"
}

ran() { jq -c -n --arg c "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'; }

cmd_in() {
    jq -n --arg c "$1" --arg p "$2" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},transcript_path:$p}'
}
r() { expect_decision "$1" rerun-guard.sh "$(cmd_in "$2" "$3")" "$4"; }

EMPTY="$(transcript "$(ran 'git status')")"
READ_ONE="$(transcript "$(ran 'gh run view 17123456 --log-failed')")"
READ_OTHER="$(transcript "$(ran 'gh run view 17999999 --log-failed')")"

r "SC-AK-411 — перезапуск без прочитанного журнала отбит" \
    'gh run rerun 17123456 --failed' "$EMPTY" deny
r "SC-AK-412 — перезапуск после прочитанного журнала проходит" \
    'gh run rerun 17123456 --failed' "$READ_ONE" PASS
r "SC-AK-413 — журнал соседнего задания перезапуск не открывает" \
    'gh run rerun 17123456 --failed' "$READ_OTHER" deny

# Отказ называет само задание и команду, которой журнал читается: отказ без действия обходят.
expect_reason "SC-AK-411 — отказ называет задание и чтение журнала" rerun-guard.sh \
    "$(cmd_in 'gh run rerun 17123456 --failed' "$EMPTY")" 'run view 17123456 --log-failed'
expect_reason "SC-AK-411 — отказ называет два законных хода" rerun-guard.sh \
    "$(cmd_in 'gh run rerun 17123456 --failed' "$EMPTY")" 'Two moves from here'

# --- отказ в пользу работы -----------------------------------------------------------------
# Номера в команде нет — судить не о чем: перезапуск последнего упавшего зовут и без него, а
# угадывать задание значит отбивать наугад.
r "SC-AK-414 — перезапуск без номера задания не судится" \
    'gh run rerun --failed' "$EMPTY" PASS
r "чтение прогонов перезапуском не считается" \
    'gh run list --branch RT-900-x' "$EMPTY" PASS
r "перезапуск чужой командой не судится" \
    'npm run rerun 17123456' "$EMPTY" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/rerun-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "записи хода нет — вызов проходит" \
    "$(cmd_in 'gh run rerun 17123456' "$TURNS/нет-такой.jsonl")"

suite_result "гард перезапуска"
