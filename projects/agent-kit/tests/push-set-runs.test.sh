#!/usr/bin/env bash
# The run line of a push set step: what the marks of the day keep about every run, so that a repeat
# on the same tree and a run on a change that did not touch the subject can be told apart.
#
# Scenarios of the agreement: SC-AK-1657, SC-AK-1667.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the run line of a push set step"

tree="$(fixture_repo_branched main work)"
trap 'rm -rf "$tree"' EXIT
marks="$tree/.claude/rt-kit/observations/.marks"

note() {
    CLAUDE_PROJECT_DIR="$tree" bash -c '. "$1/metric-marks.sh"; rt_run_note "$2" "$(($(date +%s) - 3))" "$3" "$4" "$5" "$6"' \
        _ "$HOOKS" "$@"
}
line_of() { tail -n 1 "$marks"/runs-* 2>/dev/null; }
id_of() { bash -c '. "$1/metric-marks.sh"; rt_check_id "$2"' _ "$HOOKS" "$1"; }

note sign-one green 'node tools/check-specs.mjs' origin/main touched
line="$(line_of)"
report "SC-AK-1657 — the run line holds seven fields" "$(printf '%s\n' "$line" | awk '{ print NF }')" 7
report "SC-AK-1657 — the run line holds the moment of the run" \
    "$(printf '%s\n' "$line" | awk -v now="$(date +%s)" '{ print ($5 > now - 60 && $5 <= now) ? "yes" : "no" }')" yes
report "SC-AK-1657 — the run line holds the checksum of the base" \
    "$(printf '%s\n' "$line" | awk '{ print $6 }')" "$(printf '%s' origin/main | cksum | cut -d' ' -f1)"
report "SC-AK-1657 — the run line holds the subject mark" "$(printf '%s\n' "$line" | awk '{ print $7 }')" touched

note sign-one not-run 'node tools/check-texts.mjs' origin/main not-run
report "SC-AK-1657 — a step the set did not start leaves a line of its own" \
    "$(line_of | awk '{ print $3, $7 }')" "not-run not-run"
report "SC-AK-1657 — a step the set did not start leaves no observation" \
    "$(cat "$tree"/.claude/rt-kit/observations/*.jsonl 2>/dev/null | grep -c '"ev":"run"')" 1

note sign-one green 'node tools/check-specs.mjs'
report "SC-AK-1657 — a run without a base or a subject says so" "$(line_of | awk '{ print $7 }')" unknown

main_hooks='RT_SUITES_BASE=origin/main pnpm exec nx affected -t test-hooks --base=origin/main'
epic_hooks='RT_SUITES_BASE=origin/RT-1-x pnpm exec nx affected -t test-hooks --base=origin/RT-1-x'
report "SC-AK-1667 — one check on two bases has one checksum" \
    "$([ "$(id_of "$main_hooks")" = "$(id_of "$epic_hooks")" ] && echo same || echo differs)" same
report "SC-AK-1667 — two checks on one base keep two checksums" \
    "$([ "$(id_of "$main_hooks")" = "$(id_of 'pnpm exec nx affected -t verify --base=origin/main')" ] && echo same || echo differs)" differs

note sign-two red "$main_hooks" origin/main idle
note sign-two green "$epic_hooks" origin/RT-1-x idle
report "SC-AK-1667 — the runs of one check on two bases carry one checksum in the marks" \
    "$(grep -c "^sign-two $(id_of "$main_hooks") " "$marks"/runs-*)" 2

suite_result "the run line of a push set step"
