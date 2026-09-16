#!/usr/bin/env bash
# Сценарии хука старта сессии: последний запуск CI главной ветки одной строкой в контексте.
#
# Само чтение здесь подменено: хук ищет его в каталоге проверок, названном настройкой дерева, и
# печатает то, что оно отдало. Чтение судится своим набором — checks-main-run.test.sh.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "хук старта: запуск главной ветки"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

# Дерево с репозиторием и настройкой раскладки: каталог проверок хук берёт из неё.
tree_with() {
    local dir
    dir="$(mktemp -d "$TMP/tree.XXXXXX")"
    git -C "$dir" init -q 2>/dev/null
    mkdir -p "$dir/.claude" "$dir/$1"
    printf '{"layout":{"checks":"%s"}}\n' "$1" > "$dir/.claude/rt-kit.json"
    printf '%s' "$dir"
}
# Подмена чтения: печатает строку из окружения и выходит кодом из окружения.
reading_into() {
    printf '%s\n' "console.log(process.env.STUB_LINE ?? ''); process.exit(Number(process.env.STUB_CODE ?? 0));" > "$1"
}
said() {
    CLAUDE_PROJECT_DIR="$1" bash "$HOOKS/main-run-context.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null
}

# --- SC-AK-1105 — строка о запуске главной ветки приходит в контекст на старте --------------------

tree="$(tree_with tools)"
reading_into "$tree/tools/main-run.mjs"
export STUB_LINE='main-run: «main» is green on abcdef01 of 2026-09-10'
export STUB_CODE=0
out="$(said "$tree")"
report "SC-AK-1105 — строка чтения в контексте" "$(printf '%s' "$out" | grep -c '«main» is green on abcdef01')" 1
report "SC-AK-1105 — заголовок называет чтение первым действием" "$(printf '%s' "$out" | grep -c 'read before the first action')" 1
report "SC-AK-1105 — названа команда для руки" "$(printf '%s' "$out" | grep -c 'node tools/main-run.mjs')" 1

# Красный: код чтения не ноль, строка печатается всё равно, и запуск хука не отказан.
export STUB_LINE='main-run: «main» is RED on abcdef01 of 2026-09-10: merges on top go out unchecked — https://probe/runs/7'
export STUB_CODE=1
out="$(said "$tree")"
report "SC-AK-1105 — красная строка печатается при коде 1" "$(printf '%s' "$out" | grep -c 'is RED on abcdef01')" 1
CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/main-run-context.sh" >/dev/null 2>&1
report "SC-AK-1105 — запуск не отказан кодом чтения" "$?" 0

# Каталог проверок назван иначе — чтение найдено по настройке, а не по слову «tools».
tree="$(tree_with scripts/kit)"
reading_into "$tree/scripts/kit/main-run.mjs"
export STUB_LINE='main-run: «main» has no run yet'
export STUB_CODE=0
report "SC-AK-1105 — каталог проверок взят из настройки" "$(said "$tree" | grep -c 'has no run yet')" 1
report "SC-AK-1105 — команда для руки названа по настройке" "$(said "$tree" | grep -c 'node scripts/kit/main-run.mjs')" 1

# Чтение не разложено — хук молчит, а не падает.
tree="$(tree_with tools)"
report "SC-AK-1105 — без чтения хук молчит" "$(said "$tree" | wc -c | tr -d ' ')" 0
CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/main-run-context.sh" >/dev/null 2>&1
report "SC-AK-1105 — без чтения запуск не отказан" "$?" 0

# Чтение ничего не напечатало — оно сломано; хук молчит, чтобы не выдать пустую строку за зелёную.
tree="$(tree_with tools)"
reading_into "$tree/tools/main-run.mjs"
export STUB_LINE=''
report "SC-AK-1105 — пустое чтение: хук молчит" "$(said "$tree" | wc -c | tr -d ' ')" 0

# Не репозиторий — молчание.
plain="$(mktemp -d "$TMP/plain.XXXXXX")"
report "SC-AK-1105 — вне репозитория хук молчит" "$(said "$plain" | wc -c | tr -d ' ')" 0

unset STUB_LINE STUB_CODE
suite_result "хук старта: запуск главной ветки"
