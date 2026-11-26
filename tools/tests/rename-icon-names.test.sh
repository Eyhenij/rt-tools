#!/usr/bin/env bash
# Переходный скрипт замены имён значков: что он меняет сам, что оставляет человеку и когда отказывает.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/package" "$WORK/app/node_modules/x"
cp "$ROOT/projects/ui-kit-v2/migrations/rename-icon-names.mjs" "$ROOT/projects/ui-kit-v2/migrations/icon-names.json" "$WORK/package/"

cat > "$WORK/app/page.html" <<'HTML'
<rt-icon glyph="delete" />
<button rtButton icon="add" [disabled]="a > b">Добавить</button>
<rt-icon glyph="info" />
<mat-icon icon="delete"></mat-icon>
<rt-icon [glyph]="'done'" />
<rt-icon glyph="pets" />
<rt-icon glyph="delete" glyphStrategy="font" />
<rt-icon glyph="done" [glyphStrategy]="mode" />
<rt-icon class=wide glyph=delete />
HTML
cat > "$WORK/app/menu.ts" <<'TS'
export const ITEMS = [{ icon: 'settings' }];
export const LABEL = 'delete';
TS
cp "$WORK/app/page.html" "$WORK/app/node_modules/x/page.html"
cp "$WORK/app/page.html" "$WORK/before.html"

failed=0
check() {
    if [ "$2" = "$3" ]; then
        echo "ok - $1"
    else
        echo "FAIL - $1: ожидалось «$2», получено «$3»"
        failed=1
    fi
}

run() { node "$WORK/package/rename-icon-names.mjs" "$@" > "$WORK/out.log" 2>&1; echo $?; }

check 'без --write выход нулевой' 0 "$(run "$WORK/app")"
check 'без --write файл не меняется' '' "$(diff "$WORK/before.html" "$WORK/app/page.html")"
check 'без --write названы три автоматические замены, одна без кавычек' 3 "$(grep -c '^заменит: ' "$WORK/out.log")"
check 'ручных мест шесть: info, чужой тег, выражение, свойство объекта и два тега со своим способом' 6 "$(grep -c '^вручную: ' "$WORK/out.log")"
check 'строка без слова о значке не названа' 0 "$(grep -c 'menu.ts:2' "$WORK/out.log")"

check 'с --write выход нулевой' 0 "$(run --write "$WORK/app")"
cat > "$WORK/expected.html" <<'HTML'
<rt-icon glyph="trash" />
<button rtButton icon="ico-plus" [disabled]="a > b">Добавить</button>
<rt-icon glyph="info" />
<mat-icon icon="delete"></mat-icon>
<rt-icon [glyph]="'done'" />
<rt-icon glyph="pets" />
<rt-icon glyph="delete" glyphStrategy="font" />
<rt-icon glyph="done" [glyphStrategy]="mode" />
<rt-icon class=wide glyph=trash />
HTML
check 'с --write заменены только атрибуты кита' '' "$(diff "$WORK/expected.html" "$WORK/app/page.html")"
check 'свойство объекта не тронуто' 1 "$(grep -c "icon: 'settings'" "$WORK/app/menu.ts")"
check 'node_modules не обходится' '' "$(diff "$WORK/before.html" "$WORK/app/node_modules/x/page.html")"

check 'незнакомый ключ отказывает' 2 "$(run --wirte "$WORK/app")"
check 'без пути отказывает' 2 "$(run --write)"
check 'справка называет стратегию font' 1 "$(run --help > /dev/null; grep -c "glyphStrategy: 'font'" "$WORK/out.log")"

echo '[]' > "$WORK/package/icon-names.json"
check 'пустой файл пар отказывает' 2 "$(run "$WORK/app")"

exit "$failed"
