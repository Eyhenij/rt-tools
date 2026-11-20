#!/usr/bin/env bash
# rt-kit v0.37.1 · hooks/rule-source-guard.sh · bd4ed987f32d · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh, hooks/write-targets.sh, hooks/guard-note.sh
# Guard of the place of the edit: the rules layer is fixed where it is broken, not where it is seen.
#
# The rules layer is edited by the same executor the rules layer governs, and nothing in the tree
# shows the difference between "I follow a rule" and "I edit a rule": the laid-out copy lies next to
# ordinary files and is edited the same way. The edit reaches the disk and does not reach the place
# where the miss is fixed: in the tree it is visible, in the package it is absent, and a month later
# the layout refuses over the edited file as a whole — and the price is paid by whoever edits a
# neighbouring resource that day.
#
# Only `sync --check` knew about this, and it spoke at the next layout, that is, in someone else's
# branch and on someone else's turn. The guard speaks at the minute of the edit and names the
# address: the package source, if the tree holds it, otherwise the override.
#
# WHAT IS JUDGED. The file being edited carries the layout header: `rt-kit v<version> · <resource> ·
# <digest>`. The resource from it is the address: `<sources>/<resource>` in the package tree,
# `.claude/rt-kit/overrides/<resource>` at a consumer.
#
# FAIL-OPEN: no `jq`, broken input, a foreign tool, no file, no header in it, not a git repository —
# the edit is ALLOWED. A broken guard has no right to jam work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=rule-source-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# The decision and the words come from the decision table. A refusal that names an edit of another
# file hands the decider the facts its neighbours judge that edit by — the exam, the window, the rules
# gate, the handover and the course of work — and the decider puts first what they want.
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts-flow.sh" 2>/dev/null

# refuse <action> <own facts JSON> <params JSON> [file of the named edit]
refuse() {
    local move='{}' flow='{"facts":{},"params":{}}' named
    command -v rt_decide >/dev/null 2>&1 || exit 0
    if [ -n "${4:-}" ]; then
        named="$(jq -cn --arg f "$4" '{file_path:$f,old_string:"",new_string:""}')"
        move="$(rt_fact_move Edit "$named" "$input")"
        if command -v rt_fact_flow_of >/dev/null 2>&1; then
            flow="$(rt_fact_flow_of Edit "$named" "$input")"
            [ -n "$flow" ] || flow='{"facts":{},"params":{}}'
        fi
    fi
    rt_decide "$RT_GUARD_NAME.sh" "$1" \
        "$(jq -cn --argjson m "$move" --argjson f "$flow" --argjson o "$2" '$m + $f.facts + $o')" \
        "$(jq -cn --argjson f "$flow" --argjson p "$3" '$f.params + $p')" PreToolUse "$input"
    exit 0
}

# The write targets are parsed by a shared helper: the exam guard needs the same sign, and once they
# diverged, two copies would let through different forms of writing. No file — a silent default
# remains, so that the guard does not break on an incomplete layout.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

tool="$(rt_hook_tool)"
candidates=""
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        # What is taken here is not the general sign of writing, but the target named in the
        # command outright: a redirection, `tee`, an in-place edit, a copy over the top. The
        # general sign is broad on purpose — it holds the interpreter name too — and a run of a
        # laid-out check would read as an edit of the check itself. A refusal on reading costs
        # more than a miss: a guard that gets in the way of reading is switched off on the very
        # first day.
        #
        # Removing a copy is deliberately not included here: the layout puts a removed file back,
        # and that is how a copy the formatter rewrote gets fixed.
        candidates="$(printf '%s' "$cmd" | rt_write_targets)"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
root_abs="$(cd "$root" 2>/dev/null && pwd -P)"
[ -n "$root_abs" ] || root_abs="$root"


# The directory of package sources in this tree. Only the tree that carries the package has one; a
# consumer has no source at all, and has a single address for an edit — the override.
sources=""
if rt_needs rt_kit_sources_dir rule-source-guard; then
    sources="$(rt_kit_sources_dir 2>/dev/null)"
fi

while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) ;;
        *) candidate="$root/$candidate" ;;
    esac
    # The observations are what the numbers of the package are counted from, and a hand in them
    # turns a report into a statement of the one who edited it. Only the guards write here.
    case "$candidate" in
        */.claude/rt-kit/observations/*)
            refuse edit_observations '{}' "$(jq -cn --arg p "${candidate#"$root"/}" '{path:$p}')"
            ;;
        */.claude/rt-kit.json)
            # Both keys decide what the numbers of the package are, and the one those numbers judge
            # must not switch them off. The owner edits them by hand.
            if printf '%s' "$input" | jq -r '.tool_input | tostring' 2>/dev/null | grep -qE '(^|[^[:alnum:]_-])(send|observe)([^[:alnum:]_-]|$)'; then
                refuse edit_rtkit_send '{}' "$(jq -cn --arg p "${candidate#"$root"/}" '{path:$p}')"
            fi
            ;;
    esac
    [ -f "$candidate" ] || continue
    # A laid-out file is a file of this tree. One outside it — a scratch copy, a neighbouring
    # repository — is laid out by nobody here, even when it quotes a header. The two checks above
    # judge by the end of the path and stay before this one.
    case "$candidate" in
        "$root"/* | "$root_abs"/*) ;;
        *) continue ;;
    esac

    # The header stands at the beginning of the file, but not on the first line: in a script `#!`
    # pushes it down, in a rule the title with the name and the kind of the resource does. Ten
    # lines are enough for both, and the whole file must not be read: the guard stands on every
    # edit.
    # Only a comment line of the header form counts: a file that quotes the header inside a string
    # or a sentence is not laid out.
    resource="$(head -12 "$candidate" 2>/dev/null | sed -nE 's/^[[:space:]]*(<!--|\/\/|#|\/\*|\*)[[:space:]]*rt-kit v[^ ]+ · ([^ ]+) · [0-9a-f]+.*/\2/p' | head -1)"
    [ -z "$resource" ] && continue

    # A file in conflict is skipped on a par with a removed one. Resolving a conflict does not
    # change the content of the copy — the layout puts it back — while an executor refused here is
    # left with a half-merged branch and no lawful move: there is nothing to edit in the source,
    # and an override does not lift the conflict. There are two signs, and either is enough: an
    # index record about an unmerged file, and merge markers in the file itself — the second is
    # needed where the merge is led not by git but by an outside tool that leaves markers without
    # an index record.
    if [ -n "$(git -C "$root" ls-files -u -- "$candidate" 2>/dev/null)" ] \
        || grep -qE '^(<<<<<<< |>>>>>>> )' "$candidate" 2>/dev/null; then
        continue
    fi

    # The override merges by the section «## », and that promise is true only of a text: a law, a
    # rule, a pattern, a skill. A shell script and a check file have no sections at all, and the
    # executor sent to write an override there finds nothing to merge — and learns it not from the
    # guard but from the next layout, that is, latest of all. A promise true of a third of the
    # cases is worse than none: people go and work by it.
    case "$resource" in
        *.md) override_way="an edit true only to this tree goes to the override .claude/rt-kit/overrides/${resource} — it merges by the section «## » and outlives the layout" ;;
        *) override_way="there is no override by sections for a resource of this kind: it has no «## » sections at all, and the edit goes into the package itself" ;;
    esac
    said="$(jq -cn --arg p "${candidate#"$root"/}" --arg r "$resource" --arg w "$override_way" '{path:$p, resource:$r, override_way:$w}')"

    if [ -n "$sources" ] && [ -f "$root/$sources/$resource" ]; then
        refuse edit_laid_out '{"package_source":"present"}' \
            "$(printf '%s' "$said" | jq -c --arg s "$sources/$resource" '. + {source:$s}')" "$root/$sources/$resource"
    fi

    # The override merges by the section «## »; a resource of another kind has no override at all.
    case "$resource" in
        *.md)
            refuse edit_laid_out '{"package_source":"absent"}' \
                "$(printf '%s' "$said" | jq -c --arg w "Edit the override: .claude/rt-kit/overrides/${resource} — it merges by the section «## » and outlives the layout." '. + {where:$w}')" \
                "$root/.claude/rt-kit/overrides/${resource}"
            ;;
        *)
            refuse edit_laid_out '{"package_source":"absent"}' \
                "$(printf '%s' "$said" | jq -c --arg w "A resource of this kind has no override by sections — it has no «## » sections at all. The edit goes into the package itself and arrives here by a new edition." '. + {where:$w}')" \
                "$candidate"
            ;;
    esac
done <<EOF
$candidates
EOF

exit 0
