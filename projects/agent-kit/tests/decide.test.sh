#!/usr/bin/env bash
# Сценарии решателя: ответ по таблице для хука, действия и фактов. Решатель отвечает за каждую строку
# таблицы так, как она записана, а строки «сначала отказ соседа» вычисляет сам — набор убирает их из
# таблицы перед прогоном и сверяет вычисленный текст с записанным. Последняя строка набора —
# `rows N, ok M`: её читает проверка шага плана.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "решатель по таблице"

DECIDE="$ASSETS/checks/decide.mjs"
TABLE_JSON="$ASSETS/checks/decision-table.json"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Каждая записанная строка воспроизведена решателем как есть, и каждое состояние таблицы получает
# отказ, который несёт свой образец и отказ соседа: строк «сначала отказ соседа» в таблице нет.
counts="$(DECIDE="$DECIDE" TABLE_JSON="$TABLE_JSON" node --input-type=module -e '
const { readFileSync } = await import("node:fs");
const { decide } = await import(process.env.DECIDE);
const table = JSON.parse(readFileSync(process.env.TABLE_JSON, "utf8").replace(/^#[^\n]*\n/, ""));
let ok = 0;
for (const r of table.rows) {
    const d = decide(table, { hook: r.hook, action: r.action, facts: r.when ?? {} });
    const same = d && d.decision === r.decision && d.text === (r.text ?? "") && (d.move ?? null) === (r.move ?? null);
    if (same) ok++;
    else console.error(`  diverges: ${r.hook} ${r.action} ${JSON.stringify(r.when)}`);
}
for (const s of table.states ?? []) {
    const d = decide(table, { hook: s.hook, action: s.action, facts: s.when ?? {} });
    const same = d && d.decision === "deny" && new RegExp(s.says).test(d.text) && /this comes first/.test(d.text);
    if (same) ok++;
    else console.error(`  state diverges: ${s.hook} ${s.action} ${JSON.stringify(s.when)}`);
}
console.log(`${table.rows.length + (table.states ?? []).length} ${ok}`);
')"
rows="${counts% *}"
ok="${counts#* }"
report "решатель отвечает за каждую строку таблицы так, как она записана" "$ok" "$rows"

# Отказ проверки вне таблицы — молчание: решатель отвечает только за то, что в ней есть.
report "действие без строки не отказано" "$(node "$DECIDE" '{"hook":"exam-guard.sh","action":"no_such_action","facts":{}}')" ""

# Под обвязкой переворот строки делает её решение «разрешено»: на этом стоит проверка --mutate.
key="$(TABLE_JSON="$TABLE_JSON" node -e '
const t = JSON.parse(require("fs").readFileSync(process.env.TABLE_JSON, "utf8").replace(/^#[^\n]*\n/, ""));
const r = t.rows.find((x) => x.hook === "browser-guard-no-listing.sh");
process.stdout.write(`${r.area}|${r.hook}|${r.action}|${JSON.stringify(Object.fromEntries(Object.entries(r.when ?? {}).sort()))}`);
')"
query="$(TABLE_JSON="$TABLE_JSON" node -e '
const t = JSON.parse(require("fs").readFileSync(process.env.TABLE_JSON, "utf8").replace(/^#[^\n]*\n/, ""));
const r = t.rows.find((x) => x.hook === "browser-guard-no-listing.sh");
process.stdout.write(JSON.stringify({ hook: r.hook, action: r.action, facts: r.when }));
')"
report "строка без переворота отказывает" "$(node "$DECIDE" "$query" | jq -r .decision)" deny
report "перевёрнутая строка разрешает" "$(RT_KIT_TEST=1 RT_DECISION_FLIP="$key" node "$DECIDE" "$query")" ""
report "переворот вне обвязки не действует" "$(env -u RT_KIT_TEST RT_DECISION_FLIP="$key" node "$DECIDE" "$query" | jq -r .decision)" deny

# FAIL-OPEN: сломанная таблица и сломанный запрос — молчание и код 0, хук пропускает действие.
printf 'not json' > "$TMP/broken.json"
out="$(RT_DECISION_TABLE="$TMP/broken.json" node "$DECIDE" "$query")"
code=$?
report "сломанная таблица — молчание" "$out" ""
report "сломанная таблица — код 0" "$code" 0
report "сломанный запрос — молчание" "$(node "$DECIDE" '{oops')" ""

# rt_decide в хуке: отказ таблицы — JSON решения и код 1; разрешение — молчание и код 0.
dec_out="$(. "$HOOKS/decide.sh"; rt_decide browser-guard-no-listing.sh "$(printf '%s' "$query" | jq -r .action)" "$(printf '%s' "$query" | jq -c .facts)")"
dec_code=$?
report "rt_decide: отказ выдан решением JSON" "$(printf '%s' "$dec_out" | jq -r .hookSpecificOutput.permissionDecision)" deny
report "rt_decide: отказ — код 1" "$dec_code" 1
report "rt_decide: текст несёт общий хвост" "$(printf '%s' "$dec_out" | jq -r .hookSpecificOutput.permissionDecisionReason | grep -c 'Two moves from here')" 1
report "rt_decide: ход, которого нет в таблице, — молчание" "$(. "$HOOKS/decide.sh"; rt_decide browser-guard-no-listing.sh no_such_action '{}')" ""
stop_out="$(. "$HOOKS/decide.sh"; rt_decide browser-guard-no-listing.sh "$(printf '%s' "$query" | jq -r .action)" "$(printf '%s' "$query" | jq -c .facts)" '{}' Stop)"
report "rt_decide: хук Stop получает форму block" "$(printf '%s' "$stop_out" | jq -r .decision)" block

# FAIL-OPEN хука: решателя нет — молчание и код 0, действие пропущено.
mkdir -p "$TMP/bare/hooks"
cp "$HOOKS/decide.sh" "$TMP/bare/hooks/"
bare_out="$(cd "$TMP/bare" && CLAUDE_PROJECT_DIR="$TMP/bare" bash -c ". hooks/decide.sh; rt_decide x.sh y '{}'")"
bare_code=$?
report "rt_decide без решателя — молчание" "$bare_out" ""
report "rt_decide без решателя — код 0" "$bare_code" 0
broken_out="$(RT_DECISION_TABLE="$TMP/broken.json" bash -c ". '$HOOKS/decide.sh'; rt_decide browser-guard-no-listing.sh x '{}'")"
broken_code=$?
report "rt_decide со сломанной таблицей — молчание и код 0" "$broken_out:$broken_code" ":0"

[ "$code" = 0 ] && [ -z "$out" ] && [ "$bare_code" = 0 ] && [ -z "$bare_out" ] && [ "$broken_code" = 0 ] && echo "FAIL-OPEN ok"

suite_result "решатель по таблице"
result=$?
echo "rows $rows, ok $ok"
exit "$result"
