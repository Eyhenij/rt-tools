#!/usr/bin/env bash
# Линтер по следам правки. PostToolUse.
#
# Два входа. Правка файла — линтуется один изменённый файл. Перенос файла командой — линтуются
# файлы по адресу назначения: перенос меняет либу, а вместе с ней и границы, и импорт, законный
# на прежнем месте, на новом уже запрещён. Ровно так запрещённый импорт уезжает в общую либу
# молча: файлы перекладываются командой, хук на неё не смотрит, и правило границ сработало бы —
# но его никто не запустил.
#
# Полный набор гоняет гард на пуше, но это конец работы: к моменту, когда правило срабатывает,
# поверх нарушения лежит десяток правок, и разбор превращается в археологию. Здесь тот же
# линтер, но по затронутым файлам — секунды, сразу после действия, пока контекст ещё свой.
#
# Замечания возвращаются добавленным контекстом, а не отказом: действие уже применено, и
# незаконченный промежуточный файл имеет право быть красным. Чинить их надо до конца задачи —
# все, включая лежавшие в файле раньше.
#
# Что здесь чем зовётся, знает профиль дерева:
#   rt_lint_for      — чем линтуется этот файл;
#   rt_is_app_code   — где лежит код, к которому линтеры вообще относятся;
#   RT_LINT_SKIP_RE  — что из него исключено;
#   rt_push_checks   — что гоняет гейт пуша. По нему же решается, догонит ли замечание позже:
#                      линтер, которого в гейте нет, ловит только этот хук.
# Нет профиля или нет функции — хук молчит.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ и молча: нет линтера, файл вне дерева, зелёный результат — пустой вывод.

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
[ -f package.json ] || exit 0

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
command -v rt_lint_for >/dev/null 2>&1 || exit 0

# --- какие файлы проверяем -------------------------------------------------------------

# Пути назначения всех переносов в команде. Команда бывает составной, поэтому режется по
# разделителям, и каждый кусок разбирается отдельно.
collect_moved() {
    # Перевод строки в конце обязателен: чтение без него теряет последний кусок, а команда
    # чаще всего состоит ровно из одного.
    printf '%s\n' "$1" | tr ';&\n' '\n\n\n' | while IFS= read -r segment; do
        case "$segment" in
            *"git mv "*) ;;
            *) continue ;;
        esac

        # shellcheck disable=SC2086 # разбиение по пробелам здесь и нужно
        set -- ${segment#*git mv }
        args=''
        for arg in "$@"; do
            case "$arg" in
                -*) continue ;;
            esac
            args="${args}${args:+ }${arg}"
        done

        # shellcheck disable=SC2086
        set -- $args
        [ "$#" -lt 2 ] && continue

        dest=''
        for arg in "$@"; do dest="$arg"; done

        # Назначение — каталог: имя файла остаётся прежним, меняется только путь.
        if [ -d "$dest" ]; then
            for arg in "$@"; do
                [ "$arg" = "$dest" ] && continue
                printf '%s/%s\n' "${dest%/}" "${arg##*/}"
            done
        else
            printf '%s\n' "$dest"
        fi
    done
}

# Каталог разворачивается в лежащие в нём файлы: перенос умеет двигать целые слои.
expand() {
    if [ -d "$1" ]; then
        find "$1" -type f \( -name '*.ts' -o -name '*.html' -o -name '*.scss' \) 2>/dev/null
    elif [ -f "$1" ]; then
        printf '%s\n' "$1"
    fi
}

if [ "$mode" = "edit" ]; then
    path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
    [ -z "$path" ] && exit 0
    # Путь от корня дерева приводится к абсолютному один раз, чтобы образцы не двоились.
    case "$path" in
        /*) ;;
        *) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
    esac
    candidates="$(expand "$path")"
else
    candidates="$(collect_moved "$command_text" | while IFS= read -r moved; do expand "$moved"; done)"
fi

[ -z "$candidates" ] && exit 0

# --- отсев того, что линтерами дерева не покрыто ----------------------------------------

lintable() {
    if command -v rt_is_app_code >/dev/null 2>&1; then
        rt_is_app_code "$1" || return 1
    fi
    if [ -n "${RT_LINT_SKIP_RE:-}" ] && printf '%s' "$1" | grep -qE "$RT_LINT_SKIP_RE"; then
        return 1
    fi

    return 0
}

# Имя линтера в команде — первое слово, которое не запускатель. Оно идёт в заголовок и по нему
# же ищется гейт пуша.
linter_name() {
    printf '%s' "$1" | awk '{
        for (i = 1; i <= NF; i++) {
            if ($i ~ /^(npx|pnpm|yarn|bun|npm|exec|run|dlx|--no-install)$/) { continue }
            print $i; exit
        }
    }'
}

# --- прогон -----------------------------------------------------------------------------

push_checks="$(command -v rt_push_checks >/dev/null 2>&1 && rt_push_checks 2>/dev/null)"

report=""
linters=""
covered=1
checked=0

while IFS= read -r file; do
    [ -z "$file" ] && continue
    lintable "$file" || continue
    [ "$checked" -ge "$MAX_FILES" ] && break

    lint="$(rt_lint_for "$file" 2>/dev/null)"
    [ -z "$lint" ] && continue
    checked=$((checked + 1))

    out="$(eval "$lint" 2>&1)" && continue

    # Линтера нет или он упал сам по себе — это не замечание к файлу, молчим.
    printf '%s' "$out" | grep -qiE 'command not found|could not determine executable|Cannot find module' && continue

    linter="$(linter_name "$lint")"
    case " $linters " in
        *" $linter "*) ;;
        *) linters="${linters}${linters:+ }${linter}" ;;
    esac
    printf '%s' "$push_checks" | grep -qF "$linter" || covered=0

    report="${report}
${file}:
$(printf '%s' "$out" | head -c 2500 | tr -d '\000')
"
done <<EOF
$candidates
EOF

[ -z "$report" ] && exit 0

# Длинный вывод режем: важен факт и первые нарушения, остальное видно при полном прогоне.
report="$(printf '%s' "$report" | head -c 6000)"

if [ "$covered" -eq 1 ]; then
    tail_line="Пуш всё равно не пройдёт, пока набор красный."
else
    tail_line="Почини их сейчас: этот линтер в гейт пуша не входит, и отложенное замечание уедет в главную ветку молча."
fi

if [ "$mode" = "move" ]; then
    head_line="ЛИНТЕР (${linters}) НАШЁЛ ЗАМЕЧАНИЯ ПОСЛЕ ПЕРЕНОСА. Перенос меняет либу, а вместе с ней границы: импорт, законный на прежнем месте, на новом может быть запрещён."
else
    head_line="ЛИНТЕР (${linters}) НАШЁЛ ЗАМЕЧАНИЯ:"
fi

ctx="${head_line}
${report}

Почини их до конца задачи — правятся ВСЕ замечания в затронутом файле, и новые, и лежавшие раньше: накопленные нарушения глушат сигнал о свежих. ${tail_line}"

jq -n --arg c "$ctx" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$c}}' 2>/dev/null

exit 0
