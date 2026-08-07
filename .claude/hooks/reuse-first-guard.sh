#!/usr/bin/env bash
# rt-kit v0.2.0 · hooks/reuse-first-guard.sh · 71bf74974f49 · правится надстройкой, не здесь
# Гард «ничего не пишется с нуля». PreToolUse на правке кода и разметки.
#
# Линтеры знают правила, но не знают ИНВЕНТАРЬ: линтер стилей поймает сырой цвет, линтер кода
# — нетипизированное значение, но ни один из них не знает, что готовое сообщение уже написано,
# и молча пропустит свою область оповещения с текстом, кнопкой и стилями. Гард закрывает ровно
# эту дыру: сверяет то, что пишется, с тем, что в дереве уже есть.
#
# Правило целиком — `reuse-first`.
#
# Что считается переизобретением, знает профиль проекта: .claude/rt-kit/project.sh, функция
# `rt_reinvented_in <файл>` — печатает по строке «образец<таб>чем заменить». Нет профиля или
# нет функции — гард пропускает: инвентарь дерева пакет знать не может.
#
# Осознанный выход: строка с маркером отступления пропускается — для случаев, которых в
# готовом действительно нет. Маркер объясняет, чего именно не хватает; «эти строки были здесь
# раньше» причиной не считается, и оттого проверяется только НОВЫЙ текст.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет разборщика, битый ввод, чужой инструмент — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    *) exit 0 ;;
esac

path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
# Путь от корня проекта приводится к абсолютному один раз, чтобы образцы не двоились.
case "$path" in
    /*) ;;
    ?*) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
esac
case "$path" in
    *.html | *.scss | *.ts) ;;
    *) exit 0 ;;
esac

# Правила этого дерева действуют на файлы этого дерева: без проверки корня гард требовал бы
# верстать готовым и в черновике за пределами репозитория.
case "$path" in
    "${CLAUDE_PROJECT_DIR:-.}"/*) ;;
    *) exit 0 ;;
esac

profile="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"
[ -f "$profile" ] || exit 0
# shellcheck disable=SC1090
. "$profile" 2>/dev/null || exit 0
command -v rt_reinvented_in >/dev/null 2>&1 || exit 0

# Только новый текст: строка, уже лежавшая в файле, этой правкой не заводилась.
added="$(printf '%s' "$input" | jq -r '
    [.tool_input.content? // empty,
     .tool_input.text? // empty,
     .tool_input.new_string? // empty,
     (.tool_input.edits? // [] | map(.new_string) | join("\n"))] | join("\n")' 2>/dev/null)"
[ -z "$added" ] && exit 0

found=""
while IFS="$(printf '\t')" read -r pattern replacement; do
    [ -z "$pattern" ] && continue
    # Строка с маркером отступления снимается до сверки — вместе с ней снимается и повод.
    printf '%s\n' "$added" | grep -v 'native-ok' | grep -qE "$pattern" || continue
    found="${found}  ${pattern} — есть готовое: ${replacement}"$'\n'
done <<EOF
$(rt_reinvented_in "$path")
EOF

[ -z "$found" ] && exit 0

reason="Написано своё там, где готовое уже есть:

${found}
Работа начинается с чтения готового, а не с чистого файла — правило reuse-first. Недостающий вариант заводится у готового, а не клонируется рядом: клон забирает правки на себя и расходится с оригиналом с первой же. Если готового здесь правда не хватает, поставь маркер отступления в той же строке и объясни, чего именно нет."

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Написано своё там, где готовое уже есть."}}\n'

exit 0
