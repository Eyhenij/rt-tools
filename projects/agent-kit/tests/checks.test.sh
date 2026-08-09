#!/usr/bin/env bash
# Сценарии проверок: настройки, которые они читают, и границы, которые они держат.
#
# Проверки везёт пакет, а корни и имена — своё у каждого дерева. Всё, что здесь проверяется,
# про эту границу: что берётся из настройки, что остаётся умолчанием и что происходит с
# надстройкой, назвавшей один ключ вложенного объекта.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки"

# Настройки читаются относительно каталога, где лежит сам файл настроек, — поэтому фикстура
# повторяет раскладку дерева: `tools/` с проверками и `.claude/rt-kit/` с надстройкой.
TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$TREE/tools/"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Значение ключа настроек как его увидит проверка. Путь ключа — через точку.
value_of() {
    node --input-type=module -e "
        import { CONFIG } from '${TREE}/tools/rt-kit-checks.config.mjs';
        const path = process.argv[1].split('.');
        let found = CONFIG;
        for (const key of path) { found = found?.[key]; }
        console.log(JSON.stringify(found));
    " "$1" 2>/dev/null
}

# --- без надстройки действуют умолчания -------------------------------------------------
report "умолчание: корни исходников" "$(value_of sourceRoots)" '["apps","libs"]'
report "умолчание: ключ задач пуст" "$(value_of board.taskKey)" '""'

# --- надстройка ложится поверх ------------------------------------------------------------
printf '{"sourceRoots":["projects"]}\n' > "$TREE/.claude/rt-kit/checks.json"
report "надстройка: свои корни" "$(value_of sourceRoots)" '["projects"]'
# Назвав корни, дерево не теряет остального: иначе надстройка обязана была бы повторить весь
# конфиг, и любое умолчание, добавленное пакетом позже, до неё бы не доехало.
report "надстройка: соседний ключ цел" "$(value_of docsDir)" '"docs"'

# --- вложенный объект сливается по ключам ---------------------------------------------------
# Дерево, назвавшее один ключ борды, теряло остальные и видело это отказом «нет токена бота» —
# то есть читало неполный конфиг как неполадку машины.
printf '{"board":{"taskKey":"RT"}}\n' > "$TREE/.claude/rt-kit/checks.json"
report "вложенное: названный ключ пришёл" "$(value_of board.taskKey)" '"RT"'
report "вложенное: соседние ключи целы" "$(value_of board.bot)" '""'
report "вложенное: сам объект не пропал" "$(value_of board.reviewer)" '""'

# --- список замещается целиком ----------------------------------------------------------------
# Дописывать в список нельзя: убрать из него стало бы невозможно вовсе.
printf '{"skippedDirs":["dist"]}\n' > "$TREE/.claude/rt-kit/checks.json"
report "список: замещается целиком" "$(value_of skippedDirs)" '["dist"]'

# --- битая надстройка называется, а не проглатывается -------------------------------------------
printf 'не json\n' > "$TREE/.claude/rt-kit/checks.json"
broken="$(node --input-type=module -e "import('${TREE}/tools/rt-kit-checks.config.mjs')" 2>&1 | grep -c 'не разбирается как JSON')"
report "битая надстройка названа" "$broken" 1
rm -f "$TREE/.claude/rt-kit/checks.json"

# --- корни проверок берутся из настройки, а не из кода ---------------------------------------------
# Дерево, где либы лежат не по умолчанию пакета, получало проверку, которая ходит мимо кода и
# зеленеет на пустом обходе.
for check in "$CHECKS"/*.mjs; do
    name="${check##*/}"
    [ "$name" = 'rt-kit-checks.config.mjs' ] && continue
    if grep -qE "^[^*/]*['\"\`][^'\"\`]*\b(libs|apps)(/|['\"\`])" "$check"; then
        report "без зашитых корней: $name" FAIL PASS
    else
        report "без зашитых корней: $name" PASS PASS
    fi
done

suite_result "проверки"
