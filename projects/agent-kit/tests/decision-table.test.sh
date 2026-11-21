#!/usr/bin/env bash
# Сценарии таблицы решений хуков пакета: таблица называет каждый хук, совпадает с их решениями,
# не оставляет состояния без законного хода, и отказ называет ход, который в том же состоянии
# разрешён. Цепочки выводятся из таблицы, и у каждой есть сценарий и случай здесь.
#
# Набор судит настоящую таблицу пакета и рядом — маленькие таблицы-образцы. Образцы нужны для
# парной проверки: зелёный перебор на настоящей таблице ничего не говорит, пока не видно, что на
# таблице с тупиком тот же перебор краснеет.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "таблица решений хуков"

TABLE_CMD="$ASSETS/checks/decision-table.mjs"
# The scenarios are read by an absolute path: the suite runs from any directory, and the check's
# default is relative to the directory it is called from.
SCENARIOS_MD="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/docs/specs/agent-kit/decision-table/scenarios.md"
export RT_DECISION_SCENARIOS="$SCENARIOS_MD"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

dt() { node "$TABLE_CMD" "$@" 2>&1; }
last() { dt "$@" | tail -1; }

# --- SC-AK-1562 — каждый хук пакета назван таблицей ---------------------------------------------
report "SC-AK-1562 — таблица разбирается" "$(last --validate | sed -E 's/^rows [0-9]+, //')" "problems 0"
# Копия, разложенная в дерево, несёт шапку раскладки первой строкой — таблица читается и с ней.
{ printf '# rt-kit v0.0.0 · checks/decision-table.json · 000000000000\n'; cat "$ASSETS/checks/decision-table.json"; } >"$TMP/laid.json"
report "SC-AK-1562 — таблица с шапкой раскладки разбирается" \
    "$(RT_DECISION_TABLE="$TMP/laid.json" node "$TABLE_CMD" --validate | tail -1 | sed -E 's/^rows [0-9]+, //')" "problems 0"
got="$(last --coverage)"
printf '%s' "$got" | grep -qE '^deciding ([0-9]+) of \1, helpers [0-9]+$' && got=ok
report "SC-AK-1562 — у каждой решающей проверки есть строка, у помощника — пометка" "$got" ok

# --- SC-AK-1563 — строка совпадает с решением самого хука ----------------------------------------
conform_out="$(dt --conform)"
got="$(printf '%s\n' "$conform_out" | tail -1)"
# A red sweep prints the rows that diverged: the last line alone does not say which hook to read.
printf '%s' "$got" | grep -qE '^rows [1-9][0-9]*, mismatch 0$' && got=ok || printf '%s\n' "$conform_out" | head -20 >&2
report "SC-AK-1563 — каждая строка сверена запуском хука" "$got" ok

# --- SC-AK-1798 — переменные конвейера не доходят до хука пробы ------------------------------------
# Хук отправки пропускает всё под `CI`. Таблица из двух его строк отказа, сверенная под переменными
# конвейера, держит тот же отказ: проба судит хук так, как его видит сессия.
jq '(.rows |= map(select(.hook == "pre-push.sh"))) | .states = [] | (.hooks |= map(select(.file == "pre-push.sh")))' \
    "$ASSETS/checks/decision-table.json" >"$TMP/pre-push.json"
report "SC-AK-1798 — сверка под переменными конвейера не расходится" \
    "$(CI=true GITHUB_ACTIONS=true RT_DECISION_TABLE="$TMP/pre-push.json" node "$TABLE_CMD" --conform | tail -1)" "rows 2, mismatch 0"

# --- SC-AK-1564, 1565 — тупиков нет, отказ называет разрешённый ход ------------------------------
report "SC-AK-1564, SC-AK-1565 — перебор настоящей таблицы" "$(last --walk)" "dead 0, unnamed 0"

# Образец с цепочкой: отказ a называет ход, который в том же состоянии запрещает b.
cat >"$TMP/chain.json" <<'EOF'
{"areas":{"x":{"facts":{"f":["yes","no"]},"actions":["edit","fix","ask"],"ask":"ask"}},
 "hooks":[{"file":"a.sh","kind":"guard"},{"file":"b.sh","kind":"guard"}],
 "rows":[{"hook":"a.sh","area":"x","when":{"f":"no"},"action":"edit","decision":"deny","move":"fix"},
         {"hook":"b.sh","area":"x","when":{"f":"no"},"action":"fix","decision":"deny","move":"ask"}]}
EOF
report "SC-AK-1565 — образец с цепочкой краснеет" \
    "$(RT_DECISION_TABLE="$TMP/chain.json" node "$TABLE_CMD" --walk | tail -1)" "dead 0, unnamed 1"

# Образец с цепочкой между областями: отказ области x называет ход, который запрещает хук области y
# при том же факте. Перебор по одной области его не видел.
cat >"$TMP/cross.json" <<'EOF'
{"areas":{"x":{"facts":{"f":["yes","no"]},"actions":["edit","ask"],"ask":"ask"},
          "y":{"facts":{"f":["yes","no"]},"actions":["fix","ask"],"ask":"ask"}},
 "hooks":[{"file":"a.sh","kind":"guard"},{"file":"b.sh","kind":"guard"}],
 "rows":[{"hook":"a.sh","area":"x","when":{"f":"no"},"action":"edit","decision":"deny","move":"fix"},
         {"hook":"b.sh","area":"y","when":{"f":"no"},"action":"fix","decision":"deny","move":"ask"}]}
EOF
report "SC-AK-1565 — образец с цепочкой между областями краснеет" \
    "$(RT_DECISION_TABLE="$TMP/cross.json" node "$TABLE_CMD" --walk | tail -1)" "dead 0, unnamed 1"

# Образец с тупиком: в состоянии f=no запрещено всё.
cat >"$TMP/dead.json" <<'EOF'
{"areas":{"x":{"facts":{"f":["yes","no"]},"actions":["edit","ask"],"ask":"ask"}},
 "hooks":[{"file":"a.sh","kind":"guard"}],
 "rows":[{"hook":"a.sh","area":"x","when":{"f":"no"},"action":"edit","decision":"deny","move":"ask"},
         {"hook":"a.sh","area":"x","when":{"f":"no"},"action":"ask","decision":"deny","move":"edit"}]}
EOF
report "SC-AK-1564 — образец с тупиком краснеет" \
    "$(RT_DECISION_TABLE="$TMP/dead.json" node "$TABLE_CMD" --walk | tail -1 | cut -d, -f1)" "dead 1"

# --- SC-AK-1566 — состояние «только спросить» названо отдельно -----------------------------------
report "SC-AK-1566 — образец с цепочкой даёт состояние «только спросить»" \
    "$(RT_DECISION_TABLE="$TMP/chain.json" node "$TABLE_CMD" --walk | grep -oE 'ask-only [0-9]+')" "ask-only 1"
got="$(dt --walk | grep -oE 'ask-only [0-9]+')"
report "SC-AK-1566 — настоящая таблица печатает число состояний «только спросить»" \
    "$(printf '%s' "$got" | grep -cE '^ask-only [0-9]+$')" 1

# --- SC-AK-1567 — у каждой цепочки есть сценарий, и она разведена ---------------------------------
got="$(last --chains)"
printf '%s' "$got" | grep -qE '^derived ([0-9]+), scenarios \1, uncovered 0$' && got=ok
report "SC-AK-1567 — у каждой выведенной цепочки есть сценарий" "$got" ok

# Случай на каждую цепочку: условия отказа и строки, запрещающей его ход, не встречаются. Номер
# случая — номер сценария, где цепочка записана: SC-AK-1570, SC-AK-1571, SC-AK-1572, SC-AK-1573,
# SC-AK-1574, SC-AK-1575, SC-AK-1576, SC-AK-1577, SC-AK-1578, SC-AK-1579, SC-AK-1580, SC-AK-1581,
# SC-AK-1582, SC-AK-1583, SC-AK-1584, SC-AK-1585, SC-AK-1586, SC-AK-1587, SC-AK-1589, SC-AK-1590,
# SC-AK-1591, SC-AK-1593.
# Две строки одного хука и действия различаются условиями, поэтому пара id проверяется по всем
# парам строк за ней: «no» — ни в одной условия не встречаются.
while IFS=$'\t' read -r sc id met; do
    [ -n "$id" ] || continue
    report "${sc:-SC-AK-1567} — цепочка разведена: $id" "$met" "no"
done < <(node --input-type=module -e "
import { chainsOf, chainItems, meet, rowId, withDecided } from '$TABLE_CMD';
import { readFileSync } from 'node:fs';
// The pairs are taken over the rows the hooks meet: the stored ones and those the decider computes.
const table = withDecided(JSON.parse(readFileSync('$ASSETS/checks/decision-table.json', 'utf8')));
const text = readFileSync('$SCENARIOS_MD', 'utf8');
const scOf = (c) => {
    let sc = '';
    for (const part of text.split(/^(?=### SC-AK-)/m)) {
        const head = part.match(/^### (SC-AK-\d+)/);
        if (head && chainItems(part).some((i) => i.startsWith('- \`' + rowId(c.row) + '\`') && i.includes('\`' + rowId(c.other) + '\`'))) sc = head[1];
    }
    return sc;
};
const cond = (r) => Object.fromEntries(Object.entries(r.when ?? {}).map(([k, v]) => [k, [v].flat()]));
const byId = new Map();
for (const c of chainsOf(table)) {
    const seen = byId.get(c.id) ?? { sc: scOf(c), met: false };
    seen.met ||= meet(cond(c.row), cond(c.other));
    byId.set(c.id, seen);
}
for (const [id, { sc, met }] of byId) console.log(sc + '\t' + id + '\t' + (met ? 'yes' : 'no'));
")

# --- SC-AK-1568 — правка любого хука выбирает этот набор ------------------------------------------
got="$(cd "$(dirname "${BASH_SOURCE[0]}")" && printf 'projects/agent-kit/assets/hooks/rerun-guard.sh\n' | bash select-suites.sh | grep -c 'decision-table.test.sh')"
report "SC-AK-1568 — правка хука выбирает набор таблицы" "$got" 1

# --- SC-AK-1569 — хук, снятый деревом, не делает покрытие красным ---------------------------------
mkdir -p "$TMP/hooks"
cp "$ASSETS/hooks/"*.sh "$ASSETS/hooks/"*.md "$TMP/hooks/"
rm -f "$TMP/hooks/rerun-guard.sh"
got="$(RT_DECISION_HOOKS="$TMP/hooks" node "$TABLE_CMD" --coverage | grep -c 'skipped by the tree: 1')"
report "SC-AK-1569 — снятый деревом хук назван, а не отказан" "$got" 1
RT_DECISION_HOOKS="$TMP/hooks" node "$TABLE_CMD" --coverage >/dev/null 2>&1
report "SC-AK-1569 — покрытие в дереве со снятым хуком зелёное" "$?" 0

suite_result "таблица решений хуков"
