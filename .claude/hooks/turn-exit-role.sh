#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/turn-exit-role.sh · a29644a324c1 · правится надстройкой, не здесь
# The role a session runs as, for the turn-exit guard. NOT a guard: it has no `rt-hook:` declaration
# and hooks into no agent event. The guard sources it right after the root of the tree is known.
#
# Why it exists. A role started as the main agent, `claude -p --agent <role>`, is judged as an
# executor, and a role without an edit tool can never pass that judgement: there is no edit in its
# turn, no word of the owner about a stop, and no owner to ask. Under an open epic the guard gave
# such a turn back on every pass. A run ended on the turn limit, or the refusal took up the final
# message in place of the report it was started for. The report is the whole work of such a role.
#
# How the role is recognised. The client puts the name into the field `agent_type` of the event; a
# role called through the agent tool ends with another event and never reaches the guard. The tools
# are read from the `tools:` line in the header of the role file. A role with no such line, or with
# `tools: *`, gets every tool the session has, so it stays judged as an executor; so does a role
# with no file in the tree, a built-in or a plugin one: there is nothing to read its tools from.
#
# Expects `$input` and `$root` to be set; the answer is the return code.
#
# FAIL-OPEN towards the judgement: no field, no file, an unusual name or an unreadable header — the
# session reads as an executor, and the guard works as it did before this reading existed.

rt_te_read_only_role() {
    local role file tools
    role="$(printf '%s' "$input" | jq -r '.agent_type // empty' 2>/dev/null)"
    [ -n "$role" ] || return 1
    case "$role" in
        */* | .*) return 1 ;;
    esac
    file="$root/.claude/agents/$role.md"
    [ -f "$file" ] || return 1

    # Only the header is read: the body of a role may quote the line itself.
    tools="$(awk '
        NR == 1 { if ($0 != "---") exit; next }
        $0 == "---" { exit }
        /^tools:/ { sub(/^tools:[[:space:]]*/, ""); print; exit }
    ' "$file" 2>/dev/null)"
    [ -n "$tools" ] || return 1
    case "$tools" in
        *'*'*) return 1 ;;
    esac

    ! printf '%s' "$tools" \
        | grep -qE '(^|[^[:alnum:]_])(Write|Edit|MultiEdit|NotebookEdit)([^[:alnum:]_]|$)' 2>/dev/null
}
