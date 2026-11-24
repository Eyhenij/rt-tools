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
report "the night refusal says the PR waits for the morning and the next work is taken" \
    "$(names 'The PR waits for the morning: write it into that list as the step the work waits for') $(names 'leave the card and the branch, and take the next work')" "1 1"
report "the night refusal names the list by its path in the tree and the move when the owner is back" \
    "$(names "in .claude/handoff/2198-01-01-ночь.md") $(names 'If the owner is back')" "1 1"
report "the night refusal does not call to wait for the owner's word" "$(names 'wait for their word')" 0
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
printf '# Список\n\n| Работа |\n| --- |\n| RT-1 |\n%s\n' "$AHEAD" >"$HANDOFF/2198-01-01-ночь.md"
report "a line after the table is no boundary" "$(decision)" ask
list 2198-01-01 "Слова: $AHEAD"
report "a line that does not open with the words is no boundary" "$(decision)" ask
list 2198-01-01 "$AHEAD"$'\r'
report "a boundary with a carriage return is read" "$(decision)" deny
list 2198-01-01 "$AHEAD
$BEHIND"
report "the first boundary of the head is judged" "$(decision)" deny
for at in 2199-01-01T25:00 2199-13-01T08:00 2199-11-32T08:00 2199-01-01T08:60; do
    list 2198-01-01 "Автономно до: $at"
    report "a moment the clock does not have is no boundary: $at" "$(decision)" ask
done
# A boundary minutes away, in local time: a zone far from UTC tells a local clock from UTC.
export TZ=Asia/Vladivostok
near() { node -e "const d = new Date(Date.now() + $1 * 60000); const p = (n) => String(n).padStart(2, '0'); console.log(\`\${d.getFullYear()}-\${p(d.getMonth() + 1)}-\${p(d.getDate())}T\${p(d.getHours())}:\${p(d.getMinutes())}\`)"; }
list 2198-01-01 "Автономно до: $(near 5)"
report "a boundary five minutes ahead is night" "$(decision)" deny
list 2198-01-01 "Автономно до: $(near -5)"
report "a boundary five minutes back is day" "$(decision)" ask
unset TZ
list 2198-01-01 "$AHEAD (по Москве)"
report "a moment with a tail is no boundary" "$(decision)" ask
list 2198-01-01 "$BEHIND"
printf '%s\n' "$AHEAD" >"$HANDOFF/2198-02-01-ночь-до-080000.md"
printf '%s\n' "$AHEAD" >"$HANDOFF/RT-1-probe.md"
mkdir -p "$HANDOFF/inner"
printf '%s\n' "$AHEAD" >"$HANDOFF/inner/2198-03-01-ночь.md"
report "a list put aside, another handover and a nested file are no morning list" "$(decision)" ask
ELSEWHERE="$TREE/elsewhere"
mkdir -p "$ELSEWHERE"
printf '%s\n' "$AHEAD" >"$ELSEWHERE/2199-05-05-ночь.md"
report "the directory of the list comes from the environment, an absolute one too" \
    "$(RT_HANDOFF_DIR=elsewhere decision) $(RT_HANDOFF_DIR="$ELSEWHERE" decision)" "deny deny"
list 2198-01-01 "$AHEAD"
list 2199-01-01 "$BEHIND"
report "the newest list is judged, not an older one" "$(decision)" ask
rm -rf "$HANDOFF"
report "no list opens the window" "$(decision)" ask

suite_result "the kit approval guard at night"
