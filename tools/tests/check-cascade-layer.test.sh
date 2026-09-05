#!/usr/bin/env bash
# Сценарии проверки слоя каскада: что она ловит вокруг обёртки и чем нарочный вынос отличается
# от промаха.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверка слоя каскада"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-cascade-layer.mjs" "$WORK/tools/"

LIB="$WORK/projects/ui-kit-v2/src/lib/probe"
STYLES="$WORK/projects/ui-kit-v2/src/styles"
mkdir -p "$LIB" "$STYLES"
printf '@layer rt-kit.vendor, rt-kit.base, rt-kit.components;\n' > "$STYLES/_layers.scss"

# Файл стилей компонента: тело внутри обёртки, хвост — за ней.
probe_file() {
    printf '@layer rt-kit.components {\n    .rt-probe {\n        color: var(--rt-text);\n    }\n}\n%s' "$1" \
        > "$LIB/probe.component.scss"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-cascade-layer.mjs" >/dev/null 2>&1; then got="зелено"; else got="красно"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-cascade-layer.mjs" 2>&1 | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

# --- обёртка -------------------------------------------------------------------------------
probe_file ''
verdict "обёрнутый файл без хвоста проходит" "зелено"

printf '.rt-probe {\n    color: red;\n}\n' > "$LIB/probe.component.scss"
verdict "файл без обёртки отбивается" "красно"
says "и отказ называет обёртку" 'правила стоят вне слоя'

# --- правило до обёртки --------------------------------------------------------------------
printf '.rt-early {\n    color: red;\n}\n@layer rt-kit.components {\n    .rt-probe {\n        color: red;\n    }\n}\n' \
    > "$LIB/probe.component.scss"
verdict "правило до обёртки отбивается" "красно"
says "и отказ называет его" 'до обёртки стоит'

printf "@use '../mixins';\n@layer rt-kit.components {\n    .rt-probe {\n        color: red;\n    }\n}\n" \
    > "$LIB/probe.component.scss"
verdict "объявление sass до обёртки законно" "зелено"

# --- правило после обёртки -----------------------------------------------------------------
probe_file '.rt-late {
    pointer-events: none;
}
'
verdict "правило после обёртки без отметки отбивается" "красно"
says "и отказ называет отметку" 'после обёртки стоит.*rt-layer-outside'

probe_file '/* rt-layer-outside: спорит с неслоевым правилом чужой библиотеки. */
.rt-late {
    pointer-events: none;
}
'
verdict "правило после обёртки с отметкой проходит" "зелено"
says "и вынесенное названо числом" 'вынесено из слоя с отметкой 1'

# Пояснение правилом не считается: иначе шапка файла после обёртки читалась бы как вынос.
probe_file '/* Просто пояснение в конце файла. */
'
verdict "пояснение после обёртки правилом не считается" "зелено"

# Отметка судится в хвосте, а не по всему файлу: слово внутри обёртки выноса не разрешает.
printf '@layer rt-kit.components {\n    /* rt-layer-outside */\n    .rt-probe {\n        color: red;\n    }\n}\n.rt-late {\n    pointer-events: none;\n}\n' \
    > "$LIB/probe.component.scss"
verdict "отметка внутри обёртки хвоста не оправдывает" "красно"

# --- порядок подслоёв ----------------------------------------------------------------------
probe_file ''
printf '@layer rt-kit.base, rt-kit.components;\n' > "$STYLES/_layers.scss"
verdict "порядок подслоёв без vendor отбивается" "красно"
says "и отказ называет строку порядка" 'порядок подслоёв не объявлен'

suite_result "проверка слоя каскада"
