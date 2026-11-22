#!/usr/bin/env bash
# The scenarios of the second tier of the draft check: it judges only the drafts this copy left
# behind — a branch its journal of HEAD shows checked out — and not one whose head lies in a branch
# another working copy holds.
#
# The host is a stand-in script named by `RT_GH_BIN`: it answers the list of drafts and the runs at
# their heads, and the check reads no network. The cache lies in a directory of the set.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the draft check, the second tier"

ROOT="$(cd "$TOOLS/.." && pwd)"
HOOK="$ROOT/.claude/hooks/git-guard-draft-ready.sh"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

REPO="$WORK/repo"
c() { git -C "$1" -c user.name=t -c user.email=t@t commit -q --allow-empty -m "$2"; }
git init -q -b main "$REPO"
c "$REPO" init
# The neighbour's branch RT-1: this copy never had it.
git -C "$REPO" branch RT-1-side
# This copy's own work: RT-2, then the next branch RT-3 built on it — its draft RT-2 is left behind.
git -C "$REPO" checkout -q -b RT-2-left
c "$REPO" two
git -C "$REPO" checkout -q -b RT-3-here
# A branch nobody here ever had: another session's draft with no copy on this machine.
git -C "$REPO" branch RT-4-foreign "$(GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t git -C "$REPO" commit-tree -p main -m four "main^{tree}")"
git -C "$REPO" worktree add -q "$WORK/side" RT-1-side

sha() { git -C "$REPO" rev-parse "$1"; }
GH="$WORK/gh"
cat > "$GH" <<EOF
#!/usr/bin/env bash
case "\$1 \$2" in
    'pr view') exit 1 ;;
    'pr list') printf '[{"number":11,"headRefName":"RT-1-side","headRefOid":"$(sha RT-1-side)"},{"number":12,"headRefName":"RT-2-left","headRefOid":"$(sha RT-2-left)"},{"number":14,"headRefName":"RT-4-foreign","headRefOid":"$(sha RT-4-foreign)"}]' ;;
    'run list') printf '[{"headSha":"$(sha RT-1-side)","status":"completed","conclusion":"success"},{"headSha":"$(sha RT-2-left)","status":"completed","conclusion":"success"},{"headSha":"$(sha RT-4-foreign)","status":"completed","conclusion":"success"}]' ;;
esac
EOF
chmod +x "$GH"

judge() {
    rm -rf "$WORK/cache" && mkdir -p "$WORK/cache"
    printf '{"stop_hook_active":false}' \
        | CLAUDE_PROJECT_DIR="$REPO" RT_GH_BIN="$GH" RT_BOT=rt-bot TMPDIR="$WORK/cache" bash "$HOOK" 2>/dev/null \
        | jq -r '.reason // ""' 2>/dev/null
}
names() { printf '%s' "$1" | grep -c "#$2 "; }

OUT="$(judge)"
report "draft-ready: a draft this copy left behind is refused" "$(names "$OUT" 12)" "1"
report "draft-ready: a draft of a branch another copy holds is not named" "$(names "$OUT" 11)" "0"
report "draft-ready: a draft of a branch this copy never had is not named" "$(names "$OUT" 14)" "0"
report "draft-ready: the refusal counts one draft" "$(printf '%s' "$OUT" | grep -c '^BLOCKED by git-guard-draft-ready: 1 request')" "1"

# The neighbour moved on along a chain built on this copy's branch: the draft is the neighbour's now.
git -C "$WORK/side" checkout -q -b RT-5-next RT-2-left
c "$WORK/side" five
OUT="$(judge)"
report "draft-ready: a draft under the chain another copy holds is not named" "$(names "$OUT" 12)" "0"

# This copy's own chain over its draft does not hide it: this copy is left out of the holders.
git -C "$WORK/side" checkout -q RT-1-side
OUT="$(judge)"
report "draft-ready: this copy's own chain over its draft — still refused" "$(names "$OUT" 12)" "1"

# A copy whose directory was removed without git is listed as prunable: it holds nothing.
git -C "$REPO" worktree add -q "$WORK/gone" RT-5-next
rm -rf "$WORK/gone"
OUT="$(judge)"
report "draft-ready: a copy with no directory holds nothing" "$(names "$OUT" 12)" "1"
git -C "$REPO" worktree prune >/dev/null 2>&1

# A copy on a detached head holds no branch.
git -C "$REPO" worktree add -q --detach "$WORK/loose" RT-5-next
OUT="$(judge)"
report "draft-ready: a copy on a detached head holds no branch" "$(names "$OUT" 12)" "1"
git -C "$REPO" worktree remove --force "$WORK/loose" >/dev/null 2>&1
git -C "$REPO" worktree remove --force "$WORK/side" >/dev/null 2>&1

suite_result "the draft check, the second tier"
