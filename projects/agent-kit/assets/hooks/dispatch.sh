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

collected=""

# The journal of the turn exit: a Stop branch that failed or ran past its limit writes «движок упал»
# here, and the next turn starts with that line, so a released turn is never released in silence.
journal_file=""
journal_common="$(git -C "${RT_HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}" rev-parse --git-common-dir 2>/dev/null)"
case "$journal_common" in
    '') ;;
    /*) journal_file="$journal_common/rt-kit/turn-exit.log" ;;
    *) journal_file="${RT_HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}/$journal_common/rt-kit/turn-exit.log" ;;
esac
rt_dispatch_journal() {
    [ -n "$journal_file" ] || return 0
    mkdir -p "$(dirname "$journal_file")" 2>/dev/null || return 0
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >> "$journal_file" 2>/dev/null
}
if [ "$event" = UserPromptSubmit ] && [ -s "$journal_file" ]; then
    read_mark="${journal_file%.log}.read"
    seen="$(cat "$read_mark" 2>/dev/null || echo 0)"
    total="$(wc -l < "$journal_file" | tr -d ' ')"
    if [ "$total" -gt "$seen" ] 2>/dev/null; then
        fresh="$(tail -n "$((total - seen))" "$journal_file" | grep 'движок упал' | cut -f2- | tail -3)"
        printf '%s\n' "$total" > "$read_mark" 2>/dev/null
        if [ -n "$fresh" ]; then
            notice="The previous turn was released by a failure of the exit check, not by the scenario: ${fresh}. Measure the branch first — node tools/task-flow-script.mjs measure."
            answers="${answers:-}$(jq -cn --arg c "$notice" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$c}}' | jq -Rsc . 2>/dev/null)
"
            collected="${collected}$(jq -cn --arg c "$notice" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$c}}')
"
            count=$((${count:-0} + 1))
        fi
    fi
fi
# A merge of the base leaves conflict markers in the guards themselves, and a guard that does not parse
# refuses every call, the one that takes the markers off with the rest. They are taken off by the text
# of this side, for one guard or for all of them, and by the undoing of the merge, the rebase or the
# cherry-pick. While a file of the guards does not parse and one of the three goes on, exactly these pass
# unjudged; a call after them is judged as before. Outside of the three the same restore would silently
# drop an edit nobody committed, and it does not pass.
rt_dispatch_root="$(cd "${CLAUDE_PROJECT_DIR:-${RT_HOOK_CWD:-.}}" 2>/dev/null && pwd -P)"
rt_dispatch_rel="$(cd "$here" && pwd -P)"
case "$rt_dispatch_rel" in
    "$rt_dispatch_root"/*) rt_dispatch_rel="${rt_dispatch_rel#"$rt_dispatch_root"/}" ;;
    *) rt_dispatch_rel=".claude/hooks" ;;
esac
rt_dispatch_recovery="git checkout --ours -- $rt_dispatch_rel"
rt_dispatch_broken() {
    for rt_dispatch_file in "$here"/*.sh; do
        bash -n "$rt_dispatch_file" 2>/dev/null || { printf '%s' "${rt_dispatch_file##*/}"; return 0; }
    done
    return 1
}
rt_dispatch_merging() {
    for rt_dispatch_head in MERGE_HEAD REBASE_HEAD CHERRY_PICK_HEAD; do
        git -C "$here" rev-parse -q --verify "$rt_dispatch_head" >/dev/null 2>&1 && return 0
    done
    return 1
}
if [ "$event" = PreToolUse ]; then
    rt_dispatch_cmd="$(printf '%s' "${RT_HOOK_CMD:-}" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//; s/^git -C [^[:space:];&|$`]+ /git /')"
    # One guard of the directory is restored by its file, and the neighbours keep their edits.
    case "$rt_dispatch_cmd" in "$rt_dispatch_recovery/"*[!A-Za-z0-9_./-]* | *..*) ;; "$rt_dispatch_recovery/"*.sh) rt_dispatch_cmd="$rt_dispatch_recovery" ;; esac
    case "$rt_dispatch_cmd" in
        "$rt_dispatch_recovery" | 'git merge --abort' | 'git rebase --abort' | 'git cherry-pick --abort')
            rt_dispatch_broken >/dev/null && rt_dispatch_merging && exit 0
            ;;
    esac
fi

branches="$(grep -l '^# rt-hook:' "$here"/*.sh 2>/dev/null | sort)"
[ -z "$branches" ] && [ -z "$collected" ] && exit 0

# A file happens to have several declarations: a guard standing both on a tool call and on the end
# of a turn names both events by lines of its own. Before, only the first was read — and the second
# branch was never called, silently: from the outside that is indistinguishable from a guard that
# looked and let through.

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
    # A branch names its own limit by `# rt-hook-timeout: <seconds>`; past it the branch is stopped.
    limit="$(sed -n 's/^# rt-hook-timeout:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$branch" 2>/dev/null | head -1)"
    run=(bash "$branch")
    [ -n "$limit" ] && command -v perl >/dev/null 2>&1 && run=(perl -e 'alarm shift; exec @ARGV' "$limit" bash "$branch")
    branch_err="$(mktemp 2>/dev/null)"
    if [ -n "$branch_err" ]; then
        branch_out="$(printf '%s' "$input" | "${run[@]}" 2>"$branch_err")"
        code=$?
        said_err="$(cat "$branch_err" 2>/dev/null)"
        rm -f "$branch_err" 2>/dev/null
    else
        branch_out="$(printf '%s' "$input" | "${run[@]}" 2>/dev/null)"
        code=$?
        said_err=""
    fi
    # On Stop a branch that failed or ran past its limit releases the turn and says so in the journal:
    # a stop the engine did not decide is written, never taken for a verdict.
    if [ "$code" -ne 0 ] && [ "$event" = Stop ]; then
        rt_dispatch_journal "движок упал: $(basename "$branch") exited $code"
        continue
    fi
    if [ "$code" -ne 0 ]; then
        if ! bash -n "$branch" 2>/dev/null; then
            # The guard did not judge: its file does not parse. The way out is named, for the call that
            # fixes the file is refused by the same file.
            if rt_dispatch_merging; then
                refusal="$(printf 'The guard %s does not parse, so it judged nothing: the merge left conflict markers in it. Take them off by one of two commands, alone in the call — %s/%s (the edit of the other side to a laid-out guard comes back with the layout, to one of the tree by hand), or git merge --abort. Both pass while a guard does not parse. A guard one side deleted has no version of this side, and the first command stops on it: the merge is undone.' \
                    "$(basename "$branch")" "$rt_dispatch_recovery" "$(basename "$branch")")"
            else
                refusal="$(printf 'The guard %s does not parse, so it judged nothing, and no merge goes on. A laid-out guard is put back by the layout, one of the tree is fixed by the owner in the terminal: every call of the session is refused by the same file.' "$(basename "$branch")")"
            fi
        elif [ -n "$branch_out" ]; then
            refusal="$branch_out"
        elif [ -n "$said_err" ]; then
            refusal="$said_err"
        else
            # The branch exited non-zero and said nothing by either stream. From the outside that
            # is indistinguishable from a refusal on the merits, and there is nothing to fix: nobody
            # knows which file is broken. So the dispatcher names it itself, otherwise nothing says
            # anything about a broken branch.
            refusal="$(printf 'The guard %s exited with code %s and printed nothing: the file looks broken.' \
                "$(basename "$branch")" "$code")"
        fi
        printf '%s\n' "$refusal"
        # At code 2 the agent is given only the error stream, and the output stream is dropped:
        # a refusal printed only above reached the executor empty. The text goes to both.
        printf '%s\n' "$refusal" >&2
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

    # Each answer is kept apart, as a JSON string per line: glued together, two objects are no longer
    # one answer, and the merge at the end needs to know where one ends.
    if [ -n "$branch_out" ]; then
        answers="${answers:-}$(printf '%s' "$branch_out" | jq -Rsc . 2>/dev/null)
"
        collected="${collected}${branch_out}
"
        count=$((${count:-0} + 1))
    fi
done

# The answers of several branches are merged into one object. Objects printed one after another are
# no longer one answer: the agent read them as raw text, and the laws and the handover of a session
# start arrived cut. The texts of the context and of the system message are joined by an empty line,
# the plain text of a branch goes into the context, the other fields are taken in the order of the
# branches. An event without a context field keeps the text in the system message.
rt_dispatch_merge() {
    case "$event" in
        SessionStart | UserPromptSubmit | PreToolUse | PostToolUse) with_context=true ;;
        *) with_context=false ;;
    esac
    printf '%s' "$answers" | jq -sc --arg ev "$event" --argjson ctx "$with_context" '
        map(. as $s | (try ($s | fromjson) catch null) as $j
            | if ($j | type) == "object" then {obj: $j} else {text: ($s | sub("\\s+$"; ""))} end)
        | [.[] | .obj // empty] as $objs
        | ([$objs[] | .hookSpecificOutput.additionalContext // empty]
            + [.[] | .text // empty | select(length > 0)]) as $texts
        | [$objs[] | .systemMessage // empty] as $sys
        | (reduce $objs[] as $o ({};
            . * ($o | del(.systemMessage)
                | if (.hookSpecificOutput | type) == "object"
                  then .hookSpecificOutput |= del(.additionalContext) else . end))) as $base
        | if $ctx then
            $base
            | if ($texts | length) > 0 then
                .hookSpecificOutput = ((.hookSpecificOutput // {})
                    + {hookEventName: $ev, additionalContext: ($texts | join("\n\n"))})
              else . end
            | if ($sys | length) > 0 then .systemMessage = ($sys | join("\n\n")) else . end
          else
            ($base | del(.hookSpecificOutput))
            | if (($sys + $texts) | length) > 0 then .systemMessage = (($sys + $texts) | join("\n\n"))
              else . end
          end
    ' 2>/dev/null
}

# Not one branch refused: what they printed is given out — hints and digests. A single answer goes
# out as it is; where the merge has no parser, the former glued output is better than silence.
if [ "${count:-0}" -gt 1 ]; then
    merged="$(rt_dispatch_merge)"
    if [ -n "$merged" ]; then
        printf '%s\n' "$merged"
    else
        printf '%s' "$collected"
    fi
elif [ -n "${collected:-}" ]; then
    printf '%s' "$collected"
fi

exit 0
