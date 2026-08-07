#!/usr/bin/env bash
# Гард пары «правка и её документ». PreToolUse.
#
# Расхождение кода с текстом беззвучно. Ни линтер, ни сборка, ни тесты не читают правила,
# спеки и README, поэтому текст, описывающий прежнее устройство, живёт дальше и выглядит
# действующей справкой — тем убедительнее, чем он старше. Ловится это только чтением, и ловит
# обычно владелец, а не проверка.
#
# Гард требует ровно тех пар, где связь механическая и спорить не о чем. Какие это пары, знает
# профиль проекта: {{projectProfile}}, функция `rt_docs_pair_for <файл>` — печатает образец
# пути, который обязан ехать тем же коммитом, или молчит.
#
# Отдельно — законы. Совпал ли код с законом, машина не знает, поэтому правка самого закона не
# отклоняется, а выносится вопросом владельцу: закон описывает договорённость о продукте, и
# менять её молча гард не даёт.
#
# Обход — строка `Docs-skip: <причина>` в теле коммита. Причина остаётся в истории и видна при
# разборе ветки; пустая не принимается.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, нет разборщика, битый ввод, пустой список файлов —
# пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

decide() {
    jq -n --arg d "$1" --arg r "$2" \
        '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Документ едет тем же коммитом."}}\n'
    exit 0
}

# ── Правка закона спрашивает владельца ────────────────────────────────────────
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        case "$target" in
            */{{lawsDir}}/*.md | {{lawsDir}}/*.md)
                decide ask "Правка закона: \`${target##*/}\`. Закон описывает договорённость о продукте, а не устройство кода, — назови владельцу, что и почему меняешь, и дождись ответа. Если правка уже согласована, подтверди вызов." ;;
        esac
        exit 0 ;;
esac

# ── Коммит: пара обязана ехать тем же коммитом ───────────────────────────────
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
case "$cmd" in
    *git\ commit*) ;;
    *) exit 0 ;;
esac

# Обход с причиной. Пустая причина не принимается: «Docs-skip:» без слов означает только то,
# что строку дописали, чтобы пройти гард.
if printf '%s' "$cmd" | grep -qE 'Docs-skip:[[:space:]]*[^[:space:]]'; then
    exit 0
fi

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

profile="${CLAUDE_PROJECT_DIR:-.}/{{projectProfile}}"
[ -f "$profile" ] || exit 0
# shellcheck disable=SC1090
. "$profile" 2>/dev/null || exit 0
command -v rt_docs_pair_for >/dev/null 2>&1 || exit 0

staged="$(git diff --cached --name-only 2>/dev/null)"
[ -z "$staged" ] && exit 0

missing=""
while IFS= read -r file; do
    [ -z "$file" ] && continue
    want="$(rt_docs_pair_for "$file" 2>/dev/null)"
    [ -z "$want" ] && continue
    # Пара считается приехавшей, если хоть один подготовленный файл подходит под образец.
    printf '%s\n' "$staged" | grep -qE "$want" && continue
    missing="${missing}  ${file} — ждёт документ: ${want}"$'\n'
done <<EOF
$staged
EOF

[ -z "$missing" ] && exit 0

decide deny "Документ едет в том же коммите, что и правка, которую он описывает. Не хватает пар:

${missing}
Если документа здесь правда не нужно — строка «Docs-skip: <причина>» в теле коммита; пустая причина не принимается."
