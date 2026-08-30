#!/usr/bin/env bash
# rt-kit v0.21.0 · hooks/override-write-guard.sh · 916180fdcaaa · правится надстройкой, не здесь
# rt-hook: PreToolUse Write|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/deny-tail.sh, hooks/guard-note.sh
# Гард затирания надстройки: запись поверх — не то же самое, что правка.
#
# Надстройка дерева сливается с ресурсом пакета по разделу «## »: раздел, который дерево
# переписало, замещает пакетный, а остальные приходят из пакета. Файл надстройки поэтому
# накапливается — разделы в него дописывают разные ветки и разные заходы, — и выглядит он как
# обычный текст, который можно положить целиком.
#
# Положенный целиком, он уносит с собой все разделы, которых эта правка не касалась. Пропажу не
# видно ничем: раскладка сходится, проверки зелёные, а пакетный раздел молча вернулся на место
# того, что дерево о себе говорило. Заметит это тот, кто через месяц удивится, почему правило
# снова требует чужих имён.
#
# ЧТО СУДИТСЯ. Запись файла целиком поверх существующей непустой надстройки: инструмент записи,
# перенаправление `>`, `tee` без дописывания, копирование поверх. Дописывание в конец — `>>`,
# `tee -a` — и правка по месту проходят: они ничего не уносят.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет `jq`, битый ввод, чужой инструмент, файла нет, файл пуст —
# правка РАЗРЕШАЕТСЯ. Сломанный гард не имеет права заклинить работу.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=override-write-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { printf ''; }

deny() {

    reason="$1 $(rt_deny_tail "$2")"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Гард затирания надстройки."}}\n'
    exit 0
}

# Цели записи поверх, названные командой прямо. Дописывание сюда не входит: `>>` прячется до
# разбора и обратно не разворачивается, `tee` берётся только без довода о дописывании.
rt_overwrite_targets() {
    tr "\"'\`" '   ' \
        | sed -E 's/>>/\
APPEND/g' \
        | sed -E 's/>/\
>/g' \
        | sed -nE '
            s/^>[[:space:]]*([^[:space:]|&;]+).*/\1/p
            s/(^|.*[[:space:]])tee[[:space:]]+([^-[:space:]][^[:space:]|&;]*).*/\2/p
            s/(^|.*[[:space:]])(cp|mv|install)[[:space:]]+([^[:space:]]+[[:space:]]+)+([^[:space:]|&;]+).*/\4/p
        ' \
        | sort -u
}

tool="$(rt_hook_tool)"
candidates=""
case "$tool" in
    Write | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        candidates="$(printf '%s' "$cmd" | rt_overwrite_targets)"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
overrides_dir="${RT_OVERRIDES_DIR:-.claude/rt-kit/overrides}"

while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) relative="${candidate#"$root"/}" ;;
        *)
            relative="$candidate"
            candidate="$root/$candidate"
            ;;
    esac
    case "$relative" in "$overrides_dir"/*) ;; *) continue ;; esac
    [ -f "$candidate" ] || continue

    lines="$(wc -l <"$candidate" 2>/dev/null | tr -d ' ')"
    [ -z "$lines" ] && continue
    [ "$lines" -eq 0 ] && continue

    sections="$(grep -c '^## ' "$candidate" 2>/dev/null || printf '0')"
    resource="${relative#"$overrides_dir"/}"

    deny "BLOCKED by override-write-guard: «${relative}» — надстройка этого дерева, и в ней уже лежит ${lines} строк, разделов «## » — ${sections}. Запись целиком уносит все разделы, которых эта правка не касалась, и на их место молча возвращается пакетный текст ресурса «${resource}»: раскладка после этого сходится, проверки зелёные, а сказанного деревом о себе больше нет. Правь по месту — правкой раздела, а не записью файла." \
        "новый раздел дописывается в конец: надстройка сливается с пакетным ресурсом по заголовку «## », и пакетный текст замещается только теми разделами, которые дерево назвало"
done <<EOF
$candidates
EOF

exit 0
