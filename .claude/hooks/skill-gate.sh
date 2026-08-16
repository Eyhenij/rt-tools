#!/usr/bin/env bash
# rt-kit v0.8.2 · hooks/skill-gate.sh · 12d3a4e72e2c · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
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
# Обе объявляют `skill_for <род вызова> <цель> <текст правки>`, печатающую имена правил через
# пробел; надстройка грузится второй и вправе позвать умолчание обратно — `skill_for_default`.
# Нет ни одной — гейт пропускает всё: пустой гейт лучше гейта, отбивающего наугад.
#
# Род вызова — `edit`, `bash` или `browser`. Браузерная проверка — единственная область, где
# правило нужно не под правку файла, а под инструмент: врут там не файлы, а стенд и координаты.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка и любой неопознанный путь пропускают правку (exit 0).
# Сломанный гейт не имеет права остановить работу совсем.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

# Умолчание карты ищется и рядом с самим хуком: уезжают они вместе.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for map in "$rt_hooks_dir/../rt-kit/defaults/gate-map.sh" "$rt_hooks_dir/../defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/gate-map.sh"; do
    # shellcheck disable=SC1090
    [ -f "$map" ] && . "$map" 2>/dev/null
done
command -v skill_for >/dev/null 2>&1 || exit 0

req=""
target=""
kind=""
case "$tool" in
    # Инструмент среды заводит файл теми же двумя данными, только называет их иначе — без этой
    # ветки файл заводился мимо гейта.
    Edit|Write|MultiEdit|mcp__webstorm__create_new_file)
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
        written="$(printf '%s' "$input" | jq -r '[.tool_input.content, .tool_input.text, .tool_input.new_string, (.tool_input.edits[]?.new_string)] | map(select(. != null)) | join("\n")' 2>/dev/null)"
        req="$(skill_for edit "$target" "$written" 2>/dev/null)"
        # Слои поверх доменного правила лежат отдельным файлом и зовутся в этой же оболочке:
        # доменное правило выбирается один раз по пути, а слоёв полтора десятка, и вместе они не
        # помещаются в карту, которую читают целиком. Нет файла — гейт остаётся одним слоем.
        # shellcheck disable=SC1090
        [ -f "$rt_hooks_dir/skill-gate-layers.sh" ] && . "$rt_hooks_dir/skill-gate-layers.sh" 2>/dev/null
        # Род правки для наблюдения. Одно расширение, без пути и без имени файла: наблюдение
        # уезжает наружу, и всё, кроме рода, там было бы адресом этого дерева.
        case "${target##*/}" in
            *.*) kind="${target##*.}" ;;
            *) kind="none" ;;
        esac
        ;;
    # Терминал среды исполняет ту же командную строку и кладёт её в то же поле: без этой ветки
    # коммит из него не требовал правила, тогда как тот же коммит из оболочки требовал.
    Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool)
        target="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        # Универсальный исполнитель прячет настоящую команду во вложенной строке.
        if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
            inner="$(printf '%s' "$target" | perl -0ne '
                if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                    print defined $1 ? $1 : (defined $2 ? $2 : $3);
                }
            ' 2>/dev/null)"
            [ -n "$inner" ] && target="$inner"
        fi
        req="$(skill_for bash "$target" "" 2>/dev/null)"
        kind="command"
        # Команда оболочки, которая пишет файл, — та же правка, и правило ей нужно то же.
        # Без этого яруса гейт обходится сменой не инструмента, а способа записи: отбитая
        # правка легла командой дважды за один заход. Разбор —
        # `2026-08-15-guard-denied-shell-wrote-anyway.md`.
        for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
            # shellcheck disable=SC1090
            [ -f "$profile" ] && . "$profile" 2>/dev/null
        done
        if command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 \
            && rt_shell_writes "$target"; then
            while IFS= read -r written_path; do
                [ -z "$written_path" ] && continue
                case "$written_path" in
                    /*) ;;
                    *) written_path="${CLAUDE_PROJECT_DIR:-.}/$written_path" ;;
                esac
                case "$written_path" in
                    "${CLAUDE_PROJECT_DIR:-.}"/*) ;;
                    *) continue ;;
                esac
                more="$(skill_for edit "$written_path" "" 2>/dev/null)"
                [ -n "$more" ] && req="$req $more"
            done <<EOF
$(rt_shell_paths "$target")
EOF
        fi
        ;;
    mcp__claude-in-chrome__*)
        req="$(skill_for browser "$tool" "" 2>/dev/null)"
        kind="browser"
        ;;
    *) exit 0 ;;
esac

[ -z "$req" ] && exit 0

# Карта вправе назвать несколько правил: доменное правило и то, что действует вторым слоем.
# Требуется первое незагруженное, а не все сразу: отказ, перечисляющий три правила, читается
# как «загрузи три», и загружают их подряд, теряя ту самую однократность.
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
root="${CLAUDE_PROJECT_DIR:-.}"
rules_dir="${RT_RULES_DIR:-.claude/skills}"
want=""
for name in $req; do
    # Правила, которого в дереве нет, гейт не требует. Карта умолчания называет и то, от чего
    # дерево отказалось списком: правило предметной области, чужой род файлов. Отказ «загрузи
    # правило X» на такое имя — отказ без действия: загружать нечего, и работа встаёт совсем.
    [ -f "$root/$rules_dir/${name}/SKILL.md" ] || continue
    # Принимается и голое имя правила, и имя с областью каталога («<каталог>:<имя>»).
    if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$name" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
        continue
    fi
    want="$name"
    break
done
[ -z "$want" ] && exit 0
req="$want"

# Отбитие — наблюдение: правило, которое приходится требовать чаще прочего, и род правки, на
# котором это происходит, говорят о слое правил больше, чем список загруженного.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 && rt_note gate-deny "res=$req" "kind=$kind" "sid=$sid"

# Запасной ход называется прямо в отказе: правило, заведённое в этой же ветке, реестру правил
# неизвестно — он собирается на запуске сессии, а гейт читает диск. Без этой строки следующий
# заход ищет обход перебором и обычно находит не тот.
fallback="Если инструмент такого имени не знает, правило завели после начала сессии — прочитай ${rules_dir}/${req}/SKILL.md и спутник рядом с ним."
reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill и повтори действие. ${fallback} Для этой области это происходит один раз за сессию."

# Правило называет свой закон одним словом, а слоёв законов два: общий лежит в корне, закон
# приложения — в каталоге под ним. Путь ищется, а не собирается из имени, иначе отказ ведёт в
# несуществующий файл ровно у тех правил, чей закон предметен.
laws_dir="${RT_LAWS_DIR:-docs/constitution}"
law="$(sed -n 's/^law:[[:space:]]*//p' "$root/$rules_dir/${req}/SKILL.md" 2>/dev/null | head -1)"
if [ -n "$law" ]; then
    law_path="$laws_dir/${law}.md"
    [ -f "$root/$law_path" ] || law_path="$laws_dir/application/${law}.md"
    [ -f "$root/$law_path" ] \
        && reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill — оно применяет закон ${law_path} к этому дереву — и повтори действие. ${fallback} Для этой области это происходит один раз за сессию."
fi

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Загрузи правило %s и повтори."}}\n' "$req"

exit 0
