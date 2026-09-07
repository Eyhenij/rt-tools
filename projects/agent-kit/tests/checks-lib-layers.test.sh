#!/usr/bin/env bash
# Сценарии имён дерева в сверке раскладки: приставка селекторов, имя бареля и теги либ без
# зависимостей.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: раскладка"

# --- SC-AK-264…267 — имена дерева в сверке раскладки ----------------------------------------
#
# Приставка селекторов, имя бареля и теги либ без зависимостей — слова дерева, а не пакета.
# Зашитые в проверку, они краснели на всех либах первого же дерева, у которого они свои: сорок
# расхождений подряд, ни одно из которых не было долгом.
#
# Фикстура — одна либа доменной сетки с двумя барелями: `index.ts` доменной либы и публичный вход
# публикуемого пакета рядом с ним.

LAYERS_TREE="$(mktemp -d)"
mkdir -p "$LAYERS_TREE/tools" "$LAYERS_TREE/.claude/rt-kit" "$LAYERS_TREE/libs/alpha/auth/util/src"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-lib-layers.mjs" \
    "$CHECKS/lib-common.mjs" "$CHECKS/lib-domains.mjs" "$CHECKS/lib-manifests.mjs" \
    "$CHECKS/lib-boundaries.mjs" "$CHECKS/lib-reexports.mjs" \
    "$LAYERS_TREE/tools/"
printf '{"name":"alpha-auth-util","sourceRoot":"libs/alpha/auth/util/src","prefix":"own","tags":["scope:alpha-auth-util"]}\n' \
    > "$LAYERS_TREE/libs/alpha/auth/util/project.json"
touch "$LAYERS_TREE/libs/alpha/auth/util/tsconfig.json" "$LAYERS_TREE/libs/alpha/auth/util/vitest.config.mts"
printf "export { thing } from './thing.js';\n" > "$LAYERS_TREE/libs/alpha/auth/util/src/index.ts"
printf "export { other } from './other.js';\n" > "$LAYERS_TREE/libs/alpha/auth/util/src/public-api.ts"
printf '{"compilerOptions":{"paths":{}}}\n' > "$LAYERS_TREE/tsconfig.base.json"

layers_config() {
    printf '{"sourceRoots":["libs"],"families":["alpha"],"apiFamily":"api","libsRoot":"libs"%s}\n' "$1" \
        > "$LAYERS_TREE/.claude/rt-kit/checks.json"
}

layers_says() {
    (cd "$LAYERS_TREE" && node tools/check-lib-layers.mjs 2>&1) | grep -cE "$1"
}

layers_config ''
report "SC-AK-264 — приставка не названа: проверка молчит" "$(layers_says 'prefix «')" 0
report "SC-AK-267 — тегов без зависимостей нет: описания границ не требуется" \
    "$(layers_says 'не описан ни в одном файле границ')" 0
report "SC-AK-266 — умолчание барелем зовёт только index" "$(layers_says 'public-api\.ts: a re-export')" 1

layers_config ',"libPrefix":"vm","barrelFiles":["index.ts","public-api.ts"]'
report "SC-AK-265 — чужая приставка названа" "$(layers_says 'prefix «own» instead of the mandatory «vm»')" 1
report "SC-AK-266 — названный барель собственный файл пропускает" "$(layers_says 'public-api\.ts: a re-export')" 0

rm -rf "$LAYERS_TREE"

suite_result "проверки: раскладка"
