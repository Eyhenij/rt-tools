#!/usr/bin/env bash
# The ready-made blocks of the merge and of the machine account: each is cut out of its text and run in
# bash and in zsh. A merge used to leave conflict markers in the guards, and the first block that took
# them off gave the whole directory back, with an edit nobody committed.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "the ready-made merge and token blocks"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The command of the merge out of a text: from `git merge --no-edit` to the line that ends the call.
merge_block() {
    awk '/git merge --no-edit origin\//{on=1} on{print} on && (/^}$/ || /false; }$/){exit}' "$1" \
        | sed -E 's/^[[:space:]]*//; s#origin/<[^>]*>#origin/base#'
}

# A repository in the middle of the story: the base and the branch edit the same guard, the base edits
# a text of the branch too. $1 — yes: the guards carry the attribute of this tree.
fixture() {
    local repo
    repo="$(mktemp -d "$WORK/r.XXXXXX")"
    (
        cd "$repo" || exit 1
        git init -q -b main && git config user.name t && git config user.email t@e && git config commit.gpgsign false
        mkdir -p .claude/hooks
        [ "$1" = yes ] && grep -F '.claude/hooks/*.sh' "$ROOT/.gitattributes" > .gitattributes
        printf 'v1\n' > .claude/hooks/a.sh; printf 'base\n' > .claude/hooks/b.sh; printf 'one\n' > readme.md
        git add -A && git commit -qm one
        git checkout -q -b base && printf 'v2\n' > .claude/hooks/a.sh && printf 'base two\n' > readme.md && git commit -qam base
        git update-ref refs/remotes/origin/base base
        git checkout -q main && printf 'v3\n' > .claude/hooks/a.sh && printf 'two\n' > readme.md && git commit -qam own
    ) >/dev/null 2>&1
    printf '%s' "$repo"
}

for text in "$ROOT/projects/agent-kit/assets/patterns/git-workflow-merge.md" "$ROOT/projects/agent-kit/assets/pitfalls/git-workflow-merge.md" "$ROOT/.claude/skills/task-delivery-loop-run/SKILL.md"; do
    name="$(basename "$(dirname "$text")")/$(basename "$text")"
    block="$(merge_block "$text")"
    report "$name: the block is found" "$(printf '%s' "$block" | grep -c 'git checkout --ours')" "1"
    for shell in bash zsh; do
        command -v "$shell" >/dev/null 2>&1 || continue
        repo="$(fixture no)"
        (cd "$repo" && "$shell" -c "$block" >/dev/null 2>&1)
        report "$name, $shell: a conflict is answered with a non-zero code" "$?" "1"
        report "$name, $shell: the guard in conflict holds the text of this side" "$(cat "$repo/.claude/hooks/a.sh")" "v3"
        report "$name, $shell: a conflict elsewhere keeps its markers" "$(grep -c '^<<<<<<<' "$repo/readme.md")" "1"
        # The edit nobody committed, in a guard the merge does not touch.
        repo="$(fixture no)"
        printf 'edited\n' > "$repo/.claude/hooks/b.sh"
        (cd "$repo" && "$shell" -c "$block" >/dev/null 2>&1)
        report "$name, $shell: an uncommitted edit of another guard stays" "$(cat "$repo/.claude/hooks/b.sh")" "edited"
    done
done

# The attribute of this tree: a bare merge writes no markers into the guards either.
repo="$(fixture yes)"
(cd "$repo" && git merge --no-edit origin/base >/dev/null 2>&1)
report "the attribute: the guard holds the text of this side" "$(cat "$repo/.claude/hooks/a.sh")" "v3"
report "the attribute: the guard is named in conflict" "$(git -C "$repo" diff --name-only --diff-filter=U -- .claude/hooks)" ".claude/hooks/a.sh"

# The calls of the machine account: without the token file none of them reaches the client.
bot="$(grep -m1 '^bot() {' "$ROOT/.claude/skills/task-delivery-loop-run/SKILL.md" | sed 's#/opt/homebrew/bin/gh#echo ran#')"
mkdir -p "$WORK/home/.config"
for shell in bash zsh; do
    command -v "$shell" >/dev/null 2>&1 || continue
    report "bot, $shell: no token file — the call does not run" "$(HOME="$WORK/home" "$shell" -c "$bot
bot api x; bot api -X POST y" 2>/dev/null)" ""
    report "bot, $shell: no token file — it says so" "$(HOME="$WORK/home" "$shell" -c "$bot
bot api x" 2>&1)" "no machine token"
    printf 'token\n' > "$WORK/home/.config/rt-tools-bot-token"
    report "bot, $shell: with the token the call runs" "$(HOME="$WORK/home" "$shell" -c "$bot
bot api x" 2>&1)" "ran api x"
    rm -f "$WORK/home/.config/rt-tools-bot-token"
done
report "every bot of the loop is one and the same" "$(grep '^bot() {' "$ROOT/.claude/skills/task-delivery-loop-run/SKILL.md" | sort -u | wc -l | tr -d ' ')" "1"

suite_result "merge-block"
