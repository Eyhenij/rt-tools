#!/usr/bin/env bash
# Сценарии гарда совести: найденный повтор разобранного промаха не даёт закрыть ход.
#
# Проверяется механика: находка читается из записи хода, судится последняя, и снимает её
# действие по находке, а не слова о ней.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард совести"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do
        printf '%s\n' "$line" >>"$path"
    done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/conscience-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

FOUND='СОВЕСТЬ: повтор
РАЗБОР: 2026-08-18-ready-work-left-in-drafts.md
ЧТО СЕЙЧАС: работа отдана и брошена черновиком
ЧЕМ КОНЧИЛОСЬ ТОГДА: готовая работа простояла невлитой почти три часа'

# --- находка висит ------------------------------------------------------------------------
expect_stop "SC-AK-321 — найденный повтор ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(reply 'Понял.')")")" BLOCK

# --- находка разобрана --------------------------------------------------------------------
expect_stop "SC-AK-322 — заведённый разбор происшествия ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(ran 'cat > docs/postmortems/2026-08-19-x.md')")")" PASS
expect_stop "SC-AK-323 — названный владельцу повтор ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(reply 'СОВЕСТЬ: разобрано — повтор назван владельцу')")")" PASS

# --- чисто --------------------------------------------------------------------------------
expect_stop "SC-AK-324 — при чистом ответе роли ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said 'СОВЕСТЬ: чисто')")")" PASS
expect_stop "SC-AK-325 — молчание роли ход закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply 'сделал')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
expect_stop "SC-AK-326 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'x')" "$(said "$FOUND")")" true)" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/conscience-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "записи хода нет — ход закрывается" "$(input_stop "$TURNS/нет-такой.jsonl")"

suite_result "гард совести"
