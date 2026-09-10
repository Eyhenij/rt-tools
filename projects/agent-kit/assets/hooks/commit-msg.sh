#!/usr/bin/env bash
# Commit message check. A hook of git itself, not of the agent.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The version control
# calls it as its own hook, not the agent: it judges the message of a commit already written.
#
# A versioned template: the git hooks directory of the working copy is not versioned, so the file
# is put there separately — by the prepare script when dependencies are installed. Reinstall by
# hand if the prepare step did not run for some reason:
#   cp .claude/hooks/commit-msg.sh .git/hooks/commit-msg && chmod +x .git/hooks/commit-msg
#
# Deliberately NOT through a wrapper that replaces the hooks path: the replacement takes git into
# its own directory and breaks the other hooks already lying in the working copy. The native path
# leaves them untouched.
#
# A title parsed by type and scope reads as a list, while free text reads only as a whole; that is
# why the format is checked here, on the spot, and not by eye at review.
#
# FAIL-OPEN: no checker (a fresh clone without installed dependencies) — pass. The format is not
# checked then, and that is better than a jammed commit.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

msg_file="$1"
[ -z "$msg_file" ] && exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" 2>/dev/null || exit 0

[ -x node_modules/.bin/commitlint ] || exit 0

node_modules/.bin/commitlint --edit "$msg_file"
