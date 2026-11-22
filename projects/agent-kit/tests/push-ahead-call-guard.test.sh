#!/usr/bin/env bash
# The guard of the call of the run ahead: a call that hides the exit code of the set is refused with
# the ready form; a call whose code shows passes; a text that only names the script passes.
#
# Scenarios of the description: SC-AK-1814, SC-AK-1815, SC-AK-1816, SC-AK-1821.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the call of the run ahead"

SET='bash .claude/hooks/git-guard-push-ahead.sh'
d() { expect_decision "$1" push-ahead-call-guard.sh "$(input_cmd "$2")" "$3"; }

# --- SC-AK-1814 — the code of the set is visible nowhere ------------------------------------------
d "SC-AK-1814 — \`;\` after the set and no \`\$?\` is refused" "$SET; tail -5 /tmp/a.log" deny
d "SC-AK-1814 — a newline after the set and no \`\$?\` is refused" "$SET > /tmp/a.log 2>&1
tail -5 /tmp/a.log" deny
d "SC-AK-1814 — \`||\` after the set and no \`\$?\` is refused" "$SET || tail -5 /tmp/a.log" deny
d "SC-AK-1814 — a pipe with no PIPESTATUS and no pipefail is refused" "$SET 2>&1 | tail -20" deny
d "SC-AK-1814 — the set sent to the background by \`&\` is refused" "$SET > /tmp/a.log 2>&1 &" deny
d "SC-AK-1814 — the set under \`!\` is refused" "! $SET" deny
d "SC-AK-1814 — a chain of \`&&\` ending with \`;\` and no \`\$?\` is refused" \
    "$SET > /tmp/a.log 2>&1 && echo green; tail -3 /tmp/a.log" deny
d "SC-AK-1814 — a prefixed set in a subshell is judged the same" \
    "(cd /tmp && RT_X=1 nohup time $SET); tail -3 /tmp/a.log" deny
expect_reason "SC-AK-1814 — the refusal names the ready form" push-ahead-call-guard.sh \
    "$(input_cmd "$SET | tail -5")" 'run_in_background, nothing after it'
expect_reason "SC-AK-1814 — the refusal names what hid the code" push-ahead-call-guard.sh \
    "$(input_cmd "$SET | tail -5")" 'piped into the next command'
expect_reason "SC-AK-1814 — the refusal names the log outside the tree and the verdict line" \
    push-ahead-call-guard.sh "$(input_cmd "$SET; tail -5 x")" "TMPDIR:-/tmp.*grep '\\^push ahead:'"

# --- SC-AK-1815 — the code of the set shows ---------------------------------------------------------
d "SC-AK-1815 — the set alone passes" "$SET" PASS
d "SC-AK-1815 — the set with its output redirected passes" "$SET > /tmp/a.log 2>&1" PASS
d "SC-AK-1815 — a chain of \`&&\` to the end of the call passes" \
    "cd /tmp && $SET > /tmp/a.log 2>&1 && tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — \`\$?\` right after the set passes" "$SET > /tmp/a.log 2>&1; echo \"exit \$?\"; tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — a pipe with PIPESTATUS after it passes" "$SET 2>&1 | tail -5; echo \"\${PIPESTATUS[0]}\"" PASS
d "SC-AK-1815 — a pipe under \`set -o pipefail\` passes" "set -o pipefail; $SET 2>&1 | tail -5" PASS
d "SC-AK-1815 — a trailing \`;\` with nothing after it passes" "$SET > /tmp/a.log 2>&1;" PASS

# --- SC-AK-1816 — a text that only names the script -------------------------------------------------
d "SC-AK-1816 — a search for the script passes" "grep -n 'git-guard-push-ahead.sh | tail' -r docs" PASS
d "SC-AK-1816 — a read of the script passes" "sed -n 1,40p .claude/hooks/git-guard-push-ahead.sh | head" PASS
d "SC-AK-1816 — a heredoc that names the run passes" "cat > /tmp/m.txt <<'EOF'
$SET | tail -5
EOF
git commit -q -F /tmp/m.txt" PASS
d "SC-AK-1816 — printf of the run into a file passes" "printf '%s\\n' '$SET | tail' > /tmp/x.md" PASS
d "SC-AK-1816 — a quoted commit message passes" "git commit -m \"docs: $SET | tail hides the code\"" PASS
d "SC-AK-1816 — a syntax check by \`bash -n\` passes" "bash -n .claude/hooks/git-guard-push-ahead.sh | head" PASS
d "SC-AK-1816 — a run inside \`bash -c\` that hides the code is refused" "bash -c '$SET; tail -3 /tmp/a.log'" deny
d "SC-AK-1816 — a run inside \`bash -c\` that shows the code passes" "bash -c '$SET > /tmp/a.log 2>&1'" PASS
d "SC-AK-1816 — a background \`bash -c\` that writes \`\$?\` into the log passes" \
    "nohup bash -c \"$SET > /tmp/a.log 2>&1; echo exit \\\$? >> /tmp/a.log\" >/dev/null 2>&1 &
sleep 2; echo started" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/push-ahead-call-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "an empty input passes" ''
exit_code_of "an input that does not parse passes" 'не json'
expect_decision "a call of another tool passes" push-ahead-call-guard.sh "$(input_cmd "$SET | tail" Edit)" PASS

# --- SC-AK-1821 — a red set in the ready form ends with a nonzero code -----------------------------
tree="$(fixture_repo_branched main work)"
log_dir="$(mktemp -d)"
trap 'rm -rf "$tree" "$log_dir"' EXIT
mkdir -p "$tree/tools" "$tree/.claude/rt-kit"
cp "$ASSETS/checks/push-inputs.mjs" "$ASSETS/checks/push-trace.mjs" "$tree/tools/"
cat >"$tree/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() { printf '%s\n' 'false # red'; }
EOF
printf '.claude/\n' >"$tree/.gitignore"
printf 'x\n' >"$tree/x.txt"
git -C "$tree" add -A 2>/dev/null
git -C "$tree" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'feat: x' 2>/dev/null
(cd "$tree" && CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/git-guard-push-ahead.sh" >"$log_dir/a.log" 2>&1)
code=$?
report "SC-AK-1821 — a red set in the ready form ends with a nonzero code" \
    "$([ "$code" -ne 0 ] && echo nonzero || echo "zero ($(tail -3 "$log_dir/a.log" | tr '\n' ' '))")" nonzero
report "SC-AK-1821 — the last verdict line of the log says red" \
    "$(grep '^push ahead:' "$log_dir/a.log" | tail -1)" "push ahead: red —"

suite_result "the call of the run ahead"
