#!/usr/bin/env bash
# The scenarios of the Angular Doctor threshold check: the verdict on the JSON the tool prints and
# the writing of the threshold. The tool does not scan the tree here — the output is written out by
# `--input`, so that every verdict is reachable, the failed and the degraded run among them. It runs
# only on the probe, four times, half a second each: once whole and once without the constructs of
# each source.
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

# The output of the tool: the score, then a finding per argument as «rule» or «rule@file».
output() {
    local score="$1" first=1 file
    shift
    printf '{"score": %s, "filesScanned": 10, "filesTotal": 10, "skippedChecks": [], "diagnostics": [' "$score"
    for rule in "$@"; do
        [ "$first" = 1 ] || printf ','
        first=0
        file="/x/a.ts"
        case "$rule" in *@*) file="${rule#*@}" rule="${rule%%@*}" ;; esac
        printf '{"ruleId": "%s", "file": "%s", "line": 1, "message": "m"}' "$rule" "$file"
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

# The output of the probe with every named finding of every source; the probe is judged below.
INLINE=/p/src/app/probe.component.ts
EXTERNAL=/p/src/app/probe-page.component.html
PROBE=(
    angular-doctor/project-layout
    "angular-doctor/missing-spec-file@$INLINE"
    "angular-doctor/getter-in-template@$INLINE"
    "angular-doctor/getter-in-template@$EXTERNAL"
    "oxlint/eqeqeq@$INLINE"
    "template-eslint/button-has-type@$INLINE"
    "template-eslint/button-has-type@$EXTERNAL"
)
printf '%s' "$(output 90 "${PROBE[@]}")" > "$WORK/live.json"

# --write: a degraded run is not written, a silent source is written only when named gone, and only
# beside a probe that shows the source running.
cp "$WORK/threshold.json" "$WORK/before.json"
printf '%s' "$(output 85 angular-doctor/inner-html angular-doctor/inner-html angular-doctor/missing-spec-file angular-doctor/missing-spec-file angular-doctor/missing-spec-file)" > "$WORK/out.json"
if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --write >/dev/null 2>&1; then got="written"; else got="refused"; fi
report "--write refuses a run with a silent source" "$got" "refused"
if cmp -s "$WORK/threshold.json" "$WORK/before.json"; then got="kept"; else got="changed"; fi
report "the refused --write leaves the threshold as it was" "$got" "kept"
if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --write --source-gone oxlint >/dev/null 2>&1; then got="written"; else got="refused"; fi
if cmp -s "$WORK/threshold.json" "$WORK/before.json"; then got="$got, kept"; else got="$got, changed"; fi
report "--write --source-gone on a saved output without a probe is refused" "$got" "refused, kept"
if node "$CHECK" --input "$WORK/out.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/live.json" --write --source-gone oxlint >/dev/null 2>&1; then got="written"; else got="refused"; fi
report "--write --source-gone writes the source that is gone" "$got" "written"
verdict "the written threshold makes the same run green" "$(cat "$WORK/out.json")" "green"

# The probe: every source gives its named findings in the named files of a two-component project, or
# the check is red and names the source, the rule and the file. The saved output of the probe goes by
# `--probe-input`; the real probe runs the tool on it, `--probe-omit` drops the constructs of one
# source.
cp "$WORK/before.json" "$WORK/threshold.json"
printf '%s' "$(output 80 "${SAME[@]}")" > "$WORK/tree.json"

# Whether the check is red on a probe without the named finding and names its rule and file. The
# source name is matched inside its word, not between «»: the push set runs with LC_ALL=C.UTF-8,
# where bash 3.2 breaks a variable glued to «» and the macOS grep refuses the pattern, and in the C
# locale a quote is two bytes, not one character.
probe_misses() {
    local label="$1" finding="$2" got kept=() rule
    rule="${finding%%@*}"
    for r in "${PROBE[@]}"; do [ "$r" = "$finding" ] || kept+=("$r"); done
    printf '%s' "$(output 90 "${kept[@]}")" > "$WORK/probe.json"
    if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" > "$WORK/said.txt" 2>&1; then
        got="green"
    elif grep -q "source [^ ]*${rule%%/*}[^ ]* did not fire $rule in ${finding##*/}" "$WORK/said.txt"; then got="red, named"; else got="red, unnamed"; fi
    report "$label" "$got" "red, named"
}

probe_misses "the probe without the file rule of angular-doctor is red" "angular-doctor/missing-spec-file@$INLINE"
probe_misses "the probe without the rule of oxlint is red" "oxlint/eqeqeq@$INLINE"
probe_misses "the probe without the rule of the template linter is red" "template-eslint/button-has-type@$INLINE"
probe_misses "an inline template of the probe without the getter rule is red" "angular-doctor/getter-in-template@$INLINE"
probe_misses "an external template of the probe without the getter rule is red" "angular-doctor/getter-in-template@$EXTERNAL"
probe_misses "an external template of the probe without the button rule is red" "template-eslint/button-has-type@$EXTERNAL"

# The rule fired in a file other than the named one does not count.
printf '%s' "$(output 90 "${PROBE[@]/%@$EXTERNAL/@$INLINE}")" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" > "$WORK/said.txt" 2>&1; then
    got="green"
elif [ "$(grep -c "in probe-page.component.html" "$WORK/said.txt")" = 2 ]; then got="red, named"; else got="red, unnamed"; fi
report "findings of the probe only in the inline component are red" "$got" "red, named"

printf '%s' "$(output 90 "${PROBE[@]}")" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" >/dev/null 2>&1; then got="green"; else got="red"; fi
report "the probe with the findings of every source is green" "$got" "green"

printf '%s' "$(output 90 "${PROBE[@]}" | sed 's/"skippedChecks": \[\]/"skippedChecks": ["oxlint is not available"]/')" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" > "$WORK/said.txt" 2>&1; then
    got="green"
elif grep -q "the probe: oxlint is not available" "$WORK/said.txt"; then got="red, named"; else got="red, unnamed"; fi
report "a degraded run of the probe is red and says so" "$got" "red, named"

printf '%s' "Error: the probe failed" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" > "$WORK/said.txt" 2>&1; then
    got="green"
elif grep -q "the probe: the output of angular-doctor is not JSON" "$WORK/said.txt"; then got="red, named"; else got="red, unnamed"; fi
report "a probe output that is not JSON is red" "$got" "red, named"

# A flag that went unheard would leave the check green on a probe it never ran: each misuse is
# refused with its own reason.
misuse() {
    local label="$1" reason="$2" got
    shift 2
    if node "$CHECK" "$@" > "$WORK/said.txt" 2>&1; then
        got="green"
    elif grep -qF -- "$reason" "$WORK/said.txt"; then got="refused"; else got="red, other reason"; fi
    report "$label" "$got" "refused"
}
T=(--input "$WORK/tree.json" --threshold "$WORK/threshold.json")
L="$WORK/live.json"
misuse "a saved probe without a saved tree output is refused" "give --input too" --probe-input "$L" --threshold "$WORK/threshold.json"
misuse "a saved probe and the real probe at once are refused" "are two probes" "${T[@]}" --probe-input "$L" --probe-real
misuse "--probe-omit without --probe-real is refused" "give --probe-real too" "${T[@]}" --probe-omit oxlint
misuse "--probe-omit of an unknown source is refused" "not «bogus»" "${T[@]}" --probe-real --probe-omit bogus
misuse "--probe-omit without a value is refused" "--probe-omit takes a value" "${T[@]}" --probe-omit --probe-real
misuse "--probe-input without a value is refused" "--probe-input takes a value" "${T[@]}" --probe-input
misuse "a mistyped flag is refused" "«--probe-inputs» is not a flag" "${T[@]}" --probe-inputs "$L"
misuse "a flag given twice is refused" "--probe-input is given twice" "${T[@]}" --probe-input "$L" --probe-input "$L"
misuse "--source-gone without --write is refused" "give --write too" "${T[@]}" --probe-input "$L" --source-gone oxlint
misuse "--source-gone of an unknown source is refused" "not «oxlnt»" "${T[@]}" --probe-input "$L" --write --source-gone oxlnt

# The settings of the tool hold the report path and nothing else.
printf '{"reportPath": "tmp/r.md"}' > "$WORK/config.json"
if node "$CHECK" "${T[@]}" --config "$WORK/config.json" >/dev/null 2>&1; then got="green"; else got="red"; fi
report "settings with the report path only are green" "$got" "green"
printf '{"reportPath": "tmp/r.md", "ignore": ["**/*.html"]}' > "$WORK/config.json"
misuse "settings that ignore paths are refused" "hold «ignore»" "${T[@]}" --config "$WORK/config.json"
printf '{"reportPath": "tmp/r.md", "rules": {"angular-doctor/inner-html": "off"}}' > "$WORK/config.json"
misuse "settings that switch a rule off are refused" "hold «rules»" "${T[@]}" --config "$WORK/config.json"

printf '%s' "$(output 90 "${PROBE[@]/oxlint*/angular-doctor/project-layout}")" > "$WORK/probe.json"
if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-input "$WORK/probe.json" --write --source-gone oxlint >/dev/null 2>&1; then got="written"; else got="refused"; fi
if cmp -s "$WORK/threshold.json" "$WORK/before.json"; then got="$got, kept"; else got="$got, changed"; fi
report "the probe without oxlint refuses --write --source-gone oxlint" "$got" "refused, kept"

if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-real > "$WORK/said.txt" 2>&1 \
    && grep -q "the sources angular-doctor, oxlint, template-eslint run" "$WORK/said.txt"; then got="green, ran"; else got="not green"; fi
report "the probe run for real is green" "$got" "green, ran"

# The real probe without the constructs of one source: red, with every finding of that source named.
real_misses() {
    local label="$1" source="$2" count="$3" got
    if node "$CHECK" --input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-real --probe-omit "$source" > "$WORK/said.txt" 2>&1; then
        got="green"
    elif [ "$(grep -c "source [^ ]*$source[^ ]* did not fire" "$WORK/said.txt")" = "$count" ]; then got="red, named"; else got="red, unnamed"; fi
    report "$label" "$got" "red, named"
}
real_misses "the probe run for real without the button type rule is red" template-eslint 2
real_misses "a real probe without the constructs of angular-doctor is red" angular-doctor 3
real_misses "a real probe without the loose comparison of oxlint is red" oxlint 1

# The pass: after the scan the check walks the scanned files itself, with the tool's own modules,
# and names a file the tool lost silently. A pass directory stands in for the tree beside a saved
# output; its file count is the output's filesScanned. A stand-in oxlint is a node script.
PASS="$WORK/pass"
mkdir -p "$PASS/src"
printf '%s\n' '{"score": 90, "rules": {}}' > "$WORK/pass-threshold.json"
pass_tree() {
    rm -f "$PASS/src/"*
    printf '%s\n' "import { Component } from '@angular/core';" "" "@Component({ selector: 'app-a', template: '<p>a</p>' })" 'export class AComponent {}' > "$PASS/src/a.component.ts"
    printf '%s\n' "import { Component } from '@angular/core';" "" "@Component({ selector: 'app-b', templateUrl: './b.component.html' })" 'export class BComponent {}' > "$PASS/src/b.component.ts"
    printf '%s\n' '<p>b</p>' > "$PASS/src/b.component.html"
}
# The saved output of the tool for the pass directory: its score, its file count, findings as rule@file.
pass_output() {
    local scanned="$1" first=1 rule file
    shift
    printf '{"score": 90, "filesScanned": %s, "filesTotal": %s, "skippedChecks": [], "diagnostics": [' "$scanned" "$scanned"
    for entry in "$@"; do
        [ "$first" = 1 ] || printf ','
        first=0
        rule="${entry%%@*}" file="${entry#*@}"
        printf '{"ruleId": "%s", "file": "%s", "line": 1, "message": "m"}' "$rule" "$file"
    done
    printf ']}'
}
# Whether the pass is red and its refusal holds the reason.
pass_says() {
    local label="$1" reason="$2" got
    shift 2
    if node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS" "$@" > "$WORK/said.txt" 2>&1; then
        got="green"
    elif grep -qF -- "$reason" "$WORK/said.txt"; then got="red, named"; else got="red, other reason"; fi
    report "$label" "$got" "red, named"
}
# A stand-in oxlint: `crash` dies without output on a file named boom.ts, `skip` reports one file
# fewer than it got.
printf '%s\n' \
    "const files = process.argv.slice(2).filter((a) => a.endsWith('.ts'));" \
    "if (process.env.FAKE_OXLINT === 'crash' && files.some((f) => f.endsWith('boom.ts'))) process.exit(134);" \
    "if (process.env.FAKE_OXLINT === 'always') process.exit(1);" \
    "const skipped = process.env.FAKE_OXLINT === 'skip' ? 1 : 0;" \
    "process.stdout.write(JSON.stringify({ diagnostics: [], number_of_files: files.length - skipped }));" > "$WORK/fake-oxlint.mjs"

pass_tree
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
if node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS" > "$WORK/said.txt" 2>&1 \
    && grep -q "the pass read every file: 3 files, 2 templates, oxlint 2 files" "$WORK/said.txt"; then got="green, counted"; else got="not green"; fi
report "the pass over a clean directory is green and counts" "$got" "green, counted"

printf '%s' "$(pass_output 4)" > "$WORK/pass-out.json"
pass_says "the pass over a list shorter than the scan is red" "the pass found 3 files, angular-doctor scanned 4"

printf '%s' "$(pass_output 3 "template-eslint/button-has-type@$WORK/elsewhere/c.component.html")" > "$WORK/pass-out.json"
mkdir -p "$WORK/elsewhere" && printf '<button></button>\n' > "$WORK/elsewhere/c.component.html"
pass_says "the pass with a finding outside its list is red" "outside the file list of the pass"

printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
printf '%s\n' '<p>use {x}</p>' > "$PASS/src/b.component.html"
pass_says "the pass names an external template it cannot parse" "cannot parse src/b.component.html"

pass_tree
printf '%s\n' "import { Component } from '@angular/core';" "" "@Component({ selector: 'app-a', template: '<p>use {x}</p>' })" 'export class AComponent {}' > "$PASS/src/a.component.ts"
pass_says "the pass names an inline template it cannot parse" "cannot parse src/a.component.ts"

# oxlint of the tool reports an unreadable file as oxlint/unknown with an empty file: that finding
# names no file of the list, and only the read failure is the reason.
pass_tree
printf '%s' "$(pass_output 3 "oxlint/unknown@")" > "$WORK/pass-out.json"
chmod 000 "$PASS/src/b.component.html"
if node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS" > "$WORK/said.txt" 2>&1; then
    got="green"
elif grep -qF "cannot read src/b.component.html" "$WORK/said.txt" && ! grep -qF "outside the file list" "$WORK/said.txt"; then
    got="red, named"
else got="red, other reason"; fi
chmod 644 "$PASS/src/b.component.html"
report "the pass names a file it cannot read" "$got" "red, named"

pass_tree
printf '%s' "$(pass_output 3 "oxlint/eqeqeq@src/a.component.ts")" > "$WORK/pass-out.json"
pass_says "the pass with another oxlint count than the tool is red" "oxlint gave 0 findings in the pass, 1 in the run"

printf '%s' "$(pass_output 4)" > "$WORK/pass-out.json"
printf 'export const boom = 1;\n' > "$PASS/src/boom.ts"
FAKE_OXLINT=crash pass_says "the pass names the file oxlint fails on" "it fails on src/boom.ts" --pass-oxlint "$WORK/fake-oxlint.mjs"
rm -f "$PASS/src/boom.ts"

printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
FAKE_OXLINT=skip pass_says "the pass sees oxlint skip a file" "oxlint linted 1 files of 2" --pass-oxlint "$WORK/fake-oxlint.mjs"

cp "$WORK/pass-threshold.json" "$WORK/pass-before.json"
printf '%s\n' '<p>use {x}</p>' > "$PASS/src/b.component.html"
if node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS" --write > "$WORK/said.txt" 2>&1; then got="written"; else got="refused"; fi
if cmp -s "$WORK/pass-threshold.json" "$WORK/pass-before.json" && grep -q "nothing written" "$WORK/said.txt"; then got="$got, kept"; else got="$got, changed"; fi
report "the pass that lost a file refuses --write" "$got" "refused, kept"

# The pairs of the refusals above — what the tool lawfully reports is no loss — and the refusals the
# reviews added. Their labels start with "a pass", apart from the ten losses the plan counts.
# Whether the pass is green: its line printed, no line of a loss. The exit code is not judged — the
# findings of these outputs differ from the threshold, and that red is the threshold's, not the pass's.
pass_green() {
    local label="$1" got
    shift
    node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" "$@" > "$WORK/said.txt" 2>&1
    if grep -q "the pass read every file" "$WORK/said.txt" && ! grep -q "lost a file" "$WORK/said.txt"; then got="green"; else got="red"; fi
    report "$label" "$got" "green"
}
pass_tree
# A spec file the tool ignores, and a project-layout finding on a main.ts that does not exist.
printf 'export const spec = 1;\n' > "$PASS/src/a.component.spec.ts"
printf '%s' "$(pass_output 3 "template-eslint/button-has-type@$PASS/src/b.component.html" "angular-doctor/missing-spec-file@src/a.component.ts" "angular-doctor/project-layout@src/main.ts")" > "$WORK/pass-out.json"
pass_green "a pass with findings on its own files, absolute and relative, is green" --pass-root "$PASS"
rm -f "$PASS/src/a.component.spec.ts"

printf '%s\n' '{"dependencies": {"zone.js": "0.15.0"}}' > "$PASS/package.json"
printf '%s' "$(pass_output 3 "angular-doctor/zone-js@$PASS/package.json")" > "$WORK/pass-out.json"
pass_green "a pass with a finding on package.json is green" --pass-root "$PASS"
rm -f "$PASS/package.json"

printf '%s\n' '<!-- eslint-disable -->' '<p>b</p>' > "$PASS/src/b.component.html"
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
pass_green "a pass over a template with an unused eslint-disable is green" --pass-root "$PASS"

# Without a .ts file the tool does not start oxlint; oxlint given no file lints the whole directory.
mkdir -p "$WORK/pass-html"
printf '%s\n' '<p>h</p>' > "$WORK/pass-html/h.component.html"
printf '%s\n' 'var x = 1; if (x == 2) {}' > "$WORK/pass-html/stray.js"
printf '%s' "$(pass_output 1)" > "$WORK/pass-out.json"
pass_green "a pass with no .ts file runs no oxlint and is green" --pass-root "$WORK/pass-html"

pass_tree
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
pass_says "a pass of another tool version asks to update the pass" "the tree has 0.4.0: compare the globs" --pass-version 0.4.0

printf 'export const boom = 1;\n' > "$PASS/src/boom.ts"
printf '%s' "$(pass_output 4)" > "$WORK/pass-out.json"
FAKE_OXLINT=always pass_says "a pass with oxlint failing on every part names the run, not a file" "every part of the list: the run fails, not a file" --pass-oxlint "$WORK/fake-oxlint.mjs"
rm -f "$PASS/src/boom.ts"

mkdir -p "$PASS/src/locked"
chmod 000 "$PASS/src/locked"
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
pass_says "a pass over a directory it cannot list refuses" "the pass cannot list the files"
chmod 755 "$PASS/src/locked"
rmdir "$PASS/src/locked"

# The package.json files and the stylesheets the tool reads apart from its file list (RT-3525). The
# lost file is a nested one: a root package.json the tool cannot read leaves the Angular version
# unknown, and the degraded run is red without the pass.
pass_tree
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
mkdir -p "$PASS/sub" "$PASS/coverage"
printf '%s\n' '{"name": "sub"}' > "$PASS/sub/package.json"
chmod 000 "$PASS/sub/package.json"
pass_says "the pass names a nested package.json it cannot read" "the pass cannot read sub/package.json"
chmod 644 "$PASS/sub/package.json"

printf '%s\n' '{"name": ' > "$PASS/sub/package.json"
pass_says "the pass names a package.json that is not JSON" "sub/package.json is not JSON"
printf '%s\n' '{"name": "sub"}' > "$PASS/sub/package.json"

printf '%s\n' '{"name": "coverage"}' > "$PASS/coverage/package.json"
chmod 000 "$PASS/coverage/package.json"
pass_says "the pass names a package.json under coverage it cannot read" "the pass cannot read coverage/package.json"
chmod 644 "$PASS/coverage/package.json"
rm -f "$PASS/coverage/package.json"

printf '%s\n' '.x { color: red; }' > "$PASS/sub/x.scss"
chmod 000 "$PASS/sub/x.scss"
printf '%s\n' '{"devDependencies": {"tailwindcss": "^4.1.0"}}' > "$PASS/package.json"
pass_says "the pass with tailwindcss 4 names a stylesheet it cannot read" "the pass cannot read sub/x.scss"
printf '%s\n' '{"devDependencies": {"tailwindcss": "~3.4.0"}}' > "$PASS/package.json"
pass_green "the pass with tailwindcss 3 leaves an unreadable stylesheet alone" --pass-root "$PASS"
printf '%s\n' '{"name": "pass"}' > "$PASS/package.json"
pass_green "the pass without tailwindcss leaves an unreadable stylesheet alone" --pass-root "$PASS"
chmod 644 "$PASS/sub/x.scss"

node "$CHECK" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS" > "$WORK/said.txt" 2>&1
if grep -q "oxlint 2 files, 2 package.json, 0 stylesheets" "$WORK/said.txt"; then got="counted"; else got="not counted"; fi
report "the pass counts its package.json files and stylesheets" "$got" "counted"
rm -rf "$PASS/sub" "$PASS/coverage" "$PASS/package.json"

misuse "--pass-root without a saved output is refused" "give --input too" --pass-root "$PASS"
misuse "--pass-oxlint without --pass-root is refused" "give --pass-root too" "${T[@]}" --pass-oxlint "$WORK/fake-oxlint.mjs"
misuse "--pass-version without --pass-root is refused" "give --pass-root too" "${T[@]}" --pass-version 0.4.0
misuse "--pass-oxlint with an empty value is refused" "takes a value" "${T[@]}" --pass-root "$PASS" --pass-oxlint ""
misuse "--pass-root naming no directory is refused" "names no directory" "${T[@]}" --pass-root "$WORK/nope"

suite_result "check-ngdoctor"
