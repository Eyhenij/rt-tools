#!/usr/bin/env bash
# Сценарии четырёх последних родов пакета: роль, навык без закона, заготовка и объявление дерева.
#
# Набор судит сами файлы пакета, а не фикстуру: предмет здесь — тексты и данные, которые пакет
# везёт.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: роли, навыки, заготовки и объявления"

AGENTS="$ASSETS/agents"
SKILLS="$ASSETS/skills"
COMMANDS="$ASSETS/commands"
TEMPLATES="$ASSETS/templates"
SAMPLES="$ASSETS/samples"

field_of() {
    sed -nE "s/^$2:[[:space:]]*(.*)/\1/p" "$1" 2>/dev/null | head -1
}

# --- SC-AK-1047 — роль объявляет имя и инструменты ---------------------------------------------
without_name=0
without_tools=0
for role in "$AGENTS"/*.md; do
    [ -n "$(field_of "$role" name)" ] || without_name=$((without_name + 1))
    [ -n "$(field_of "$role" tools)" ] || without_tools=$((without_tools + 1))
done
report "SC-AK-1047 — имя объявлено каждой ролью" "$without_name" 0
report "SC-AK-1047 — инструменты объявлены каждой ролью" "$without_tools" 0

# --- SC-AK-1048 — описание роли говорит, когда её зовут ----------------------------------------
without_when=0
for role in "$AGENTS"/*.md; do
    field_of "$role" description | grep -qiE 'use |use$|зов|when ' || without_when=$((without_when + 1))
done
report "SC-AK-1048 — описание называет случай вызова" "$without_when" 0

# --- SC-AK-1049 — роль, не пишущая файлов, не объявляет пишущих инструментов --------------------
writes_anyway=0
for role in "$AGENTS"/*.md; do
    field_of "$role" description | grep -qiE 'writes no files|changes no files|edits no files|files и не' || continue
    field_of "$role" tools | grep -qE '(^|[ ,])(Write|Edit|NotebookEdit)([ ,]|$)' && writes_anyway=$((writes_anyway + 1))
done
report "SC-AK-1049 — не пишущая роль пишущих инструментов не держит" "$writes_anyway" 0

# --- SC-AK-1050 — навык без закона закона не объявляет ------------------------------------------
declares_law=0
for skill in "$SKILLS"/*.md; do
    [ -n "$(field_of "$skill" law)" ] && declares_law=$((declares_law + 1))
done
report "SC-AK-1050 — навыки без закона его не объявляют" "$declares_law" 0

# --- SC-AK-1051 — навык без закона не носит рода лестницы ---------------------------------------
wears_kind=0
for skill in "$SKILLS"/*.md; do
    case "$(field_of "$skill" kind)" in
        rule | pattern) wears_kind=$((wears_kind + 1)) ;;
    esac
done
report "SC-AK-1051 — рода лестницы навыки не носят" "$wears_kind" 0

# --- SC-AK-1052 — команда объявляет, что делает и что берёт -------------------------------------
half_declared=0
for command in "$COMMANDS"/*.md; do
    [ -n "$(field_of "$command" description)" ] || half_declared=$((half_declared + 1))
done
report "SC-AK-1052 — описание есть у каждой команды" "$half_declared" 0

# --- SC-AK-1053 — заготовка держит места для заполнения -----------------------------------------
without_places=0
for blank in "$TEMPLATES"/*.md "$SAMPLES"/*/_template/*.md; do
    [ -f "$blank" ] || continue
    grep -qE '<[^>]+>' "$blank" || without_places=$((without_places + 1))
done
report "SC-AK-1053 — места для заполнения есть у каждой заготовки" "$without_places" 0

# --- SC-AK-1054 — заготовка папки задачи заголовка раскладки не держит ---------------------------
stamped=0
for blank in "$SAMPLES"/tasks/_template/*.md; do
    [ -f "$blank" ] || continue
    head -1 "$blank" | grep -q '^<!-- rt-kit v' && stamped=$((stamped + 1))
done
report "SC-AK-1054 — заголовка раскладки в заготовке нет" "$stamped" 0

# --- SC-AK-1055 — объявление дерева читается как данные -----------------------------------------
not_data=0
jq -e . "$ASSETS/variants.json" >/dev/null 2>&1 || not_data=$((not_data + 1))
jq -e . "$ASSETS/traits.json" >/dev/null 2>&1 || not_data=$((not_data + 1))
report "SC-AK-1055 — объявления дерева читаются как данные" "$not_data" 0

# --- SC-AK-1056 — вход в спеки отвечает нулём по имени всех четырёх родов ------------------------
ROOT_TREE="$(cd "$ASSETS/../../.." && pwd)"
uncovered=0
if [ -f "$ROOT_TREE/tools/specs-for.mjs" ]; then
    for role in "$AGENTS"/*.md; do
        (cd "$ROOT_TREE" && node tools/specs-for.mjs "projects/agent-kit/assets/agents/$(basename "$role")" >/dev/null 2>&1) \
            || uncovered=$((uncovered + 1))
    done
    for skill in "$SKILLS"/*.md; do
        (cd "$ROOT_TREE" && node tools/specs-for.mjs "projects/agent-kit/assets/skills/$(basename "$skill")" >/dev/null 2>&1) \
            || uncovered=$((uncovered + 1))
    done
fi
report "SC-AK-1056 — ролей и навыков без спеки не осталось" "$uncovered" 0

# --- SC-AK-1057 — мера непокрытых показывает ноль ------------------------------------------------
left=0
if [ -f "$ROOT_TREE/tools/specs-for.mjs" ]; then
    left="$(cd "$ROOT_TREE" && node tools/specs-for.mjs 2>/dev/null | grep -c . || true)"
fi
report "SC-AK-1057 — непокрытых ресурсов не осталось" "$left" 0

suite_result "проверки: роли, навыки, заготовки и объявления"
