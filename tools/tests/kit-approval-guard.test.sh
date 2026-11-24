#!/usr/bin/env bash
# The scenarios of the kit approval guard at night: before the boundary of an autonomous session a
# record in place refuses the PR instead of opening the owner's window, and by day the window is back.
# The check is a double that answers by the variables of the case; the morning lists are files of a
# one-off tree. The daytime decisions without a list stand in `check-kit-approval.test.sh`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the kit approval guard at night"

GUARD="$(cd "$TOOLS/.." && pwd)/.claude/hooks/kit-approval-guard.sh"
TREE="$(mktemp -d)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT
HANDOFF="$TREE/.claude/handoff"
mkdir -p "$TREE/tools" "$HANDOFF"
cat >"$TREE/tools/check-kit-approval.mjs" <<'STUB'
if (process.argv.includes('--quotes')) {
    if (process.env.STUB_QUOTES) console.log(process.env.STUB_QUOTES);
    process.exit(0);
}
process.exit(process.env.STUB_FAIL ? 1 : 0);
STUB
QUOTES='Макет: «да» · Витрина: «да»'

answer() {
    printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "${1:-gh pr create --title x}" \
        | CLAUDE_PROJECT_DIR="$TREE" bash "$GUARD" 2>/dev/null
}
decision() {
    local out
    out="$(answer "$@")"
    if [ -z "$out" ]; then echo PASS; else printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision'; fi
}
names() { answer | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -cF -- "$1"; }
list() { printf '# Список к утру\n\n%s\nРазрешено: «нет»\n\n| Работа | Ветка |\n| --- | --- |\n%s\n' "$2" "${3:-}" >"$HANDOFF/$1-ночь.md"; }
AHEAD='Автономно до: 2199-01-02T08:00'
BEHIND='Автономно до: 2001-01-02T08:00'
export STUB_QUOTES="$QUOTES"

list 2198-01-01 "$AHEAD"
report "night refuses instead of the window" "$(decision)" deny
report "the night refusal names the boundary, the list and the quotes" \
    "$(names '2199-01-02T08:00') $(names '.claude/handoff/2198-01-01-ночь.md') $(names "$QUOTES")" "1 1 1"
report "the night refusal says the PR waits for the morning" "$(names 'The PR waits for the morning')" 1
report "no visible kit edit passes at night" "$(STUB_QUOTES='' decision)" PASS
report "a missing record is refused at night by its own reason" \
    "$(STUB_FAIL=1 decision) $(STUB_FAIL=1 answer | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -c 'Autonomous until')" "deny 0"
report "a release with no fault passes at night" "$(decision 'gh workflow run publish-ui-kit-v2.yml')" PASS

list 2198-01-01 "$BEHIND"
report "a passed boundary opens the window" "$(decision)" ask
list 2198-01-01 'Автономно до: 8 утра'
report "a boundary in words opens the window" "$(decision)" ask
list 2198-01-01 'Граница: до утра' "| $AHEAD | x |"
report "a row of the table that quotes the line is no boundary" "$(decision)" ask
list 2198-01-01 "$AHEAD"
list 2199-01-01 "$BEHIND"
report "the newest list is judged, not an older one" "$(decision)" ask
rm -rf "$HANDOFF"
report "no list opens the window" "$(decision)" ask

suite_result "the kit approval guard at night"
