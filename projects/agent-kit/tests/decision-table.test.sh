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
got="$(last --coverage)"
printf '%s' "$got" | grep -qE '^deciding ([0-9]+) of \1, helpers [0-9]+$' && got=ok
report "SC-AK-1562 — у каждой решающей проверки есть строка, у помощника — пометка" "$got" ok

# --- SC-AK-1563 — строка совпадает с решением самого хука ----------------------------------------
got="$(last --conform)"
printf '%s' "$got" | grep -qE '^rows [1-9][0-9]*, mismatch 0$' && got=ok
report "SC-AK-1563 — каждая строка сверена запуском хука" "$got" ok

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
# SC-AK-1582, SC-AK-1583, SC-AK-1584, SC-AK-1585, SC-AK-1586, SC-AK-1587.
while IFS=$'\t' read -r id met; do
    [ -n "$id" ] || continue
    sc="$(awk -v id="\`$id\`" '/^### SC-AK-/ { n = $2 } index($0, id) { print n; exit }' "$SCENARIOS_MD" 2>/dev/null)"
    report "${sc:-SC-AK-1567} — цепочка разведена: $id" "$met" "no"
done < <(node --input-type=module -e "
import { chainsOf, meet } from '$TABLE_CMD';
import { readFileSync } from 'node:fs';
const table = JSON.parse(readFileSync('$ASSETS/checks/decision-table.json', 'utf8'));
const cond = (r) => Object.fromEntries(Object.entries(r.when ?? {}).map(([k, v]) => [k, [v].flat()]));
for (const c of chainsOf(table)) console.log(c.id + '\t' + (meet(cond(c.row), cond(c.other)) ? 'yes' : 'no'));
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
