#!/usr/bin/env bash
# Сценарии рода правил пакета: чем правило обязано быть, чтобы его можно было разложить в чужое
# дерево и сверить с ним жалобу.
#
# Набор судит сами правила пакета, а не фикстуру: предмет здесь — тексты, которые пакет везёт, и
# подменять их образцом значило бы проверять образец. Дерева-потребителя набор не касается.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: род правил пакета"

RULES="$ASSETS/rules"
LAWS="$ASSETS/laws"
PATTERNS="$ASSETS/patterns"

# Поле заголовка правила: имя поля печатается со своим значением.
field_of() {
    sed -nE "s/^$2:[[:space:]]*(.*)/\1/p" "$1" 2>/dev/null | head -1
}

# Разделы правила верхнего уровня, кроме заголовка. Заголовки внутри огороженного куска не
# считаются: образец с разделами внутри разорвал бы правило на части.
sections_of() {
    awk '/^```/ { fence = !fence } !fence && /^## / { sub(/^## /, ""); print }' "$1" 2>/dev/null
}

# --- SC-AK-1016 — каждое правило объявляет существующий закон ---------------------------------
no_law=0
unknown_law=0
two_laws=0
for rule in "$RULES"/*.md; do
    law="$(field_of "$rule" law)"
    if [ -z "$law" ]; then
        no_law=$((no_law + 1))
        continue
    fi
    [ "$(sed -nE 's/^law:[[:space:]]*(.*)/\1/p' "$rule" 2>/dev/null | grep -c .)" -gt 1 ] && two_laws=$((two_laws + 1))
    [ -f "$LAWS/$law.md" ] || [ -f "$LAWS/$law.needs-app.md" ] || [ -f "$LAWS/$law.needs-admin.md" ] || unknown_law=$((unknown_law + 1))
done
report "SC-AK-1016 — закон объявлен каждым правилом" "$no_law" 0
report "SC-AK-1016 — объявленный закон есть в пакете" "$unknown_law" 0
report "SC-AK-1016 — двух законов над правилом нет" "$two_laws" 0

# --- SC-AK-1017 — раздел о применении закона здесь обязателен ---------------------------------
without_applies=0
for rule in "$RULES"/*.md; do
    sections_of "$rule" | grep -qx 'How the law applies here' || without_applies=$((without_applies + 1))
done
report "SC-AK-1017 — раздел о применении есть у каждого" "$without_applies" 0

# --- SC-AK-1018 — правило называет место, где живут имена дерева ------------------------------
without_lives=0
for rule in "$RULES"/*.md; do
    sections_of "$rule" | grep -qx 'Where it lives' || without_lives=$((without_lives + 1))
done
report "SC-AK-1018 — раздел о месте имён есть у каждого" "$without_lives" 0

# --- SC-AK-1019 — описание правила не длиннее предела -----------------------------------------
# Предел тот же, каким его считает проверка описаний: триста знаков.
too_long=0
without_description=0
for rule in "$RULES"/*.md; do
    description="$(field_of "$rule" description)"
    if [ -z "$description" ]; then
        without_description=$((without_description + 1))
        continue
    fi
    [ "${#description}" -gt 300 ] && too_long=$((too_long + 1))
done
report "SC-AK-1019 — описание есть у каждого правила" "$without_description" 0
report "SC-AK-1019 — длиннее предела описаний нет" "$too_long" 0

# --- SC-AK-1020 — у каждого правила есть хотя бы один образец ---------------------------------
# Образец находится по полю `rule:`, а не по приставке в имени: приставку носят не все.
without_pattern=0
for rule in "$RULES"/*.md; do
    name="$(basename "$rule" .md)"
    name="${name%.needs-app}"
    name="${name%.needs-admin}"
    name="${name%.github}"
    name="${name%.gitlab}"
    name="${name%.azure}"
    grep -qlE "^rule:[[:space:]]*$name\$" "$PATTERNS"/*.md 2>/dev/null || without_pattern=$((without_pattern + 1))
done
report "SC-AK-1020 — правил без образца нет" "$without_pattern" 0

# --- SC-AK-1021 — правило говорит, что из закона здесь не держится ----------------------------
without_gap=0
for rule in "$RULES"/*.md; do
    sections_of "$rule" | grep -qx 'What of the law is not here' || without_gap=$((without_gap + 1))
done
report "SC-AK-1021 — раздел о недержанном есть у каждого" "$without_gap" 0

# --- SC-AK-1022 — приставка признака объявлена в списке признаков ------------------------------
unknown_trait=0
for rule in "$RULES"/*.md; do
    case "$(basename "$rule" .md)" in
        *.needs-*)
            trait="$(basename "$rule" .md)"
            trait="${trait##*.needs-}"
            jq -e --arg t "$trait" 'has($t)' "$ASSETS/traits.json" >/dev/null 2>&1 || unknown_trait=$((unknown_trait + 1))
            ;;
    esac
done
report "SC-AK-1022 — незаявленных признаков нет" "$unknown_trait" 0

# --- SC-AK-1023 — издание правила названо в списке изданий -------------------------------------
unknown_variant=0
for rule in "$RULES"/*.md; do
    name="$(basename "$rule" .md)"
    case "$name" in
        *.github | *.gitlab | *.azure)
            value="${name##*.}"
            jq -e --arg v "$value" '[.host.options[].value] | index($v) != null' "$ASSETS/variants.json" >/dev/null 2>&1 \
                || unknown_variant=$((unknown_variant + 1))
            ;;
    esac
done
report "SC-AK-1023 — незаявленных изданий нет" "$unknown_variant" 0

# --- SC-AK-1024 — правило с холодной частью называет её в заголовке ----------------------------
silent_cold=0
for rule in "$RULES"/*.md; do
    name="$(basename "$rule" .md)"
    [ -f "$ASSETS/pitfalls/$name.md" ] || continue
    grep -qE '^\*\*Cold part:\*\*' "$rule" || silent_cold=$((silent_cold + 1))
done
report "SC-AK-1024 — холодная часть названа в заголовке" "$silent_cold" 0

# --- SC-AK-1025 — вход в спеки отвечает нулём по имени любого правила --------------------------
# Вход читает привязки спутников дерева, поэтому спрашивается из корня дерева пакета.
ROOT_TREE="$(cd "$ASSETS/../../.." && pwd)"
uncovered=0
if [ -f "$ROOT_TREE/tools/specs-for.mjs" ]; then
    for rule in "$RULES"/*.md; do
        (cd "$ROOT_TREE" && node tools/specs-for.mjs "projects/agent-kit/assets/rules/$(basename "$rule")" >/dev/null 2>&1) \
            || uncovered=$((uncovered + 1))
    done
fi
report "SC-AK-1025 — правил без спеки не осталось" "$uncovered" 0

suite_result "проверки: род правил пакета"
