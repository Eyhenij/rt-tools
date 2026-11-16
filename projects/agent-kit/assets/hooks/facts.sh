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
#   rt_fact_window_fill <record>     the fill of the window in tokens
#   rt_fact_window_over_stop <sid> <record>  yes when the window is past its stop threshold
#   rt_fact_window_params <record>   the numbers a window refusal names, as JSON
#   rt_fact_exam <record>            the exam on the loaded rules: passed, failed or none
#   rt_fact_from_handoff <record>    yes when the session began from a handover
#   rt_fact_rule_loaded <rule> <sid> yes when the rule is loaded or absent from the tree
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

# The verdict of the exam on the loaded rules over the whole session: passed, failed or none. Only a
# tool that cannot read or write files gives a verdict, and the assistant's own text never does: the
# reasons stand at the exam guard, which refuses by this fact.
rt_fact_exam() {
    [ -f "$1" ] || { printf 'none'; return 0; }
    jq -s -r '

        def textof:
            if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end;

        # The call whose answer is discarded is recognised by its identifier, and the identifier is
        # bound by a name: a dot after a pipe means the list itself, the search over it answers zero
        # on any non-empty list, and every answer of every tool gets muted at once — that is, the
        # verdict is looked for in the host records alone.
        #
        # Tools that read and write files: their result does not count as a verdict — otherwise
        # echoing the same line or reading a file with it passes the guard, and the real verdict
        # does not.
        ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
        | ([.[] | select(.type == "assistant") | (.message.content // [])[]
             | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null)
             | {key: (.id // ""), value: true}] | from_entries) as $muted

        | [ .[]
            # The assistant text is never a verdict: writing the needed line in a reply costs one
            # move.
            | if .type == "assistant" then ""
              elif .type == "user" then
                  ([ ((.message.content // []) | if type == "array" then .[] else empty end
                        | select(.type == "tool_result")
                        | select((.tool_use_id // "") | if . == "" then true else ($muted[.] | not) end)
                        | .content | textof),
                     ((.message.content // "") | if type == "string" then . else "" end),
                     # The call result field: the same record, another form. Discarded only when
                     # this result belongs to a reading or writing tool.
                     (. as $rec
                      | if ($rec.toolUseResult // null) == null then ""
                        elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                                | select(.type == "tool_result") | (.tool_use_id // "")]
                              | map($muted[.] // false) | any) then ""
                        else ($rec.toolUseResult | textof) end)
                   ] | join("\n"))
              # Host records — the role completion notice and the attachment: the host chooses their
              # form, and they count whole.
              else tostring end ] | join("\n")
        | [scan("(ЭКЗАМЕН:[[:space:]]*сдано|EXAM:[[:space:]]*passed)[[:space:]]*([0-9]+)[[:space:]]*(из|of)[[:space:]]*([0-9]+)")]
        | if length == 0 then "none"
          else (.[-1] | if .[1] == .[3] then "passed" else "failed" end)
          end
' "$1" 2>/dev/null
}

# Whether the session began from a handover: a word of the owner names it. yes or no.
rt_fact_from_handoff() {
    [ -f "$1" ] || { printf 'no'; return 0; }
    jq -s -r '
        [.[] | select(.type == "user") | .message.content
           | if type == "string" then . elif type == "array"
             then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end]
        | join("\n") | if test("handoff|передач[аи][[:space:]]+захода") then "yes" else "no" end
    ' "$1" 2>/dev/null || printf 'no'
}

# Whether a rule is loaded in this session, read the way the rules gate reads it: yes, or no while the
# rule exists in the tree and the session has not loaded it.
rt_fact_rule_loaded() {
    _rt_rule="$1"
    _rt_loaded="${TMPDIR:-/tmp}/claude-skill-gate/${2:-nosession}.loaded"
    [ -f "${CLAUDE_PROJECT_DIR:-.}/${RT_RULES_DIR:-.claude/skills}/${_rt_rule}/SKILL.md" ] || { printf 'yes'; return 0; }
    if [ -f "$_rt_loaded" ] && grep -qE "^([^:]*:)?${_rt_rule}$" "$_rt_loaded" 2>/dev/null; then
        printf 'yes'
    else
        printf 'no'
    fi
}

# The fill of the window in tokens: the last usage record of a reply — the input, the one-off write
# into the cache, what was read from the cache and the output. A sum over all records will not do:
# what was read from the cache repeats in each of them. A tail of 200 lines holds the last one.
rt_fact_window_fill() {
    tail -n 200 "$1" 2>/dev/null | jq -s -r '
        [.[] | select(.type == "assistant") | .message.usage | select(. != null)]
        | last
        | if . == null then empty
          else ((.input_tokens // 0) + (.cache_creation_input_tokens // 0)
                + (.cache_read_input_tokens // 0) + (.output_tokens // 0))
          end
    ' 2>/dev/null
}

# Whether the window is past its stop threshold: yes or no. The mark of the window guard answers
# first; without it the fill is counted against the window size of the tree profile, the way the
# window guard counts it. Parameters: the session id, the conversation record.
rt_fact_window_over_stop() {
    if [ -f "$(rt_fact_window_stop_file "$1")" ]; then printf 'yes'; return 0; fi
    (
        _rt_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        for _rt_p in "$_rt_here/../rt-kit/defaults/project.sh" "$_rt_here/../defaults/project.sh" \
            "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
            # shellcheck disable=SC1090
            [ -f "$_rt_p" ] && . "$_rt_p" 2>/dev/null
        done
        _rt_w="${RT_WINDOW_TOKENS:-}"
        _rt_f="$(rt_fact_window_fill "${2:-}")"
        case "$_rt_w$_rt_f" in '' | *[!0-9]*) printf 'no'; exit 0 ;; esac
        [ -n "$_rt_f" ] && [ "$_rt_w" -gt 0 ] 2>/dev/null || { printf 'no'; exit 0; }
        if [ $((_rt_f * 100 / _rt_w)) -ge "${RT_WINDOW_STOP_PCT:-50}" ]; then printf 'yes'; else printf 'no'; fi
    )
}

# The numbers a refusal past the window threshold names: the fill, the window, the threshold and the
# directories that stay open. JSON for the slots of the decision table.
rt_fact_window_params() {
    (
        _rt_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        for _rt_p in "$_rt_here/../rt-kit/defaults/project.sh" "$_rt_here/../defaults/project.sh" \
            "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
            # shellcheck disable=SC1090
            [ -f "$_rt_p" ] && . "$_rt_p" 2>/dev/null
        done
        _rt_w="${RT_WINDOW_TOKENS:-0}"
        _rt_f="$(rt_fact_window_fill "${1:-}")"
        case "$_rt_w" in '' | *[!0-9]*) _rt_w=0 ;; esac
        case "$_rt_f" in '' | *[!0-9]*) _rt_f=0 ;; esac
        _rt_pct=0
        [ "$_rt_w" -gt 0 ] && _rt_pct=$((_rt_f * 100 / _rt_w))
        jq -cn --arg pct "$_rt_pct" --arg fill_k "$((_rt_f / 1000))" --arg window_k "$((_rt_w / 1000))" \
            --arg stop_pct "${RT_WINDOW_STOP_PCT:-50}" --arg tasks_dir "${RT_TASKS_DIR:-docs/tasks}" \
            --arg handoff_dir "${RT_HANDOFF_DIR:-.claude/handoff}" \
            '{pct:$pct, fill_k:$fill_k, window_k:$window_k, stop_pct:$stop_pct, tasks_dir:$tasks_dir, handoff_dir:$handoff_dir}'
    )
}
