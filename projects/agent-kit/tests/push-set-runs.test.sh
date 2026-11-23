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

# --- SC-AK-1846, SC-AK-1847 — the steps run on the node the tree pins ----------------------------
# A node of its own stands first in PATH, as the hook inherits it; the pinned one lies in a directory
# of nvm. The only step writes which node it found.
node_box="$(mktemp -d)"
trap 'rm -rf "$tree" "$set_tree" "$node_box"' EXIT
fake_node() {
    mkdir -p "$1"
    printf '#!/bin/sh\necho v%s\n' "$2" >"$1/node"
    chmod +x "$1/node"
}
fake_node "$node_box/other" 20.11.0
for v in 22.22.3 22.9.0 20.1.0; do fake_node "$node_box/nvm/versions/node/v$v/bin" "$v"; done
mkdir -p "$node_box/nvm-empty"
seen="$node_box/seen"

# A tree with the pin and a commit over its start. No pin — no .nvmrc.
node_tree() {
    local t
    t="$(fixture_repo_branched main work)"
    mkdir -p "$t/.claude/rt-kit"
    printf '.claude/\n' >"$t/.gitignore"
    printf '%s\n' "rt_push_checks() { printf '%s\\n' 'command -v node >\"\$RT_SEEN\"'; }" >"$t/.claude/rt-kit/project.sh"
    [ -n "$1" ] && printf '%s\n' "$1" >"$t/.nvmrc"
    git -C "$t" add -A 2>/dev/null
    git -C "$t" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'chore: pin' 2>/dev/null
    printf '%s' "$t"
}
# How the set ran in that tree: the node the step found, or the line of a missing pin.
set_node() {
    local t="$1" nvm="${2:-$node_box/nvm}"
    rm -f "$seen"
    (cd "$t" && PATH="$node_box/other:$PATH" NVM_DIR="$nvm" RT_SEEN="$seen" CLAUDE_PROJECT_DIR="$t" \
        bash -c '. "$1/push-set.sh"; rt_push_set_profile "$1" "$PWD"; rt_push_set_run ""; printf "%s" "$rt_push_set_node"' _ "$HOOKS" 2>/dev/null)
    cat "$seen" 2>/dev/null
}
ahead_node() {
    local t="$1" nvm="${2:-$node_box/nvm}" code
    rm -f "$seen"
    (cd "$t" && PATH="$node_box/other:$PATH" NVM_DIR="$nvm" RT_SEEN="$seen" CLAUDE_PROJECT_DIR="$t" \
        bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1)
    code=$?
    printf '%s %s' "$code" "$(cat "$seen" 2>/dev/null || printf none)"
}
pinned_bin() { printf '%s/nvm/versions/node/v%s/bin/node' "$node_box" "$1"; }

t_exact="$(node_tree 22.22.3)"
# A green step leaves a mark for its tree, and the next runner skips it: the run ahead gets a tree of its own.
t_ahead="$(node_tree 22.22.3)"
t_major="$(node_tree 22)"
t_alias="$(node_tree 'lts/*')"
t_none="$(node_tree '')"
t_same="$(node_tree 20.11.0)"
t_other="$(node_tree 99.0.0)"
trap 'rm -rf "$tree" "$set_tree" "$node_box" "$t_exact" "$t_ahead" "$t_major" "$t_alias" "$t_none" "$t_same" "$t_other"' EXIT

report "SC-AK-1846 — the set sees the pinned node" "$(set_node "$t_exact")" "$(pinned_bin 22.22.3)"
report "SC-AK-1846 — the run ahead sees the pinned node" "$(ahead_node "$t_ahead")" "0 $(pinned_bin 22.22.3)"
report "SC-AK-1846 — a major pin takes the highest installed match" "$(set_node "$t_major")" "$(pinned_bin 22.22.3)"
report "SC-AK-1846 — an alias pin runs on the node of PATH" "$(set_node "$t_alias")" "$node_box/other/node"
report "SC-AK-1846 — no pin runs on the node of PATH" "$(set_node "$t_none")" "$node_box/other/node"
report "SC-AK-1847 — same node in PATH runs the steps" "$(set_node "$t_same" "$node_box/nvm-empty")" "$node_box/other/node"
report "SC-AK-1847 — the set starts no step without the pinned node" \
    "$(set_node "$t_other" | sed -E 's/PATH gives .*/PATH gives …/')" \
    "node v99.0.0 is pinned in .nvmrc and not installed; PATH gives …"
report "SC-AK-1847 — the run ahead starts no step without the pinned node" "$(ahead_node "$t_other")" "3 none"

suite_result "the run line of a push set step"
