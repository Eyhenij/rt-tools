#!/usr/bin/env bash
# Сценарии гарда утверждения: что владельцу говорят о дереве и чем это подтверждают.
#
# Проверяется механика, а не карта дерева: стенограмма хода собирается здесь же. Гард судит
# пару — сказанное владельцу и команды того же хода.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард утверждения"

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
told() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
answered() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" \
        '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_claim() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/claim-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- утверждение без команды --------------------------------------------------------------
# Ровно этим кончились восемь разборов: слово сказано, дерева за ним нет.
expect_claim "SC-AK-393 — «проверено» без прогона набора ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(told 'Всё проверено, тесты зелёные.')")")" BLOCK
expect_claim "SC-AK-394 — «запушено» без вызова пуша ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(told 'Ветка запушена.')")")" BLOCK
expect_claim "SC-AK-395 — «ветки сняты» без вызова удаления ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'прибери')" "$(told 'Влитые ветки сняты.')")")" BLOCK
expect_claim "SC-AK-396 — «прогон зелёный» без вызова о прогоне ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'что там')" "$(told 'Прогон зелёный, можно вливать.')")")" BLOCK
expect_claim "SC-AK-397 — «в дереве этого нет» без поиска ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'есть такое?')" "$(told 'В дереве этого нет.')")")" BLOCK

# --- утверждение с командой ---------------------------------------------------------------
expect_claim "SC-AK-398 — прогон набора «проверено» подтверждает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'pnpm run check:all')" "$(told 'Всё проверено, тесты зелёные.')")")" PASS
expect_claim "SC-AK-399 — вызов пуша «запушено» подтверждает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push -u origin RT-1-probe')" "$(told 'Ветка запушена.')")")" PASS
expect_claim "SC-AK-400 — вызов удаления «ветки сняты» подтверждает" \
    "$(input_stop "$(transcript "$(say 'прибери')" "$(ran 'git push origin --delete RT-1-probe')" "$(told 'Влитые ветки сняты.')")")" PASS
expect_claim "SC-AK-401 — поиск по дереву отрицание подтверждает" \
    "$(input_stop "$(transcript "$(say 'есть такое?')" "$(ran 'grep -rn claim docs')" "$(told 'В дереве этого нет.')")")" PASS

# --- чего гард не судит --------------------------------------------------------------------
# Обещание врать нечем: будущее время утверждением о дереве не является.
expect_claim "SC-AK-402 — обещание проверить ход не задерживает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(told 'Сейчас прогоню набор и вернусь.')")")" PASS
# Судится сказанное владельцу, а не вывод инструмента: за файл отвечает гейт.
expect_claim "SC-AK-403 — те же слова в выводе инструмента ход не задерживают" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'cat report.md')" "$(answered 'Всё проверено, тесты зелёные.')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
expect_claim "SC-AK-404 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(told 'Всё проверено, тесты зелёные.')")" true)" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/claim-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "запись хода, которой нет, пропускается" "$(input_stop "$TURNS/нет-такой.jsonl")"

# --- отказ называет само утверждение --------------------------------------------------------
# «Не подтверждено» без слова исполнитель читает как придирку и переписывает соседнюю фразу.
reason_of() {
    printf '%s' "$1" | "$HOOKS/claim-guard.sh" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null
}
if reason_of "$(input_stop "$(transcript "$(say 'продолжай')" "$(told 'Ветка запушена.')")")" \
    | grep -qi 'запушена'; then got="есть"; else got="нет"; fi
report "SC-AK-405 — отказ называет найденное утверждение" "$got" "есть"

suite_result "гард утверждения"
