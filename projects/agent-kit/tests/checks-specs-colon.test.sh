#!/usr/bin/env bash
# Сценарий сверки привязок: потерянное двоеточие между файлом и символом в ячейке с якорем.
#
# Отдельный набор: основной набор сверки спеков упёрся в предел длины файла. Фикстура здесь та же
# по форме, но минимальная: судится одна строка привязки, а не раскладка дерева.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: потерянное двоеточие в привязке"

SPEC_TREE="$(mktemp -d)"
mkdir -p "$SPEC_TREE/tools" "$SPEC_TREE/docs/constitution" "$SPEC_TREE/.claude/skills"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-specs.mjs" \
    "$CHECKS/spec-common.mjs" "$CHECKS/spec-anchors.mjs" "$CHECKS/spec-contract.mjs" "$CHECKS/spec-scenarios.mjs" "$CHECKS/spec-proposed.mjs" \
    "$SPEC_TREE/tools/"

specs_says() {
    (cd "$SPEC_TREE" && node tools/check-specs.mjs 2>&1) | grep -cE "$1"
}

# --- SC-AK-1229 — потерянное двоеточие в ячейке привязки названо -----------------------------
#
# Токен с косой чертой и расширением без «:символ» якорем не читается, и строка с другими
# якорями проходила молча. Строка вердикта называет файлы словами, и там голый путь законен.
mkdir -p "$SPEC_TREE/.claude/skills/colon-rule"
printf -- '---\nname: colon-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/.claude/skills/colon-rule/SKILL.md"

colon_row() {
    printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | %s |\n' "$1" \
        > "$SPEC_TREE/.claude/skills/colon-rule/implementation.md"
}

colon_row '`tools/check-specs.mjs:checkSpecHeadings` и `tools/spec-common.mjs` `REQUIRED_HEADINGS`'
report "SC-AK-1229 — символ отдельно от пути рядом с якорем назван" "$(specs_says 'the colon between the file and the symbol is lost')" 1

colon_row '`tools/check-specs.mjs:checkSpecHeadings` и `tools/spec-common.mjs`:REQUIRED_HEADINGS'
report "SC-AK-1229 — двоеточие снаружи кавычек назван" "$(specs_says 'the colon between the file and the symbol is lost')" 1

colon_row '`tools/check-specs.mjs:checkSpecHeadings`, а файл `tools/spec-common.mjs` лежит рядом'
report "SC-AK-1229 — голый путь словами рядом с якорем не судится" "$(specs_says 'the colon between the file and the symbol is lost')" 0

colon_row '`tools/check-specs.mjs:checkSpecHeadings` и `tools/spec-common.mjs:REQUIRED_HEADINGS`'
report "SC-AK-1229 — оба токена с символом проходят" "$(specs_says 'the colon between the file and the symbol is lost')" 0

colon_row '**Не исполняется.** Службу держит `tools/check-specs.mjs`, а дерево её не берёт.'
report "SC-AK-1229 — вердикт с путём словами не судится" "$(specs_says 'the colon between the file and the symbol is lost')" 0

rm -rf "$SPEC_TREE/.claude/skills/colon-rule"

rm -rf "$SPEC_TREE"
suite_result "проверки: потерянное двоеточие в привязке"
