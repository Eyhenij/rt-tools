#!/usr/bin/env bash
# rt-kit v0.39.0 · hooks/git-guard-push-tests.sh · 9da27a6e952d · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool|mcp__terminal__run_in_terminal
# rt-hook-timeout: 1800
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/profile-check.sh, hooks/deny-tail.sh, hooks/push-sign.sh, hooks/push-set.sh, hooks/git-guard-push-marks.sh
# The guard of the checks before a push. PreToolUse on the push call.
#
# A push is the entry into the pipeline: a merge into the main branch starts the rollout, and
# everything not checked locally gets checked on production already. Edits go out this way twice in
# a row, green in a selective run and red in the pipeline: one time only the end-to-end specs were
# run, the other only the affected project.
#
# The guard does not take it on trust: it runs what the tree profile listed itself, and lets the
# push through only on a zero return code. If the runner caches the result, the set takes seconds
# on an unchanged tree, and after an edit it is run anew.
#
# What to run is known by the profile: the function `rt_push_checks <base>` — one command per line.
# The base is the branch the contribution is counted against; empty means there is no remote. The
# function is called from the directory the push goes from and may decide by it itself: a step
# whose checks the tree does not have it simply does not print. There is no profile or no function
# — the guard passes: the package cannot invent the list of checks.
#
# The base is taken from the remote, not from the local main branch: the local one falls behind or
# diverges silently. That has happened already — the local one stood at a merge wiped from the
# history by a force push, and the set counted against it would have been the wrong one. The base
# is the remote branch the head has the fewest commits over — the helper `git-guard-push-marks.sh`
# picks it. There is no network or no remote — the base is empty, and
# the profile falls back to a full run: the gate may turn out stricter than needed, but NEVER weaker.
#
# A check green on the same tree against the same base is not run again, and a tree that declares
# `RT_PUSH_HEAVY_AHEAD=1` runs its heavy steps ahead by `git-guard-push-ahead.sh`: the guard only
# reads their marks. The hook limit is 30 minutes, and the heavy steps of one tree outgrew it.
#
# FAIL-OPEN: not a repository, broken input, no profile, no parse file `push-sign.sh`, no set file
# `push-set.sh`, no perl — pass.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=git-guard-push-tests
RT_GUARD_RULE=git-workflow

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    # The environment terminal, the universal runner and the session terminal tab put the command
    # into the same field. Left out of this list, the tab carried a push past the gate after two
    # refusals: the tree had no git hook, and nothing else would have run the set. The git hook
    # `pre-push` now runs it for a push this guard does not see.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool | mcp__terminal__run_in_terminal) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# Without the word there is no push at all, and the parse below is not paid for.
case "$cmd" in
    *push*) ;;
    *) exit 0 ;;
esac

# The push calls and the branch switches are found by the parse in `push-sign.sh`: one line per
# call, read below. No parse file or no perl — no lines, and the guard passes.
# shellcheck disable=SC1090
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/push-sign.sh" 2>/dev/null || true
command -v rt_push_calls >/dev/null 2>&1 || exit 0
push_calls="$(printf '%s' "$cmd" | rt_push_calls)"

# A dry-run push sends nothing: there is no point running the whole set for it. A dry run of one
# call does not cover a real push next to it in the same command.
pushes="$(printf '%s\n' "$push_calls" | grep -c ' real$')"
opaque=false
printf '%s\n' "$push_calls" | grep -qx 'opaque' && printf '%s' "$cmd" | grep -q 'git' && opaque=true
[ "${pushes:-0}" -gt 0 ] || [ "$opaque" = true ] || exit 0

# The refusal of this gate. The shared deny tail — the two lawful moves and the lawful form of a
# bypass — may not be laid out; then there is no tail, and the reason stays as it was.
#   push_refuse <action> <facts of the set> [params]
# The decision, the move and the text come from the decision table; the hook names the shape of the
# call, the state of the set and the words of the outputs.
shape_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$shape_dir/facts.sh" 2>/dev/null
push_refuse() {
    local facts params
    facts="$(jq -cn --arg r "$(rt_fact_rule_loaded git-workflow "$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)")" \
        --argjson own "${2:-"{}"}" '{rule_loaded:$r} + $own')"
    # The refusals of the shape name a plain push as the fix, and that push is refused next while the
    # heavy steps of the tree have no green mark. So they name the run ahead before it.
    params="$(jq -cn --arg a "bash ${shape_dir#"$PWD"/}/git-guard-push-ahead.sh" --argjson own "${3:-"{}"}" '{ahead_cmd:$a} + $own')"
    # shellcheck disable=SC1091
    . "$shape_dir/decide.sh" 2>/dev/null
    command -v rt_decide >/dev/null 2>&1 && rt_decide git-guard-push-tests.sh "$1" "$facts" "$params"
    exit 0
}

# Commands the parse cannot read are refused when the text names a push: a shell reading its
# commands from the input, `source` of a substitution, function calls that grow without bound. What
# such a command runs is seen only when it runs, and a silent pass would let a push leave unchecked.
if [ "$opaque" = true ]; then
    push_refuse push_opaque
fi

# A branch switch in the same command is refused whole.
#
# The guard is a parse of the command BEFORE it runs: it runs the set in the tree that lies there
# now. A compound "switch and push" passes the gate on the FORMER branch — silently, checking the
# wrong thing. There is no refusal at that, and a green set reads as a check of what goes to the
# hosting. This was caught by chance: the gate refused a push on a red check of file length for a
# file that is not in the pushed branch at all — it was looking at the branch the same command was
# leaving.
#
# What is judged is a switch to another tree before the push. Creating a new branch from the current
# tip (`checkout -b`, `switch -c`) and restoring files do not fall here: the tree stays. A new
# branch from another start point does. A switch after the push changes nothing the set judged.
# The switch is found by the same parse as the push: a pattern over the line did not see
# `git checkout` inside `bash -c` or `eval`.
switched=false
printf '%s\n' "$push_calls" | awk '$0 == "switch" { s = 1 } / real$/ && s { f = 1 } END { exit !f }' && switched=true
if [ "$switched" = true ]; then
    push_refuse push_switch
fi

# Several pushes in one command, or a push inside a loop, are refused whole. The set runs once
# per call on the tree that lies there, and every other branch leaves unchecked.
# A push after `done` or inside `if` is one push; a push in the body or the condition of a loop is
# not. Several recipients in one call are several pushes too, and the parse above names them.
looped=false
printf '%s\n' "$push_calls" | grep -q '^loop .* real$' && looped=true
several_refs=false
printf '%s\n' "$push_calls" | grep -q ' several real$' && several_refs=true
if [ "${pushes:-0}" -gt 1 ] || [ "$looped" = true ] || [ "$several_refs" = true ]; then
    push_refuse push_multi
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -f package.json ] || exit 0

# Sending from a second working copy is refused whole.
#
# The second copy is taken for reading: the merge of the main branch goes on it while the session's
# copy holds someone else's uncommitted work. A call made from there is judged by the copy the
# session stands in — that is, by a foreign tree: its stale archive and its half-written spec refuse
# the call, while the contribution actually leaving is never checked at all.
#
# A second copy is the same shared `.git` directory under another root. Another repository is no
# copy of this tree, and its root differs from the session root always: judged by the roots alone,
# a session of one tree could not push a branch into another repository at all. Such a call is not
# judged by this guard — the set of this tree says nothing about a foreign one.
moved="$(printf '%s' "$cmd" | sed -nE 's/.*(^|[;&|[:space:]])cd[[:space:]]+([^[:space:];&|]+).*/\2/p' | head -1)"
moved="${moved%\'}"; moved="${moved#\'}"
moved="${moved%\"}"; moved="${moved#\"}"
if [ -n "$moved" ] && [ -d "$moved" ]; then
    moved_root="$(git -C "$moved" rev-parse --show-toplevel 2>/dev/null)"
    here_root="$(git rev-parse --show-toplevel 2>/dev/null)"
    moved_repo="$(git -C "$moved" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    here_repo="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    [ -n "$moved_repo" ] && [ -n "$here_repo" ] && [ "$moved_repo" != "$here_repo" ] && exit 0
    if [ -n "$moved_root" ] && [ -n "$here_root" ] && [ "$moved_root" != "$here_root" ]; then
        push_refuse push_second_copy '{}' "$(jq -cn --arg m "$moved_root" --arg h "$here_root" '{moved_root:$m, here_root:$h}')"
    fi
fi

# The tree profile: first the package default, over it the project override, if there is one. A
# function declared in the override replaces the default whole and may call it back by the
# `_default` suffix. There is neither — the hook passes: an empty guard is better than a guard
# that refuses at random.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# The set itself is run by the code it shares with the git hook `pre-push`.
# shellcheck disable=SC1091
. "$rt_hooks_dir/push-set.sh" 2>/dev/null || exit 0
rt_push_set_profile "$rt_hooks_dir" "${CLAUDE_PROJECT_DIR:-.}"

# A word about a missing profile function: a hook that exited silently is indistinguishable from a
# working one. The file may not be laid out — then the former, silent behaviour stays.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# An observation line on every outcome. A guard that writes only refusals answers one question out
# of three: how many pushes it stopped. "The set was run and is green" and "no set was found" look
# the same in the record — as silence — and a gate that has not run a single check in a week is
# indistinguishable from a gate where everything is green. This is written into the same
# observations record as guard refusals, and goes out by the same tree switch.
rt_push_gate_note() {
    local outcome="$1" sid
    # shellcheck disable=SC1090
    [ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
    command -v rt_note >/dev/null 2>&1 || return 0
    sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
    if [ -n "$sid" ]; then
        rt_note push-gate "res=$outcome" "sid=$sid"
    else
        rt_note push-gate "res=$outcome"
    fi
    return 0
}

if ! rt_needs rt_push_checks git-guard-push-tests; then
    rt_push_gate_note no-checks
    exit 0
fi

base="$(rt_push_set_base)"

# Whether the command sends the checked-out branch under its own name: it names that branch as a
# word and carries no `source:target` pair. Only such a push is told by the head — a push of another
# branch, or of the head into a branch of another name, sends what the head says nothing about.
push_sends_head() {
    local branch
    # shellcheck disable=SC1091
    command -v rt_fact_branch >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
    branch="$(rt_fact_branch)" || return 1
    printf '%s' "$cmd" | grep -qE '[[:space:]][A-Za-z0-9_./@^~+-]+:[A-Za-z0-9_./-]+([[:space:];&|]|$)' && return 1
    case " $cmd " in *" $branch "* | *" $branch;"* | *" $branch&"* | *" $branch|"*) return 0 ;; esac

    return 1
}

# A head that adds nothing to its base is not judged: the set has nothing new to look at.
if command -v rt_push_adds_nothing >/dev/null 2>&1 && push_sends_head && rt_push_adds_nothing "$base"; then
    rt_push_gate_note nothing-new
    printf 'the push gate: the head adds no commit to %s — the set is not run\n' \
        "$(command -v rt_push_base_label >/dev/null 2>&1 && rt_push_base_label "$base" || printf '%s' "$base")" >&2
    exit 0
fi

# Every red among the light checks is named by one refusal. The gate used to leave on the first red
# one, and each fix opened the next reason by a push of its own: three pushes in a row went so on one
# branch — a repeated function, a name shared by two kits, a paint probe. A check with nothing to look
# at exits with the skip code: before, it said so by a line of output and exited with zero, and in the
# set that zero stood next to the passed ones and differed from them in nothing.
rt_push_set_ask_ahead=1
rt_push_set_run "$base"
failed="$rt_push_set_failed"
output="$rt_push_set_output"
skipped="$rt_push_set_skipped"
held="$rt_push_set_held"
ahead="$rt_push_set_ahead"
ran="$rt_push_set_ran"

# The node the tree pins is not on the machine, and PATH gives another one: no step ran, and an empty
# set must not read as a green one. One line names both versions and the install command.
if [ -n "${rt_push_set_node:-}" ]; then
    rt_push_gate_note node
    said="$(push_refuse push '{"push_node_pinned":"no"}' "$(jq -cn --arg l "$rt_push_set_node" '{node_line:$l}')")"
    # The decider runs on the node of PATH — the very node that may be too old to run it, or absent:
    # then it answers nothing, and the refusal is said here, or the push would pass unjudged.
    if [ -z "$said" ]; then
        # shellcheck disable=SC1091
        command -v rt_deny_tail >/dev/null 2>&1 || . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
        command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
        said="$(jq -cn --arg r "BLOCKED: ${rt_push_set_node}. No step of the push set ran. Install the pinned node by that command and push again. $(rt_deny_tail)" \
            '{hookSpecificOutput:{hookEventName:"PreToolUse", permissionDecision:"deny", permissionDecisionReason:$r}}')"
    fi
    printf '%s\n' "$said"
    exit 0
fi

# Heavy steps with no mark are named in one refusal together with the red light ones: the command
# that runs them ahead goes to the background, where no hook limit cuts it, and the push after it
# passes from the marks.
if [ -n "$ahead" ]; then
    rt_push_gate_note ahead
    ahead_cmd="bash ${rt_hooks_dir#"$PWD"/}/git-guard-push-ahead.sh"
    dirty_line=""
    rt_push_mark_clean || dirty_line="

The working copy holds edits outside the index: a mark is trusted only on a clean copy. Commit first."
    red_line=""
    [ -n "$failed" ] && red_line="

Red among the light checks:
${failed}

$(printf '%s' "$output" | tr -d '\000')"
    # Both bases are named: a mark is keyed by its base, and a push that chose another base than
    # the run ahead looks the same as one with no run at all.
    last_base=""
    command -v rt_push_base_last >/dev/null 2>&1 && last_base="$(rt_push_base_last)"
    command -v rt_push_base_label >/dev/null 2>&1 || rt_push_base_label() { printf '%s' "${1:-none}"; }
    base_line="

The base of this push: $(rt_push_base_label "$base"). The base of the last run ahead of this branch: ${last_base:-none recorded}."
    push_refuse push '{"push_marks_green":"no"}' "$(jq -cn --arg a "$ahead" --arg c "$ahead_cmd" --arg d "$dirty_line" --arg r "$red_line" \
        --arg b "$base_line" '{ahead:$a, ahead_cmd:$c, dirty_line:$d, red_line:$r, base_line:$b}')"
fi

# What was skipped is named aloud even when the set passed: silence about it is exactly the
# indistinguishability this code was created for. The push goes through at that — there is no
# refusal here.
# The profile function is there, but it has nothing to print in this tree: the outcome is the same
# as without it — no set was found, and silence about that would read as a green run.
if [ "$ran" -eq 0 ]; then
    rt_push_gate_note no-checks
    exit 0
fi

if [ -z "$failed" ] && [ -n "$skipped" ]; then
    printf 'the push gate: the set passed, but these checks had nothing to look at:\n%s\n' "$skipped" >&2
fi

# How the gate set is narrower than the pipeline set — said once per session.
#
# The delivery rule demands that the gate not be narrower than the pipeline, and there is nothing
# to assemble that requirement from: the pipeline file differs from tree to tree, and the package
# cannot derive the steps of the set from it. Silence at that reads as "everything is checked": the
# divergence is learnt from a red pipeline after the PR, when the edit has already been handed to a
# person.
#
# The mark lives in the temporary files directory, as with the word about a missing profile
# function: on every push the same line would repeat dozens of times per session and would stop
# being read.
gap_key="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$gap_key" ] && gap_key="$(date +%Y%m%d 2>/dev/null || printf 'nosession')"
gap_mark="${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$gap_key"
if [ ! -f "$gap_mark" ]; then
    printf 'the push gate: the gate set is not the pipeline set. Image builds, showcase snapshots and
' >&2
    printf 'the check of assembled packages are not part of it: what stands in it is shown by the
' >&2
    printf 'state review (agent-kit doctor, the section on the set before a push) — run what is
' >&2
    printf 'missing before the request.
' >&2
    : >"$gap_mark" 2>/dev/null || true
fi

# A green set leaves the commit it judged in the mark of the shared git directory. The git hook
# `pre-push` runs the same set before every push, whatever sent it, and lets through a push of
# exactly this commit at once: the call this guard just let through would otherwise wait for the set
# twice. The mark is not written when every check was skipped or the copy has uncommitted edits.
if [ -z "$failed" ]; then
    rt_push_gate_note green
    rt_push_mark_write
    exit 0
fi

rt_push_gate_note red

# The tail of every red output, not all of it: the runner prints a long one, and what is needed is
# the reason for the refusal.
tail_out="$(printf '%s' "$output" | tr -d '\000')"
red_count="$(printf '%s\n' "$failed" | grep -c .)"
held_line=""
[ -n "$held" ] && held_line="

Not started after the red ones — heavy, and the push is refused anyway:
${held}"
# Red comes in two kinds, and the guard does not tell them apart: it checks only the return code.
# When a check of the code fails, "fix it and push again" is right. When the check itself is wrong,
# the same text orders fixing code nobody touched: a refusal once taken apart lay wholly in
# documents untouched by any commit of the branch. The verifiability law says a broken check does
# not stop the work, so the text of the table names the third move too.
push_refuse push '{"push_marks_green":"yes","push_checks_green":"no"}' \
    "$(jq -cn --arg n "$red_count" --arg f "$failed" --arg h "$held_line" --arg t "$tail_out" \
        '{red_count:$n, failed:$f, held_line:$h, tail_out:$t}')"
