#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/prose-style-guard.sh · 246735b312ed · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit
# Requires: checks/check-prose-style.mjs, hooks/deny-tail.sh
# Prose guard: officialese and words that are not written in this tree do not reach the file.
#
# The rule about texts demands plain words, and this was held only by the memory of whoever writes:
# not one wording convention was checked. The owner reads what was written and sees machine prose
# where the convention demands human prose.
#
# Only the new text of the edit is judged, not the whole file: what has accumulated is fixed by a
# separate piece of work, and refusing an edit of a neighbouring line because of it would make the
# guard bypassed out of necessity.
#
# FAIL-OPEN: no node, no check, a foreign tool, not `.md` → pass.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=prose-style-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Edit | Write | MultiEdit) ;;
    *) exit 0 ;;
esac

path="$(rt_hook_file)"
case "$path" in
    *.md) ;;
    *) exit 0 ;;
esac

# The archive and the task folders are not judged: the archive is not edited at all, and the
# progress is written in haste and lives until the merge.
case "$path" in
    */docs/archive/* | */docs/tasks/*) exit 0 ;;
esac

added="$(printf '%s' "$input" | jq -r '.tool_input.new_string // .tool_input.content // ([.tool_input.edits[]?.new_string] | join("\n")) // empty' 2>/dev/null)"
[ -z "$added" ] && exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
check=""
for candidate in "$rt_hooks_dir/../checks/check-prose-style.mjs" "$rt_hooks_dir/../rt-kit/checks/check-prose-style.mjs" "${CLAUDE_PROJECT_DIR:-.}/tools/check-prose-style.mjs"; do
    [ -f "$candidate" ] && check="$candidate" && break
done
[ -z "$check" ] && exit 0

tmp="$(mktemp -t prose)" || exit 0
printf '%s\n' "$added" > "$tmp"
found="$(node "$check" "$tmp" 2>&1 | grep -- '—' | sed 's|.*proba*[^:]*:|  line |' | head -8)"
rm -f "$tmp"
[ -z "$found" ] && exit 0

reason="BLOCKED by prose-style-guard: the new text carries officialese or a word not written in this tree.

${found}

Edit the text instead of bypassing the finding: a replacement is named at each of them. Wording is a rule about texts, and the check sees the listed signs, not style at large: a paragraph clean by it may still be bad, a dirty one is bad for certain."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"prose-style-guard: officialese in the new text."}}\n'
exit 0
