#!/usr/bin/env bash
# Сценарии гарда затирания надстройки: надстройка правится по разделу, а не кладётся целиком.
#
# Дерево фикстуры собирается своё: гард судит непустоту надстройки и считает её разделы, а
# настоящее дерево держит их ровно столько, сколько нажило.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард затирания надстройки"

TREE="$(mktemp -d)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/.claude/rt-kit/overrides/rules" "$TREE/docs"

# Нажитая надстройка: три раздела, дописанных разными ветками.
printf '%s\n' '## Как это называется здесь' 'Своё имя.' '' \
    '## Ловушки' 'Своя ловушка.' '' \
    '## Чего из закона здесь нет' 'Своё исключение.' > "$TREE/.claude/rt-kit/overrides/rules/probe.md"
# Пустая надстройка: затирать в ней нечего.
: > "$TREE/.claude/rt-kit/overrides/rules/empty.md"
# Свой файл дерева: надстройкой не является.
printf '%s\n' '# Замысел' > "$TREE/docs/plan.md"

write_in() {
    jq -n --arg f "$TREE/$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Write",tool_input:{file_path:$f},cwd:$d}'
}
edit_in() {
    jq -n --arg f "$TREE/$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}'
}
cmd_in() {
    jq -n --arg c "$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
run() {
    printf '%s' "$1" | CLAUDE_PROJECT_DIR="$TREE" "$HOOKS/override-write-guard.sh" 2>/dev/null
}
decision() {
    local out
    out="$(run "$1")"
    [ -z "$out" ] && { printf 'PASS'; return 0; }
    printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null
}
says() {
    run "$1" | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null | grep -cE "$2"
}

report "SC-AK-539 — запись поверх нажитой надстройки отбивается" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/probe.md)")" deny
report "SC-AK-539 — отказ называет размер того, что затрут" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" '8 lines')" 1
report "SC-AK-539 — и число разделов" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" 'sections «## » — 3')" 1
report "SC-AK-539 — и говорит про слияние по разделу" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" 'merges with the package resource by the heading')" 1

report "SC-AK-540 — правка надстройки по месту проходит" \
    "$(decision "$(edit_in .claude/rt-kit/overrides/rules/probe.md)")" PASS
report "SC-AK-540 — пустая надстройка кладётся целиком" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/empty.md)")" PASS
report "SC-AK-540 — надстройки ещё нет — запись проходит" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/new.md)")" PASS
report "SC-AK-540 — свой файл дерева гарду безразличен" \
    "$(decision "$(write_in docs/plan.md)")" PASS

# Та же запись командой оболочки: гард судит затирание, а не инструмент.
report "SC-AK-541 — перенаправление поверх надстройки отбивается" \
    "$(decision "$(cmd_in 'printf x > .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — копирование поверх надстройки отбивается" \
    "$(decision "$(cmd_in 'cp new.md .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — отдача в надстройку через tee отбивается" \
    "$(decision "$(cmd_in 'printf x | tee .claude/rt-kit/overrides/rules/probe.md')")" deny

# Дописывание ничего не уносит: раздел встаёт в конец, прежние остаются на месте.
report "SC-AK-542 — дописывание в конец проходит" \
    "$(decision "$(cmd_in 'printf x >> .claude/rt-kit/overrides/rules/probe.md')")" PASS
report "SC-AK-542 — дописывание через tee -a проходит" \
    "$(decision "$(cmd_in 'printf x | tee -a .claude/rt-kit/overrides/rules/probe.md')")" PASS
report "SC-AK-542 — чтение надстройки проходит" \
    "$(decision "$(cmd_in 'cat .claude/rt-kit/overrides/rules/probe.md')")" PASS

# Отказ в пользу работы: сломанный гард не заклинивает работу.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/override-write-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "правка по месту гарду безразлична" "$(jq -n --arg d "$TREE" '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:"x"},cwd:$d}')"

suite_result "гард затирания надстройки"
