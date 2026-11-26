#!/usr/bin/env bash
# Обращения к владельцу на задачу по наблюдениям дерева: команда `tools/owner-touches.mjs` читает папку
# наблюдений-заготовок и печатает задачи, итог, медиану, окна разрешений и виды набранных сообщений.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "обращения к владельцу на задачу"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
CMD="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/owner-touches.mjs"
DIR="$WORK/observations"
mkdir -p "$DIR"

# RT-1: ответ в окне, одно сообщение, записанное трижды в одну секунду, и то же в файле второй раз.
# RT-2: взята, обращений нет. RT-3: два сообщения в разные секунды. Строка без задачи и битая строка.
# Окно разрешений хука — одно, хоть и лежит дважды. Строка после границы окна не считается.
cat > "$DIR/2026-11-22.jsonl" <<'EOF'
{"t":"2026-11-22T10:00:00Z","ev":"task-taken","task":"RT-1","sid":"a"}
{"t":"2026-11-22T10:01:00Z","ev":"record-menu","task":"RT-1","sid":"a"}
{"t":"2026-11-22T10:02:00.100Z","ev":"record-word","task":"RT-1","kind":"queued","about":"order","sid":"a"}
{"t":"2026-11-22T10:02:00.101Z","ev":"record-word","task":"RT-1","kind":"queued","about":"order","sid":"a"}
{"t":"2026-11-22T10:02:00.102Z","ev":"record-word","task":"RT-1","kind":"queued","about":"order","sid":"a"}
{"t":"2026-11-22T10:02:00.102Z","ev":"record-word","task":"RT-1","kind":"queued","about":"order","sid":"a"}
{"t":"2026-11-22T11:00:00Z","ev":"task-taken","task":"RT-2","sid":"b"}
{"t":"2026-11-22T12:00:00Z","ev":"record-word","task":"RT-3","kind":"typed","about":"correction","sid":"c"}
{"t":"2026-11-22T12:05:00Z","ev":"record-word","task":"RT-3","kind":"typed","about":"other","sid":"c"}
{"t":"2026-11-22T12:06:00Z","ev":"record-word","kind":"typed","about":"status","sid":"c"}
{"t":"2026-11-22T12:07:00Z","ev":"guard-ask","sid":"c"}
{"t":"2026-11-22T12:07:00Z","ev":"guard-ask","sid":"c"}
{broken
{"t":"2026-11-23T09:00:00Z","ev":"record-word","task":"RT-3","kind":"typed","about":"status","sid":"c"}
EOF

out="$(node "$CMD" --dir "$DIR" --until 2026-11-23 --json)"
report "SC-AK-2006 — повторы одного сообщения схлопнуты, задача без обращений идёт с нулём, медиана честная" \
    "$(printf '%s' "$out" | jq -c '[.tasks,.total,.median,.windows,.perTask["RT-1"],.perTask["RT-2"],.broken]')" "[3,4,2,1,2,0,1]"
report "SC-AK-2006 — виды набранных сообщений и доля прочего; строка без задачи в таблицу не идёт" \
    "$(printf '%s' "$out" | jq -c '[.kinds.correction,.kinds.order,.kinds.other,.kinds.status,.otherShare]')" "[1,1,1,0,0.33]"
report "SC-AK-2006 — граница --since отсекает раньшее" \
    "$(node "$CMD" --dir "$DIR" --since 2026-11-23 --json | jq -c '[.tasks,.total,.kinds.status]')" "[1,1,1]"
report "SC-AK-2006 — без наблюдений команда печатает нули, а не падает" \
    "$(node "$CMD" --dir "$WORK/none" --json | jq -c '[.tasks,.total,.median,.otherShare]')" "[0,0,0,null]"

suite_result "обращения к владельцу на задачу"
