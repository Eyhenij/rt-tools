#!/usr/bin/env bash
# rt-hook: SessionStart startup|resume|compact|clear
# SessionStart: the last run of the main branch goes into the context in one line, at every start.
#
# A merge reads as the end of the work, and a red main branch after it lives until the owner
# notices: a run of the main branch is opened by nobody, so nobody reads its outcome. The line is
# printed here so that the session starts from it, not from memory of a green PR; after a merge made
# mid-session the same command is called by hand — the rule `task-flow` names it.
#
# The reading itself lies among the checks laid out in the tree — the same reading the work queue
# audit uses. It goes to the hosting, and that costs a second at every start; the alternative is a
# day and a half of a red main branch nobody saw.
#
# FAIL-OPEN: no `jq`, no `node`, not a git repository, no laid-out reading — we exit silently. The
# session matters more than the line. What the reading itself could not do it says by its own line:
# no pipeline file, a pipeline asleep on a push, no network.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

root="$(cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

# Where the checks of the package lie is named by the tree: the directory differs from tree to tree,
# and a name written here would be right in the first one and wrong in the second.
checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
if [ -z "$checks" ] || [ "$checks" = null ]; then
    checks=tools
fi
reading="$root/$checks/main-run.mjs"
[ -f "$reading" ] || exit 0

# A non-zero code is the reading's own verdict — red or pushed out — not a breakage: the line is
# printed all the same. A reading that printed nothing has broken, and silence is all it gets.
line="$(cd "$root" && node "$reading" 2>/dev/null)"
[ -z "$line" ] && exit 0

{
    printf 'MAIN BRANCH RUN — read before the first action, and again after every known merge.\n\n'
    printf '%s\n\n' "$line"
    printf 'A red or a pushed-out run is fixed before new work is taken: merges on top go out unchecked.\n'
    printf 'The same line by hand: `node %s/main-run.mjs`. The rule — skill `task-flow`.\n' "$checks"
} | jq -Rs '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}' 2>/dev/null || exit 0
