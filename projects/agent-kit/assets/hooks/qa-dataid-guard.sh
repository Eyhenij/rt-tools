#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|mcp__webstorm__create_new_file|Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh, hooks/write-targets.sh
# Anchor guard for end-to-end tests. PreToolUse on a markup edit.
#
# Specs address elements only through this attribute. Styling classes change together with the
# layout, and lookup by role and text breaks on translations — the application lives in many
# locales. Both kinds of selection make end-to-end tests brittle, so there is one anchor and it is
# set by default, not added later: an element without the attribute gets into a test only after
# someone notices it is missing.
#
# The rule is inverted: ANY compound tag (a component) and any tag with an event binding counts
# as interactive, except those marked decorative. Listing the interactive ones by name does not
# work — the kit has over a hundred components, and the list goes stale silently: a component
# forgotten in it passes without an anchor.
#
# A deliberate way out: the skip attribute ON THE TAG ITSELF. A marker searched for across the
# whole edit would switch the check off entirely — a decorative link would take the submit button
# from the same edit along with it.
#
# What is called what here is known by the tree profile:
#   RT_QA_SKIP_RE      — paths where the anchor is not required: the showcase, root markup, tests;
#   RT_QA_COMPONENT_RE — by which name a tag is recognised as a component of this tree;
#   rt_qa_decorative   — tag names a test does not click.
#
# FAIL-OPEN: no parser, broken input, someone else's tool — pass.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=qa-dataid-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The write targets are taken by the shared parse: the same sign serves the guard of the place of an
# edit, and two copies of it would let through different shapes of a write. No file — a silent
# default remains, so that the guard does not break on an incomplete layout.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/write-targets.sh" ] && . "$rt_hooks_dir/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

tool="$(rt_hook_tool)"
cmd=""
case "$tool" in
    # The IDE tool creates a file from the same two pieces of data, only names them differently —
    # without this branch markup was created past all the checks.
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    # Markup written by a shell command is judged the same: the same text with the name of the shell
    # instead of the name of the edit gave silence, and a screen written by a heredoc got into the
    # tree without a single anchor.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        path="$(printf '%s' "$cmd" | rt_write_targets | grep -m1 '\.html$')"
        ;;
    *) exit 0 ;;
esac
# The path from the IDE arrives relative to the tree root, while all the samples below are
# written from the application directory. Bring it to one form once, so the rules do not double.
case "$path" in
    /*) ;;
    ?*) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
esac
case "$path" in
    *.html) ;;
    *) exit 0 ;;
esac

# The tree profile: first the package default, over it the project override, if there is one.
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that exited silently is indistinguishable from
# a working one. The file may not be laid out — then the old behaviour remains, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# The application's markup lives where its code lives. Without this positive check the guard
# would extend to any markup file on disk — a draft outside the tree was refused with a demand to
# set anchors.
if rt_needs rt_is_app_code qa-dataid-guard; then
    rt_is_app_code "$path" || exit 0
fi

if [ -n "${RT_QA_SKIP_RE:-}" ] && printf '%s' "$path" | grep -qE "$RT_QA_SKIP_RE"; then
    exit 0
fi

# Only the NEW text is checked: what already lay in the file was not created by this edit, and
# demanding an anchor from someone else's line means refusing the edit of a neighbouring one. For a
# shell command the new text is the body of the command: the written markup stands inside it.
if [ -n "$cmd" ]; then
    added="$cmd"
else
    added="$(printf '%s' "$input" | jq -r '
        [ .tool_input.content?, .tool_input.text?, .tool_input.new_string?, (.tool_input.edits[]?.new_string) ]
        | map(select(. != null)) | join("\n")
    ' 2>/dev/null)"
fi
[ -z "$added" ] && exit 0

decorative="$(rt_needs rt_qa_decorative qa-dataid-guard && rt_qa_decorative 2>/dev/null)"
component_re="${RT_QA_COMPONENT_RE:--}"

# Opening tags are parsed WHOLE: a tag spans several lines, and the anchor often stands not in
# the first of them — a line-by-line check would lie.
missing="$(printf '%s' "$added" | RT_QA_DECORATIVE="$decorative" RT_QA_COMPONENT_RE="$component_re" perl -0777 -ne '
    # Comments are cut out before parsing: they often hold sample markup ("was <button …>,
    # replaced with a navigation"). Without this an edit was refused because of an element that
    # will not be in the document tree, and the refusal could be bypassed only by spoiling the
    # text of the comment itself.
    s/<!--.*?-->//gs;
    # Decorative and structural: a test does not click these and does not check state by them.
    # Everything else counts as interactive by default — the kit grows, and the default must lean
    # towards the anchor, not towards silence. Being in the list is NOT an indulgence: a tag with
    # an event binding is checked on equal terms with the rest.
    my %decorative = map { $_ => 1 } split /\s+/, ($ENV{RT_QA_DECORATIVE} // "");
    my $component = $ENV{RT_QA_COMPONENT_RE} || "-";
    my %seen;
    while (/<([a-zA-Z][\w-]*)((?:[^<>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*)>/gs) {
        my ($tag, $attrs) = ($1, $2);
        # Structural framework tags produce no document node: an anchor set on them will not be
        # found by any test selection. Demanding it means demanding what does not work.
        next if $tag =~ /^(ng-container|ng-template|ng-content)$/;
        next if $attrs =~ /\bqa-dataid\b/;
        # A deliberate opt-out is marked on the tag itself, not somewhere in the same edit.
        next if $attrs =~ /\bqa-skip\b/;
        my $interactive =
               $attrs =~ /\(\s*[a-zA-Z][\w.:-]*\s*\)\s*=/
            || $attrs =~ /\b(routerLink|rtButton|href)\b/
            || $tag =~ /^(button|a|input|select|textarea|form|dialog)$/
            || ($tag =~ /$component/ && !$decorative{$tag});
        next unless $interactive;
        next if $seen{$tag}++;
        print "<$tag> ";
    }
' 2>/dev/null)"

[ -z "$missing" ] && exit 0

reason="BLOCKED: interactive elements without a test anchor in ${path##*/}: ${missing}. Tests address elements only through this attribute: styling classes change together with the markup, and a search by role and text breaks on translations — both kinds of selection make end-to-end tests brittle. Set the anchor through a dash by the meaning of the element; repeating elements of a list carry ONE anchor and differ by data attributes. If an element is purely decorative and a test will never touch it — put the skip attribute ON THAT VERY TAG, the neighbouring elements of the edit keep being checked."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has
# one. The file may not be laid out — then there is no tail, and the reason for the refusal stays
# the same.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "the skip attribute on the decorative tag itself")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"An interactive element without a test anchor."}}\n'

exit 0
