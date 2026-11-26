#!/usr/bin/env bash
# Проверка наборов значков: на каком расхождении она отказывает и что пропускает. Дерево для
# случаев заводится свое: проверка берёт корень по своему месту, поэтому копия судит копию.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the icon sets of the kit: names, drawings, fallbacks and the pairs of the migration"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

ICON="projects/ui-kit-v2/src/lib/components/icon"
KIT="projects/ui-kit-v2/src/assets/icons"
MATERIAL="projects/ui-kit-v2/src/assets/icons-material"
PAIRS="projects/ui-kit-v2/migrations/icon-names.json"

sets_file() {
    cat > "$WORK/tree/$ICON/rt-icon-sets.ts" <<TS
export const RT_ICON_MATERIAL_NAMES: ReadonlyArray<string> = [
    'trash',
];
export const rtIconBuiltInSets: ReadonlyArray<object> = [
    { name: 'kit', url: '/icons' },
    { name: 'material', url: '/icons-material', fallback: '$1', names: RT_ICON_MATERIAL_NAMES, fill: true },$2
];
TS
}

fresh_tree() {
    rm -rf "$WORK/tree"
    mkdir -p "$WORK/tree/tools" "$WORK/tree/$ICON" "$WORK/tree/$KIT" "$WORK/tree/$MATERIAL" "$WORK/tree/$(dirname "$PAIRS")"
    cp "$TOOLS/check-icon-map.mjs" "$WORK/tree/tools/"
    printf "export const iconsName = [\n    'trash',\n    'copy',\n] as const;\n" > "$WORK/tree/$ICON/rt-icon-names.ts"
    sets_file kit ''
    touch "$WORK/tree/$KIT/trash.svg" "$WORK/tree/$KIT/copy.svg" "$WORK/tree/$MATERIAL/trash.svg" "$WORK/tree/$MATERIAL/trash.fill.svg"
    echo '[{ "from": "delete", "to": "trash", "why": "корзина" }]' > "$WORK/tree/$PAIRS"
    echo '{ "trash": "delete" }' > "$WORK/tree/tools/material-icon-sources.json"
}

# The exit code and the number of lines of the refusal that name the sign.
judged() {
    local out code
    out="$(node "$WORK/tree/tools/check-icon-map.mjs" 2>&1)"
    code=$?
    echo "$code $(printf '%s\n' "$out" | grep -c -- "$1")"
}

fresh_tree
report "a whole tree passes" "$(judged 'расхождений нет')" "0 1"

fresh_tree && rm "$WORK/tree/$KIT/copy.svg"
report "a name without a kit drawing is named" "$(judged 'рисунка в наборе kit нет')" "1 1"

fresh_tree && touch "$WORK/tree/$KIT/extra.svg"
report "a kit drawing without a name is named" "$(judged 'имени в списке нет')" "1 1"

fresh_tree && rm "$WORK/tree/$MATERIAL/trash.fill.svg"
report "a missing filled drawing is named" "$(judged 'залитого рисунка нет')" "1 1"

fresh_tree && touch "$WORK/tree/$MATERIAL/copy.svg"
report "a material drawing outside the list is named" "$(judged 'в перечне набора имени нет')" "1 1"

fresh_tree && echo '{}' > "$WORK/tree/tools/material-icon-sources.json"
report "a list name without a source is named" "$(judged 'в material-icon-sources.json нет')" "1 1"

fresh_tree && sets_file material ''
report "a fallback circle is named" "$(judged 'замкнута в круг')" "1 1"

fresh_tree && sets_file absent ''
report "a fallback that does not reach kit is named" "$(judged 'не доходит до kit')" "1 1"

fresh_tree && echo '[{ "from": "delete", "to": "gone", "why": "корзина" }]' > "$WORK/tree/$PAIRS"
report "a pair leading outside the kit names is named" "$(judged 'в списке кита нет')" "1 1"

fresh_tree && echo '[{ "from": "delete", "to": "trash", "why": "а" }, { "from": "delete", "to": "copy", "why": "б" }]' > "$WORK/tree/$PAIRS"
report "an old name met twice is named" "$(judged 'встречается дважды')" "1 1"

fresh_tree && echo '[{ "from": "copy", "to": "trash", "why": "а" }]' > "$WORK/tree/$PAIRS"
report "a pair that renames a kit name is named" "$(judged 'само есть в списке кита')" "1 1"

fresh_tree && echo 'export const other = 1;' > "$WORK/tree/$ICON/rt-icon-sets.ts"
report "an empty parse is a refusal, not a green answer" "$(judged 'разбор пуст')" "1 2"

suite_result "check-icon-map"
