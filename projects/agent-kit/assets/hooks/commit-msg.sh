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

# Git names the message file; called by hand, the hook reads the message git keeps for the last commit.
msg_file="${1:-$(git rev-parse --absolute-git-dir 2>/dev/null)/COMMIT_EDITMSG}"
[ -f "$msg_file" ] || exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" 2>/dev/null || exit 0

[ -x node_modules/.bin/commitlint ] || exit 0

said="$(node_modules/.bin/commitlint --edit "$msg_file" 2>&1)" && { [ -n "$said" ] && printf '%s\n' "$said" >&2; exit 0; }
# The linter refused: the decision and the words come from the decision table, the linter's own
# lines go inside them, and the exit code is the table's answer.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || { printf '%s\n' "$said" >&2; exit 0; }
# The facts are those of the state git runs this hook in: the commit has passed the guards of the
# agent — not on the main branch, signed as declared, its document pair whole, the rule loaded.
rt_decide commit-msg.sh commit_bad_message '{"rule_loaded":"yes","branch_is_main":"no","commits_signed_declared":"yes","doc_pair":"yes"}' "$(jq -cn --arg s "$said" '{said:$s}')" git
exit $?
