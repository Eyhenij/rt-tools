#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/grill-gate-ask.sh · 9ccdeb685920 · правится надстройкой, не здесь
# rt-hook: PreToolUse AskUserQuestion
# Requires: hooks/grill-gate.sh
# The half of the conversation guard that stands on the question tool: the menu is judged before it
# is sent.
#
# A resource of its own, not a line in the neighbour's header, because the question tool is the
# only way to ask the owner, and the tree may already have its own guard on it with its own refusal
# reason. A second refusal on the same tool makes the question unavailable altogether, and the tree
# drops the guard whole instead of taking its half. Split over two resources, the halves are
# cancelled separately: a refusal line removes one and leaves the other.
#
# The call is judged by the same body as the turn end: the requirement is one, and its two editions
# must not diverge. Here only the event declaration and passing the input on.
#
# FAIL-OPEN: no neighbouring file — the turn is ALLOWED. A half of the guard that has lost its body
# has no right to jam the conversation.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$rt_hooks_dir/grill-gate.sh" ] || exit 0

rt_hook_read
printf '%s' "$RT_HOOK_INPUT" | "$rt_hooks_dir/grill-gate.sh"
