#!/usr/bin/env bash
# The stage of the plan measured by one call: `task-flow-script.mjs step <N>`.
#
# The checks of the fixture read files of `state/` outside the task folder: the test turns a step green
# or red by writing one, and the plan stays as its commit holds it.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the stage measured by one call"

ENGINE="$ASSETS/checks/task-flow-script.mjs"
B=RT-7-probe
R="$(fixture_repo_branched main "$B")"
git -C "$R" update-ref refs/remotes/origin/main main
F="$R/docs/tasks/$B"
P="$F/progress.md"
MARKS="$R/.git/rt-kit/steps/$B"
export RT_FLOW_RECORDS_HOME="$(mktemp -d)"
trap 'rm -rf "$R" "$RT_FLOW_RECORDS_HOME"' EXIT

PLAN='# Plan

## Stages

### 1. First

- **Steps:**
    1. One
       Check: `cat state/1.1` → `ok`
    2. Two
       Check: `cat state/1.2` → `ok`
    3. Three
       Check: `cat state/1.3` → `ok`

### 2. Second

- **Steps:**
    1. Four
       Check: `cat state/2.1` → `ok`
    2. Five
       Check: `cat state/2.2` → `ok`

### 10. Tenth

- **Steps:**
    1. Six
       Check: `cat state/10.1` → `ok`
    2. Seven'
fixture_commit "$R" "docs/tasks/$B/plan.md" "$PLAN" 'docs: plan'

# Every check answers `ok`, except the steps named.
states() {
    mkdir -p "$R/state"
    for n in 1.1 1.2 1.3 2.1 2.2 10.1; do printf 'ok\n' > "$R/state/$n"; done
    for n in "$@"; do printf 'no\n' > "$R/state/$n"; done
}
# The progress with a mark per step, in the order of the plan, and no marks on disk but those named.
progress() {
    local marks="$1" i=0
    printf '# Progress\n\n## Where we stand\n\n- **Stage:** 1\n\n## Steps\n\n' > "$P"
    for n in '1.1 One' '1.2 Two' '1.3 Three' '2.1 Four' '2.2 Five' '10.1 Six' '10.2 Seven'; do
        printf -- '- [%s] %s\n' "${marks:$i:1}" "$n" >> "$P"
        i=$((i + 1))
    done
    rm -rf "$MARKS"
}
# A green mark of the plan of the branch; `GREEN` overrides its fields.
green() { mkdir -p "$MARKS" && for n in "$@"; do printf '{"matched":true,"plan":"%s","replaced":false}\n' "${GREEN:-$PRINT}" > "$MARKS/$n.json"; done; }
step() {
    local code
    OUT="$(cd "$R" && node "$ENGINE" step "$@" 2>&1)"
    code=$?
    printf '%s\n' "$OUT" > "$R/out"
    return "$code"
}
code_of() { step "$@" >/dev/null; printf '%s' "$?"; }
out() { cat "$R/out"; }
# The marks of the progress as one word: `xx>    `.
marks() { sed -nE 's/^- \[(.)\] [0-9]+\.[0-9]+ .*/\1/p' "$P" | tr -d '\n' | tr ' ' '.'; }
disk() { (cd "$MARKS" 2>/dev/null && ls | sed 's/\.json$//' | sort -V | tr '\n' ' ' | sed 's/ $//'); }
# A neutral edit of the progress judged by the step guard.
edit() {
    jq -n --arg f "$P" --arg d "$R" \
        '{session_id:"tests",tool_name:"Edit",cwd:$d,tool_input:{file_path:$f,old_string:"- **Stage:** 1",new_string:"- **Stage:** 1 of 3"}}'
}

# The fingerprint of the plan as the engine writes it.
states
progress '>      '
step 1.1
PRINT="$(node -p "require('$MARKS/1.1.json').plan")"

# --- every step matched ---------------------------------------------------------------------
states
progress '>      '
report "SC-AK-1997 — every step of the stage is marked: code 0" "$(code_of 1)" 0
report "SC-AK-1997 — every step of the stage is marked: the progress" "$(marks)" 'xxx>...'
report "SC-AK-1997 — every step of the stage is marked: the marks on disk" "$(disk)" '1.1 1.2 1.3'
report "SC-AK-1997 — every step of the stage is marked: the closing line" "$(out | tail -1)" 'stage 1: measured 3, matched 3, left open 0'
report "SC-AK-1997 — every step of the stage is marked: a line per step" "$(out | grep -cE '^1\.[123] .*· совпало$')" 3
expect_decision "SC-AK-1997 — an edit of the progress passes the guard after it: all matched" flow-step-guard.sh "$(edit)" PASS

# --- the first step did not match -----------------------------------------------------------
states 1.1
progress '>      '
report "SC-AK-1998 — a first step that did not match marks none: code 1" "$(code_of 1)" 1
report "SC-AK-1998 — a first step that did not match marks none: the progress" "$(marks)" '>......'
report "SC-AK-1998 — a first step that did not match marks none: the others keep marks on disk" "$(disk)" '1.2 1.3'
report "SC-AK-1998 — matched, not marked: the line names the open step" \
    "$(out | grep -cE '^1\.[23] .*· совпало · not marked: 1\.1 stands open before it$')" 2
report "SC-AK-1998 — matched, not marked: the closing line counts them" "$(out | tail -1)" 'stage 1: measured 3, matched 2, left open 2'
expect_decision "SC-AK-1998 — an edit of the progress passes the guard after it: the first did not match" flow-step-guard.sh "$(edit)" PASS
# The step mended, one call marks all three: the marks of the others are on disk, the steps open.
states
report "SC-AK-1998 — a first step that did not match marks none: mended, one call marks the stage" "$(code_of 1) $(marks)" '0 xxx>...'

# --- a middle step did not match ------------------------------------------------------------
states 1.2
progress '>      '
report "SC-AK-1999 — a middle step that did not match: code 1" "$(code_of 1)" 1
report "SC-AK-1999 — a middle step that did not match: marked up to it, it is current" "$(marks)" 'x>.....'
report "SC-AK-1999 — a middle step that did not match: matched, not marked behind it" "$(out | grep -c '^1.3 .*not marked: 1.2 stands open before it$')" 1
expect_decision "SC-AK-1999 — an edit of the progress passes the guard after it: a middle one did not match" flow-step-guard.sh "$(edit)" PASS

# --- an open step of an earlier stage -------------------------------------------------------
states
progress 'xx>    '
green 1.1 1.2
report "SC-AK-2000 — an open step of an earlier stage: code 1 with every step matched" "$(code_of 2)" 1
report "SC-AK-2000 — an open step of an earlier stage: none is marked" "$(marks)" 'xx>....'
report "SC-AK-2000 — an open step of an earlier stage: the line names it" "$(out | grep -c 'not marked: 1.3 stands open before it$')" 2
expect_decision "SC-AK-2000 — an edit of the progress passes the guard after it: an earlier stage is open" flow-step-guard.sh "$(edit)" PASS

# --- done steps -----------------------------------------------------------------------------
states
progress 'x>     '
green 1.1
printf 'no\n' > "$R/state/1.1"
report "SC-AK-2001 — a done step with a green mark is not measured: code 0" "$(code_of 1) $(marks)" '0 xxx>...'
report "SC-AK-2001 — a done step with a green mark is not measured: its line" "$(out | grep -c '^1.1 not measured: its mark stands$')" 1
report "SC-AK-2001 — a done step with a green mark is not measured: the closing line" "$(out | tail -1)" 'stage 1: measured 2, matched 2, left open 0'

states
progress 'xxx>   '
green 1.1 1.2 1.3
report "SC-AK-2001 — all marked are measured again: code 0" "$(code_of 1)" 0
report "SC-AK-2001 — all marked are measured again: the closing line" "$(out | tail -1)" 'stage 1: measured 3, matched 3, left open 0'
states 1.2
report "SC-AK-2001 — all marked are measured again: one that no longer matches gives code 1" "$(code_of 1)" 1
report "SC-AK-2001 — all marked are measured again: its mark on disk is gone" "$(disk)" '1.1 1.3'

states 1.1
progress 'x>     '
report "SC-AK-2001 — a mark without a green one is measured: code 1" "$(code_of 1)" 1
report "SC-AK-2001 — a mark without a green one is measured: its verdict" "$(out | grep -c '^1.1 .*· не совпало$')" 1

states 1.1
progress 'x>     '
mkdir -p "$MARKS" && printf '{"matched":false,"plan":"%s","replaced":false}\n' "$PRINT" > "$MARKS/1.1.json"
report "SC-AK-2001 — a mark without a green one is measured: a mark that did not match" "$(code_of 1; out | grep -c '^1.1 .*· не совпало$')" '11'
progress 'x>     '
GREEN=0000000000000000 green 1.1
report "SC-AK-2001 — a mark without a green one is measured: the mark of another plan" "$(code_of 1; out | grep -c '^1.1 .*· не совпало$')" '11'
report "SC-AK-2001 — a done step that did not match keeps its mark in the progress, its mark on disk is gone" "$(marks) $(disk)" 'xxx>... 1.2 1.3'
states 1.1
progress 'x>     '
green 1.1
printf '\n## Decisions along the way\n\n- **Check of step 1.1 replaced:** `echo no` → `ok`\n' >> "$P"
report "SC-AK-2001 — a mark without a green one is measured: the check is replaced since" "$(code_of 1; out | grep -c '^1.1 .*· не совпало$')" '11'

# --- a progress whose lines do not follow the plan ------------------------------------------
# The case, the edit of the progress, and the marks and the open step it leaves.
broken() {
    states ${4:-}
    progress '>      '
    sed -i.bak -E "$2" "$P" && rm "$P.bak"
    local before="$(cat "$P")"
    report "SC-AK-2000 — a line that cannot be marked in order stops the marking: $1" "$(code_of 1) $(out | grep -c "not marked: $3")" '1 '"${5:-1}"
    report "SC-AK-2000 — a line that cannot be marked in order stops the marking: $1, the progress stays" "$([ "$before" = "$(cat "$P")" ] && echo same)" same
    expect_decision "SC-AK-2000 — an edit of the progress passes the guard after it: $1" flow-step-guard.sh "$(edit)" PASS
}
broken 'a note with the number of a step above the steps' 's/^- \*\*Stage.*/&\n- [ ] 1.1 One (a note)/' 'the progress holds no line of it'
broken 'no line of the step' '/\] 1\.1 One/d; s/\[ \] 1\.2/[>] 1.2/' 'the progress holds no line of it'
broken 'no line of a step that did not match' '/\] 1\.1 One/d; s/\[ \] 1\.2/[>] 1.2/' '1.1 stands open before it' 1.1 2
broken 'the lines swapped' 's/^- \[>\] 1\.1 One/- [>] 1.9 Two/; s/^- \[ \] 1\.2 Two/- [ ] 1.1 One/; s/^- \[>\] 1\.9/- [>] 1.2/' 'the progress holds no line of it' 1.2

# --- refusals -------------------------------------------------------------------------------
states
progress '>      '
before="$(cat "$P")"
report "SC-AK-2002 — no such stage: code 1" "$(code_of 3)" 1
report "SC-AK-2002 — no such stage: the refusal" "$(out)" 'step: the plan names no stage 3'
report "SC-AK-2002 — no such stage: nothing is measured" "$(disk) $([ "$before" = "$(cat "$P")" ] && echo same)" ' same'
report "SC-AK-2002 — one stage per call: a second number" "$(code_of 1 2) $(out)" '1 step: one stage per call: 2 is not read'
report "SC-AK-2002 — one stage per call: a flag of the final rerun" "$(code_of 1 --pr) $(disk)" '1 '
progress 'xxxxx> '
report "SC-AK-2002 — no such stage: 1 is not 10" "$(code_of 1; out | grep -c '^10')" '00'
report "SC-AK-2002 — a step with no check: code 1" "$(code_of 10)" 1
report "SC-AK-2002 — a step with no check: its line" "$(out | grep -c '^10.2 step: step 10.2 has no check line$')" 1
report "SC-AK-2002 — a step with no check: the one before it is marked" "$(marks)" 'xxxxxx>'

# --- one step as before ---------------------------------------------------------------------
progress '>      '
report "SC-AK-2003 — one step as before: step 1.1" "$(step 1.1; out)" 'ожидалось `ok` · получено ok · совпало'
report "SC-AK-2003 — one step as before: marked" "$(marks)" 'x>.....'
step --done
report "SC-AK-2003 — one step as before: step --done prints its line and the count" "$(out | tr '\n' '|')" '1.1 ожидалось `ok` · получено ok · совпало|steps re-measured 1, matched 1|'

# --- no progress, another directory ---------------------------------------------------------
rm "$P" && rm -rf "$MARKS"
report "SC-AK-1998 — a progress that is not there is not written" "$(code_of 1; out | tail -1; ls "$F")" '1stage 1: measured 3, matched 3, left open 3
plan.md'
progress '>      '
report "SC-AK-2002 — a call from a directory below the root is refused" "$(cd "$R/state" && node "$ENGINE" step 1 2>&1 | grep -c 'is not from the root of the tree')" 1
progress 'x>     '

# --- a taken-apart folder -------------------------------------------------------------------
fixture_commit "$R" "docs/tasks/$B/progress.md" "$(cat "$P")" 'docs: progress'
git -C "$R" rm -r -q "docs/tasks/$B"
report "SC-AK-2002 — a taken-apart folder: removed and not committed, code 1" "$(code_of 1)" 1
report "SC-AK-2002 — a taken-apart folder: the refusal" "$(out | grep -c '^step: the task folder is taken apart')" 1
git -C "$R" -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false commit -q -m 'docs: apart'
report "SC-AK-2002 — a taken-apart folder: committed, code 1" "$(code_of 1)" 1
report "SC-AK-2002 — a taken-apart folder: it does not come back to the disk" "$(test -e "$F" && echo back || echo apart)" 'apart'
# Put back by another run: it stands on disk, and the head does not hold it.
mkdir -p "$F" && git -C "$R" show "HEAD~1:docs/tasks/$B/progress.md" > "$P"
before="$(cat "$P")"
report "SC-AK-2002 — a taken-apart folder: one standing on disk only is refused" "$(code_of 1; out | grep -c '^step: the task folder is taken apart')" '11'
report "SC-AK-2002 — a taken-apart folder: one standing on disk only is left as it was" "$([ "$before" = "$(cat "$P")" ] && echo same)" 'same'

suite_result "the stage measured by one call"
