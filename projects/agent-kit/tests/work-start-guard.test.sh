#!/usr/bin/env bash
# Сценарии гарда начала работы: ход, правивший код приложения, не кончается, пока владелец в
# этом же ходе о работе не просил.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же, а признак кода
# приложения приходит из умолчания профиля пакета — тот судит путь относительно корня дерева.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард начала работы"

TURNS="$(mktemp -d)"
REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$TURNS" "$REPO"; }
trap cleanup EXIT

mkdir -p "$REPO/libs/probe" "$REPO/docs"

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
edited() {
    jq -c -n --arg p "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:$p}}]}}'
}
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}

input_stop() {
    jq -n --arg p "$1" --arg d "$REPO" --argjson a "${2:-false}" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/work-start-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Отказ читается тем, кому он адресован: он называет и правленный файл, и то, чем реплика была.
expect_reason() {
    local label="$1" json="$2" want="$3" out
    out="$(printf '%s' "$json" | "$HOOKS/work-start-guard.sh" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null)"
    case "$out" in
        *"$want"*) report "$label" "есть:$want" "есть:$want" ;;
        *) report "$label" "нет:$want" "есть:$want" ;;
    esac
}

CODE="$REPO/libs/probe/thing.ts"
TEXT="$REPO/docs/note.md"

# SC-AK-775 — путь к файлу заданием не бывает
T="$(transcript "$(say "$REPO/docs/handoff.md")" "$(edited "$CODE")")"
expect_stop "SC-AK-775 — правка кода после пути к файлу отбита" "$(input_stop "$T")" BLOCK
expect_reason "SC-AK-775 — отказ называет правленный файл" "$(input_stop "$T")" "$CODE"
expect_reason "SC-AK-775 — отказ называет, чем была реплика" "$(input_stop "$T")" "a path to a file"

# SC-AK-776 — просьба владельца ход отпускает
T="$(transcript "$(say 'доделай второй этап замысла и открой заявку')" "$(edited "$CODE")")"
expect_stop "SC-AK-776 — правка кода после просьбы проходит" "$(input_stop "$T")" PASS

# SC-AK-777 — одно слово просьбой не считается
T="$(transcript "$(say 'продолжай')" "$(edited "$CODE")")"
expect_stop "SC-AK-777 — одно слово отбито" "$(input_stop "$T")" BLOCK
expect_reason "SC-AK-777 — отказ называет род реплики" "$(input_stop "$T")" "one word"

# SC-AK-778 — судится код приложения, а не всякая правка
T="$(transcript "$(say "$REPO/docs/handoff.md")" "$(edited "$TEXT")")"
expect_stop "SC-AK-778 — правка текста после пути к файлу проходит" "$(input_stop "$T")" PASS

# SC-AK-778 — ход без единой правки файла не судится вовсе
T="$(transcript "$(say "$REPO/docs/handoff.md")" "$(ran 'git status')")"
expect_stop "SC-AK-778 — ход без правки проходит" "$(input_stop "$T")" PASS

# SC-AK-779 — прерывание владельца просьбой не бывает
T="$(transcript "$(say '[Request interrupted by user]')" "$(edited "$CODE")")"
expect_stop "SC-AK-779 — правка кода после прерывания отбита" "$(input_stop "$T")" BLOCK
expect_reason "SC-AK-779 — отказ называет прерывание" "$(input_stop "$T")" "an interruption"

# SC-AK-780 — повторный заход по тому же ходу не судится
T="$(transcript "$(say "$REPO/docs/handoff.md")" "$(edited "$CODE")")"
expect_stop "SC-AK-780 — повторный заход проходит" "$(input_stop "$T" true)" PASS

# SC-AK-780 — отказ в пользу работы: записи хода нет
expect_stop "SC-AK-780 — ход без записи проходит" "$(input_stop "$TURNS/нет-такого.jsonl")" PASS

# SC-AK-780 — отказ в пользу работы: дерево не объявило признака кода приложения
T="$(transcript "$(say "$REPO/docs/handoff.md")" "$(edited "$CODE")")"
BARE="$(mktemp -d)"
printf '{"name":"probe"}\n' > "$BARE/package.json"
report "SC-AK-780 — дерево без признака кода приложения проходит" \
    "$( (cd "$BARE" && CLAUDE_PROJECT_DIR="$BARE" HOME="$BARE" printf '%s' "$(input_stop "$T")" \
        | env -i PATH="$PATH" CLAUDE_PROJECT_DIR="$BARE" bash "$HOOKS/work-start-guard.sh" 2>/dev/null) | head -c 1 | wc -c | tr -d ' ')" 0

rm -rf "$BARE"

# SC-AK-781 — судится последний ход, а не вся запись
T="$(transcript "$(say 'сделай гард')" "$(edited "$CODE")" "$(say 'спасибо')" "$(ran 'git status')")"
expect_stop "SC-AK-781 — ход без правки кода проходит, хотя правка была раньше" "$(input_stop "$T")" PASS

suite_result "гард начала работы"
