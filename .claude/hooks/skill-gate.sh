#!/usr/bin/env bash
# rt-kit v0.3.0 · hooks/skill-gate.sh · ef810fa44f7f · правится надстройкой, не здесь
# Гейт правил: не даёт править файл, пока не загружено правило, под которое он подпадает.
#
# Закон и правило, которых никто не открывает, не действуют. Напоминание в подсказке помогает
# ровно до первой спешки, поэтому требование держит хук: правка отбивается ОДИН раз на сессию
# для каждой области, а после загрузки правила та же область проходит молча — повторов нет, и
# стоит это почти ничего.
#
# Карта «файл — правило» живёт не здесь, а в двух файлах рядом, и это не дублирование.
# Умолчание — `.claude/rt-kit/defaults/gate-map.sh` — везёт пакет: деревья этой мастерской
# устроены одинаково, и переписывать одну и ту же карту в каждом заново значило бы заводить
# столько её редакций, сколько репозиториев. Надстройку — `.claude/rt-kit/gate-map.sh` — пишет
# проект, и она необязательна: витрина, свой род файлов, чужая раскладка есть не у всех.
# Обе объявляют `skill_for <род вызова> <цель>`, печатающую имя правила; надстройка грузится
# второй и вправе позвать умолчание обратно — `skill_for_default`.
# Нет ни одной — гейт пропускает всё: пустой гейт лучше гейта, отбивающего наугад.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка и любой неопознанный путь пропускают правку (exit 0).
# Сломанный гейт не имеет права остановить работу совсем.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

for map in "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/gate-map.sh"; do
    # shellcheck disable=SC1090
    [ -f "$map" ] && . "$map" 2>/dev/null
done
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
        # Текст правки идёт карте вторым доводом: есть правила, которые вступают не от того,
        # ЧТО за файл правится, а от того, ЧТО в него пишут, — обращение к среде исполнения
        # приходит в обычный сервис, а число-настройка в обычный класс.
        written="$(printf '%s' "$input" | jq -r '[.tool_input.new_string, .tool_input.content, (.tool_input.edits // [] | .[].new_string)] | map(select(. != null)) | join("\n")' 2>/dev/null)"
        req="$(skill_for edit "$target" "$written" 2>/dev/null)"
        ;;
    Bash)
        target="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        req="$(skill_for bash "$target" "" 2>/dev/null)"
        ;;
    *) exit 0 ;;
esac

[ -z "$req" ] && exit 0

# Карта вправе назвать несколько правил: доменное правило и то, что действует вторым слоем.
# Требуется первое незагруженное, а не все сразу: отказ, перечисляющий три правила, читается
# как «загрузи три», и загружают их подряд, теряя ту самую однократность.
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
want=""
for name in $req; do
    # Принимается и голое имя правила, и имя с областью каталога («<каталог>:<имя>»).
    if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$name" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
        continue
    fi
    want="$name"
    break
done
[ -z "$want" ] && exit 0
req="$want"

reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill и повтори действие. Для этой области это происходит один раз за сессию."
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Загрузи правило %s и повтори."}}\n' "$req"

exit 0
