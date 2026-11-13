#!/usr/bin/env bash
# Scenarios of the time limit of a push set step: a check that passed over the limit the tree
# measured for it is red, and a check with no limit is green however long it took.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the push set: a check over its time limit"

over() {
    (
        # shellcheck disable=SC1091
        . "$HOOKS/git-guard-push-marks.sh"
        rt_push_check_budget() { case "$1" in 'node tools/check-a.mjs') echo 12 ;; esac; }
        rt_push_over_budget_words() { printf '%s\n' 'the owner word'; }
        rt_push_over_budget "$1" "$2"
    )
}

said() { printf '%s' "$1" | grep -qF -- "$2" && printf yes || printf no; }

report "SC-AK-1350 — a check over its limit is refused" "$(said "$(over 'node tools/check-a.mjs' 13)" 'over the time limit')" yes
report "SC-AK-1350 — the refusal names the time it took" "$(said "$(over 'node tools/check-a.mjs' 13)" '13s')" yes
report "SC-AK-1350 — the refusal names the limit" "$(said "$(over 'node tools/check-a.mjs' 13)" 'against 12s')" yes
report "SC-AK-1350 — the refusal carries the tree's words" "$(said "$(over 'node tools/check-a.mjs' 13)" 'the owner word')" yes
report "SC-AK-1350 — a check at its limit is green" "[$(over 'node tools/check-a.mjs' 12)]" '[]'
report "SC-AK-1350 — a check with no limit is green however long" "[$(over 'docker build .' 9999)]" '[]'

# The package default is silent: a tree that measured nothing gets no limit at all.
silent="$(
    # shellcheck disable=SC1091
    . "$ASSETS/defaults/push.sh" 2>/dev/null
    rt_push_check_budget() { rt_push_check_budget_default "$@"; }
    # shellcheck disable=SC1091
    . "$HOOKS/git-guard-push-marks.sh"
    rt_push_over_budget 'node tools/check-a.mjs' 9999
)"
report "SC-AK-1350 — the package default sets no limit" "[$silent]" '[]'

suite_result "push-over-budget"
