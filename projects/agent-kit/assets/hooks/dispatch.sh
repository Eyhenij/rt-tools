#!/usr/bin/env bash
# The dispatcher of agent events. NOT a guard: it has no `rt-hook:` declaration — on the contrary,
# it reads such declarations in the others. In the agent settings it stands alone on an event
# instead of a list.
#
# Why it exists. The agent calls every guard in a process of its own and feeds each of them the same
# input. There are eighteen guards on a tool call, and each parses the input anew — six or seven
# calls of the parser. The measurement of this tree: eight hundred and twenty-six milliseconds per
# call, of which eighty-five are the starting of shells, and the rest is repeated parsing of one
# text.
#
# What it does. It reads the input once, parses it once, puts the fields into the environment and
# calls the branches of the event in order. The first non-zero return code is given to the agent
# together with the output of the guard — the remaining branches are not called: a refusal ended the
# call at the very first guard before as well.
#
# What it does not do. It judges nothing itself and replaces no guard: the files stay as they were,
# the entry point changes. The event and the call pattern are carried by the guard itself, by the
# `# rt-hook:` line in its header, and the map is assembled from them — a list written out
# separately would diverge from the set of files at the very first one added.
#
# FAIL-OPEN, IN FAVOUR OF WORK: no event in the argument, no guards directory, no parser — exit with
# zero. A broken dispatcher has no right to jam the work.

set -u

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/utf8.sh" 2>/dev/null || true

event="${1:-}"
[ -z "$event" ] && exit 0

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

# One parse for all the branches: four fields by one call of the parser instead of six per guard.
# The values arrive already quoted for the shell — that is what `@sh` in the parser is made for: the
# command line holds both quotes and newlines, and there is no other way to substitute it.
assignments="$(printf '%s' "$input" | jq -r '@sh "RT_HOOK_TOOL=\(.tool_name // "") RT_HOOK_CMD=\(.tool_input.command // "") RT_HOOK_FILE=\(.tool_input.file_path // "") RT_HOOK_CWD=\(.cwd // "") RT_HOOK_SOURCE=\(.source // "")"' 2>/dev/null)"
if [ -n "$assignments" ]; then
    eval "$assignments" 2>/dev/null || true
    export RT_HOOK_TOOL RT_HOOK_CMD RT_HOOK_FILE RT_HOOK_CWD RT_HOOK_SOURCE
    # The sign of parsing: by it the branches tell a ready field from an empty variable that ended
    # up in the run environment by chance. Without it an empty value reads as "there is no field".
    export RT_HOOK_PARSED=1
fi
export RT_HOOK_INPUT="$input"

branches="$(grep -l '^# rt-hook:' "$here"/*.sh 2>/dev/null | sort)"
[ -z "$branches" ] && exit 0

# A file happens to have several declarations: a guard standing both on a tool call and on the end
# of a turn names both events by lines of its own. Before, only the first was read — and the second
# branch was never called, silently: from the outside that is indistinguishable from a guard that
# looked and let through.
collected=""
for branch in $branches; do
    matched=0
    while IFS= read -r declaration; do
        [ -z "$declaration" ] && continue

        branch_event="${declaration%% *}"
        [ "$branch_event" = "$event" ] || continue

        # The call pattern: there is none at all — the guard is called on any; there is one — it is
        # matched in full, not by a piece. A star and a dot with a star mean the same: any call.
        #
        # The subject of the match depends on the event. For a tool call it is the tool name; at the
        # entry into a session there is no tool name, and the pattern there names the kind of start
        # — `startup`, `resume`, `compact`, `clear`. A match against an empty name never coincided,
        # and not a single entry hook was called through the dispatcher: the session began without
        # the body of laws, without the glossary, without the work state and without the handover of
        # the previous session — with a zero code and empty output.
        matcher="${declaration#"$branch_event"}"
        matcher="${matcher#"${matcher%%[![:space:]]*}"}"
        subject="${RT_HOOK_TOOL:-}"
        [ -z "$subject" ] && subject="${RT_HOOK_SOURCE:-}"
        if [ -n "$matcher" ] && [ "$matcher" != '*' ] && [ "$matcher" != '.*' ]; then
            [[ "$subject" =~ ^(${matcher})$ ]] || continue
        fi

        matched=1
        break
    done <<EOF
$(sed -n 's/^# rt-hook:[[:space:]]*//p' "$branch" 2>/dev/null)
EOF

    # At least one declaration matched — the branch is called once. Two declarations of one event in
    # one file would call the guard twice on one input, and the second call would judge the same
    # thing.
    [ "$matched" = 1 ] || continue

    # The error stream of a branch is collected separately, not discarded: on a successful turn it
    # is noise and does not go out, and on a refusal it is the reason itself. A guard that prints
    # its refusal there reached the executor as a line about a broken file — with the file whole and
    # the text plain, which nobody saw. In one session two refusals in a row were lost that way.
    branch_err="$(mktemp 2>/dev/null)"
    if [ -n "$branch_err" ]; then
        branch_out="$(printf '%s' "$input" | bash "$branch" 2>"$branch_err")"
        code=$?
        said_err="$(cat "$branch_err" 2>/dev/null)"
        rm -f "$branch_err" 2>/dev/null
    else
        branch_out="$(printf '%s' "$input" | bash "$branch" 2>/dev/null)"
        code=$?
        said_err=""
    fi
    if [ "$code" -ne 0 ]; then
        if [ -n "$branch_out" ]; then
            printf '%s\n' "$branch_out"
        elif [ -n "$said_err" ]; then
            printf '%s\n' "$said_err"
        else
            # The branch exited non-zero and said nothing by either stream. From the outside that
            # is indistinguishable from a refusal on the merits, and there is nothing to fix: nobody
            # knows which file is broken. So the dispatcher names it itself, otherwise nothing says
            # anything about a broken branch.
            printf 'The guard %s exited with code %s and printed nothing: the file looks broken.\n' \
                "$(basename "$branch")" "$code"
        fi
        exit "$code"
    fi

    # A refusal from a branch comes not as a return code but as a decision in the output: the guards
    # of the end of a turn print it and exit with zero. Without stopping here, the dispatcher would
    # glue this object to the output of the next branch — and what is glued together is not parsed,
    # so the refusal is lost entirely. There are two forms of a refusal under a zero code: the block
    # decision of the guards of the end of a turn and the call-denied decision of the guards of an
    # edit. The second was not recognised at all — the refusal went into the shared collected output
    # and was glued to the output of a neighbouring branch, and what is glued together is not
    # parsed: a guard called on its own answered with a denial, while through the dispatcher the
    # refusal was lost entirely.
    if [ -n "$branch_out" ] && printf '%s' "$branch_out" | jq -e '
        .decision == "block" or .hookSpecificOutput.permissionDecision == "deny"
    ' >/dev/null 2>&1; then
        printf '%s\n' "$branch_out"
        exit 0
    fi

    [ -n "$branch_out" ] && collected="${collected}${branch_out}
"
done

# Not one branch refused: what they printed is given out — hints and digests.
[ -n "${collected:-}" ] && printf '%s' "$collected"

exit 0
