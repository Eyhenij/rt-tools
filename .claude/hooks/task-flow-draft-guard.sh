#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/task-flow-draft-guard.sh · 861e6ac32ed1 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/task-flow-context.sh, hooks/task-flow-guard.sh, hooks/deny-tail.sh
# PreToolUse guard for Edit|Write|MultiEdit: no code is written before the product agreement.
#
# The plan says how the work will be done and is silent about what was agreed with the owner.
# The product agreement is the only text that names the promised behaviour before the code;
# written afterwards, it retells a decision already made instead of checking it.
#
# The guard demands one thing and exactly one: the plan names the agreement with the line
# `**Draft:** \`path\``, and what is named exists. The task folder, the plan itself and the
# declared state are demanded by `task-flow-guard`, and before its refusals this guard judges
# nothing: no plan on disk — it stays silent.
#
# The demands are kept apart so that a tree can drop one and keep the other. While both rode in
# one file, dropping the agreement demand also dropped the demand for the task folder and the
# plan — that is, everything the guard was made for.
#
# There is a deliberate way out: the line `**Behaviour:** unchanged — <reason>` in the plan
# lifts the agreement demand. An empty reason is not accepted, same as with `Docs-skip:`.
#
# The whole rule — the `task-flow` rule.
#
# FAIL-OPEN: no jq, not a git repository, broken input, foreign tool → pass. A broken guard must
# not get in the way of work.

# Own name in the observations: the refusal is written by the shared refusal tail, not by the
# guard itself.
RT_GUARD_NAME=task-flow-draft-guard

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parsing the call is shared by both progress guards. The file may not be laid out: then there is
# nothing to judge with, and the guard stays silent.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/task-flow-context.sh" ] && . "$rt_hooks_dir/task-flow-context.sh"
command -v rt_task_flow_context >/dev/null 2>&1 || exit 0

# The shared refusal tail: two lawful moves and the lawful form of bypass, when the refusal has
# one. The file may not be laid out — then there is no tail, and the reason for the refusal stays
# as it was.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh"

rt_task_flow_context || exit 0

branch="$RT_TF_BRANCH"
root="$RT_TF_ROOT"
tasks_dir="$RT_TF_TASKS_DIR"
plan="$RT_TF_PLAN"

deny() { rt_task_flow_deny "$@"; }

# No plan — that is another guard's demand, and the refusal about it is printed by the progress
# guard. Work with a taken-apart folder leaves here too: by this minute the plan has been removed
# from disk on purpose.
[ -f "$plan" ] || exit 0

# The bypass line: the behaviour does not change, no product agreement is needed. The reason must
# be there — without it the bypass becomes the default.
if grep -qE '^\*\*(Behaviour|Поведение):\*\*[[:space:]]*(unchanged|не меняется)[[:space:]]*—[[:space:]]*\S' "$plan" 2>/dev/null; then
    exit 0
fi

# The agreement is named in one of two forms. The first is a separate document in the "proposed"
# directory: it moves into the domain spec when the work closes. The second is the domain spec
# itself: a tree without a separate directory writes the agreement straight into it, and there is
# nothing to move — the draft matches the spec from day one. Demanding one form would impose the
# way agreements are written along with the check that the work follows the plan: a tree with
# the second way drops the guard entirely and is left without the only machine check under the
# rule.
draft="$(sed -nE 's/^\*\*(Draft|Драфт):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$plan" 2>/dev/null | head -1)"
[ -z "$draft" ] && draft="$(sed -nE 's/^\*\*(Spec|Спек):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$plan" 2>/dev/null | head -1)"

if [ -z "$draft" ]; then
    deny "BLOCKED by task-flow: no product agreement is named in '${tasks_dir}/${branch}/plan.md'. Name it by one of two lines: '**Draft:** \`path\`' — a separate document in docs/specs/<domain>/proposed/<feature>/, or '**Spec:** \`path\`' — the domain spec the agreement is written into directly. The rule is task-flow." \
        "the line '**Behaviour:** unchanged — <the owner reason>' in the plan; an empty reason is not accepted"
fi

case "$draft" in
    /*) draft_path="$draft" ;;
    *) draft_path="$root/$draft" ;;
esac

if [ -e "$draft_path" ]; then
    exit 0
fi

# An agreement merged into the domain spec leaves the disk — by design: the main branch must not
# hold a "proposed" directory. But the plan refers to it until the work ends, and without this
# branch the last commit of the PR would lock the branch: neither edits after review remarks nor
# a changelog entry could be made after the merge.
#
# The branch history tells a merged agreement from one never created: a path that was never in
# it was never an agreement. There is nothing to ask about this but git, so no git — the refusal
# stays.
if git -C "$root" log --oneline -1 -- "$draft" 2>/dev/null | grep -q .; then
    exit 0
fi

# The merge may also be the first commit that created the named path at all: the draft was
# written without committing, and what went into history was already the domain spec. Then the
# path has no history, and the work was done exactly as the close pattern says — and the refusal
# would lock the branch at the last step. The sign: the agreement is named by a path of the form
# `<domain>/proposed/<feature>`, the domain directory exists in the tree, and the feature name
# occurs in it. While there is no such spec, the refusal stays as it was.
case "$draft" in
    */proposed/*)
        domain_dir="${draft%%/proposed/*}"
        feature="${draft##*/proposed/}"
        feature="${feature%/}"
        if [ -n "$feature" ] && [ -d "$root/$domain_dir" ] \
            && grep -rq -- "$feature" "$root/$domain_dir" 2>/dev/null; then
            exit 0
        fi
        ;;
esac

deny "BLOCKED by task-flow: the plan names the agreement '${draft}', and it is neither on disk nor in the history of the branch. Create it from the sample (docs/specs/_template) or fix the path in '${tasks_dir}/${branch}/plan.md'. The rule is task-flow."
