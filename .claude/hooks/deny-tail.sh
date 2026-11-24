#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/deny-tail.sh · 548a90f48bb1 · правится надстройкой, не здесь
# The shared deny tail. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event.
# The guards source it themselves — the same way they source the observation record and the word
# about a missing profile function.
#
# Why it exists. A guard's refusal names the miss and the way to lift it, and nobody names what to
# do when lifting it does not work out. The empty place is taken by a third move that is in no rule:
# bypass silently — by a shell command, by a neighbouring tool, by editing the guard itself. That is
# what happened: within one hour a refusal was bypassed twice, and both times the edit landed past
# the guard. There are two lawful moves, and both are named right in the refusal text instead of
# being left to the reader's guess.
#
# WHAT IS SAID. Fix what was named and repeat the call — or bring the owner the price of the bypass
# and wait for their word. Where the bypass has a lawful form — a line in the commit body, a line
# in the plan, a command flag — the same tail names it: a bypass known to be lawful is looked for by
# the guard's own words, not past the guard.
#
# WHAT THE TAIL DOES NOT DO. It does not judge whether the bypass fits this case: the owner decides
# that. And it does not replace the refusal reason — that stands before it and names the miss by
# name.
#
# THE REFUSAL RECORD IS NOT HERE. Every refusal passes through the decider call, `rt_decide` in
# `decide.sh`: it knows the decision the table took and writes the record.

# The deny tail as a string. The first parameter is the lawful form of bypass, if the refusal has
# one; empty means there is no lawful form at all, and this is said outright.
#
#   reason="BLOCKED: <reason>. $(rt_deny_tail 'the line `Docs-skip: <reason>` in the commit body')"
#   reason="BLOCKED: <reason>. $(rt_deny_tail)"
# The rule the rules gate still waits for in this session, or nothing. A refusal names a move, and
# the gate refuses that very move while its rule is not loaded: the executor then walks from one
# refusal to the next. A guard that names a move the gate judges asks here first and names the
# loading of the rule instead. The gate's own reading is repeated, not called: the gate is a hook
# with input of its own, and the record and the rule directory are the whole of its answer.
# Parameters: the rule name, the session id.
rt_gate_pending() {
    local rule="$1" sid="${2:-nosession}"
    local loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
    [ -f "${CLAUDE_PROJECT_DIR:-.}/${RT_RULES_DIR:-.claude/skills}/${rule}/SKILL.md" ] || return 1
    [ -f "$loaded" ] && grep -qE "^([^:]*:)?${rule}$" "$loaded" 2>/dev/null && return 1
    printf '%s' "$rule"
}

# The words about the part of a compound command a refusal judges, or nothing for a plain command.
# The harness refuses the call whole, so the neighbours of the judged part did not run either, and a
# refusal that does not say so reads as if the rest of the command were done. The second parameter is
# an extended regular expression of what the guard judged; among the parts that carry it a part with a
# write sign comes first. The body of a heredoc is data and is no part. No part carries it — a script
# file holds it — and the words name the call as a whole.
rt_judged_part() {
    printf '%s\n' "$1" | RT_JP_WANT="$2" awk -v sq="'" '
        function flush() {
            gsub(/^[ \t]+|[ \t]+$/, "", seg)
            if (seg != "") { part[++n] = seg }
            seg = ""
        }
        {
            if (tag != "") { line = $0; gsub(/^[ \t]+|[ \t]+$/, "", line); if (line == tag) { tag = "" } ; next }
            len = length($0)
            for (i = 1; i <= len; i++) {
                c = substr($0, i, 1)
                if (c == "\\" && q != sq && i < len) { seg = seg c substr($0, i + 1, 1); i++; continue }
                if (q != "") { if (c == q) { q = "" } }
                else if (c == "\"" || c == sq || c == "`") { q = c }
                else if (c == ";" || c == "|") { flush(); continue }
                else if (c == "&" && substr($0, i + 1, 1) != ">" && substr($0, i - 1, 1) != ">") { flush(); continue }
                seg = seg c
            }
            if (q == "" && match($0, "<<-?[ \t]*[\"" sq "]?[A-Za-z_][A-Za-z0-9_]*")) {
                tag = substr($0, RSTART, RLENGTH); sub("^<<-?[ \t]*[\"" sq "]?", "", tag)
            }
            if (q == "") { flush() } else { seg = seg " " }
        }
        END {
            flush()
            if (n < 2) { exit }
            want = ENVIRON["RT_JP_WANT"]
            for (k = 1; k <= n; k++) {
                if (part[k] !~ want) { continue }
                if (first == "") { first = part[k] }
                if (wrote == "" && part[k] ~ /[>]|tee |sed |cp |mv |install |python|node |ruby |perl |php /) { wrote = part[k] }
            }
            said = wrote != "" ? wrote : first
            if (length(said) > 240) { said = substr(said, 1, 240) "…" }
            if (said != "") { printf "The part of the command judged here: `%s`. ", said }
            printf "The call is refused whole: none of the %d parts of the command ran, send the others as calls of their own.", n
        }
    ' 2>/dev/null
}

rt_deny_tail() {
    if [ -n "$1" ]; then
        printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. The lawful form of bypass: %s. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.' "$1"
        return 0
    fi

    printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. There is no lawful form of bypass for this refusal. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.'
}
