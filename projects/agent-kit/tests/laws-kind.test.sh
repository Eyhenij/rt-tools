#!/usr/bin/env bash
# Сценарии рода законов пакета: чем закон обязан быть, чтобы его можно было разложить в чужое
# дерево и сверить с ним жалобу.
#
# Набор судит сами законы пакета, а не фикстуру: предмет здесь — тексты, которые пакет везёт, и
# подменять их образцом значило бы проверять образец. Дерева-потребителя набор не касается.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: род законов пакета"

LAWS="$ASSETS/laws"

# Адрес внутри закона: путь с расширением, имя файла с расширением или привязка «файл:символ».
# Заголовок и статьи закона таких строк не держат — иначе закон нельзя прочесть в чужом дереве.
addresses_in() {
    grep -oE '`[^`]*\.(md|ts|mjs|sh|json|scss)[^`]*`' "$1" 2>/dev/null | grep -c . || true
}

# Разделы закона верхнего уровня, кроме заголовка.
sections_of() {
    grep -E '^## ' "$1" 2>/dev/null | sed 's/^## //'
}

# --- SC-AK-990 — закон не называет адресов ------------------------------------------------
with_addresses=0
for law in "$LAWS"/*.md; do
    [ "$(addresses_in "$law")" -gt 0 ] && with_addresses=$((with_addresses + 1))
done
report "SC-AK-990 — ни один закон не называет пути или файла" "$with_addresses" 0

# --- SC-AK-1001 — раздел статей обязателен, сверх него только открытые вопросы --------------
without_articles=0
foreign_sections=0
for law in "$LAWS"/*.md; do
    grep -qE '^## Articles' "$law" || without_articles=$((without_articles + 1))
    while IFS= read -r section; do
        case "$section" in
            Articles | 'Open questions') ;;
            *) foreign_sections=$((foreign_sections + 1)) ;;
        esac
    done < <(sections_of "$law")
done
report "SC-AK-1001 — раздел статей есть у каждого закона" "$without_articles" 0
report "SC-AK-1001 — чужих разделов в законах нет" "$foreign_sections" 0

# --- SC-AK-1002 — имя закона не повторяется ни в одном слое ---------------------------------
names="$(cd "$LAWS" && ls *.md 2>/dev/null | sed 's/\.md$//' | sed 's/\.needs-[a-z]*$//')"
report "SC-AK-1002 — имена законов не повторяются" \
    "$(printf '%s\n' "$names" | sort | uniq -d | grep -c . || true)" 0

# --- SC-AK-1003 — признак дерева стоит приставкой в имени файла -----------------------------
declared="$(grep -oE '"(db|admin|app|packages)"' "$ASSETS/traits.json" | tr -d '"' | sort -u)"
unknown_traits=0
for law in "$LAWS"/*.md; do
    base="$(basename "$law" .md)"
    case "$base" in
        *.needs-*)
            trait="${base##*.needs-}"
            printf '%s\n' "$declared" | grep -qxF "$trait" || unknown_traits=$((unknown_traits + 1))
            ;;
    esac
done
report "SC-AK-1003 — признак закона объявлен в наборе признаков" "$unknown_traits" 0
report "SC-AK-1003 — набор признаков не пуст" "$(printf '%s\n' "$declared" | grep -c .)" 4

# --- SC-AK-1004 — закон без правила объявляет себя договорённостью до кода ------------------
lawless=0
for law in "$LAWS"/*.md; do
    base="$(basename "$law" .md)"
    if ! grep -rqE "^law: *$base *$" "$ASSETS/rules" 2>/dev/null; then
        grep -qiE '^\*\*Status' "$law" || lawless=$((lawless + 1))
    fi
done
report "SC-AK-1004 — закон без правила несёт строку состояния" "$lawless" 0

# --- SC-AK-1005 — указатель законов собирается обходом каталога, а не списком ---------------
index_hook="$ASSETS/hooks/constitution-index.sh"
report "SC-AK-1005 — указатель обходит каталог" "$(grep -cE 'for law in .*\*\.md' "$index_hook")" 1
report "SC-AK-1005 — заголовок берётся из самого закона" "$(grep -cE "grep -m1 '\^# '" "$index_hook")" 1
report "SC-AK-1005 — своего списка законов в хуке нет" \
    "$(grep -cE '(delivery|verifiability|work-conduct)\.md' "$index_hook")" 0

# --- SC-AK-1006 — вход в спеки отвечает о законе спекой, а не дырой -------------------------
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
uncovered_laws=0
for law in "$LAWS"/*.md; do
    (cd "$root" && node tools/specs-for.mjs "laws/$(basename "$law")" >/dev/null 2>&1) ||
        uncovered_laws=$((uncovered_laws + 1))
done
report "SC-AK-1006 — о каждом законе говорит спека" "$uncovered_laws" 0

suite_result "проверки: род законов пакета"
