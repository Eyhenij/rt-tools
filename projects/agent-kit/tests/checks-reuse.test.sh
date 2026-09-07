#!/usr/bin/env bash
# Сценарии сплошной проверки единообразия: пустой набор признаков и положение имени глобали.
#
# Проверяется поведение самой проверки, а не карта дерева: дерево собирается здесь же, из
# ресурсов пакета.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: единообразие"

REUSE_TREE="$(mktemp -d)"
mkdir -p "$REUSE_TREE/tools/signals" "$REUSE_TREE/.claude/rt-kit" "$REUSE_TREE/libs/alpha/src"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-reuse.mjs" "$CHECKS/signals.mjs" "$REUSE_TREE/tools/"
cp "$CHECKS/signals/core.json" "$CHECKS/signals/ui-kit-v2.json" "$REUSE_TREE/tools/signals/"

# Настройка дерева: наборы называются доводом, чтобы один и тот же корень судился и с ними, и без.
config_with() {
    printf '{"sourceRoots":["libs"],"allowlistDir":"tools","backendRoots":["libs/api"],"reuse":{"bundles":%s},"board":{"taskKey":"RT"}}\n' \
        "$1" > "$REUSE_TREE/.claude/rt-kit/checks.json"
}

code_of() {
    (cd "$REUSE_TREE" && node tools/check-reuse.mjs >/dev/null 2>&1)
    printf '%s' "$?"
}

says() {
    (cd "$REUSE_TREE" && node tools/check-reuse.mjs 2>&1) | grep -cE "$1"
}

ts_in() { printf '%s\n' "$2" > "$REUSE_TREE/libs/alpha/src/$1.ts"; }
html_in() { printf '%s\n' "$2" > "$REUSE_TREE/libs/alpha/src/$1.html"; }

# Настройка с объявленными директивами своей дизайн-системы дерева.
config_kit() {
    printf '{"sourceRoots":["libs"],"allowlistDir":"tools","backendRoots":["libs/api"],"reuse":{"bundles":["ui-kit-v2"],"kitDirectives":%s},"board":{"taskKey":"RT"}}\n' \
        "$1" > "$REUSE_TREE/.claude/rt-kit/checks.json"
}

# --- SC-AK-813 — дерево без единого признака получает отказ, а не зелёный ноль ----------------
config_with '[]'
ts_in probe 'export const nothing = 1;'
report "SC-AK-813 — пустой набор признаков отбивает прогон" "$(code_of)" 1
report "SC-AK-813 — отказ называет наборы при пакете" "$(says 'The bundles at the package: .*core')" 1

config_with '["core"]'
report "SC-AK-813 — объявленный набор прогон пропускает" "$(code_of)" 0

# --- SC-AK-814 — признак глобали судит положение имени, а не подстроку -------------------------
# Имя внутри строки в кавычках глобалью не бывает: за кавычкой стоит текст, а не обращение.
ts_in quoted "export const key = 'document.mailBody';"
report "SC-AK-814 — имя внутри строки совпадением не считается" "$(says 'raw-window')" 0

# Обращение через поле объекта — это и есть предписанный правилом внедрённый токен.
ts_in field 'export class A { readonly #window = 1; read() { return this.#window.location; } }'
report "SC-AK-814 — обращение через поле совпадением не считается" "$(says 'raw-window')" 0

# Своя переменная с этим именем: имя предметное, переименованию не подлежит.
ts_in own 'const window = { from: 1 }; export const from = window.from;'
report "SC-AK-814 — своя переменная гасит признак в файле" "$(says 'raw-window')" 0

# Настоящее обращение к глобали остаётся видимым.
ts_in real 'export function width(): number { return window.innerWidth; }'
report "SC-AK-814 — обращение к глобали названо" "$(says 'raw-window')" 1

rm -f "$REUSE_TREE/libs/alpha/src/"*.ts

# --- SC-AK-815 — код без разметки под признаки среды не попадает -------------------------------
mkdir -p "$REUSE_TREE/libs/api/src"
printf '%s\n' 'export const w = window.innerWidth;' > "$REUSE_TREE/libs/api/src/report.ts"
report "SC-AK-815 — серверный корень признаком среды не судится" "$(says 'raw-window')" 0

# --- SC-AK-817 — директивы своей дизайн-системы вырезаются из признаков нативных тегов --------
# Источник вида в дереве бывает не один, и директива своей системы стоит на нативном теге так же,
# как директива кнопки кита. Дерево называет их списком; не назвало — не вырезается ничего.
rm -f "$REUSE_TREE/libs/alpha/src/"*.ts
html_in field '<input vmInput name="login" />'

config_kit '[]'
report "SC-AK-817 — без объявленных директив поле остаётся расхождением" "$(says 'input')" 1

config_kit '["vmInput","vmChip"]'
report "SC-AK-817 — объявленная директива гасит признак поля" "$(says 'input')" 0

# Нативный тег без директивы виден по-прежнему: вырезается названное, а не тег целиком.
html_in bare '<input name="login" />'
report "SC-AK-817 — поле без директивы остаётся расхождением" "$(says 'input')" 1

# Вырезание кнопки, зашитое в набор, объявленные директивы не отменяют.
rm -f "$REUSE_TREE/libs/alpha/src/"*.html
html_in kit '<button rtButton>ок</button>'
report "SC-AK-817 — своё вырезание набора остаётся в силе" "$(says 'button')" 0

# --- SC-AK-874 — папка источника готового выведена из-под признака ---------------------------
#
# Дерево, которое готовое само и пишет, до этого выбирало между «шумит на каждом своём файле» и
# «молчит везде»: набор о готовом кита обращён к потребителю, а внутри самого кита обход готового
# не ловило ничто. Обратный образец пути разводит источник и потребителя внутри одного дерева.

rm -f "$REUSE_TREE/libs/alpha/src/"*.html "$REUSE_TREE/libs/alpha/src/"*.ts
mkdir -p "$REUSE_TREE/libs/alpha/src/lib/ui-kit/dynamic-input" "$REUSE_TREE/libs/alpha/src/lib/ui-kit/table"
cat > "$REUSE_TREE/tools/signals/source.json" <<'JSON'
{
    "signals": [
        { "key": "native-input", "ext": ".html", "exceptNamed": "src/lib/ui-kit/dynamic-input/", "find": "<input\\b", "instead": "поле набора" }
    ]
}
JSON
config_with '["source"]'
printf '%s\n' '<input name="login" />' > "$REUSE_TREE/libs/alpha/src/lib/ui-kit/table/t.html"
report "SC-AK-874 — внутри набора признак судит по-прежнему" "$(says 'native-input')" 1

rm -f "$REUSE_TREE/libs/alpha/src/lib/ui-kit/table/t.html"
printf '%s\n' '<input name="login" />' > "$REUSE_TREE/libs/alpha/src/lib/ui-kit/dynamic-input/i.html"
report "SC-AK-874 — папка источника готового признака не получает" "$(says 'native-input')" 0

rm -rf "$REUSE_TREE"

suite_result "проверки: единообразие"
