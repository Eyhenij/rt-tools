#!/usr/bin/env bash
# Сценарии гарда отметки груза: ход, который взял запись груза в работу или отдал по ней работу,
# не кончается, пока состояние записи в приёме не переведено.
#
# Гард — этот дерева, а не пакета: приём груза живёт в одном дереве мастерской, и граница пакета
# такой ресурс отбивает. Набор поэтому берёт его из каталога хуков дерева, а не из ресурсов
# пакета — рядом с наборами команд чтения, отметки и закрытия груза.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же, а папка задачи с
# ключами груза кладётся в фикстуру.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

GUARD="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/.claude/hooks/cargo-mark-guard.sh"

echo "гард отметки груза"

TURNS="$(mktemp -d)"
REPO="$(fixture_repo RT-1-cargo)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$TURNS" "$REPO"; }
trap cleanup EXIT

BRANCH="$(git -C "$REPO" branch --show-current)"
TASK="$REPO/docs/tasks/$BRANCH"
mkdir -p "$TASK"

KEY=515044e4-21f2-4bb5-b46a-b9f232116d75

# Разбор просьбы с ключами груза и без них.
grill_with_keys() {
    printf '# Разбор просьбы\n\nПриехало грузом: %s\n' "$KEY" > "$TASK/grill.md"
}
grill_without_keys() {
    printf '# Разбор просьбы\n\nВладелец попросил починить отступ.\n' > "$TASK/grill.md"
}

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
wrote() {
    jq -c -n --arg p "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Write",input:{file_path:$p}}]}}'
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
    out="$( (cd "$REPO" && printf '%s' "$json" | "$GUARD" 2>/dev/null) )"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

expect_reason() {
    local label="$1" json="$2" want="$3" out
    out="$( (cd "$REPO" && printf '%s' "$json" | "$GUARD" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null) )"
    case "$out" in
        *"$want"*) report "$label" "есть:$want" "есть:$want" ;;
        *) report "$label" "нет:$want" "есть:$want" ;;
    esac
}

grill_with_keys

# SC-MB-281 — работа отдана, а состояние записи прежнее
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')")"
expect_stop "SC-MB-281 — отдача без отметки отбита" "$(input_stop "$T")" BLOCK
expect_reason "SC-MB-281 — отказ называет ключ записи" "$(input_stop "$T")" "$KEY"
expect_reason "SC-MB-281 — отказ требует приём починки" "$(input_stop "$T")" "the fix travels with the move"

# SC-MB-261, SC-MB-281 — отметка тем же ходом отпускает
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')" \
    "$(ran 'npm run cargo:mark -- --state fixed --fix статьёй --proposal 515044e4-21f2-4bb5-b46a-b9f232116d75')")"
expect_stop "SC-MB-261, SC-MB-281 — отдача с отметкой проходит" "$(input_stop "$T")" PASS

# SC-MB-282 — взятие в работу гардом не судится: чужой записи «в работе» не поставить
T="$(transcript "$(say 'разбери приёмник')" "$(wrote "$TASK/grill.md")")"
expect_stop "SC-MB-282 — заведение папки задачи проходит" "$(input_stop "$T")" PASS

# SC-MB-282 — закрытие издателем считается отметкой наравне с обычной
T="$(transcript "$(say 'закрывай')" "$(ran 'git rm -r docs/tasks/'"$BRANCH")" \
    "$(ran 'node tools/cargo-close.mjs --state fixed --fix статьёй --proposal 515044e4-21f2-4bb5-b46a-b9f232116d75')")"
expect_stop "SC-MB-282 — разбор папки с закрытием проходит" "$(input_stop "$T")" PASS

# SC-MB-283 — между взятием и отдачей отметки не требуется
T="$(transcript "$(say 'делай этап')" "$(wrote "$REPO/libs/probe/thing.ts")" "$(ran 'git commit -m x')")"
expect_stop "SC-MB-283 — обычный ход работы проходит" "$(input_stop "$T")" PASS

# SC-MB-283 — сухой прогон отметкой не считается: он следа наружу не оставляет
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')" \
    "$(ran 'npm run cargo:mark -- --state fixed --dry-run --proposal 515044e4-21f2-4bb5-b46a-b9f232116d75')")"
expect_stop "SC-MB-283 — сухой прогон отметкой не считается" "$(input_stop "$T")" BLOCK

# SC-MB-284 — задача не из груза гарда не получает
grill_without_keys
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')")"
expect_stop "SC-MB-284 — отдача работы без ключей груза проходит" "$(input_stop "$T")" PASS
grill_with_keys

# SC-MB-284 — короткий признак ключом не считается: отметка с ним отбивается приёмом
printf '# Разбор просьбы\n\nЗапись 515044e4 — восьми знаков не хватает.\n' > "$TASK/grill.md"
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')")"
expect_stop "SC-MB-284 — короткий признак ключом не считается" "$(input_stop "$T")" PASS
grill_with_keys

# SC-MB-285 — отказ в пользу работы: дерево команды отметки не объявило
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')")"
report "SC-MB-285 — дерево без команды отметки проходит" \
    "$( (cd "$REPO" && RT_CARGO_MARK_CMD='' printf '%s' "$(input_stop "$T")" \
        | env RT_CARGO_MARK_CMD= CLAUDE_PROJECT_DIR="$REPO" bash "$GUARD" 2>/dev/null) | head -c 1 | wc -c | tr -d ' ')" 0

# SC-MB-285 — повторный заход по тому же ходу не судится
T="$(transcript "$(say 'закрывай')" "$(ran 'gh pr create --draft --base main')")"
expect_stop "SC-MB-285 — повторный заход проходит" "$(input_stop "$T" true)" PASS

# SC-MB-285 — записи хода нет вовсе
expect_stop "SC-MB-285 — ход без записи проходит" "$(input_stop "$TURNS/нет-такого.jsonl")" PASS

suite_result "гард отметки груза"
