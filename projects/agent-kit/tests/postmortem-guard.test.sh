#!/usr/bin/env bash
# Сценарии гарда происшествия: что считается признанием промаха и чем требование снимается.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же, каталог записей —
# в одноразовом дереве. Полноту набора образцов гард не обещает и здесь: проверяется, что
# признанное словами из набора ловится, а обычная работа — нет.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард происшествия"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
mkdir -p "$TREE/docs/postmortems"
TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TREE" "$TURNS"; }
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
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
uses() {
    local input="$2"
    [ -z "$input" ] && input='{}'
    jq -c -n --arg n "$1" --arg i "$input" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:$n,input:($i|fromjson)}]}}'
}

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/postmortem-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

WROTE='{"file_path":"docs/postmortems/2026-08-13-probe.md"}'
WROTE_ELSE='{"file_path":"docs/tasks/RT-1-probe/progress.md"}'

# --- SC-AK-95 — ход с признанием промаха не закрывается без записи ---------------------------
expect_stop "SC-AK-95 — признал промах, записи нет" \
    "$(input_stop "$(transcript "$(say 'почему так вышло?')" "$(reply 'Был неправ: утверждение о дереве я не проверил.')")")" BLOCK
expect_stop "SC-AK-95 — извинение тоже признание" \
    "$(input_stop "$(transcript "$(say 'ты соврал')" "$(reply 'Извиняюсь, факт я принял на веру.')")")" BLOCK

# --- SC-AK-96 — запись появилась, и ход закрывается -------------------------------------------
expect_stop "SC-AK-96 — запись сделана тем же ходом" \
    "$(input_stop "$(transcript "$(say 'почему так вышло?')" "$(reply 'Был неправ.')" "$(uses Write "$WROTE")")")" PASS
expect_stop "запись не в тот файл требования не снимает" \
    "$(input_stop "$(transcript "$(say 'почему так вышло?')" "$(reply 'Был неправ.')" "$(uses Write "$WROTE_ELSE")")")" BLOCK

# --- обычная работа не судится ------------------------------------------------------------------
# Гард ловит признание, а не любое упоминание ошибки: разбор дефекта в коде происшествием не
# является, и заход, где чинят чужую поломку, требования не получает.
expect_stop "разбор дефекта происшествием не считается" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель падала на пустом ответе — поправил условие.')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда.
expect_stop "повторный заход отпускается" \
    "$(input_stop "$(transcript "$(say 'почему так вышло?')" "$(reply 'Был неправ.')")" true)" PASS
expect_stop "нет записи хода — нечего судить" "$(input_stop "$TURNS/нетакого.jsonl")" PASS

# Дерево без каталога записей требования не получает: гард не навязывается тому, кто разборов
# не ведёт.
BARE="$(fixture_tree)"
CLAUDE_PROJECT_DIR="$BARE" expect_stop "дерево без каталога записей не судится" \
    "$(input_stop "$(transcript "$(say 'почему так вышло?')" "$(reply 'Был неправ.')")")" PASS
rm -rf "$BARE"

suite_result "гард происшествия"
