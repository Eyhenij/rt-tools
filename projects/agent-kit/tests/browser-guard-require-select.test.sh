#!/usr/bin/env bash
# Сценарии гарда свежести выбора браузера.
#
# Проверяется канал, которым уходит причина отказа. Сказанное в поток ошибок до исполнителя не
# доходит: он видит «No stderr output» и читает подряд падающие вызовы браузера как поломку
# расширения. Поэтому причина судится там же, где её судят соседние гарды, — полем ответа.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард свежести выбора браузера"

TMP="$(mktemp -d)"
TREE="$(mktemp -d)"
cleanup() { rm -rf "$TMP" "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/.claude/hooks"
cp "$ASSETS/hooks/browser-device-id.sh" "$TREE/.claude/hooks/browser-device-id.sh"
export CLAUDE_PROJECT_DIR="$TREE"
export RT_BROWSER_DEVICE_ID=профиль-дерева
export TMPDIR="$TMP"

MARKS="$TMP/claude-browser-guard"

# Ввод одного вызова расширения: событие, признак захода. Сам выбор гард не судит — у него свой.
call() {
    jq -n --arg s "$1" \
        '{session_id:$s,hook_event_name:"PreToolUse",tool_name:"mcp__claude-in-chrome__navigate",
          tool_input:{url:"http://localhost:4200"}}'
}

# Гард зовётся один раз, а сказанное им разбирается по трём каналам сразу: код возврата, ответ и
# поток ошибок. Порознь их не снять — вызовов было бы три, и каждый двигал бы метку.
run() {
    local sid="$1"
    call "$sid" | bash "$HOOKS/browser-guard-require-select.sh" >"$TMP/out" 2>"$TMP/err"
    printf '%s' "$?" >"$TMP/code"
}

decision() { jq -r '.hookSpecificOutput.permissionDecision // "нет"' <"$TMP/out" 2>/dev/null; }
reason() { jq -r '.hookSpecificOutput.permissionDecisionReason // ""' <"$TMP/out" 2>/dev/null; }

# --- SC-AK-862. Отказ на отсутствующей метке -----------------------------------------------

rm -rf "$MARKS"
run s1
report "SC-AK-862 — отказ без метки приходит полем ответа" "$(decision)" deny
report "SC-AK-862 — отказ уходит нулём, а не кодом ошибки" "$(cat "$TMP/code")" 0
report "SC-AK-862 — поток ошибок пуст" "$([ -s "$TMP/err" ] && echo непусто || echo пусто)" пусто
report "SC-AK-862 — причина называет закреплённый профиль" \
    "$(reason | grep -qF 'профиль-дерева' && echo есть || echo нет)" есть
report "SC-AK-862 — причина называет два законных хода" \
    "$(reason | grep -qF 'Ходов отсюда два' && echo есть || echo нет)" есть

# --- SC-AK-863. Отказ на протухшей метке ---------------------------------------------------

mkdir -p "$MARKS"
: >"$MARKS/s2"
touch -t 202001010000 "$MARKS/s2"
run s2
report "SC-AK-863 — протухшая метка отбита тем же полем" "$(decision)" deny
report "SC-AK-863 — причина называет возраст выбора" \
    "$(reason | grep -qE 'был [0-9]+ с назад' && echo есть || echo нет)" есть
report "SC-AK-863 — протухшая метка снята" "$([ -f "$MARKS/s2" ] && echo есть || echo нет)" нет

# --- свежая метка: непрерывная работа идёт свободно ----------------------------------------

mkdir -p "$MARKS"
: >"$MARKS/s3"
run s3
report "свежая метка пропускает вызов" "$(cat "$TMP/code")" 0
report "пропуск ответа не пишет" "$([ -s "$TMP/out" ] && echo непусто || echo пусто)" пусто
report "пропуск метку обновляет" "$([ -f "$MARKS/s3" ] && echo есть || echo нет)" есть

# --- отказ в пользу работы ------------------------------------------------------------------

rm -rf "$MARKS"
out="$(call s4 | env -u RT_BROWSER_DEVICE_ID bash "$HOOKS/browser-guard-require-select.sh" 2>/dev/null)"
report "без названного профиля гард пропускает" "$([ -n "$out" ] && echo отказ || echo пропуск)" пропуск

suite_result "гард свежести выбора браузера"
