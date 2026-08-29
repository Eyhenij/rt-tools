#!/usr/bin/env bash
# rt-kit v0.20.0 · hooks/rule-source-guard.sh · bda08913cc04 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/profile-check.sh, hooks/deny-tail.sh, hooks/write-targets.sh
# Гард места правки: слой правил чинится там, где сломано, а не там, где виден.
#
# Слой правил правит тот же исполнитель, которым слой правил управляет, и разницы между
# «исполняю правило» и «правлю правило» в дереве не видно ничем: разложенная копия лежит рядом
# с обычными файлами и правится так же. Правка доходит до диска и не доходит до места, где
# промах чинится: в дереве она видна, в пакете её нет, а через месяц раскладка отказывает по
# правленому файлу целиком — и цену платит тот, кто в этот день правил соседний ресурс.
#
# Знал об этом только `sync --check`, и говорил он на следующей раскладке, то есть в чужой
# ветке и чужим ходом. Гард говорит в минуту правки и называет адрес: источник пакета, если
# дерево его держит, иначе — надстройку.
#
# ЧТО СУДИТСЯ. Файл, который правят, несёт шапку раскладки: `rt-kit v<версия> · <ресурс> ·
# <дайджест>`. Ресурс из неё и есть адрес: `<источники>/<ресурс>` в дереве пакета,
# `.claude/rt-kit/overrides/<ресурс>` у потребителя.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет `jq`, битый ввод, чужой инструмент, файла нет, шапки в нём нет,
# не git-репозиторий — правка РАЗРЕШАЕТСЯ. Сломанный гард не имеет права заклинить работу.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { printf ''; }

deny() {
    # shellcheck disable=SC1090
    [ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
    command -v rt_note >/dev/null 2>&1 && rt_note guard-deny res=rule-source-guard

    reason="$1 $(rt_deny_tail "$2")"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Гард места правки."}}\n'
    exit 0
}

# Цели записи разбирает общий помощник: тот же признак нужен гарду экзамена, и разойдясь, две
# копии пропустили бы разные формы записи. Файла нет — остаётся молчаливое умолчание, чтобы гард
# не сломался на неполной раскладке.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

tool="$(rt_hook_tool)"
candidates=""
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        # Здесь берётся не общий признак записи, а цель, названная в команде прямо:
        # перенаправление, `tee`, правка на месте, копирование поверх. Общий признак широк
        # намеренно — в нём и имя интерпретатора, — и запуск разложенной проверки читался бы
        # как правка её самой. Отбитие на чтении стоит дороже пропуска: гард, мешающий читать,
        # выключают в первый же день.
        #
        # Снятие копии сюда не входит намеренно: снятый файл раскладка кладёт заново, и так
        # чинят копию, которую переписал форматтер.
        candidates="$(printf '%s' "$cmd" | rt_write_targets)"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"

# Каталог источников пакета в этом дереве. Есть он только у дерева, которое пакет и везёт; у
# потребителя источника нет вовсе, и адрес правки у него один — надстройка.
sources=""
if rt_needs rt_kit_sources_dir rule-source-guard; then
    sources="$(rt_kit_sources_dir 2>/dev/null)"
fi

while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) ;;
        *) candidate="$root/$candidate" ;;
    esac
    [ -f "$candidate" ] || continue

    # Шапка стоит в начале файла, но не первой строкой: у сценария её отодвигает `#!`, у
    # правила — заголовок с именем и родом ресурса. Десяти строк хватает обоим, а читать файл
    # целиком нельзя: гард стоит на каждой правке.
    resource="$(head -12 "$candidate" 2>/dev/null | sed -nE 's/.*rt-kit v[^ ]+ · ([^ ]+) · [0-9a-f]+.*/\1/p' | head -1)"
    [ -z "$resource" ] && continue

    if [ -n "$sources" ] && [ -f "$root/$sources/$resource" ]; then
        deny "BLOCKED by rule-source-guard: «${candidate#"$root"/}» разложен пакетом, и правка на его месте теряется на следующей раскладке — а до тех пор раскладка отказывает по этому файлу целиком, и цену платит тот, кто в этот день правит соседний ресурс. Ресурс — «${resource}». Правь источник: ${sources}/${resource} — потом собери пакет и разложи." \
            "правка, верная только этому дереву, идёт в надстройку .claude/rt-kit/overrides/${resource} — она сливается по разделу «## » и раскладку переживает"
    fi

    deny "BLOCKED by rule-source-guard: «${candidate#"$root"/}» разложен пакетом @rt-tools/agent-kit, и правка на его месте теряется на следующей раскладке. Ресурс — «${resource}». Правь надстройку: .claude/rt-kit/overrides/${resource} — она сливается по разделу «## » и раскладку переживает." \
        "то, что верно любому дереву, правится в самом пакете и приезжает сюда новой редакцией"
done <<EOF
$candidates
EOF

exit 0
