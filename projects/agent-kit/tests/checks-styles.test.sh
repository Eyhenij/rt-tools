#!/usr/bin/env bash
# Сценарии проверки классов вёрстки: объявление из подключённого пакета, изменившийся перечень
# файлов у строки списка известного и строка, за которой класс уже подкреплён правилом.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: классы вёрстки"

# --- классы вёрстки -------------------------------------------------------------------------
#
# Фикстура — дерево с приложением, своими стилями и каталогом зависимостей: проверка обходит
# исходники сама, а до пакета добирается только тем подключением, которое приложение назвало.

STYLES_TREE="$(mktemp -d)"
mkdir -p "$STYLES_TREE/tools" "$STYLES_TREE/.claude/rt-kit" "$STYLES_TREE/apps/web"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-styles.mjs" "$STYLES_TREE/tools/"
printf '{"sourceRoots":["apps"],"allowlistDir":"tools"}\n' > "$STYLES_TREE/.claude/rt-kit/checks.json"

styles_says() {
    (cd "$STYLES_TREE" && node tools/check-styles.mjs 2>&1) | grep -cE "$1"
}
styles_code() {
    (cd "$STYLES_TREE" && node tools/check-styles.mjs >/dev/null 2>&1)
    printf '%s' "$?"
}

# Класс со своим правилом расхождением не бывает — это основание, на котором стоит остальное.
printf '<div rtBlock="card"><b rtElem="head"></b></div>\n' > "$STYLES_TREE/apps/web/screen.html"
printf '.card {\n    &__head {\n        color: red;\n    }\n}\n' > "$STYLES_TREE/apps/web/screen.scss"
printf '{"accepted":{},"debt":{}}\n' > "$STYLES_TREE/tools/styles-allowlist.json"
report "классы: своё правило проходит" "$(styles_code)" 0

# SC-AK-268 — правило, приехавшее подключённым пакетом, расхождением не считается
mkdir -p "$STYLES_TREE/node_modules/@vendor/kit/styles"
printf '{"name":"@vendor/kit","version":"1.0.0"}\n' > "$STYLES_TREE/node_modules/@vendor/kit/package.json"
printf '.panel {\n    &__title {\n        color: blue;\n    }\n}\n' \
    > "$STYLES_TREE/node_modules/@vendor/kit/styles/_blocks.scss"
printf "@use '@vendor/kit/styles/blocks';\n" > "$STYLES_TREE/apps/web/styles.scss"
printf '<div rtBlock="panel"><b rtElem="title"></b></div>\n' > "$STYLES_TREE/apps/web/panel.html"
report "SC-AK-268 — пакетное правило считается объявлением" "$(styles_code)" 0

# SC-AK-269 — подключение внутри пакетного файла не разбирается
printf "@use 'deep';\n.panel {\n    &__title {\n        color: blue;\n    }\n}\n" \
    > "$STYLES_TREE/node_modules/@vendor/kit/styles/_blocks.scss"
printf '.panel {\n    &__deep {\n        color: green;\n    }\n}\n' \
    > "$STYLES_TREE/node_modules/@vendor/kit/styles/_deep.scss"
printf '<div rtBlock="panel"><b rtElem="deep"></b></div>\n' > "$STYLES_TREE/apps/web/deep.html"
report "SC-AK-269 — второе колено подключений не читается" "$(styles_code)" 1
report "SC-AK-269 — назван именно этот класс" "$(styles_says 'rtElem="deep"')" 1
rm "$STYLES_TREE/apps/web/deep.html"
printf '.panel {\n    &__title {\n        color: blue;\n    }\n}\n' \
    > "$STYLES_TREE/node_modules/@vendor/kit/styles/_blocks.scss"

# SC-AK-270 — ненайденный пакет проверку не роняет
printf "@use '@vendor/kit/styles/blocks';\n@use '@nowhere/gone/styles/blocks';\n" \
    > "$STYLES_TREE/apps/web/styles.scss"
report "SC-AK-270 — ненайденный пакет не роняет проверку" "$(styles_code)" 0

# SC-AK-271 — разросшийся долг называется разросшимся
printf '<div rtBlock="card"><b rtElem="foot"></b></div>\n' > "$STYLES_TREE/apps/web/a.html"
printf '{"accepted":{},"debt":{"elem foot @ apps/web/a.html":{"reason":"фикстура набора","task":"RT-900"}}}\n' > "$STYLES_TREE/tools/styles-allowlist.json"
report "классы: долг в списке не отбивает" "$(styles_code)" 0
printf '<div rtBlock="card"><b rtElem="foot"></b></div>\n' > "$STYLES_TREE/apps/web/b.html"
report "SC-AK-271 — разросшийся долг отбивает" "$(styles_code)" 1
report "SC-AK-271 — назван разросшимся и с добавившимся файлом" "$(styles_says 'долг разросся.*b\.html')" 1
report "SC-AK-271 — строку убрать не советует" "$(styles_says 'строку убрать')" 0
report "SC-AK-271 — новой строки не предлагает" "$(styles_says 'правила нет ни в одном файле стилей')" 0

# SC-AK-272 — сократившийся перечень называется сократившимся
printf '{"accepted":{},"debt":{"elem foot @ apps/web/a.html, apps/web/b.html":{"reason":"фикстура набора","task":"RT-900"}}}\n' \
    > "$STYLES_TREE/tools/styles-allowlist.json"
rm "$STYLES_TREE/apps/web/b.html"
report "SC-AK-272 — сокращение долга не отбивает" "$(styles_code)" 0
report "SC-AK-272 — названо сокращением и файлом" "$(styles_says 'долг сократился.*b\.html')" 1
report "SC-AK-272 — строку убрать не советует" "$(styles_says 'строку убрать')" 0

# SC-AK-273 — строка о подкреплённом классе по-прежнему убирается
printf '.card {\n    &__head {\n        color: red;\n    }\n\n    &__foot {\n        color: red;\n    }\n}\n' \
    > "$STYLES_TREE/apps/web/screen.scss"
report "SC-AK-273 — подкреплённый класс отбивает строкой списка" "$(styles_code)" 1
report "SC-AK-273 — сказано убрать строку" "$(styles_says 'строку убрать')" 1

# SC-AK-274 — правило, собранное вложенностью, читается объявлением
#
# Разметка прежних случаев снимается: их классы без правила дали бы расхождение и здесь, а
# проверяется тут другое.
rm -f "$STYLES_TREE/apps/web/a.html" "$STYLES_TREE/apps/web/b.html"
printf '{"accepted":{},"debt":{}}\n' > "$STYLES_TREE/tools/styles-allowlist.json"
printf '<div rtBlock="card"><b rtElem="head"></b><i rtElem="head-icon"></i></div>\n' \
    > "$STYLES_TREE/apps/web/screen.html"
printf '.card {\n    &__head {\n        color: red;\n\n        &-icon {\n            color: blue;\n        }\n    }\n}\n' \
    > "$STYLES_TREE/apps/web/screen.scss"
report "SC-AK-274 — конкатенация считается объявлением" "$(styles_code)" 0

# SC-AK-275 — вложенность собирается на любую глубину
printf '<div rtBlock="card"><b rtElem="head"></b><i rtElem="head-icon-mark"></i></div>\n' \
    > "$STYLES_TREE/apps/web/screen.html"
printf '.card {\n    &__head {\n        color: red;\n\n        &-icon {\n            color: blue;\n\n            &-mark {\n                color: green;\n            }\n        }\n    }\n}\n' \
    > "$STYLES_TREE/apps/web/screen.scss"
report "SC-AK-275 — третье колено вложенности собирается" "$(styles_code)" 0

# SC-AK-276 — конкатенация не выдумывает имён за пределами своего блока
printf '<div rtBlock="card"><b rtElem="head"></b><i rtElem="lonely"></i></div>\n' \
    > "$STYLES_TREE/apps/web/screen.html"
printf '.card {\n    &__head {\n        color: red;\n    }\n}\n\n.other {\n    &-lonely {\n        color: gray;\n    }\n}\n' \
    > "$STYLES_TREE/apps/web/screen.scss"
report "SC-AK-276 — хвост без головы объявлением не становится" "$(styles_code)" 1
report "SC-AK-276 — назван именно этот класс" "$(styles_says 'rtElem="lonely"')" 1

rm -rf "$STYLES_TREE"

suite_result "проверки: классы вёрстки"
