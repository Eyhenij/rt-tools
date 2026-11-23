#!/usr/bin/env bash
# The scenarios of the Angular Doctor threshold check: the verdict on the JSON the tool prints and
# the writing of the threshold. The tool does not scan the tree here — the output is written out by
# `--input`, so that every verdict is reachable, the failed and the degraded run among them. It runs
# only on the probe, twice, half a second each: once whole and once without one source's construct.
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

# The probe: every source fires its named rule on a one-component project, or the check is red and
# names the source. The saved output of the probe goes by `--probe-input`; the real probe runs the
# tool once on it, `--probe-omit` drops the construct of one source.
cp "$WORK/before.json" "$WORK/threshold.json"
printf '%s' "$(output 80 "${SAME[@]}")" > "$WORK/tree.json"
PROBE=(angular-doctor/project-layout angular-doctor/missing-spec-file oxlint/eqeqeq template-eslint/button-has-type)

# Whether the check is red on a probe without the named rule and names that rule.
probe_misses() {
    local label="$1" rule="$2" got kept=()
    for r in "${PROBE[@]}"; do [ "$r" = "$rule" ] || kept+=("$r"); done
    printf '%s' "$(output 90 "${kept[@]}")" > "$WORK/probe.json"
    if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" > "$WORK/said.txt" 2>&1; then
        got="green"
    elif grep -q "«${rule%%/*}» did not fire $rule" "$WORK/said.txt"; then got="red, named"; else got="red, unnamed"; fi
    report "$label" "$got" "red, named"
}

probe_misses "the probe without the file rule of angular-doctor is red" angular-doctor/missing-spec-file
probe_misses "the probe without the rule of oxlint is red" oxlint/eqeqeq
probe_misses "the probe without the rule of the template linter is red" template-eslint/button-has-type

printf '%s' "$(output 90 "${PROBE[@]}")" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" >/dev/null 2>&1; then got="green"; else got="red"; fi
report "the probe with the rule of every source is green" "$got" "green"

printf '%s' "$(output 90 "${PROBE[@]}" | sed 's/"skippedChecks": \[\]/"skippedChecks": ["oxlint is not available"]/')" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" >/dev/null 2>&1; then got="green"; else got="red"; fi
report "a degraded run of the probe is red" "$got" "red"

printf '%s' "$(output 90 angular-doctor/project-layout angular-doctor/missing-spec-file template-eslint/button-has-type)" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" --write --source-gone oxlint >/dev/null 2>&1; then got="written"; else got="refused"; fi
if cmp -s "$WORK/threshold.json" "$WORK/before.json"; then got="$got, kept"; else got="$got, changed"; fi
report "the probe without oxlint refuses --write --source-gone oxlint" "$got" "refused, kept"

if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-real >/dev/null 2>&1; then got="green"; else got="red"; fi
report "the probe run for real is green" "$got" "green"

if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-real --probe-omit template-eslint > "$WORK/said.txt" 2>&1; then
    got="green"
elif grep -q "did not fire template-eslint/button-has-type" "$WORK/said.txt"; then got="red, named"; else got="red, unnamed"; fi
report "the probe run for real without the button type rule is red" "$got" "red, named"

suite_result "check-ngdoctor"
