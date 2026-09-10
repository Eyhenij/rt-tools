#!/usr/bin/env bash
# Сценарии рода образцов и холодных частей пакета: чем они обязаны быть, чтобы правило над ними
# находило их, а дерево-потребитель могло их разложить.
#
# Набор судит сами файлы пакета, а не фикстуру: предмет здесь — тексты, которые пакет везёт, и
# подменять их образцом значило бы проверять образец.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: род образцов и холодных частей"

PATTERNS="$ASSETS/patterns"
PITFALLS="$ASSETS/pitfalls"
RULES="$ASSETS/rules"

field_of() {
    sed -nE "s/^$2:[[:space:]]*(.*)/\1/p" "$1" 2>/dev/null | head -1
}

# Имя правила без приставки признака и без издания платформы.
bare_name() {
    local name="$1"
    name="${name%.needs-app}"
    name="${name%.needs-admin}"
    name="${name%.github}"
    name="${name%.gitlab}"
    name="${name%.azure}"
    printf '%s' "$name"
}

# --- SC-AK-1026 — правило объявлено в заголовке каждого образца --------------------------------
without_rule=0
for pattern in "$PATTERNS"/*.md; do
    [ -n "$(field_of "$pattern" rule)" ] || without_rule=$((without_rule + 1))
done
report "SC-AK-1026 — образцов без объявленного правила нет" "$without_rule" 0

# --- SC-AK-1027 — объявленное правило есть в пакете --------------------------------------------
unknown_rule=0
for pattern in "$PATTERNS"/*.md; do
    rule="$(field_of "$pattern" rule)"
    [ -z "$rule" ] && continue
    found=0
    for candidate in "$RULES/$rule.md" "$RULES/$rule".*.md; do
        [ -f "$candidate" ] && found=1
    done
    [ "$found" -eq 1 ] || unknown_rule=$((unknown_rule + 1))
done
report "SC-AK-1027 — незнакомых правил в образцах нет" "$unknown_rule" 0

# --- SC-AK-1028 — образец объявляет свой род ---------------------------------------------------
wrong_kind=0
for pattern in "$PATTERNS"/*.md; do
    [ "$(field_of "$pattern" kind)" = pattern ] || wrong_kind=$((wrong_kind + 1))
done
report "SC-AK-1028 — род объявлен образцом верно" "$wrong_kind" 0

# --- SC-AK-1029 — правило называет свои образцы разделом ---------------------------------------
# Считаются правила, у которых образцы есть: правило без образцов сторожит соседний набор.
silent_rules=0
for rule in "$RULES"/*.md; do
    name="$(bare_name "$(basename "$rule" .md)")"
    grep -qlE "^rule:[[:space:]]*$name\$" "$PATTERNS"/*.md 2>/dev/null || continue
    grep -qE '^## Patterns' "$rule" || silent_rules=$((silent_rules + 1))
done
report "SC-AK-1029 — раздел образцов есть у каждого правила" "$silent_rules" 0

# --- SC-AK-1030 — издание образца названо в списке изданий -------------------------------------
unknown_variant=0
for pattern in "$PATTERNS"/*.md; do
    name="$(basename "$pattern" .md)"
    case "$name" in
        *.github | *.gitlab | *.azure)
            value="${name##*.}"
            jq -e --arg v "$value" '[.host.options[].value] | index($v) != null' "$ASSETS/variants.json" >/dev/null 2>&1 \
                || unknown_variant=$((unknown_variant + 1))
            ;;
    esac
done
report "SC-AK-1030 — незаявленных изданий у образцов нет" "$unknown_variant" 0

# --- SC-AK-1031 — имя образца не занято двумя разными образцами --------------------------------
# Издания одного предмета делят имя законно: дерево раскладывает ровно одно из них. Расхождение —
# повтор имени между файлами, из которых хотя бы один изданием не является.
shared=0
for pattern in "$PATTERNS"/*.md; do
    name="$(basename "$pattern" .md)"
    case "$name" in
        *.github | *.gitlab | *.azure) continue ;;
    esac
    twins=0
    for other in "$PATTERNS"/*.md; do
        [ "$other" = "$pattern" ] && continue
        [ "$(bare_name "$(basename "$other" .md)")" = "$name" ] && twins=$((twins + 1))
    done
    [ "$twins" -gt 0 ] && shared=$((shared + 1))
done
report "SC-AK-1031 — имя не занято двумя образцами" "$shared" 0

# --- SC-AK-1032 — холодная часть отвечает правилу по имени -------------------------------------
orphan_cold=0
for cold in "$PITFALLS"/*.md; do
    name="$(basename "$cold" .md)"
    if [ -f "$RULES/$name.md" ]; then
        continue
    fi
    # Холодная часть навыка без закона лежит под именем навыка: правила над ним нет.
    [ -f "$ASSETS/skills/$name.md" ] && continue
    orphan_cold=$((orphan_cold + 1))
done
report "SC-AK-1032 — холодных частей без хозяина нет" "$orphan_cold" 0

# --- SC-AK-1033 — холодная часть называет свой ресурс ------------------------------------------
# Обычно это правило; там, где над предметом закона нет, — сам навык.
silent_cold=0
for cold in "$PITFALLS"/*.md; do
    grep -qiE 'the rule is|the skill|правило' "$cold" || silent_cold=$((silent_cold + 1))
done
report "SC-AK-1033 — холодная часть называет свой ресурс" "$silent_cold" 0

# --- SC-AK-1034 — правило с холодной частью называет её в заголовке ----------------------------
unnamed_cold=0
for cold in "$PITFALLS"/*.md; do
    name="$(basename "$cold" .md)"
    [ -f "$RULES/$name.md" ] || continue
    grep -qE '^\*\*Cold part:\*\*' "$RULES/$name.md" || unnamed_cold=$((unnamed_cold + 1))
done
report "SC-AK-1034 — холодная часть названа правилом" "$unnamed_cold" 0

# --- SC-AK-1035 — вход в спеки отвечает нулём по имени обоих родов -----------------------------
ROOT_TREE="$(cd "$ASSETS/../../.." && pwd)"
uncovered=0
if [ -f "$ROOT_TREE/tools/specs-for.mjs" ]; then
    for file in "$PATTERNS"/*.md "$PITFALLS"/*.md; do
        case "$file" in
            *"/patterns/"*) where=patterns ;;
            *) where=pitfalls ;;
        esac
        (cd "$ROOT_TREE" && node tools/specs-for.mjs "projects/agent-kit/assets/$where/$(basename "$file")" >/dev/null 2>&1) \
            || uncovered=$((uncovered + 1))
    done
fi
report "SC-AK-1035 — образцов и ловушек без спеки не осталось" "$uncovered" 0

suite_result "проверки: род образцов и холодных частей"
