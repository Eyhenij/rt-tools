#!/usr/bin/env bash
# The guard of the call of the run ahead: a call that does not end with the exit code of the set is
# refused with the ready form; a call that ends with it passes; a text that only names the script
# passes.
#
# Scenarios of the description: SC-AK-1814, SC-AK-1815, SC-AK-1816, SC-AK-1821, SC-AK-1935.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the call of the run ahead"

SET='bash .claude/hooks/git-guard-push-ahead.sh'
# The calls are background calls: only those come back as a notice with one exit code.
bg() { input_cmd "$1" "${2:-Bash}" | jq -c '.tool_input.run_in_background = true'; }
d() { expect_decision "$1" push-ahead-call-guard.sh "$(bg "$2")" "$3"; }

# --- SC-AK-1814 — the call does not end with the code of the set ----------------------------------
d "SC-AK-1814 — the call of the card: \`; echo \"exit=\$?\"\` after the set is refused" \
    "$SET > ahead-3422.log 2>&1; echo \"exit=\$?\"" deny
d "SC-AK-1814 — \`;\` and a tail after the set is refused" "$SET; tail -5 /tmp/a.log" deny
d "SC-AK-1814 — a newline and a tail after the set is refused" "$SET > /tmp/a.log 2>&1
tail -5 /tmp/a.log" deny
d "SC-AK-1814 — \`||\` after the set is refused" "$SET || tail -5 /tmp/a.log" deny
d "SC-AK-1814 — a pipe with no PIPESTATUS is refused" "$SET 2>&1 | tail -20" deny
d "SC-AK-1814 — \`\$?\` after a pipe is the code of the pipe and is refused" "$SET 2>&1 | tail -5; echo \"exit \$?\"" deny
d "SC-AK-1814 — \`rc=\$?\` with no \`exit \$rc\` at the end is refused" "$SET > /tmp/a.log 2>&1; rc=\$?; tail -5 /tmp/a.log" deny
d "SC-AK-1814 — \`set +o pipefail\` keeps the pipe refused" "set +o pipefail; $SET 2>&1 | tail -5" deny
d "SC-AK-1814 — the set sent to the background by \`&\` is refused" "$SET > /tmp/a.log 2>&1 &" deny
d "SC-AK-1814 — a background \`bash -c\` that writes \`\$?\` into the log is refused" \
    "nohup bash -c \"$SET > /tmp/a.log 2>&1; echo exit \\\$? >> /tmp/a.log\" >/dev/null 2>&1 &
sleep 2; echo started" deny
d "SC-AK-1814 — the set under \`!\` is refused" "! $SET" deny
d "SC-AK-1814 — a chain of \`&&\` ending with \`;\` is refused" \
    "$SET > /tmp/a.log 2>&1 && echo green; tail -3 /tmp/a.log" deny
d "SC-AK-1814 — a prefixed set in a subshell is judged the same" \
    "(cd /tmp && RT_X=1 nohup time $SET); tail -3 /tmp/a.log" deny
d "SC-AK-1814 — a set in a loop piped into tail is refused" "for i in 1; do $SET; done 2>&1 | tail -5" deny
d "SC-AK-1814 — a set in a group piped into tail is refused" "{ $SET; } 2>&1 | tail -5" deny
d "SC-AK-1814 — a set under \`if\` and a tail after it is refused" "if $SET > /tmp/a.log 2>&1; then :; fi; tail -3 /tmp/a.log" deny
d "SC-AK-1814 — a redirection glued to the script is read apart" "$SET>/tmp/a.log 2>&1; tail -5 /tmp/a.log" deny
d "SC-AK-1814 — \`source\`, \`pnpm exec\`, \`timeout -s\` and \`env -i\` are runs" \
    "source .claude/hooks/git-guard-push-ahead.sh | tail -5" deny
d "SC-AK-1814 — \`pnpm exec\` before the shell is a run" "pnpm exec $SET | tail -5" deny
d "SC-AK-1814 — \`timeout -s KILL\` before the shell is a run" "timeout -s KILL 3600 $SET | tail -5" deny
d "SC-AK-1814 — \`env -i\` and \`caffeinate -i\` before the shell are runs" "env -i caffeinate -i $SET | tail -5" deny
d "SC-AK-1814 — \`bash -o pipefail -c\` is judged by its inner text" "bash -o pipefail -c '$SET; tail -3 /tmp/a.log'" deny
d "SC-AK-1814 — \`\$?\` in double quotes of \`bash -c\` is the outer code" "bash -c \"$SET > /tmp/a.log 2>&1; exit \$?\"" deny
d "SC-AK-1814 — \`eval\` is judged by its inner text" "eval \"$SET | tail -5\"" deny
d "SC-AK-1814 — \`exit \${PIPESTATUS[0]}\` is refused: zsh has no such array and exits 0" \
    "$SET 2>&1 | tail -5; exit \"\${PIPESTATUS[0]}\"" deny
d "SC-AK-1814 — a pipe under pipefail followed by \`;\` and a tail is refused" "set -o pipefail; $SET | tail -5; echo done" deny
d "SC-AK-1814 — a pipe under pipefail sent to the background is refused" "set -o pipefail; $SET | tail -5 &" deny
d "SC-AK-1814 — a pipe under pipefail followed by \`||\` is refused" "set -o pipefail; $SET | tee /tmp/a.log || echo red" deny
d "SC-AK-1814 — pipefail switched off again keeps the pipe refused" "set -o pipefail; set +o pipefail; $SET | tail -5" deny
d "SC-AK-1814 — a chain of \`&&\` sent to the background is refused" "cd /tmp && $SET > /tmp/a.log 2>&1 &" deny
d "SC-AK-1814 — the set inside \`\$(…)\` is refused" "out=\$($SET 2>&1); echo \"\$out\" | tail -5" deny
d "SC-AK-1814 — a shell reading a heredoc is judged by its body" "bash <<'EOF'
$SET | tail -5
EOF" deny
d "SC-AK-1814 — \`exit \$rc\` reached only on one branch is refused" "$SET > /tmp/a.log 2>&1; rc=\$?; tail -3 /tmp/a.log || exit \$rc" deny
d "SC-AK-1814 — \`/usr/bin/env bash\` is a run" "/usr/bin/env bash .claude/hooks/git-guard-push-ahead.sh; echo done" deny
d "SC-AK-1814 — \`stdbuf\` and \`script\` before the shell are runs" "stdbuf -oL $SET | tee /tmp/a.log" deny
d "SC-AK-1814 — \`script -q /dev/null\` before the shell is a run" "script -q /dev/null $SET | tail -5" deny
d "SC-AK-1814 — \`set -e\` does not cover a set under \`if\`" "set -e; if $SET; then :; fi; tail -3 /tmp/a.log" deny
d "SC-AK-1814 — a heredoc word inside quotes opens no heredoc" "echo \"use <<EOF in heredocs\"
$SET 2>&1 | tail -5" deny
expect_reason "SC-AK-1814 — the refusal names the ready form" push-ahead-call-guard.sh \
    "$(bg "$SET | tail -5")" 'run_in_background, nothing after it'
expect_reason "SC-AK-1814 — the refusal names what hid the code" push-ahead-call-guard.sh \
    "$(bg "$SET | tail -5")" 'piped into the next command'
expect_reason "SC-AK-1814 — a pipe in a group is named a pipe" push-ahead-call-guard.sh \
    "$(bg "{ $SET; } 2>&1 | tail -5")" 'piped into the next command'
expect_reason "SC-AK-1814 — a chain ending with \`||\` is named so" push-ahead-call-guard.sh \
    "$(bg "$SET && echo green || echo red")" 'ends with `;`, a newline or `\|\|`'
expect_reason "SC-AK-1814 — the refusal names the log of the copy outside the tree and the verdict line" \
    push-ahead-call-guard.sh "$(bg "$SET; tail -5 x")" 'TMPDIR:-/tmp\}/push-ahead-\$\(basename "\$PWD"\)\.log.*last `push ahead:` line'

# --- SC-AK-1815 — the call ends with the code of the set ------------------------------------------
d "SC-AK-1815 — the set alone passes" "$SET" PASS
d "SC-AK-1815 — the set with its output redirected passes" "$SET > /tmp/a.log 2>&1" PASS
d "SC-AK-1815 — the ready form passes" "$SET > \"\${TMPDIR:-/tmp}/push-ahead-\$(basename \"\$PWD\").log\" 2>&1" PASS
d "SC-AK-1815 — a chain of \`&&\` to the end of the call passes" \
    "cd /tmp && $SET > /tmp/a.log 2>&1 && tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — \`exit \$?\` right after the set passes" "$SET > /tmp/a.log 2>&1; exit \$?" PASS
d "SC-AK-1815 — \`rc=\$?\` and \`exit \$rc\` at the end pass" "$SET > /tmp/a.log 2>&1; rc=\$?; tail -3 /tmp/a.log; exit \$rc" PASS
d "SC-AK-1815 — \`|| exit 1\` after the set passes: on red the call ends red" "$SET > /tmp/a.log 2>&1 || exit 1; tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — \`if ! set; then …; exit 1\` passes" "if ! $SET > /tmp/a.log 2>&1; then tail -3 /tmp/a.log; exit 1; fi" PASS
d "SC-AK-1815 — \`if ! set; then exit 1; fi\` passes" "if ! $SET > /tmp/a.log 2>&1; then exit 1; fi; tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — \`set -e\` before the set lets a tail follow" "set -e; $SET > /tmp/a.log 2>&1; tail -3 /tmp/a.log" PASS
d "SC-AK-1815 — \`bash -e -c\` lets a tail follow inside" "bash -e -c '$SET > /tmp/a.log 2>&1; tail -3 /tmp/a.log'" PASS
d "SC-AK-1815 — a pipe that ends the call under \`set -o pipefail\` passes" "set -o pipefail; $SET 2>&1 | tail -5" PASS
d "SC-AK-1815 — a trailing \`;\` with nothing after it passes" "$SET > /tmp/a.log 2>&1;" PASS
d "SC-AK-1815 — a set in a loop with nothing after it passes" "for i in 1; do $SET > /tmp/a.log 2>&1; done" PASS
d "SC-AK-1815 — a redirection glued as \`&>\` is no background" "$SET&>/tmp/a.log" PASS
d "SC-AK-1815 — a retry loop that breaks on green ends with the code of the last set" \
    "for a in 1 2 3; do $SET > /tmp/a.log 2>&1 && break; done" PASS
expect_decision "SC-AK-1815 — a call in the foreground is not judged: its output stands in the result" \
    push-ahead-call-guard.sh "$(input_cmd "$SET > /tmp/a.log 2>&1; echo \"exit=\$?\"")" PASS

# --- SC-AK-1816 — a text that only names the script -------------------------------------------------
d "SC-AK-1816 — a search for the script passes" "grep -n 'git-guard-push-ahead.sh | tail' -r docs" PASS
d "SC-AK-1816 — a read of the script passes" "sed -n 1,40p .claude/hooks/git-guard-push-ahead.sh | head" PASS
d "SC-AK-1816 — a heredoc that names the run passes" "cat > /tmp/m.txt <<'EOF'
$SET | tail -5
EOF
git commit -q -F /tmp/m.txt" PASS
d "SC-AK-1816 — a heredoc with a backslash delimiter passes" "cat > /tmp/m.txt <<\\EOF
$SET | tail -5
EOF" PASS
d "SC-AK-1816 — printf of the run into a file passes" "printf '%s\\n' '$SET | tail' > /tmp/x.md" PASS
d "SC-AK-1816 — a quoted commit message passes" "git commit -m \"docs: $SET | tail hides the code\"" PASS
d "SC-AK-1816 — a syntax check by \`bash -n\` passes" "bash -n .claude/hooks/git-guard-push-ahead.sh | head" PASS
d "SC-AK-1816 — a run inside \`bash -c\` that hides the code is refused" "bash -c '$SET; tail -3 /tmp/a.log'" deny
d "SC-AK-1816 — a run inside \`bash -c\` that ends with the code passes" "bash -c '$SET > /tmp/a.log 2>&1'" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/push-ahead-call-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "an empty input passes" ''
exit_code_of "an input that does not parse passes" 'не json'
expect_decision "a call of another tool passes" push-ahead-call-guard.sh "$(bg "$SET | tail" Edit)" PASS

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

# --- SC-AK-1935 — the red line names the file of the full output and the locale --------------------
cat >"$tree/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() { printf '%s\n' 'seq 1 60; false # red'; }
EOF
(cd "$tree" && LC_ALL=C.UTF-8 CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/git-guard-push-ahead.sh" >"$log_dir/b.log" 2>&1)
full="$(sed -n 's/^  the full output: //p' "$log_dir/b.log")"
report "SC-AK-1935 — the refusal names the file of the full output" "$(grep -c . "$full" 2>/dev/null)" 60
report "SC-AK-1935 — the red line names the locale" "$(grep -c '✗ red in .* under LC_ALL=C.UTF-8' "$log_dir/b.log")" 1
# The push guard and the git hook run the set by the shared code: their refusal names both too.
said="$(cd "$tree" && export LC_ALL=C.UTF-8 && . "$HOOKS/push-set.sh" && rt_push_set_profile "$HOOKS" "$tree" \
    && rt_push_set_run "" >/dev/null 2>&1 && printf '%s' "$rt_push_set_output" | head -1)"
report "SC-AK-1935 — the refusal of the push guard names the locale" \
    "$(printf '%s' "$said" | grep -c 'LC_ALL=C.UTF-8, the full output: ')" 1
full="$(printf '%s' "$said" | sed -n 's/.*the full output: \(.*\))$/\1/p')"
report "SC-AK-1935 — the refusal of the push guard names the file of the full output" \
    "$(grep -c . "$full" 2>/dev/null)" 60

suite_result "the call of the run ahead"
