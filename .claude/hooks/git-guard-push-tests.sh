#!/usr/bin/env bash
# rt-kit v0.3.0 · hooks/git-guard-push-tests.sh · 22fc85f0a43b · правится надстройкой, не здесь
# Гард проверок перед пушем. PreToolUse на вызове пуша.
#
# Пуш — это вход в конвейер: слияние в главную ветку запускает выкатку, и всё, что не
# проверено локально, проверяется уже на проде. Сюда дважды подряд уезжают правки, зелёные в
# выборочном прогоне и красные в конвейере: один раз прогонялись только сквозные спеки, другой
# — только затронутый проект.
#
# Гард не верит на слово: он сам гоняет то, что перечислил профиль проекта, и пускает пуш
# только при нулевом коде возврата. Если прогонщик кэширует результат, набор на неизменившемся
# дереве занимает секунды, а после правки гоняется заново.
#
# Что гонять, знает профиль: .claude/rt-kit/project.sh, функция `rt_push_checks` — по команде на
# строку. Нет профиля или нет функции — гард пропускает: список проверок пакет выдумать не
# может.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, битый ввод, нет профиля — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
case "$cmd" in
    *git\ push*) ;;
    *) exit 0 ;;
esac

# Пробный пуш ничего не отправляет: гонять ради него весь набор незачем.
case "$cmd" in
    *--dry-run*) exit 0 ;;
esac

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Объявленная в надстройке функция замещает умолчание целиком и вправе позвать его обратно
# суффиксом `_default`. Нет ни того ни другого — хук пропускает: пустой гард лучше гарда,
# отбивающего наугад.
for profile in "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
command -v rt_push_checks >/dev/null 2>&1 || exit 0

failed=""
output=""
while IFS= read -r check; do
    [ -z "$check" ] && continue
    out="$(eval "$check" 2>&1)" && continue
    failed="$check"
    output="$out"
    break
done <<EOF
$(rt_push_checks)
EOF

[ -z "$failed" ] && exit 0

# Хвост вывода, а не весь: у прогонщика он длинный, а нужна причина отказа.
tail_out="$(printf '%s' "$output" | tail -n 40)"
reason="Отбито перед пушем: «${failed}» упала. Пуш — вход в конвейер, и красное отсюда проверяется уже на проде. Почини и повтори.

${tail_out}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Проверки перед пушем не прошли."}}\n'

exit 0
