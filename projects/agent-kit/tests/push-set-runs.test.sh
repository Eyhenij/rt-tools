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

# --- both runners of the set write the line ------------------------------------------------------
# A tree with a profile of two steps: one of the table of reads, which reads the texts of `docs/`,
# and one the profile declares a subject for.
set_tree="$(fixture_repo_branched main work)"
trap 'rm -rf "$tree" "$set_tree"' EXIT
mkdir -p "$set_tree/tools" "$set_tree/docs" "$set_tree/src" "$set_tree/.claude/rt-kit"
cp "$ASSETS/checks/push-inputs.mjs" "$ASSETS/checks/push-trace.mjs" "$set_tree/tools/"
printf "import { readFileSync } from 'node:fs';\nreadFileSync('docs/a.md', 'utf8');\n" >"$set_tree/tools/check-texts.mjs"
printf 'a\n' >"$set_tree/docs/a.md"
cat >"$set_tree/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() { printf '%s\n' 'node tools/check-texts.mjs' 'true # hooks'; }
rt_push_subject() { case "$1" in *hooks*) printf '%s\n' hooks ;; esac; }
EOF
printf '.claude/\n' >"$set_tree/.gitignore"
(cd "$set_tree" && printf 'node tools/check-texts.mjs\n' | node tools/push-inputs.mjs record >/dev/null 2>&1)
git -C "$set_tree" add -A 2>/dev/null
git -C "$set_tree" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'chore: набор' 2>/dev/null
set_base="$(git -C "$set_tree" rev-parse HEAD)"
printf 'x\n' >"$set_tree/src/x.ts"
git -C "$set_tree" add -A 2>/dev/null
git -C "$set_tree" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'feat: код' 2>/dev/null
set_marks="$set_tree/.claude/rt-kit/observations/.marks"

(cd "$set_tree" && CLAUDE_PROJECT_DIR="$set_tree" bash -c '. "$1/push-set.sh"; rt_push_set_profile "$1" "$PWD"; rt_push_set_run "$2"' _ "$HOOKS" "$set_base" >/dev/null 2>&1)
report "SC-AK-1657 — the git hook runner writes seven fields for every step" \
    "$(awk '{ print NF }' "$set_marks"/runs-* 2>/dev/null | sort -u | tr '\n' ' ')" "7 "
report "SC-AK-1657 — the git hook runner records a step the selection dropped as not run" \
    "$(awk -v id="$(id_of 'node tools/check-texts.mjs')" '$2 == id { print $3, $7 }' "$set_marks"/runs-* 2>/dev/null)" "not-run not-run"
report "SC-AK-1657 — the git hook runner marks a run whose change missed the declared subject idle" \
    "$(awk -v id="$(id_of 'true # hooks')" '$2 == id { print $3, $7 }' "$set_marks"/runs-* 2>/dev/null)" "green idle"

rm -rf "$set_marks"
(cd "$set_tree" && CLAUDE_PROJECT_DIR="$set_tree" bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1)
report "SC-AK-1657 — the runner ahead writes seven fields for every step" \
    "$(awk '{ print NF }' "$set_marks"/runs-* 2>/dev/null | sort -u | tr '\n' ' ')" "7 "

suite_result "the run line of a push set step"
