#!/usr/bin/env bash
# Сценарии гарда выбора браузера: чужой профиль запрещается до вызова, а метка свежести ставится
# после него — только при подтверждённом подключении.
#
# Раньше метка ставилась при совпадении признака, то есть на попытке выбора: при отключённом
# профиле вызов возвращал отказ, метка уже стояла, и следующие вызовы уходили в тот браузер,
# который расширение считало активным.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард выбора браузера"

TMP="$(mktemp -d)"
TREE="$(mktemp -d)"
cleanup() { rm -rf "$TMP" "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/.claude/rt-kit" "$TREE/.claude/hooks"
cp "$ASSETS/hooks/browser-device-id.sh" "$TREE/.claude/hooks/" 2>/dev/null
printf 'закреплённый\n' > "$TREE/.claude/rt-kit/browser-device-id"

export TMPDIR="$TMP"
export CLAUDE_PROJECT_DIR="$TREE"

MARKS="$TMP/claude-browser-guard"

# Ввод одного вызова: событие, запрошенный профиль и ответ вызова.
call() {
    jq -n --arg e "$1" --arg d "$2" --arg s "$3" --arg a "$4" \
        '{session_id:$s,hook_event_name:$e,tool_name:"mcp__claude-in-chrome__select_browser",tool_input:{deviceId:$d}}
         + (if $a == "" then {} else {tool_response:$a} end)'
}
run() {
    printf '%s' "$1" | bash "$HOOKS/browser-guard-device-id.sh" >/dev/null 2>&1
    printf '%s' "$?"
}
marked() { [ -f "$MARKS/$1" ] && printf 'да' || printf 'нет'; }

# --- до вызова: проверяется признак профиля -----------------------------------------------------
report "SC-AK-838 — чужой профиль запрещён до вызова" "$(run "$(call PreToolUse чужой s1 '')")" 2
report "SC-AK-838 — закреплённый профиль разрешён" "$(run "$(call PreToolUse закреплённый s1 '')")" 0
report "SC-AK-838 — разрешение до вызова метку не ставит" "$(marked s1)" нет

# --- после вызова: метка по результату ----------------------------------------------------------
rm -rf "$MARKS"
run "$(call PostToolUse закреплённый s2 '{"connected":true,"deviceId":"закреплённый"}')" >/dev/null
report "SC-AK-839 — подтверждённое подключение ставит метку" "$(marked s2)" да

rm -rf "$MARKS"
run "$(call PostToolUse закреплённый s3 '{"error":"browser not connected"}')" >/dev/null
report "SC-AK-839 — отказ выбора метку не ставит" "$(marked s3)" нет

rm -rf "$MARKS"
run "$(call PostToolUse закреплённый s4 'Selected browser not found')" >/dev/null
report "SC-AK-839 — отказ текстом метку не ставит" "$(marked s4)" нет

rm -rf "$MARKS"
run "$(call PostToolUse закреплённый s5 '')" >/dev/null
report "SC-AK-839 — пустой ответ подключением не считается" "$(marked s5)" нет

# --- при ошибке гард пропускает ------------------------------------------------------------------
# Дерево не назвало закреплённый профиль — гард пропускает всё: сравнивать не с чем.
rm -f "$TREE/.claude/rt-kit/browser-device-id"
report "без закреплённого профиля вызов разрешён" "$(run "$(call PreToolUse чужой s6 '')")" 0

suite_result "гард выбора браузера"
