#!/usr/bin/env bash
# The scenarios of the Angular Doctor threshold check: the verdict on the JSON the tool prints and
# the writing of the threshold. The tool itself is not run here — the output is written out by
# `--input`, so that every verdict is reachable, the failed and the degraded run among them.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the Angular Doctor threshold check"

CHECK="$TOOLS/check-ngdoctor.mjs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The threshold the scenarios judge against: two sources, three rules.
cat > "$WORK/threshold.json" <<'EOF'
{
    "score": 80,
    "rules": {
        "angular-doctor/inner-html": 2,
        "angular-doctor/missing-spec-file": 3,
        "oxlint/eqeqeq": 1
    }
}
EOF

# The output of the tool: the score, then a finding per argument as «rule».
output() {
    local score="$1" first=1
    shift
    printf '{"score": %s, "filesScanned": 10, "filesTotal": 10, "skippedChecks": [], "diagnostics": [' "$score"
    for rule in "$@"; do
        [ "$first" = 1 ] || printf ','
        first=0
        printf '{"ruleId": "%s", "file": "/x/a.ts", "line": 1, "message": "m"}' "$rule"
    done
    printf ']}'
}

SAME=(angular-doctor/inner-html angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file oxlint/eqeqeq)

# The verdict of the check on an output text: green or red.
verdict() {
    local label="$1" text="$2" want="$3" got
    printf '%s' "$text" > "$WORK/out.json"
    if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

# Whether the output of the check holds a line matching the pattern.
says() {
    local label="$1" text="$2" pattern="$3" got
    printf '%s' "$text" > "$WORK/out.json"
    if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --verbose 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

verdict "the result equal to the threshold is green" "$(output 80 "${SAME[@]}")" "green"
says "the green verdict ends with the shown score" "$(output 80 "${SAME[@]}")" "^score 80 = threshold 80$"

verdict "a lower score is red" "$(output 78.5 "${SAME[@]}")" "red"
verdict "one more finding of a firing rule at the same score is red" "$(output 80 "${SAME[@]}" oxlint/eqeqeq)" "red"
says "the red verdict names the rule that grew" "$(output 80 "${SAME[@]}" oxlint/eqeqeq)" "oxlint/eqeqeq: 1 → 2"
says "--verbose lists the files of the rule that grew" "$(output 80 "${SAME[@]}" oxlint/eqeqeq)" "oxlint/eqeqeq /x/a.ts:1"
verdict "a finding of a new rule is red" "$(output 80 "${SAME[@]}" angular-doctor/target-blank)" "red"
verdict "a swap between two rules at the same totals is red" \
    "$(output 80 angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file oxlint/eqeqeq)" "red"

FEWER="$(output 81.5 angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file oxlint/eqeqeq)"
verdict "a better result not written as the threshold is red" "$FEWER" "red"
says "the red verdict on a better result names the write command" "$FEWER" "check-ngdoctor.mjs --write"

verdict "a silent source the threshold holds is red" "$(output 85 angular-doctor/inner-html angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file)" "red"
says "the red verdict on a silent source names it" "$(output 85 angular-doctor/inner-html angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file)" "source «oxlint» gave no finding"
verdict "a run with skipped checks is red at equal numbers" "$(output 80 "${SAME[@]}" | sed 's/"skippedChecks": \[\]/"skippedChecks": ["oxlint is not available"]/')" "red"
verdict "a run that scanned fewer files than it found is red" "$(output 80 "${SAME[@]}" | sed 's/"filesScanned": 10/"filesScanned": 9/')" "red"

verdict "an empty input is red" "" "red"
verdict "a broken input is red" "Error: something failed" "red"
verdict "an input without a score is red" '{"diagnostics": []}' "red"
verdict "an input without the findings is red" '{"score": 80}' "red"

# --write: a degraded run is not written, a silent source is written only when named gone.
cp "$WORK/threshold.json" "$WORK/before.json"
printf '%s' "$(output 85 angular-doctor/inner-html angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file)" > "$WORK/out.json"
if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --write >/dev/null 2>&1; then got="written"; else got="refused"; fi
report "--write refuses a run with a silent source" "$got" "refused"
if cmp -s "$WORK/threshold.json" "$WORK/before.json"; then got="kept"; else got="changed"; fi
report "the refused --write leaves the threshold as it was" "$got" "kept"
if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --write --source-gone oxlint >/dev/null 2>&1; then got="written"; else got="refused"; fi
report "--write --source-gone writes the source that is gone" "$got" "written"
verdict "the written threshold makes the same run green" "$(cat "$WORK/out.json")" "green"

suite_result "check-ngdoctor"
