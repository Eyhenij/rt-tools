#!/usr/bin/env bash
# rt-kit v0.41.1 · hooks/docs-guard.sh · 28089b3aff0d · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|NotebookEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/facts-docs.sh, hooks/profile-check.sh, hooks/deny-tail.sh, hooks/guard-note.sh
# Guard of the pair "an edit and its document". PreToolUse.
#
# A divergence of the code from the text is soundless. Neither the linter, nor the build, nor the
# tests read the rules, the specs and the READMEs, so a text describing the previous arrangement
# lives on and looks like a working reference — the more convincingly, the older it is. It is
# caught only by reading, and it is usually the owner who catches it, not a check.
#
# The guard demands exactly those pairs where the link is mechanical and there is nothing to argue
# about:
#
#   a rule and its companion    — when the section with the statements is edited, not "Pitfalls";
#   creating and removing a lib — the README of that lib;
#   moving a file between libs  — the READMEs of both;
#   the rest of the pairs       — named by the tree profile, the function `rt_docs_pair_for <file>`.
#
# Apart from them — the laws. Whether the code came together with a law, a machine does not know:
# an edit of a file a law points to by an anchor is therefore not rejected but put to the owner as
# a question. The same question meets an edit of the law itself — both in place and through an
# override over it: a law describes a product agreement, and the guard does not let it be changed
# silently.
#
# The bypass is the line `Docs-skip: <reason>` in the commit body. The reason stays in the history
# and is visible when the branch is reviewed; an empty one is not accepted.
#
# FAIL-OPEN: not a repository, no parser, broken input, an empty list of files — let through.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=docs-guard
RT_GUARD_RULE=doc-style

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"

# The decision, the move and the text come from the decision table. Parameters: the action, the facts
# of this guard, the params of the text. A refusal names the edit of the first awaited document, and
# the facts of the neighbours are those they judge that edit by: the decider puts first what they want.
decide() {
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/facts.sh" 2>/dev/null
    dg_sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    dg_record="$(rt_fact_transcript "$input")"
    dg_doc="${first_doc:-README.md}"
    case "$dg_doc" in /*) ;; *) dg_doc="$(git rev-parse --show-toplevel 2>/dev/null)/$dg_doc" ;; esac
    dg_facts="$(jq -cn --argjson own "$2" \
        --arg exam "$(rt_fact_exam_holds "$dg_record")" \
        --arg window "$(rt_fact_window_over_stop "$dg_sid" "$dg_record")" \
        --arg rule "$(rt_fact_move_rule_loaded Edit "$(jq -cn --arg f "$dg_doc" '{file_path:$f,old_string:"",new_string:""}')" "$dg_sid")" \
        --arg gate "$(rt_fact_move_gate_rule Edit "$(jq -cn --arg f "$dg_doc" '{file_path:$f,old_string:"",new_string:""}')" "$dg_sid")" \
        --arg flow "$(rt_fact_rule_loaded "${RT_TASK_FLOW_RULE:-task-flow}" "$dg_sid")" \
        --arg handoff "$(rt_fact_from_handoff "$dg_record")" \
        '{exam:$exam, window_over_stop:$window, rule_loaded:$rule, gate_rule:$gate, task_flow_loaded:$flow, from_handoff:$handoff} + $own')"
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/decide.sh" 2>/dev/null
    command -v rt_decide >/dev/null 2>&1 && rt_decide docs-guard.sh "$1" "$dg_facts" "${3:-"{}"}" PreToolUse "$input"
    exit 0
}

# The tree profile: first the package default, and the project override on top of it, if there is
# one. A function declared in the override replaces the default whole and may call it back through
# the `_default` suffix.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that left silently is indistinguishable from a
# working one. The file may be not laid out — then the previous behaviour stays, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

laws_dir="${RT_LAWS_DIR:-docs/constitution}"
lib_marker="${RT_LIB_MARKER:-project.json}"
overrides_dir="${RT_OVERRIDES_DIR:-.claude/rt-kit/overrides}"

# ── An edit of a law asks the owner ───────────────────────────────────────────
#
# The companion next to a law is the binding of the articles to the code; it goes stale on every
# rename and is edited freely. Only the text of the law itself is asked about.
#
# There are two paths to the text of a law, and the second is walked more often. A laid-out law is
# not edited in place at all: the edit is lost on the next layout, and the layout itself refuses it
# — so the override is edited, and the file of the law is rewritten by the layout. A guard that
# knows one laws directory watches exactly the path by which nobody goes to a law: the more
# involved the tree's override, the more rarely a law is edited in place. The override is asked
# about too — by its content it is an edit of the law, not of the wrapping.
case "$tool" in
    Edit | Write | MultiEdit | NotebookEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // .tool_input.path // .tool_input.pathInProject // empty' 2>/dev/null)"
        case "$target" in
            */"$laws_dir"/*.implementation.md | "$laws_dir"/*.implementation.md) exit 0 ;;
            */"$laws_dir"/*.md | "$laws_dir"/*.md)
                decide edit_laid_out '{}' "$(jq -cn --arg f "${target##*/}" '{file:$f}')"
                ;;
            */"$overrides_dir"/laws/*.implementation.md | "$overrides_dir"/laws/*.implementation.md) exit 0 ;;
            */"$overrides_dir"/laws/*.md | "$overrides_dir"/laws/*.md)
                if [ "$tool" = Write ]; then dg_act=write_override; else dg_act=edit_override; fi
                decide "$dg_act" '{}' "$(jq -cn --arg f "${target##*/}" '{file:$f}')"
                ;;
        esac
        exit 0
        ;;
esac

# ── The commit ────────────────────────────────────────────────────────────────

# The environment terminal and the universal executor put the command in the same field.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# The universal executor passes the real command as a nested string. It is that string that has to
# be parsed, otherwise the command name stands right after a quote and no rule reaches it.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

case "$cmd" in
    *git\ commit*) ;;
    *) exit 0 ;;
esac

# The analysis of the pair lives in `facts-docs.sh`: the delivery hooks ask the same fact.
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts-docs.sh" 2>/dev/null
command -v rt_fact_doc_problems >/dev/null 2>&1 || exit 0
rt_fact_doc_problems "$cmd" || exit 0

if [ -n "$problems" ]; then
    decide commit '{"doc_pair":"no"}' "$(jq -cn --arg p "$problems" '{problems:$p}')"
fi

# ── 4. The laws ───────────────────────────────────────────────────────────────
#
# There is nothing to reject: whether the edit came together with a law is visible only by reading.
# But the place where an article of a law is carried out is named by an anchor, and an edit of
# exactly that file is the only moment when the audit is still cheap to do.
#
# There are two layers of laws: the shared one in the root, an application law in a directory under
# it. The pattern accepts both, otherwise an edit of a subject law would count as an edit past the
# laws.
if [ -d "$laws_dir" ] && ! printf '%s\n' "$paths" | grep -qE "^${laws_dir}/([^/]+/)?[^/]+\.md$"; then
    touched=''
    for anchor in $(grep -ohE '`[A-Za-z0-9_./@-]+\.(ts|mjs|html|scss|prisma|proto|json)(:[A-Za-z0-9_#.-]+)?`' "$laws_dir"/*.implementation.md 2>/dev/null \
        | tr -d '`' | sed 's/:.*//' | grep '/' | sort -u); do
        has_path "$anchor" && touched="${touched}
  • \`$anchor\`"
    done

    if [ -n "$touched" ]; then
        decide commit '{"doc_pair":"yes","law_anchor_touched":"yes"}' "$(jq -cn --arg t "$touched" --arg l "$laws_dir" '{touched:$t, laws_dir:$l}')"
    fi
fi

exit 0
