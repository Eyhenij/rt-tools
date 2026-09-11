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

# --- SC-AK-1087 — пустой обход отказывает, а не отвечает «расхождений нет» --------------------
#
# Пропуск выше говорит, что раскладки либ у дерева нет вовсе. Здесь корни на месте, а обход вернулся
# пустым: имена семей взяты из настройки, и дерево, переименовавшее семью, держит умолчание пакета.
# Строка «0 либ, расхождений нет» от честного нуля не отличается, а проверка стоит в проверке перед
# push — её молчание читается как её зелёный ответ.

layers_code() {
    (cd "$LAYERS_TREE" && node tools/check-lib-layers.mjs >/dev/null 2>&1)
    printf '%s' "$?"
}

layers_config ''
report "SC-AK-1087 — дерево с либами до отказов об обходе не доходит" \
    "$(layers_says 'not a single lib was met|is declared by the key')" 0

printf '{"sourceRoots":["libs"],"families":["alpha","beta"],"apiFamily":"api","libsRoot":"libs"}\n' \
    > "$LAYERS_TREE/.claude/rt-kit/checks.json"
mkdir -p "$LAYERS_TREE/libs/gamma"
report "SC-AK-1087 — объявленная семья без каталога отбивает прогон" "$(layers_code)" 1
report "SC-AK-1087 — отказ называет каталог семьи" "$(layers_says 'libs/beta')" 1

printf '{"sourceRoots":["libs"],"families":["gamma"],"apiFamily":"api","libsRoot":"libs"}\n' \
    > "$LAYERS_TREE/.claude/rt-kit/checks.json"
report "SC-AK-1087 — корень без единой либы отбивает прогон" "$(layers_code)" 1
report "SC-AK-1087 — отказ называет пройденные корни" "$(layers_says 'not a single lib was met')" 1

# --- SC-AK-1092 — аудит читает объявленное имя, тег и алиас ----------------------------------
#
# Имя, тег и алиас у либы уже записаны — в манифесте и в списке путей. Аудит собирал их заново из
# пути, и дерево, назвавшее либу иначе, краснело на ровном месте: погасить это можно было только
# списком исключений. Формула остаётся там, где не объявлено ничего: она называет, каким имя
# должно стать.

LIB_DIR="$LAYERS_TREE/libs/alpha/auth/util"
layers_config ''

printf '{"name":"своя-либа","sourceRoot":"libs/alpha/auth/util/src","tags":["scope:своя-либа"]}\n' \
    > "$LIB_DIR/project.json"
report "SC-AK-1092 — своё имя не считается расхождением" "$(layers_says 'the project name')" 0
report "SC-AK-1092 — тег судится по имени либы, а не по пути" "$(layers_says 'does not match the name of the lib')" 0

printf '{"name":"своя-либа","sourceRoot":"libs/alpha/auth/util/src","tags":["scope:alpha-auth-util"]}\n' \
    > "$LIB_DIR/project.json"
report "SC-AK-1092 — тег, разошедшийся с именем, назван" "$(layers_says 'does not match the name of the lib')" 1

printf '{"sourceRoot":"libs/alpha/auth/util/src","tags":["scope:alpha-auth-util"]}\n' \
    > "$LIB_DIR/project.json"
report "SC-AK-1092 — либа без объявленного имени названа" "$(layers_says 'declares no project name')" 1
report "SC-AK-1092 — отказ говорит, каким имя должно стать" "$(layers_says 'alpha-auth-util')" 1

printf '{"name":"своя-либа","sourceRoot":"libs/alpha/auth/util/src","tags":["scope:своя-либа"]}\n' \
    > "$LIB_DIR/project.json"
printf '{"compilerOptions":{"paths":{"@своё/что-угодно":["./libs/alpha/auth/util/src/index.ts"]}}}\n' \
    > "$LAYERS_TREE/tsconfig.base.json"
report "SC-AK-1092 — алиас найден по тому, куда указывает" "$(layers_says 'names no alias pointing at')" 0

printf '{"compilerOptions":{"paths":{"@своё/что-угодно":["./libs/alpha/auth/other/src/index.ts"]}}}\n' \
    > "$LAYERS_TREE/tsconfig.base.json"
report "SC-AK-1092 — либа без единого алиаса названа" "$(layers_says 'names no alias pointing at')" 1

rm -rf "$LAYERS_TREE"

suite_result "проверки: раскладка"
