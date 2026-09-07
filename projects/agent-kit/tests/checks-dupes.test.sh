#!/usr/bin/env bash
# Сценарии признака повтора таблиц соответствий: точная копия, разошедшаяся и две разные
# таблицы. Полное равенство было слепо ровно там, где копия разошлась с оригиналом на строку.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: повторы"

DUPES_TREE="$(mktemp -d)"
mkdir -p "$DUPES_TREE/tools" "$DUPES_TREE/.claude/rt-kit" \
    "$DUPES_TREE/libs/alpha/src" "$DUPES_TREE/libs/beta/src"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-dupes.mjs" "$DUPES_TREE/tools/"
printf '{"sourceRoots":["libs"],"allowlistDir":"tools","board":{"taskKey":"RT"}}\n' \
    > "$DUPES_TREE/.claude/rt-kit/checks.json"

table_in() {
    printf 'export const %s = {\n%s} as const;\n' "$2" "$3" > "$DUPES_TREE/libs/$1/src/table.ts"
}

dupes_says() {
    (cd "$DUPES_TREE" && node tools/check-dupes.mjs 2>&1) | grep -cE "$1"
}

SIX="    draft: 'черновик',\n    review: 'разбор',\n    ready: 'готово',\n    merged: 'влито',\n    closed: 'закрыто',\n    stale: 'протухло',\n"
SIX_ONE_APART="    draft: 'черновик',\n    review: 'разбор',\n    ready: 'готово',\n    merged: 'влито',\n    closed: 'закрыто',\n    frozen: 'заморожено',\n"
OTHER="    alpha: 'первая',\n    beta: 'вторая',\n    gamma: 'третья',\n    delta: 'четвёртая',\n    epsilon: 'пятая',\n    zeta: 'шестая',\n"

table_in alpha STATE_LABELS "$(printf "$SIX")"
table_in beta STATUS_LABELS "$(printf "$SIX")"
report "SC-AK-596 — точная копия таблицы названа" "$(dupes_says 'one table of matches')" 1

table_in beta STATUS_LABELS "$(printf "$SIX_ONE_APART")"
report "SC-AK-597 — копия, разошедшаяся на пару, названа" "$(dupes_says 'diverged on 1 of 6 pairs')" 1

table_in beta STATUS_LABELS "$(printf "$OTHER")"
report "SC-AK-598 — две разные таблицы повтором не считаются" "$(dupes_says 'one table of matches')" 0

rm -rf "$DUPES_TREE"

suite_result "проверки: повторы"
