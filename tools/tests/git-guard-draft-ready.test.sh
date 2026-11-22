#!/usr/bin/env bash
# The scenarios of the second tier of the draft check: a draft whose branch another working copy
# holds is not judged, a draft whose branch no copy holds is refused as before.
#
# The host is a stand-in script named by `RT_GH_BIN`: it answers the list of drafts and the runs at
# their heads, and the check reads no network. The cache lies in a directory of the set.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the draft check, the second tier"

ROOT="$(cd "$TOOLS/.." && pwd)"
HOOK="$ROOT/.claude/hooks/git-guard-draft-ready.sh"
WORK="$(mktemp -d)"
cleanup() {
    git -C "$WORK/repo" worktree remove --force "$WORK/side" >/dev/null 2>&1
    rm -rf "$WORK"
}
trap cleanup EXIT

REPO="$WORK/repo"
git init -q -b main "$REPO"
git -C "$REPO" -c user.name=t -c user.email=t@t commit -q --allow-empty -m init
git -C "$REPO" branch RT-1-side
git -C "$REPO" branch RT-2-left
git -C "$REPO" checkout -q -b RT-3-here
git -C "$REPO" worktree add -q "$WORK/side" RT-1-side

SHA1="$(git -C "$REPO" rev-parse RT-1-side)"
GH="$WORK/gh"
cat > "$GH" <<EOF
#!/usr/bin/env bash
case "\$1 \$2" in
    'pr view') exit 1 ;;
    'pr list') printf '[{"number":11,"headRefName":"RT-1-side","headRefOid":"$SHA1"},{"number":12,"headRefName":"RT-2-left","headRefOid":"$SHA1"}]' ;;
    'run list') printf '[{"headSha":"$SHA1","status":"completed","conclusion":"success"}]' ;;
esac
EOF
chmod +x "$GH"

judge() {
    rm -rf "$WORK/cache" && mkdir -p "$WORK/cache"
    printf '{"stop_hook_active":false}' \
        | CLAUDE_PROJECT_DIR="$REPO" RT_GH_BIN="$GH" RT_BOT=rt-bot TMPDIR="$WORK/cache" bash "$HOOK" 2>/dev/null \
        | jq -r '.reason // ""' 2>/dev/null
}

OUT="$(judge)"
report "draft-ready: a draft of a branch another copy holds is not named" "$(printf '%s' "$OUT" | grep -c '#11 ')" "0"
report "draft-ready: a draft of a branch no copy holds is refused" "$(printf '%s' "$OUT" | grep -c '#12 ')" "1"
report "draft-ready: the refusal counts one draft" "$(printf '%s' "$OUT" | grep -c '^BLOCKED by git-guard-draft-ready: 1 request')" "1"

git -C "$REPO" worktree remove --force "$WORK/side" >/dev/null 2>&1
OUT="$(judge)"
report "draft-ready: the copy is gone, its branch's draft is refused again" "$(printf '%s' "$OUT" | grep -c '#11 ')" "1"

git -C "$REPO" worktree add -q "$WORK/side" RT-2-left
git -C "$WORK/side" checkout -q RT-1-side 2>/dev/null
git -C "$REPO" worktree add -q "$WORK/other" RT-2-left
OUT="$(judge)"
report "draft-ready: every draft held by a copy — the stop passes" "$OUT" ""
git -C "$REPO" worktree remove --force "$WORK/other" >/dev/null 2>&1

suite_result "the draft check, the second tier"
