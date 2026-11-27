#!/usr/bin/env bash
# rt-kit v0.42.1 · hooks/facts.sh · e96353f9f05b · правится надстройкой, не здесь
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
#   rt_fact_exam_holds <record>      the exam as the exam guard holds it: a switched-off role and a
#                                    declared bypass count as passed
#   rt_fact_move_rule_loaded <tool> <tool input> <sid>
#                                    yes when every rule the rules gate wants for that move is loaded
#   rt_fact_move_gate_rule <tool> <tool input> <sid>
#                                    the first rule the gate waits for before that move, or nothing
#   rt_fact_from_handoff <record>    yes when the session began from a handover
#   rt_move_rules <tool> <input>     the rules the rules gate wants for a move, one per line
#   rt_fact_rule_loaded <rule> <sid> yes when the rule is loaded or absent from the tree
#   rt_fact_move <tool> <tool input> <hook input>
#                                    the facts the neighbours judge a named move by, as JSON: the
#                                    exam, the window, the rules the gate wants for the move, the
#                                    rule of the course of work and the entry from a handover
#   rt_node_pinned_dir [root]        the bin directory of the node `.nvmrc` pins, installed by nvm
#   rt_node_pin_mismatch [root]      one line when no installed node serves the pin and the node
#                                    of PATH does not either; empty otherwise
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
    elif rt_fact_rule_deliverable "$_rt_rule" "${2:-nosession}"; then
        printf 'yes'
    else
        printf 'no'
    fi
}

# A rule the rules gate puts into the session by the same call: readable, and within the host limit
# with the frame of its delivery. The hooks of one call run side by side, and the record of the
# delivery may not be written yet when a neighbour reads it; naming the load of such a rule sends
# the session into the round the gate removed. A call without a session id gets no delivery.
rt_fact_rule_deliverable() {
    [ "${2:-nosession}" != nosession ] || return 1
    _rt_file="${CLAUDE_PROJECT_DIR:-.}/${RT_RULES_DIR:-.claude/skills}/$1/SKILL.md"
    [ -r "$_rt_file" ] || return 1
    _rt_limit="${RT_GATE_CONTEXT_LIMIT:-10000}"
    case "$_rt_limit" in '' | *[!0-9]*) _rt_limit=10000 ;; esac
    _rt_size="$(wc -m < "$_rt_file" 2>/dev/null | tr -d ' ')"
    [ -n "$_rt_size" ] || return 1
    # The frame of a delivery — its opening line and the file heading — weighs under 400 characters.
    [ $((_rt_size + 400)) -le "$_rt_limit" ]
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

# The exam as the exam guard holds it: the role switched off by the tree, or the bypass declared in
# the body of the last commit, hold nothing — the exam counts as passed.
rt_fact_exam_holds() {
    # No record of the conversation: the exam guard has nothing to judge by and lets the call through.
    [ -f "${1:-}" ] || { printf 'passed'; return 0; }
    _rt_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # shellcheck disable=SC1091
    if [ -f "$_rt_here/roles.sh" ] && . "$_rt_here/roles.sh" 2>/dev/null && rt_role_off strict-teacher; then
        printf 'passed'
        return 0
    fi
    if git -C "${CLAUDE_PROJECT_DIR:-.}" log -1 --format=%B 2>/dev/null | grep -qE '^Exam-skip:[[:space:]]*[^[:space:]<]'; then
        printf 'passed'
        return 0
    fi
    _rt_e="$(rt_fact_exam "$1")"
    printf '%s' "${_rt_e:-none}"
}

# Whether the rules gate lets a move through: every rule its map wants for the move is loaded.
# Parameters: the tool of the move, its tool input as JSON, the session id.
rt_fact_move_rule_loaded() {
    if [ -n "$(rt_fact_move_gate_rule "$@")" ]; then printf 'no'; else printf 'yes'; fi
}

# The first rule the rules gate waits for before a move, or nothing when the move passes it.
# Parameters: the tool of the move, its tool input as JSON, the session id.
rt_fact_move_gate_rule() {
    _rt_in="$(jq -cn --arg t "$1" --argjson i "$2" '{tool_name:$t, tool_input:$i}' 2>/dev/null)"
    for _rt_r in $(rt_move_rules "$1" "$_rt_in"); do
        [ "$(rt_fact_rule_loaded "$_rt_r" "$3")" = yes ] || { printf '%s' "$_rt_r"; return 0; }
    done
}

# The facts the neighbours judge a named move by. A guard that names a move hands them to the decider,
# and the decider puts first what a neighbour wants before that move.
# Parameters: the tool of the move, its tool input as JSON, the hook input.
rt_fact_move() {
    _rt_sid="$(printf '%s' "$3" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    _rt_rec="$(rt_fact_transcript "$3")"
    jq -cn --arg exam "$(rt_fact_exam_holds "$_rt_rec")" \
        --arg window "$(rt_fact_window_over_stop "$_rt_sid" "$_rt_rec")" \
        --arg rule "$(rt_fact_move_rule_loaded "$1" "$2" "$_rt_sid")" \
        --arg gate "$(rt_fact_move_gate_rule "$1" "$2" "$_rt_sid")" \
        --arg handoff "$(rt_fact_from_handoff "$_rt_rec")" \
        --arg flow "$(rt_fact_rule_loaded "${RT_TASK_FLOW_RULE:-task-flow}" "$_rt_sid")" \
        '{exam:$exam, window_over_stop:$window, rule_loaded:$rule, gate_rule:$gate, task_flow_loaded:$flow, from_handoff:$handoff}'
}

# The rules the gate wants for a move: the map read the way the gate reads it, a shell command
# with the files it writes. Parameters: the tool of the move, the whole input of the move.
rt_move_rules() {
    local mr_dir mr_root mr_map mr_profile mr_target mr_path
    mr_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    mr_root="${CLAUDE_PROJECT_DIR:-.}"
    (
        for mr_map in "$mr_dir/../rt-kit/defaults/gate-map.sh" "$mr_dir/../defaults/gate-map.sh" "$mr_root/.claude/rt-kit/defaults/gate-map.sh" "$mr_root/.claude/rt-kit/gate-map.sh"; do
            # shellcheck disable=SC1090
            [ -f "$mr_map" ] && . "$mr_map" 2>/dev/null
        done
        command -v skill_for >/dev/null 2>&1 || exit 0
        case "$1" in
            Edit | Write | MultiEdit)
                mr_target="$(printf '%s' "$2" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
                case "$mr_target" in /*) ;; ?*) mr_target="$mr_root/$mr_target" ;; *) exit 0 ;; esac
                skill_for edit "$mr_target" "" 2>/dev/null
                ;;
            Bash)
                mr_target="$(printf '%s' "$2" | jq -r '.tool_input.command // empty' 2>/dev/null)"
                [ -n "$mr_target" ] || exit 0
                skill_for bash "$mr_target" "" 2>/dev/null
                for mr_profile in "$mr_dir/../rt-kit/defaults/project.sh" "$mr_dir/../defaults/project.sh" "$mr_root/.claude/rt-kit/defaults/project.sh" "$mr_root/.claude/rt-kit/project.sh"; do
                    # shellcheck disable=SC1090
                    [ -f "$mr_profile" ] && . "$mr_profile" 2>/dev/null
                done
                command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 || exit 0
                rt_shell_writes "$mr_target" || exit 0
                rt_shell_paths "$mr_target" | while IFS= read -r mr_path; do
                    [ -n "$mr_path" ] || continue
                    case "$mr_path" in /*) ;; *) mr_path="$mr_root/$mr_path" ;; esac
                    skill_for edit "$mr_path" "" 2>/dev/null
                done
                ;;
        esac
    ) | tr '\n' ' '
}

# The version `.nvmrc` of the tree pins, without the `v`: a full version, a major or a major and a
# minor. The first line that is not a comment counts, spaces and tabs aside. An alias — `lts/*`,
# `node` — and a tree with no `.nvmrc` give nothing.
rt_node_pin() {
    local pin
    # A byte order mark ahead of the version is dropped with the rest of the blank.
    pin="$({ LC_ALL=C sed -e "s/^$(printf '\357\273\277')//" -e 's/#.*//' -e 's/[[:space:]]//g' "${1:-.}/.nvmrc" | grep -m 1 .; } 2>/dev/null)"
    pin="${pin#v}"
    case "$pin" in '' | *[!0-9.]* | .* | *..* | *.) return 0 ;; esac
    printf '%s' "$pin"
}

# Whether version $1 is not lower than version $2, part by part as numbers: 22.01 equals 22.1.
rt_node_at_least() {
    awk -v a="$1" -v b="$2" 'BEGIN { n = split(a, x, "."); m = split(b, y, "."); if (m > n) n = m
        for (i = 1; i <= n; i++) { if (x[i] + 0 > y[i] + 0) exit 0; if (x[i] + 0 < y[i] + 0) exit 1 } exit 0 }'
}

# Whether node $1 serves pin $2: the pinned version itself; for a major or a major and a minor, any
# version under it; for a full version, a newer one of the same major too.
rt_node_serves() {
    local have="$1" pin="$2"
    case "$have" in "$pin" | "$pin".*) return 0 ;; esac
    case "$pin" in *.*.*) [ "${have%%.*}" = "${pin%%.*}" ] && rt_node_at_least "$have" "$pin" ;; *) return 1 ;; esac
}

# The bin directory of the pinned node under nvm. A full version takes its own directory, and with
# none — the highest installed one of the same major above it; a major or a major and a minor takes
# the highest installed version under it. An install with no executable node is passed over. The
# steps of a set run on it: the node the hook inherits may be another one, and a tree that demands
# its node refuses that.
rt_node_pinned_dir() {
    local pin base found version
    pin="$(rt_node_pin "${1:-.}")"
    [ -n "$pin" ] || return 0
    base="${NVM_DIR:-$HOME/.nvm}/versions/node"
    [ -x "$base/v$pin/bin/node" ] && printf '%s' "$base/v$pin/bin" && return 0
    for found in "$base"/v*/bin/node; do
        [ -x "$found" ] || continue
        version="${found%/bin/node}"
        printf '%s\n' "${version##*/v}"
    done | grep -E '^[0-9]+(\.[0-9]+)*$' | sort -t. -k1,1nr -k2,2nr -k3,3nr | while IFS= read -r version; do
        rt_node_serves "$version" "$pin" && printf '%s' "$base/v$version/bin" && break
    done || true
    return 0
}

# One line when no installed node serves the pin and the node of PATH does not serve it either: no
# step of a set runs then, and the line names the command that installs it. A node of PATH that
# serves the pin runs the steps as before.
rt_node_pin_mismatch() {
    local root="${1:-.}" pin have shown
    pin="$(rt_node_pin "$root")"
    [ -n "$pin" ] || return 0
    [ -n "$(rt_node_pinned_dir "$root")" ] && return 0
    have="$(node --version 2>/dev/null)"
    have="${have#v}"
    [ -n "$have" ] && rt_node_serves "$have" "$pin" && return 0
    shown="${have:+v$have}"
    printf 'node v%s is pinned in .nvmrc and not installed; PATH gives %s — nvm install %s' \
        "$pin" "${shown:-no node}" "$pin"
}
