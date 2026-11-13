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

report "SC-AK-1350 — a check over its limit is refused" "$(said "$(over 'node tools/check-a.mjs' 14)" 'over the time limit')" yes
report "SC-AK-1350 — the refusal names the time it took" "$(said "$(over 'node tools/check-a.mjs' 14)" '14s')" yes
report "SC-AK-1350 — the refusal names the limit" "$(said "$(over 'node tools/check-a.mjs' 14)" 'against 12s')" yes
report "SC-AK-1350 — the refusal carries the tree's words" "$(said "$(over 'node tools/check-a.mjs' 14)" 'the owner word')" yes
report "SC-AK-1350 — a check at its limit is green" "[$(over 'node tools/check-a.mjs' 12)]" '[]'
# No margin: the owner's word is that a limit is only ever lowered, and a margin raises it.
report "SC-AK-1350 — one second over the limit is refused" "$(said "$(over 'node tools/check-a.mjs' 13)" 'over the time limit')" yes
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

whole() {
    (
        # shellcheck disable=SC1091
        . "$HOOKS/git-guard-push-marks.sh"
        rt_push_set_budget() { echo 440; }
        rt_push_over_budget_words() { printf '%s\n' 'the owner word'; }
        rt_push_set_over_budget "$1"
    )
}

report "SC-AK-1351 — a whole set over its limit is refused" "$(said "$(whole 441)" 'the push went over its time limit')" yes
report "SC-AK-1351 — the refusal names both numbers" "$(said "$(whole 441)" '441s against 440s')" yes
report "SC-AK-1351 — the refusal asks why before the next push" "$(said "$(whole 441)" 'before the next push')" yes
report "SC-AK-1351 — the refusal carries the tree's words" "$(said "$(whole 441)" 'the owner word')" yes
report "SC-AK-1351 — a whole set at its limit is green" "[$(whole 440)]" '[]'
whole_silent="$(
    # shellcheck disable=SC1091
    . "$ASSETS/defaults/push.sh" 2>/dev/null
    rt_push_set_budget() { rt_push_set_budget_default "$@"; }
    # shellcheck disable=SC1091
    . "$HOOKS/git-guard-push-marks.sh"
    rt_push_set_over_budget 99999
)"
report "SC-AK-1351 — the package default sets no whole limit" "[$whole_silent]" '[]'

# A set over the limit leaves no marks: the second push of the same code runs it again instead of
# passing by marks, so the refusal is not lifted by repeating the push.
dropped="$(
    markdir="$(mktemp -d)"
    # shellcheck disable=SC1091
    . "$HOOKS/git-guard-push-marks.sh"
    rt_push_mark_key() { printf 'k-%s' "$(printf '%s' "$1" | cksum | cut -d' ' -f1)"; }
    rt_push_mark_dir() { printf '%s' "$markdir"; }
    touch "$markdir/$(rt_push_mark_key 'node tools/check-a.mjs' main)" "$markdir/$(rt_push_mark_key 'node tools/check-b.mjs' main)"
    rt_push_mark_drop 'node tools/check-a.mjs' main
    ls "$markdir" | wc -l | tr -d ' '
    rm -rf "$markdir"
)"
report "SC-AK-1351 — a dropped mark is gone and the other stays" "$dropped" 1
calls_drop() { grep -c 'rt_push_mark_drop "\$check" "\$base"' "$HOOKS/$1" 2>/dev/null; }
report "SC-AK-1351 — the run ahead drops this run's marks when over" "$(calls_drop git-guard-push-ahead.sh)" 1
report "SC-AK-1351 — the session and git hook runner drops this run's marks when over" "$(calls_drop push-set.sh)" 1

# Both runners call the whole limit: one left without it lets the long push through by its path.
calls() { grep -c 'rt_push_set_over_budget "\$set_took"' "$HOOKS/$1" 2>/dev/null; }
report "SC-AK-1351 — the run ahead judges the whole set" "$(calls git-guard-push-ahead.sh)" 1
report "SC-AK-1351 — the session and git hook runner judges the whole set" "$(calls push-set.sh)" 1

suite_result "push-over-budget"
