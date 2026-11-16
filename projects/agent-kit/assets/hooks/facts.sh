#!/usr/bin/env bash
# The facts of the state the guards decide by, each computed in one place. NOT a guard: it has no
# `rt-hook:` declaration and hooks into no agent event. A guard sources it and calls `rt_fact_*`.
#
# Why a file of its own. The same fact was computed by a dozen hooks, three different ways: the
# branch by `git branch --show-current`, by `git symbolic-ref` and by `git rev-parse --abbrev-ref`,
# which answer a detached head differently. A fact the decider reads has one definition, or the table
# describes a state no hook agrees on.
#
# WHAT IS HERE.
#   rt_fact_branch [dir]             the current branch; empty and 1 on a detached head
#   rt_fact_default_branch           the default branch the remote names, without «origin/»
#   rt_fact_remote_head <branch>     the commit of the branch on the remote, asked over the network
#   rt_fact_transcript <input>       the path of the conversation record named by the hook input
#   rt_fact_agent_transcript <input> the path of a subagent's record named by the hook input
#   rt_fact_window_stop_file <sid>   the mark the window guard leaves past the stop threshold
#
# FAIL-OPEN: a fact that cannot be read is empty. The guard decides by an empty fact as it did when
# its own call failed.

rt_fact_branch() {
    if [ -n "${1:-}" ]; then
        _rt_b="$(git -C "$1" branch --show-current 2>/dev/null)"
    else
        _rt_b="$(git branch --show-current 2>/dev/null)"
    fi
    [ -n "$_rt_b" ] || return 1
    printf '%s\n' "$_rt_b"
}

rt_fact_default_branch() {
    git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##'
}

# A slow network gives no answer rather than a stalled guard: the limits end a call that crawls.
rt_fact_remote_head() {
    GIT_HTTP_LOW_SPEED_LIMIT=1000 GIT_HTTP_LOW_SPEED_TIME=5 GIT_TERMINAL_PROMPT=0 \
        git ls-remote origin "refs/heads/$1" 2>/dev/null | cut -f1
}

rt_fact_transcript() {
    printf '%s' "$1" | jq -r '.transcript_path // empty' 2>/dev/null
}

rt_fact_agent_transcript() {
    printf '%s' "$1" | jq -r '.agent_transcript_path // empty' 2>/dev/null
}

rt_fact_window_stop_file() {
    printf '%s/claude-window-stop/%s' "${TMPDIR:-/tmp}" "$1"
}
