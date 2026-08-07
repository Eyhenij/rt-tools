#!/usr/bin/env bash
# Гард якоря для спек. PreToolUse на правке шаблонов.
#
# Спеки адресуют элементы только через этот атрибут. Классы оформления меняются вместе с
# вёрсткой, а поиск по роли и тексту ломается на переводах — приложение живёт во многих
# локалях. Оба вида селекторов делают сквозные спеки хрупкими, поэтому якорь один и ставится
# по умолчанию, а не дописывается потом: элемент без атрибута попадает в спеку только после
# того, как кто-то заметит его отсутствие.
#
# Правило инвертировано: интерактивным считается ЛЮБОЙ составной тег (компонент) и любой тег с
# привязкой события, кроме помеченных пропуском. Перечислять интерактивные поимённо не выходит
# — компонентов в источнике вида сотня, и список устаревает молча: забытый в нём компонент
# проходит без якоря.
#
# Осознанный выход: атрибут пропуска НА САМОМ ТЕГЕ. Маркер, который ищется во всей правке,
# выключал бы проверку целиком — декоративная ссылка уносила бы с собой кнопку отправки из той
# же правки.
#
# Что здесь не проверяется, знает профиль проекта: {{projectProfile}}, переменная RT_QA_SKIP_RE
# — образец путей, у которых якорь не требуется (сам источник вида, витрина, корневая
# разметка).
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет разборщика, битый ввод, чужой инструмент — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    *) exit 0 ;;
esac

target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
case "$target" in
    *.component.html|*.html) ;;
    *) exit 0 ;;
esac

profile="${CLAUDE_PROJECT_DIR:-.}/{{projectProfile}}"
if [ -f "$profile" ]; then
    # shellcheck disable=SC1090
    . "$profile" 2>/dev/null
    if [ -n "${RT_QA_SKIP_RE:-}" ] && printf '%s' "$target" | grep -qE "$RT_QA_SKIP_RE"; then
        exit 0
    fi
fi

# Проверяется только НОВЫЙ текст: то, что уже лежало в файле, эта правка не заводила, и
# требовать якорь у чужой строки — значит отбивать правку соседней.
added="$(printf '%s' "$input" | jq -r '
    [.tool_input.content? // empty,
     .tool_input.text? // empty,
     .tool_input.new_string? // empty,
     (.tool_input.edits? // [] | map(.new_string) | join("\n"))] | join("\n")' 2>/dev/null)"
[ -z "$added" ] && exit 0

# Открывающие теги без якоря: составной тег (компонент) или тег с привязкой события. Тег с
# атрибутом пропуска или с самим якорем пропускается.
offenders="$(printf '%s' "$added" | perl -0ne '
    my @bad;
    while (/<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|\x27[^\x27]*\x27|[^>"\x27])*)>/gs) {
        my ($tag, $attrs) = ($1, $2);
        next if $attrs =~ /qa-dataid/ || $attrs =~ /qa-skip/;
        my $is_component = $tag =~ /-/;
        my $has_event    = $attrs =~ /\(\s*[a-zA-Z][\w.]*\s*\)\s*=/;
        push @bad, "<$tag" if $is_component || $has_event;
    }
    print join(", ", @bad) if @bad;
' 2>/dev/null)"

[ -z "$offenders" ] && exit 0

reason="Интерактивный элемент без якоря для спек: ${offenders}. Спеки адресуют элементы только им — классы меняются вместе с вёрсткой, а поиск по тексту ломается на переводах. Значение — через дефис, по смыслу элемента; повторяющиеся элементы списка носят один якорь и различаются атрибутами данных. Декоративный элемент помечается атрибутом пропуска на самом теге."

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Интерактивный элемент без якоря для спек."}}\n'

exit 0
