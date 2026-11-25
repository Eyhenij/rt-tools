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
# A branch no copy remembers: judged as before.
git -C "$REPO" branch RT-4-foreign "$(GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t git -C "$REPO" commit-tree -p main -m four "main^{tree}")"
git -C "$REPO" worktree add -q "$WORK/side" RT-1-side
# The neighbour had RT-6 and moved on to RT-1: RT-6 stands in its journal only.
git -C "$REPO" branch RT-6-past "$(GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t git -C "$REPO" commit-tree -p main -m six "main^{tree}")"
git -C "$WORK/side" checkout -q RT-6-past
git -C "$WORK/side" checkout -q RT-1-side
# This copy had RT-7 and handed it over: another copy holds it now. The host names a head this
# repository does not have, so only the name of the branch tells whose draft it is.
git -C "$REPO" checkout -q -b RT-7-handed main
git -C "$REPO" checkout -q RT-3-here
git -C "$REPO" worktree add -q "$WORK/seven" RT-7-handed
GONE=ffffffffffffffffffffffffffffffffffffffff

sha() { git -C "$REPO" rev-parse "$1"; }
GH="$WORK/gh"
cat > "$GH" <<EOF
#!/usr/bin/env bash
case "\$1 \$2" in
    'pr view') exit 1 ;;
    'pr list') printf '[{"number":11,"headRefName":"RT-1-side","headRefOid":"$(sha RT-1-side)"},{"number":12,"headRefName":"RT-2-left","headRefOid":"$(sha RT-2-left)"},{"number":14,"headRefName":"RT-4-foreign","headRefOid":"$(sha RT-4-foreign)"},{"number":16,"headRefName":"RT-6-past","headRefOid":"$(sha RT-6-past)"},{"number":17,"headRefName":"RT-7-handed","headRefOid":"$GONE"}]' ;;
    'run list') printf '[{"headSha":"$(sha RT-1-side)","status":"completed","conclusion":"success"},{"headSha":"$(sha RT-2-left)","status":"completed","conclusion":"success"},{"headSha":"$(sha RT-4-foreign)","status":"completed","conclusion":"success"},{"headSha":"$(sha RT-6-past)","status":"completed","conclusion":"success"},{"headSha":"$GONE","status":"completed","conclusion":"success"}]' ;;
esac
EOF
chmod +x "$GH"

# The hook judged from the copy the input names; the project directory is always the main copy.
judge_at() {
    rm -rf "$WORK/cache" && mkdir -p "$WORK/cache"
    jq -n --arg d "$1" '{stop_hook_active:false,cwd:$d}' \
        | CLAUDE_PROJECT_DIR="$REPO" RT_GH_BIN="$GH" RT_BOT=rt-bot TMPDIR="$WORK/cache" bash "$HOOK" 2>/dev/null \
        | jq -r '.reason // ""' 2>/dev/null
}
judge() { judge_at "$REPO"; }
names() { printf '%s' "$1" | grep -c "#$2 "; }

OUT="$(judge_at "$WORK/side")"
report "draft-ready: from a linked copy its own past branch is refused" "$(names "$OUT" 16)" "1"
report "draft-ready: from a linked copy the main copy's draft is not named" "$(names "$OUT" 12)" "0"

OUT="$(judge)"
report "draft-ready: a branch another copy holds by name, head not here — not named" "$(names "$OUT" 17)" "0"
git -C "$REPO" worktree remove --force "$WORK/seven" >/dev/null 2>&1

OUT="$(judge)"
report "draft-ready: a draft this copy left behind is refused" "$(names "$OUT" 12)" "1"
report "draft-ready: a draft of a branch another copy holds is not named" "$(names "$OUT" 11)" "0"
report "draft-ready: a draft of a branch another copy had, never this one, is not named" "$(names "$OUT" 16)" "0"
report "draft-ready: a draft of a branch no copy remembers is refused as before" "$(names "$OUT" 14)" "1"
report "draft-ready: the copy it was handed to is gone — this copy's draft again" "$(names "$OUT" 17)" "1"
report "draft-ready: the refusal counts three drafts" "$(printf '%s' "$OUT" | grep -c '^BLOCKED by git-guard-draft-ready: 3 requests')" "1"

# A copy of a role cut from the head of this copy's draft leads no chain.
git -C "$REPO" worktree add -q -b worktree-agent-x "$WORK/role" RT-2-left
OUT="$(judge)"
report "draft-ready: a role copy over this copy's draft does not hide it" "$(names "$OUT" 12)" "1"
git -C "$REPO" worktree remove --force "$WORK/role" >/dev/null 2>&1

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

# A branch this copy never had is named once per head in a session: this session cannot lift it.
judge_again() {
    jq -n --arg d "$REPO" --arg s "$1" '{stop_hook_active:false,cwd:$d,session_id:$s}' \
        | CLAUDE_PROJECT_DIR="$REPO" RT_GH_BIN="$GH" RT_BOT=rt-bot TMPDIR="$WORK/cache" bash "$HOOK" 2>/dev/null \
        | jq -r '.reason // ""' 2>/dev/null
}
rm -rf "$WORK/cache" && mkdir -p "$WORK/cache"
report "draft-ready: a draft of a branch this copy never had is named" "$(names "$(judge_again one)" 14)" "1"
OUT="$(judge_again one)"
report "draft-ready: чужой черновик назван один раз на вершину" "$(names "$OUT" 14)" "0"
report "draft-ready: this copy's own draft is named at every end of a turn" "$(names "$OUT" 12)" "1"
report "draft-ready: another session is told of it once too" "$(names "$(judge_again two)" 14)" "1"
sed -i.bak "s/$(sha RT-4-foreign)/$(sha RT-6-past)/g" "$GH"
rm -f "$WORK"/cache/rt-draft-abandoned-*
report "draft-ready: a new head of it is named again" "$(names "$(judge_again one)" 14)" "1"

suite_result "the draft check, the second tier"
