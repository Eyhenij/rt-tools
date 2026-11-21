#!/usr/bin/env bash
# The scenarios of the Angular Doctor threshold check: the verdict on the JSON the tool prints.
# The tool itself is not run here — the input is written out, so that every verdict is reachable,
# the failed run of the tool among them.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the Angular Doctor threshold check"

CHECK="$TOOLS/check-ngdoctor.mjs"
THRESHOLD="$(node --input-type=module -e "import('$CHECK').then((m) => console.log(m.THRESHOLD))")"
BELOW="$(node -p "$THRESHOLD - 0.75")"
ABOVE="$(node -p "$THRESHOLD + 0.75")"

# The verdict of the check on the given standard input: green or red.
verdict() {
    local label="$1" input="$2" want="$3" got
    if printf '%s' "$input" | node "$CHECK" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

# Whether the output of the check holds a line matching the pattern.
says() {
    local label="$1" input="$2" pattern="$3" got
    if printf '%s' "$input" | node "$CHECK" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

report_of() { printf '{"score": %s, "totals": {"error": 1, "warning": 2, "info": 3}}' "$1"; }

verdict "a score equal to the threshold is green" "$(report_of "$THRESHOLD")" "green"
says "the green verdict ends with the shown score" "$(report_of "$THRESHOLD")" "^score [0-9]+ = threshold [0-9]+$"
verdict "a score below the threshold is red" "$(report_of "$BELOW")" "red"
says "the red verdict below names the way to the finding" "$(report_of "$BELOW")" "angular-doctor --verbose"
verdict "a score above the threshold is red" "$(report_of "$ABOVE")" "red"
says "the red verdict above names the new threshold" "$(report_of "$ABOVE")" "THRESHOLD = $ABOVE"
verdict "an empty input is red" "" "red"
verdict "a broken input is red" "Error: something failed" "red"
verdict "an input without a score is red" '{"totals": {}}' "red"
verdict "a score that is not a number is red" '{"score": "31"}' "red"

suite_result "check-ngdoctor"
