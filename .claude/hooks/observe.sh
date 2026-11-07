#!/usr/bin/env bash
# rt-kit v0.34.0 · hooks/observe.sh · 57b0bcd89216 · правится надстройкой, не здесь
# Recording observations about the rules layer. NOT a guard: it has no `rt-hook:` declaration and it
# hooks into no agent event. The guards source it — the same way the gate sources the map.
#
# Why it exists. Edits to the package texts came out of the head of whoever writes them: what of the
# laid-out is used every day, what was never used once and what people stumble over a second time
# was unknown to the package. Part of the data was already being gathered and thrown away — the
# record of loads lived in a temporary directory and died with the compaction of the context.
#
# WHAT IS RECORDED. Only the names of package resources and counters: the name of a rule or a guard,
# the kind of event, the kind of file, the package version and the sign of a session. No tree paths,
# no names of its domains, no name of the tree itself — and this rests not on the caller's memory
# but on `rt_observe_clean`: a value with a slash is not written at all. An observation later
# travels into someone else's repository, and the ban on naming a foreign tree has to rest on the
# construction.
#
# FAIL-OPEN. An observation is a guard's side work, and any breakage of it silently lets the action
# through: an unavailable directory, a missing `date`, a full disk. A guard that fell over on
# recording an observation would stop work for the sake of statistics.

# A value fit for recording. A path is not carried out under any circumstances, the rest is cleaned
# down to a name and trimmed: a long value in an observation means nothing but a leak.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

rt_observe_clean() {
    case "$1" in
        */*) return 0 ;;
    esac
    printf '%s' "$1" | LC_ALL=C tr -cd 'A-Za-z0-9._:-' | cut -c1-48
}

# The sign of a session: it is computed from the session name and cannot be restored back. It is
# needed so that the digest knows the number of sessions, not only the number of events.
rt_observe_session() {
    printf '%s' "$1" | cksum 2>/dev/null | cut -d' ' -f1
}

# The version of the package that laid this file out. It stands in the header put there by the
# layout; in the package sources there is no header, and the version there is `dev`.
rt_observe_version() {
    local found
    found="$(sed -n 's/^# rt-kit v\([^ ]*\) .*/\1/p' "${BASH_SOURCE[0]}" 2>/dev/null | head -1)"
    printf '%s' "${found:-dev}"
}

# The observations directory of this tree. An empty string — there will be no record.
rt_observe_dir() {
    local root="${CLAUDE_PROJECT_DIR:-.}" config
    config="$root/.claude/rt-kit.json"
    # The tree's switch kills the recording whole, not in parts: the package is installed by those
    # we know nothing about too. An unreadable setting does not count as switching off — otherwise
    # broken JSON would quietly switch the observations off, and there would be nothing to see it
    # by.
    if [ -f "$config" ] && command -v jq >/dev/null 2>&1; then
        [ "$(jq -r 'if .observe == false then "off" else "on" end' "$config" 2>/dev/null)" = "off" ] && return 0
    fi
    printf '%s' "$root/.claude/rt-kit/observations"
}

# One observation: the kind of event and `key=value` pairs. The `sid` key is hashed, the rest are
# cleaned. An empty value creates no field.
#
#   rt_note gate-deny res=styling-bem kind=scss sid="$sid"
rt_note() {
    local kind="$1" dir day stamp line pair key value
    [ -n "$kind" ] || return 0
    shift

    dir="$(rt_observe_dir)"
    [ -n "$dir" ] || return 0
    mkdir -p "$dir" 2>/dev/null || return 0

    day="$(date -u +%Y-%m-%d 2>/dev/null)" || return 0
    stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null)" || return 0
    [ -n "$day" ] || return 0

    line="{\"t\":\"$stamp\",\"ev\":\"$(rt_observe_clean "$kind")\""
    for pair in "$@"; do
        key="$(rt_observe_clean "${pair%%=*}")"
        value="${pair#*=}"
        [ -n "$key" ] || continue
        if [ "$key" = "sid" ]; then
            value="$(rt_observe_session "$value")"
        else
            value="$(rt_observe_clean "$value")"
        fi
        [ -n "$value" ] || continue
        line="$line,\"$key\":\"$value\""
    done
    line="$line,\"v\":\"$(rt_observe_version)\"}"

    printf '%s\n' "$line" >> "$dir/$day.jsonl" 2>/dev/null || return 0
    rt_send_start 2>/dev/null
    return 0
}

# The package command of this tree: a consumer has it installed, the tree of sources has it built. An
# empty string means there is nothing to send with.
rt_send_command() {
    local root="$1"
    if [ -x "$root/node_modules/.bin/agent-kit" ]; then
        printf '%s' "$root/node_modules/.bin/agent-kit"
    elif [ -f "$root/dist/agent-kit/bin/agent-kit.js" ]; then
        printf 'node %s' "$root/dist/agent-kit/bin/agent-kit.js"
    fi
}

# Starts the sending in a process of its own and returns at once: a guard stands on every call and
# never waits for the network. The 15 minutes are asked of the mark's time first, so a guard pays
# for one `find`, not for a process. The command checks the same limit itself, because a person can
# call it too.
#
#   rt_send_start [--session-end]
rt_send_start() {
    local root="${CLAUDE_PROJECT_DIR:-.}" config command dir
    config="$root/.claude/rt-kit.json"
    dir="$(rt_observe_dir)"
    [ -n "$dir" ] && [ -f "$config" ] || return 0
    if [ -z "${1:-}" ] && [ -n "$(find "$dir/.marks/send.json" -mmin -15 2>/dev/null)" ]; then
        return 0
    fi
    command -v jq >/dev/null 2>&1 || return 0
    [ "$(jq -r 'if (.intake // "") == "" or .send == false then "off" else "on" end' "$config" 2>/dev/null)" = "on" ] || return 0
    command="$(rt_send_command "$root")"
    [ -n "$command" ] || return 0

    # shellcheck disable=SC2086
    (nohup $command send --quiet ${1:-} --root "$root" >/dev/null 2>&1 &) >/dev/null 2>&1
    return 0
}

# A line about a send that failed more than a day ago. Silence: nothing failed, or it is too fresh to
# bother a person with — the next try may well go through.
rt_send_fault_line() {
    local dir mark
    dir="$(rt_observe_dir)"
    mark="$dir/.marks/send.json"
    [ -n "$dir" ] && [ -f "$mark" ] || return 0
    command -v jq >/dev/null 2>&1 || return 0
    jq -r --argjson now "$(date +%s)" \
        'select(.fault != 0 and ($now * 1000 - .tried) > 86400000)
         | "The numbers of this tree have not reached the intake: \(.reason). `agent-kit doctor` names the way out."' \
        "$mark" 2>/dev/null
    return 0
}
