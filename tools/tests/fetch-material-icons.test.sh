#!/usr/bin/env bash
# Загрузчик рисунков Material: на лишний аргумент он отказывает и не ходит в сеть, а без
# аргументов берёт имена из списка соответствий. Сеть подменена, а папка вывода — копия.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the fetch of the Material drawings: arguments, the source list, the written files"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/tools"
cp "$TOOLS/fetch-material-icons.mjs" "$WORK/tools/"
echo '{ "trash": "delete", "tag": "sell" }' > "$WORK/tools/material-icon-sources.json"
OUT="$WORK/projects/ui-kit-v2/src/assets/icons-material"

cat > "$WORK/fake-fetch.mjs" <<'JS'
import { appendFileSync } from 'node:fs';
globalThis.fetch = async (url) => {
    appendFileSync(process.env.FETCH_LOG, `${url}\n`);
    return { ok: true, status: 200, text: async () => '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><path d="M0"/></svg>' };
};
JS

fetch_run() {
    rm -rf "$OUT" "$WORK/fetch.log"
    touch "$WORK/fetch.log"
    FETCH_LOG="$WORK/fetch.log" node --import "$WORK/fake-fetch.mjs" "$WORK/tools/fetch-material-icons.mjs" "$@" > "$WORK/out.log" 2>&1
    echo "$? $(wc -l < "$WORK/fetch.log" | tr -d ' ') $(ls "$OUT" 2>/dev/null | wc -l | tr -d ' ')"
}

report "a flag refuses with no request and no file" "$(fetch_run --help)" "2 0 0"
report "a word refuses the same way" "$(fetch_run all)" "2 0 0"
report "with no argument two drawings per listed name are written" "$(fetch_run)" "0 4 4"
report "the file is named by the kit name" "$(ls "$OUT" | tr '\n' ' ')" "tag.fill.svg tag.svg trash.fill.svg trash.svg "
report "the request goes by the Material name" "$(grep -c '/sell/materialsymbolsoutlined/sell_' "$WORK/fetch.log")" "2"
report "the written drawing takes the text colour" "$(grep -c 'fill="currentColor"' "$OUT/trash.svg")" "1"

echo '{}' > "$WORK/tools/material-icon-sources.json"
report "an empty source list refuses with no request" "$(fetch_run)" "1 0 0"

suite_result "fetch-material-icons"
