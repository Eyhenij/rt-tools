#!/usr/bin/env bash
# The selection of the cards that move to «Deployed» after a rollout: what moves, what stays.
#
# The mechanics only: the rows are given by hand, the host is not asked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the cards that move to Deployed after a rollout"

pick() {
    node --input-type=module -e "
        import { deployedMoves } from '$TOOLS/board-deployed.mjs';
        const rows = JSON.parse(process.argv[1]);
        console.log(deployedMoves(rows, 'Done').map((row) => row.number).join(','));
    " "$1"
}

# A closed task without an epic, in Done — moves.
report "a closed task in Done moves" \
    "$(pick '[{"status":"Done","kind":"Issue","number":1,"state":"CLOSED","parentState":null}]')" "1"

# A closed task of an epic that is still open — stays: it reached the epic branch, not main.
report "a closed task of an open epic stays" \
    "$(pick '[{"status":"Done","kind":"Issue","number":2,"state":"CLOSED","parentState":"OPEN"}]')" ""

# A closed task of a closed epic — moves with the epic.
report "a closed task of a closed epic moves" \
    "$(pick '[{"status":"Done","kind":"Issue","number":3,"state":"CLOSED","parentState":"CLOSED"}]')" "3"

# An open task in Done — a discrepancy of the queue, not a rollout; stays.
report "an open task in Done stays" \
    "$(pick '[{"status":"Done","kind":"Issue","number":4,"state":"OPEN","parentState":null}]')" ""

# A closed task in another column — the rollout does not judge it.
report "a closed task outside Done stays" \
    "$(pick '[{"status":"In review","kind":"Issue","number":5,"state":"CLOSED","parentState":null}]')" ""

# A PR card in Done — no task behind it; stays.
report "a PR card in Done is not judged" \
    "$(pick '[{"status":"Done","kind":"PullRequest","number":6,"state":null,"parentState":null}]')" ""

# Several at once — the order of the rows is kept.
report "the order of the rows is kept" \
    "$(pick '[{"status":"Done","kind":"Issue","number":7,"state":"CLOSED","parentState":null},{"status":"Done","kind":"Issue","number":8,"state":"CLOSED","parentState":"OPEN"},{"status":"Done","kind":"Issue","number":9,"state":"CLOSED","parentState":"CLOSED"}]')" "7,9"

suite_result "board-deployed"
