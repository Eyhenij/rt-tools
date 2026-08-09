#!/usr/bin/env bash
# Гард пары «правка и её документ». PreToolUse.
#
# Расхождение кода с текстом беззвучно. Ни линтер, ни сборка, ни тесты не читают правила,
# спеки и README, поэтому текст, описывающий прежнее устройство, живёт дальше и выглядит
# действующей справкой — тем убедительнее, чем он старше. Ловится это только чтением, и ловит
# обычно владелец, а не проверка.
#
# Гард требует ровно тех пар, где связь механическая и спорить не о чем:
#
#   правило и его спутник      — когда правится раздел с утверждениями, а не «Ловушки»;
#   заведение и удаление либы  — README этой либы;
#   переезд файла между либами — README обеих;
#   остальные пары             — их называет профиль дерева, функция `rt_docs_pair_for <файл>`.
#
# Отдельно — законы. Совпал ли код с законом, машина не знает: правка файла, на который закон
# ссылается якорем, поэтому не отклоняется, а выносится вопросом владельцу. Тем же вопросом
# встречается и правка самого закона: закон описывает договорённость о продукте, и менять её
# молча гард не даёт.
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

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Объявленная в надстройке функция замещает умолчание целиком и вправе позвать его обратно
# суффиксом `_default`.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

laws_dir="${RT_LAWS_DIR:-docs/constitution}"
lib_marker="${RT_LIB_MARKER:-project.json}"

# ── Правка закона спрашивает владельца ────────────────────────────────────────
#
# Спутник рядом с законом — привязка статей к коду, она устаревает при каждом переименовании и
# правится свободно. Спрашивается только сам текст закона.
case "$tool" in
    Edit | Write | MultiEdit | NotebookEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // .tool_input.path // .tool_input.pathInProject // empty' 2>/dev/null)"
        case "$target" in
            */"$laws_dir"/*.implementation.md | "$laws_dir"/*.implementation.md) exit 0 ;;
            */"$laws_dir"/*.md | "$laws_dir"/*.md)
                decide ask "Правка закона: \`${target##*/}\`. Закон описывает договорённость о продукте, а не устройство кода, — назови владельцу, что и почему меняешь, и дождись ответа. Если правка уже согласована, подтверди вызов."
                ;;
        esac
        exit 0
        ;;
esac

# ── Коммит ────────────────────────────────────────────────────────────────────

# Терминал среды и универсальный исполнитель кладут команду в то же поле.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# Универсальный исполнитель передаёт настоящую команду вложенной строкой. Разбирать надо её,
# иначе имя команды стоит сразу за кавычкой и ни одно правило до него не дотягивается.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

case "$cmd" in
    *git\ commit*) ;;
    *) exit 0 ;;
esac

# Причина обхода остаётся в истории, поэтому обход законен. Пустая строка обходом не считается:
# «Docs-skip:» без причины — это тот же молчаливый пропуск, только с двоеточием.
if printf '%s' "$cmd" | grep -qiE 'Docs-skip:[[:space:]]*[^[:space:]"'"'"']{3,}'; then
    exit 0
fi

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# `-a` берёт все отслеживаемые правки, `--amend` — ещё и файлы переписываемого коммита.
# Считать всегда по индексу значило бы проверять не тот набор, который уедет в историю.
changes=''
source_mode='index'
case "$cmd" in
    *' -a'* | *--all*)
        changes="$(git diff HEAD --name-status -M 2>/dev/null)"
        source_mode='worktree'
        ;;
    *) changes="$(git diff --cached --name-status -M 2>/dev/null)" ;;
esac
case "$cmd" in
    *--amend*) changes="$(printf '%s\n%s' "$changes" "$(git show --name-status --format= HEAD 2>/dev/null)")" ;;
esac

changes="$(printf '%s\n' "$changes" | grep -v '^[[:space:]]*$')"
[ -z "$changes" ] && exit 0

# Пути коммита без статусов. Переименование подаётся тремя полями — берём обе стороны.
paths="$(printf '%s\n' "$changes" | awk -F'\t' '{ for (i = 2; i <= NF; i++) if ($i != "") print $i }' | sort -u)"

has_path() { printf '%s\n' "$paths" | grep -qxF "$1"; }

# Содержимое таким, каким оно уедет в коммит. Источник тот же, по которому собран список
# правок: `-a` заберёт рабочее дерево, обычный коммит — индекс. Читать индекс всегда нельзя —
# при `-a` там лежит прежняя редакция, и гард держал бы коммит, который расхождение и чинит;
# читать рабочее дерево всегда тоже нельзя — неподготовленная правка в коммит не попадёт.
content_of() {
    if [ "$source_mode" = 'worktree' ]; then
        cat "$1" 2>/dev/null
    else
        git show ":$1" 2>/dev/null || cat "$1" 2>/dev/null
    fi
}

problems=''
add() { problems="${problems}
  • $1"; }

# ── 1. Правило и его спутник ──────────────────────────────────────────────────
#
# Утверждения правила ключуются своим текстом, и переформулировка без правки спутника рвёт
# связь молча. Сверка спеков это ловит, но гоняется в гейте пуша — здесь та же пара
# встречается коммитом раньше, пока правка ещё в голове у автора.
#
# Раздел с утверждениями — единственное, что связано со спутником; правка «Ловушек» или
# таблицы «Где это лежит» его не трогает, поэтому сравнивается только этот раздел.
STATEMENTS='/^## Как закон применяется здесь$/,/^## [^К]/'
statements_of() { content_of "$1" | awk "$STATEMENTS"; }

for rule in $(printf '%s\n' "$paths" | grep -E '/SKILL\.md$'); do
    grep -q '^kind: rule$' "$rule" 2>/dev/null || continue
    companion="${rule%/SKILL.md}/implementation.md"

    [ -f "$companion" ] || continue
    has_path "$companion" && continue

    if [ "$(statements_of "$rule")" != "$(git show "HEAD:$rule" 2>/dev/null | awk "$STATEMENTS")" ]; then
        add "утверждения \`$rule\` правятся без спутника — добавь в коммит \`$companion\`"
    fi
done

# ── 2. Пары, которые называет дерево ──────────────────────────────────────────
#
# Контракт и спек домена, гард и его сценарии — что именно, знает профиль: связь у каждого
# дерева своя, а механика одна.
if command -v rt_docs_pair_for >/dev/null 2>&1; then
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        want="$(rt_docs_pair_for "$file" 2>/dev/null)"
        [ -z "$want" ] && continue
        # Пара считается приехавшей, если хоть один файл коммита подходит под образец.
        printf '%s\n' "$paths" | grep -qE "$want" && continue
        add "\`$file\` правится без документа — тем же коммитом ждёт \`$want\`"
    done <<EOF
$paths
EOF
fi

# ── 3. Либа и её README ───────────────────────────────────────────────────────

lib_root() {
    dir="${1%/*}"
    while [ -n "$dir" ] && [ "$dir" != "." ]; do
        [ -f "$dir/$lib_marker" ] && { printf '%s' "$dir"; return 0; }
        case "$dir" in */*) dir="${dir%/*}" ;; *) dir='' ;; esac
    done

    return 1
}

need_readme=''
want_readme() {
    root="$1"
    [ -n "$root" ] || return 0
    case " $need_readme " in *" $root "*) return 0 ;; esac
    need_readme="$need_readme $root"
}

# Заведение и удаление либы: README — единственное место, где написано, что в ней лежит и кто
# её зовёт, и раскладку она переживает только вместе с правкой этого текста.
while IFS="$(printf '\t')" read -r status first second; do
    case "$status" in
        A* | D*)
            case "$first" in */"$lib_marker") want_readme "${first%/"$lib_marker"}" ;; esac
            ;;
        R*)
            # Переезд файла меняет обе стороны: у одной либы он пропал из состава, у другой
            # появился.
            from="$(lib_root "$first")" && to="$(lib_root "$second")"
            if [ -n "$from" ] && [ -n "$to" ] && [ "$from" != "$to" ]; then
                want_readme "$from"
                want_readme "$to"
            fi
            ;;
    esac
done <<EOF
$changes
EOF

# Переезд, поданный парой «удалено там, добавлено тут»: переименованием считается не всё, что
# им является, — правка содержимого при переносе сбивает поиск.
moved_added="$(printf '%s\n' "$changes" | awk -F'\t' '$1 ~ /^A/ { n = split($2, p, "/"); print p[n] "\t" $2 }' | sort -u)"
moved_deleted="$(printf '%s\n' "$changes" | awk -F'\t' '$1 ~ /^D/ { n = split($2, p, "/"); print p[n] "\t" $2 }' | sort -u)"
if [ -n "$moved_added" ] && [ -n "$moved_deleted" ]; then
    while IFS="$(printf '\t')" read -r base added; do
        [ -n "$base" ] || continue
        gone="$(printf '%s\n' "$moved_deleted" | awk -F'\t' -v b="$base" '$1 == b { print $2; exit }')"
        [ -n "$gone" ] || continue
        to="$(lib_root "$added")" || continue
        from="$(lib_root "$gone")" || continue
        [ "$from" = "$to" ] && continue
        want_readme "$from"
        want_readme "$to"
    done <<EOF
$moved_added
EOF
fi

for root in $need_readme; do
    [ -d "$root" ] || continue   # либу удалили целиком — править в ней нечего
    has_path "$root/README.md" || add "состав либы \`$root\` изменился без правки \`$root/README.md\`"
done

if [ -n "$problems" ]; then
    decide deny "BLOCKED: коммит правит код, но не документ, который его описывает.
${problems}

Текст правится в той же ветке, что и код: документ, разошедшийся с деревом, выглядит действующей справкой и уводит следующего читателя. Если правка документа здесь действительно не нужна — назови причину строкой \`Docs-skip: <причина>\` в теле коммита, она останется в истории."
fi

# ── 4. Законы ─────────────────────────────────────────────────────────────────
#
# Отклонять нечего: сошлась ли правка с законом, видно только чтением. Но место, где статья
# закона исполняется, названо якорем, и правка ровно этого файла — единственный момент, когда
# сверку ещё дёшево сделать.
#
# Слоёв законов два: общий в корне, закон приложения — в каталоге под ним. Образец принимает
# оба, иначе правка предметного закона считалась бы правкой мимо законов.
if [ -d "$laws_dir" ] && ! printf '%s\n' "$paths" | grep -qE "^${laws_dir}/([^/]+/)?[^/]+\.md$"; then
    touched=''
    for anchor in $(grep -ohE '`[A-Za-z0-9_./@-]+\.(ts|mjs|html|scss|prisma|proto|json)(:[A-Za-z0-9_#.-]+)?`' "$laws_dir"/*.implementation.md 2>/dev/null \
        | tr -d '`' | sed 's/:.*//' | grep '/' | sort -u); do
        has_path "$anchor" && touched="${touched}
  • \`$anchor\`"
    done

    if [ -n "$touched" ]; then
        decide ask "Правка задевает места, где исполняются статьи законов:
${touched}

Законы лежат в \`${laws_dir}/\`, привязка — в спутниках рядом. Прочитай закон и скажи владельцу, сошлась ли с ним правка: если правка его уточняет или ему противоречит, закон правится в этой же ветке, но только с его ведома. Если закон не изменился — подтверди вызов."
    fi
fi

exit 0
