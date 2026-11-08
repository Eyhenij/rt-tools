#!/usr/bin/env bash
# rt-kit v0.35.0 · hooks/pull-outcomes.sh · be7a4594982f · правится надстройкой, не здесь
# The facts about closed requests, one JSON object per line. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The report and the sending call it.
#
# Why here and not in the reader. A merge often happens in a browser with no session open, so the
# outcome is read later. The hosting side lives in the tree profile, `rt_pull_outcomes <day>`: the
# package ships a default for GitHub, and another hosting names its own. The marks live here, and a
# branch name is hashed by the same code that wrote the mark. So this file joins the two, and the
# reader never sees a branch name.
#
#   bash pull-outcomes.sh <day, YYYY-MM-DD>
#
# A line of the profile: `{number, merged, task, revert, epic, closed, head, commits}`, where `commits`
# holds `{sha, tree, parents}` from the oldest. What leaves here: the same without `head`, plus
# `handover` (`{commit, tree}` or null) and `corrections` (the owner corrections after the handover).
#
# Exit code 3 — nobody to ask: no profile function, or it failed. A tree without outcomes is counted
# apart, so silence must not read as «nothing was closed».

hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="${CLAUDE_PROJECT_DIR:-$PWD}"
export CLAUDE_PROJECT_DIR="$root"
cd "$root" 2>/dev/null || exit 3

for profile in "$hooks_dir/../rt-kit/defaults/project.sh" "$hooks_dir/../defaults/project.sh" \
    "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

. "$hooks_dir/metric-marks.sh" 2>/dev/null || exit 3
command -v rt_pull_outcomes >/dev/null 2>&1 || exit 3
command -v jq >/dev/null 2>&1 || exit 3

# The function is there, so a failure of it is a broken read, and a broken read is not «nobody to
# ask»: code 4 keeps the day of the last read where it was, and the next read takes the request again.
pulls="$(rt_pull_outcomes "$1" 2>/dev/null)"
code=$?
[ "$code" = 3 ] && exit 3
[ "$code" = 0 ] || exit 4

printf '%s\n' "$pulls" | while IFS= read -r pull; do
    [ -n "$pull" ] || continue
    head="$(printf '%s' "$pull" | jq -r '.head // empty' 2>/dev/null)"
    handover=''
    corrections='[]'
    if [ -n "$head" ]; then
        file="$(rt_branch_mark handover "$head")"
        [ -f "$file" ] && handover="$(cat "$file" 2>/dev/null)"
        file="$(rt_branch_mark corrections "$head")"
        [ -f "$file" ] && corrections="$(sed -n 's/^after //p' "$file" 2>/dev/null | jq -R . | jq -cs . 2>/dev/null)"
    fi
    printf '%s' "$pull" | jq -c --arg sign "$handover" --argjson after "${corrections:-[]}" '
        del(.head)
        + { corrections: $after,
            handover: (if $sign == "" then null
                       else ($sign | split(" ") | { commit: .[0], tree: .[1] }) end) }' 2>/dev/null
done
exit 0
