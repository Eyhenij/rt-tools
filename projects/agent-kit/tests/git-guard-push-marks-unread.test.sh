#!/usr/bin/env bash
# Scenarios of the key of a green mark: a check the profile names unread paths for keeps its key
# over a commit of those paths alone, and every other check loses it on any change of the tree.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the marks of the push set: a check keyed by what it reads"

REPO="$(mktemp -d)"
git -C "$REPO" init -q 2>/dev/null
git -C "$REPO" config commit.gpgsign false
git -C "$REPO" config user.name probe
git -C "$REPO" config user.email probe@example.invalid
mkdir -p "$REPO/src" "$REPO/docs"
printf 'code\n' > "$REPO/src/a.ts"
printf 'text\n' > "$REPO/docs/a.md"
git -C "$REPO" add -A 2>/dev/null
git -C "$REPO" commit -q -m 'chore: the start' 2>/dev/null

# The key of a check on the head of the fixture. The profile of the fixture names what the builder
# does not read: files under `docs/` and a markdown file at the root.
key_of() {
    (
        cd "$REPO" || exit 1
        # shellcheck disable=SC1091
        . "$HOOKS/git-guard-push-marks.sh"
        rt_push_check_unread() {
            case "$1" in builder) printf '%s\n' ':(exclude)docs' ':(exclude,glob)*.md' ;; esac
        }
        rt_push_mark_key "$1" ''
    )
}

commit_file() {
    mkdir -p "$REPO/$(dirname "$1")"
    printf '%s\n' "$2" > "$REPO/$1"
    git -C "$REPO" add -A 2>/dev/null
    git -C "$REPO" commit -q -m "chore: $1" 2>/dev/null
}

same() { [ -n "$1" ] && [ "$1" = "$2" ] && printf same || printf differs; }

builder_start="$(key_of builder)"
whole_start="$(key_of whole)"
report "the key of a check is not empty" "$([ -n "$builder_start" ] && printf yes)" yes

commit_file docs/plan.md 'a plan'
report "SC-AK-1347 — a commit under an unread directory keeps the key of the check" "$(same "$builder_start" "$(key_of builder)")" same
report "SC-AK-1347 — the same commit drops the key of a check the profile does not name" "$(same "$whole_start" "$(key_of whole)")" differs

commit_file README.md 'a text at the root'
report "SC-AK-1347 — a markdown file at the root keeps the key of the check" "$(same "$builder_start" "$(key_of builder)")" same

commit_file src/rule.md 'a text inside the code'
builder_text_in_code="$(key_of builder)"
report "SC-AK-1348 — a markdown file inside the code drops the key" "$(same "$builder_start" "$builder_text_in_code")" differs

commit_file src/b.ts 'more code'
report "SC-AK-1348 — a commit of code drops the key" "$(same "$builder_text_in_code" "$(key_of builder)")" differs

rm -rf "$REPO"
suite_result "the marks of the push set: a check keyed by what it reads"
