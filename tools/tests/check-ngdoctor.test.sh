#!/usr/bin/env bash
# The scenarios of the Angular Doctor threshold check: the verdict on the JSON the tool prints.
# The tool itself is not run here — the input is written out, so that every verdict is reachable,
# the failed run of the tool and the run with skipped checks among them.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the Angular Doctor threshold check"

CHECK="$TOOLS/check-ngdoctor.mjs"
# The threshold as four numbers: score, errors, warnings, info.
read -r SCORE ERRORS WARNINGS INFO <<<"$(node --input-type=module -e "import('$CHECK').then(({ THRESHOLD: t }) => console.log(t.score, t.error, t.warning, t.info))")"

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

# The JSON of the tool: score, errors, warnings, info and the skipped checks as a JSON list.
report_of() {
    printf '{"score": %s, "totals": {"error": %s, "warning": %s, "info": %s}, "skippedChecks": %s}' \
        "$1" "$2" "$3" "$4" "${5:-[]}"
}

SAME="$(report_of "$SCORE" "$ERRORS" "$WARNINGS" "$INFO")"
verdict "the result equal to the threshold is green" "$SAME" "green"
says "the green verdict ends with the shown score" "$SAME" "^score [0-9]+ = threshold [0-9]+$"

LOWER="$(report_of "$(node -p "$SCORE - 0.75")" "$ERRORS" "$((WARNINGS + 1))" "$INFO")"
verdict "a lower score is red" "$LOWER" "red"
says "the red verdict on a worse result names the way to the finding" "$LOWER" "angular-doctor --verbose"

verdict "one more warning at the same score is red" "$(report_of "$SCORE" "$ERRORS" "$((WARNINGS + 1))" "$INFO")" "red"
verdict "one more error at the same score is red" "$(report_of "$SCORE" "$((ERRORS + 1))" "$WARNINGS" "$INFO")" "red"
verdict "one more info at the same score is red" "$(report_of "$SCORE" "$ERRORS" "$WARNINGS" "$((INFO + 1))")" "red"
verdict "a fix that adds another finding is red" \
    "$(report_of "$(node -p "$SCORE + 1.5")" "$((ERRORS - 1))" "$((WARNINGS + 1))" "$INFO")" "red"

HIGHER="$(report_of "$(node -p "$SCORE + 0.75")" "$ERRORS" "$((WARNINGS - 1))" "$INFO")"
verdict "a better result not written as the threshold is red" "$HIGHER" "red"
says "the red verdict on a better result names the new threshold" "$HIGHER" "write THRESHOLD = \\{ score: $(node -p "$SCORE + 0.75"), error: $ERRORS"

SKIPPED="$(report_of "$SCORE" "$ERRORS" "$WARNINGS" "$INFO" '["oxlint is not available"]')"
verdict "a run with skipped checks is red at equal numbers" "$SKIPPED" "red"
says "the red verdict on skipped checks prints their reason" "$SKIPPED" "oxlint is not available"

verdict "an empty input is red" "" "red"
verdict "a broken input is red" "Error: something failed" "red"
verdict "an input without a score is red" '{"totals": {}}' "red"
verdict "a score that is not a number is red" '{"score": "31"}' "red"
verdict "an input without the counts is red" "{\"score\": $SCORE}" "red"

suite_result "check-ngdoctor"
