#!/usr/bin/env bash
# rt-kit v0.3.0 · hooks/lint-after-edit.sh · 61d50944413e · правится надстройкой, не здесь
# Линтер по следам правки. PostToolUse.
#
# Два входа. Правка файла — линтуется один изменённый файл. Перенос файла командой — линтуются
# файлы по адресу назначения: перенос меняет либу, а вместе с ней и границы, и импорт,
# законный на прежнем месте, на новом уже запрещён. Ровно так запрещённый импорт уезжает в
# общую либу молча: файлы перекладываются командой, хук на неё не смотрит, и правило границ
# сработало бы — но его никто не запустил.
#
# Полный набор гоняет гард на пуше, но это конец работы: к моменту, когда правило срабатывает,
# поверх нарушения лежит десяток правок, и разбор превращается в археологию. Здесь тот же
# линтер, но по затронутым файлам — секунды, сразу после действия, пока контекст ещё свой.
#
# Замечания возвращаются добавленным контекстом, а не отказом: действие уже применено, и
# незаконченный промежуточный файл имеет право быть красным. Чинить их надо до конца задачи —
# все, включая лежавшие в файле раньше.
#
# Чем линтуется файл, знает профиль проекта: .claude/rt-kit/project.sh, функция `rt_lint_for <файл>`.
# Нет профиля или нет функции — хук молчит.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ и молча: нет линтера, файл вне проекта, зелёный результат — пустой
# вывод.

# Сколько файлов линтуется за один перенос. Переезд либы трогает десятки файлов, и прогон по
# каждому превратил бы хук в минутную паузу; на нарушение границы хватает первых.
MAX_FILES=12

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) mode="edit" ;;
    Bash) mode="move" ;;
    *) exit 0 ;;
esac

# Отсев до всякой работы: хук висит на каждой команде оболочки, а перенос среди них — редкость.
command_text=""
if [ "$mode" = "move" ]; then
    command_text="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
    case "$command_text" in
        *"git mv "*) ;;
        *) exit 0 ;;
    esac
fi

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0

profile="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"
[ -f "$profile" ] || exit 0
# shellcheck disable=SC1090
. "$profile" 2>/dev/null || exit 0
command -v rt_lint_for >/dev/null 2>&1 || exit 0

files=""
if [ "$mode" = "edit" ]; then
    files="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
else
    # Пути назначения всех переносов в команде. Команда бывает составной, поэтому режется по
    # разделителям, и каждый кусок разбирается отдельно. Перевод строки в конце обязателен:
    # чтение без него теряет последний кусок, а команда чаще всего состоит ровно из одного.
    files="$(printf '%s\n' "$command_text" | tr ';&\n' '\n\n\n' | awk '
        /git mv / {
            sub(/.*git mv /, "");
            n = split($0, parts, /[[:space:]]+/);
            for (i = n; i >= 1; i--) {
                if (parts[i] !~ /^-/ && parts[i] != "") { print parts[i]; break }
            }
        }' | head -n "$MAX_FILES")"
fi

[ -z "$files" ] && exit 0

report=""
while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ -f "$file" ] || continue
    lint="$(rt_lint_for "$file" 2>/dev/null)"
    [ -z "$lint" ] && continue
    out="$(eval "$lint" 2>&1)" || report="${report}${out}"$'\n'
done <<EOF
$files
EOF

[ -z "$report" ] && exit 0

jq -n --arg r "Замечания линтера по только что тронутым файлам — чинить до конца задачи, включая те, что лежали в файле раньше:"$'\n'"$report" \
    '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$r}}' 2>/dev/null

exit 0
