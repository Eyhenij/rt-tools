#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/hook-input.sh · 24aec8980099 · правится надстройкой, не здесь
# Shared reading of the hook input. NOT a guard: it has no `rt-hook:` declaration and does not
# subscribe to the agent events. The guards source it themselves — by the same technique they source
# the shared refusal tail.
#
# Why it exists. The input arrives as one object, and every guard needs the same fields from it: the
# tool name, the command line, the edit path, the working directory. While each of them pulled these
# out on its own, one agent call cost more than a hundred parses of one and the same text — six or
# seven per guard, eighteen guards per event. A parse costs six milliseconds, a shell start — five.
#
# How it works. The dispatcher parses the input once and puts the fields into the environment. The
# guard asks for them here: present in the environment — it takes what is ready, absent — it parses
# itself. The second is the direct call: that is how the guards are called by the scenario suites,
# and they must work without the dispatcher too.
#
# WHY READING THE STREAM IS A SEPARATE COMMAND AND NOT A VALUE. Command substitution runs in a
# subshell, and everything it remembered dies with it: the first call would read the stream out, and
# the second would get emptiness — and the guard would let through a call it was obliged to refuse.
# So the stream is read by the command `rt_hook_read`, which puts the input into a variable of the
# current shell, not by a function that returns it through substitution.
#
# FAIL-OPEN, IN FAVOUR OF WORK: no parser, broken input, an empty field — an empty string. Broken
# reading has no right to jam the work: on an empty field the guard exits with zero.

# Reads the input into `RT_HOOK_INPUT`, if it is not there yet. Called as a command, not as a
# substitution.
rt_hook_read() {
    [ -n "${RT_HOOK_INPUT:-}" ] && return 0

    RT_HOOK_INPUT="$(cat 2>/dev/null)"
    export RT_HOOK_INPUT
    return 0
}

# An input field by variable name and path in the object: `rt_hook_field RT_HOOK_TOOL '.tool_name'`.
# The environment variable outranks parsing — it is put there by the dispatcher, which parsed the
# input once.
rt_hook_field() {
    local name="$1" path="$2"

    # What is ready is trusted only by the sign of parsing, not by the fact that the variable is
    # declared. An empty variable in the environment means "there is no field", and without the sign
    # it is indistinguishable from "the field is there and it is empty": the guard stopped parsing
    # the input and let through calls it was obliged to refuse. The suites caught this with sixteen
    # failures — the run environment carried empty values.
    if [ "${RT_HOOK_PARSED:-}" = '1' ] && [ -n "${!name+x}" ]; then
        printf '%s' "${!name}"
        return 0
    fi

    rt_hook_read
    printf '%s' "$RT_HOOK_INPUT" | jq -r "${path} // empty" 2>/dev/null
}

# THE START OF A CALL IN THE COMMAND LINE. The prefix of the pattern by which a guard recognises its
# own call: the command stands at the start of the line, after a separator — and after any number of
# environment variable assignments before its name.
#
# Assignments belong here because a call with them is the ordinary form, and part of the suite
# demands it outright: the identity of the call that opens a PR is visible from the command only by
# an explicit substitution of the token. A sign that knew nothing of assignments went blind on this
# form silently — it did not refuse and did not warn, it did not count the call as a call, and the
# whole subject of the guard stayed unjudged. That is how the push, the opening of a PR, taking off
# the draft and the merge went past their own guards: a commit with a foreign signature went into
# the main branch, and the ban on a merge by the agent was lifted by substituting the token.
#
# The value of an assignment comes in three kinds: without spaces, as a substitution `$( … )` and in
# quotes. Before, only the first was accepted, while PRs are opened by the command
# `GH_TOKEN=$(cat <file>) gh pr create …` — the path in the substitution holds a space, and the
# delivery guard did not check such a command: neither the branch number, nor the body of the PR,
# nor the taking apart of the task folder. The silence of a guard is indistinguishable from a
# permission.
#
# A substitution is taken up to the first closing bracket, a quoted string — up to the closing quote
# of the same kind. Nested brackets and quotes the pattern does not parse: the sign stays a pattern,
# not a shell parser. The sign must err on the side of firing too often: a guard that did not
# recognise a call stays silent and looks sound; one that fired an extra time is visible at once and
# gets fixed.
#
# An assignment by itself does not count as a call: a command name must stand after it.
#
# A directory before the name is the same command. A client whose own name is taken by a shell alias
# is called by the full path, and a sign that knew only the bare name did not recognise such a call
# at all: the guard exited with zero, and its silence is indistinguishable from a permission. That
# is how PRs went out opened not by the machine record. A path part does not cross a space, so it
# stays inside one word and glues nothing extra to the call.
#
# A runner standing before the call is the same call. `timeout`, `nohup`, `env`, `sudo` and their
# kin take a command and run it as their own argument: the call is there, and the sign, looking only
# at the start of the line, did not see it. One push with `timeout` before it went past the whole
# gate set — the branch left with two red checks, and the pipeline caught them a minute later. The
# list is closed: any word before the call would count `echo git push` as a push.
#
# This is declared in a SINGLE place, not as a literal in every guard: having diverged, the copies
# are fixed one at a time and say nothing about the rest staying blind.
RT_CMD_RUNNER='((timeout|nohup|time|command|nice|stdbuf|sudo|env|caffeinate|setsid|ionice)([[:space:]]+(-[^[:space:]]+|[0-9]+(\.[0-9]+)?[smhd]?|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*))*[[:space:]]+)*'
RT_CMD_BOUND='(^|[;&|(]|&&|\|\|)[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=([^[:space:]]*|\$\([^)]*\)|"[^"]*"|'"'"'[^'"'"']*'"'"')[[:space:]]+)*'"$RT_CMD_RUNNER"'([^[:space:]]*/)?'

# The fields that all guards ask for.
rt_hook_tool() { rt_hook_field RT_HOOK_TOOL '.tool_name'; }
rt_hook_cmd() { rt_hook_field RT_HOOK_CMD '.tool_input.command'; }
rt_hook_file() { rt_hook_field RT_HOOK_FILE '.tool_input.file_path'; }
rt_hook_cwd() { rt_hook_field RT_HOOK_CWD '.cwd'; }

# WAITS FOR THE LAST TEXT OF THE TURN IN THE RECORD. The guards of the ending judge what was said
# to the owner, while the record of the turn at that moment happens to be incomplete: the text of
# the reply lands in the file no earlier than the host calls the hook, and the guard reads a turn
# that has no text at all. It stays silent honestly — and from the outside it is indistinguishable
# from a guard that looked and let through. Exactly so a turn that put the work into dependence on
# the word of the owner went past three guards at once, while the same turn, fed to them a second
# time, was refused.
#
# We wait in short attempts: the file is written up in milliseconds, and a turn does not end
# instantly anyway. Waited it out — zero; still no text — one, and the guard decides from there.
rt_turn_has_text() {
    local transcript="$1" tries="${2:-20}" got

    [ -n "$transcript" ] && [ -f "$transcript" ] || return 1
    command -v jq >/dev/null 2>&1 || return 1

    while [ "$tries" -gt 0 ]; do
        got="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
            def is_input:
                .type == "user"
                and ((.isCompactSummary // false) | not)
                and (((.message.content // []) | if type == "array"
                        then ([.[] | select(.type == "tool_result")] | length)
                        else 0 end) == 0);

            (map(is_input) | rindex(true)) as $i
            | (if $i == null then . else .[$i + 1:] end)
            | [.[] | select(.type == "assistant") | (.message.content // [])[]
                 | select(.type == "text") | .text]
            | length
        ' 2>/dev/null)"

        [ -n "$got" ] && [ "$got" != '0' ] && return 0

        tries=$((tries - 1))
        [ "$tries" -gt 0 ] && sleep 0.05
    done

    return 1
}
