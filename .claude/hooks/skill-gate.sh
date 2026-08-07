#!/usr/bin/env bash
# rt-kit v0.2.0 · hooks/skill-gate.sh · 87a5feb17a85 · правится надстройкой, не здесь
# Гейт правил: не даёт править файл, пока не загружено правило, под которое он подпадает.
#
# Закон и правило, которых никто не открывает, не действуют. Напоминание в подсказке помогает
# ровно до первой спешки, поэтому требование держит хук: правка отбивается ОДИН раз на сессию
# для каждой области, а после загрузки правила та же область проходит молча — повторов нет, и
# стоит это почти ничего.
#
# Карта «файл — правило» живёт не здесь: она знает имена этого дерева, а хук их знать не может.
# Её пишет проект в .claude/rt-kit/gate-map.sh — функцией `skill_for <род вызова> <цель>`, печатающей имя
# правила. Нет карты — гейт пропускает всё: пустой гейт лучше гейта, отбивающего наугад.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка и любой неопознанный путь пропускают правку (exit 0).
# Сломанный гейт не имеет права остановить работу совсем.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

map="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/gate-map.sh"
[ -f "$map" ] || exit 0
# shellcheck disable=SC1090
. "$map" 2>/dev/null || exit 0
command -v skill_for >/dev/null 2>&1 || exit 0

req=""
target=""
case "$tool" in
    Edit|Write|MultiEdit)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        # Путь от корня проекта приводится к абсолютному один раз: иначе карту пришлось бы
        # писать в двух формах, и вторая расходилась бы с первой молча.
        case "$target" in
            /*) ;;
            ?*) target="${CLAUDE_PROJECT_DIR:-.}/$target" ;;
        esac
        # Правила этого дерева действуют на файлы этого дерева. Без проверки корня гейт ловил
        # бы и соседний репозиторий на той же машине.
        case "$target" in
            "${CLAUDE_PROJECT_DIR:-.}"/*) ;;
            *) exit 0 ;;
        esac
        req="$(skill_for edit "$target" 2>/dev/null)"
        ;;
    Bash)
        target="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        req="$(skill_for bash "$target" 2>/dev/null)"
        ;;
    *) exit 0 ;;
esac

[ -z "$req" ] && exit 0

# Принимается и голое имя правила, и имя с областью каталога («<каталог>:<имя>»).
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$req" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
    exit 0
fi

reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill и повтори действие. Для этой области это происходит один раз за сессию."
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Загрузи правило %s и повтори."}}\n' "$req"

exit 0
