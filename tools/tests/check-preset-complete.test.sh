#!/usr/bin/env bash
# The scenarios of the preset completeness check: what it demands a reason of, what it works the
# reason out for itself, and what tells a mark that still explains something from one that outlived
# what it explained.
#
# Covers SC-UKV-104 and SC-UKV-105 of the agreement `docs/specs/ui-kit-v2/proposed/material-preset`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the preset completeness check"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-preset-complete.mjs" "$WORK/tools/"

STYLES="$WORK/projects/ui-kit-v2/src/styles"
mkdir -p "$STYLES"

# The source the check reads: it takes only the two rows out of it, so the fixture declares exactly
# them. The first argument is the base set's rows, the second the preset's.
source_file() {
    printf 'export const light = [\n%s];\nexport const material = [\n%s];\n' "$1" "$2" \
        > "$STYLES/tokens.source.mjs"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-preset-complete.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-preset-complete.mjs" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

# --- the preset answers ---------------------------------------------------------------------
source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "an assignment the preset rewrites passes" "green"

# --- SC-UKV-104: silence without a reason ---------------------------------------------------
source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff` },
    { name: `--rt-color-text-primary`, value: `#111` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "an assignment the preset neither rewrites nor names is refused" "red"
says "and the refusal names it" '--rt-color-text-primary'
says "and it names both ways out" 'tokens\.material\.mjs.*presetShared|presetShared'

source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff` },
    { name: `--rt-color-text-primary`, value: `#111`, presetShared: `the ink of the page is one in both sets` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "the same assignment with a named reason passes" "green"

source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff` },
    { name: `--rt-color-text-primary`, value: `#111`, presetShared: `   ` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "an empty reason is no reason" "red"

# --- the reason is worked out where the value is a reference --------------------------------
source_file \
    '    { name: `--rt-color-action-primary`, value: `#00f` },
    { name: `--rt-color-action-primary-on-surface`, value: `var(--rt-color-action-primary)` },
' \
    '    { name: `--rt-color-action-primary`, value: `#080` },
'
verdict "an assignment following the preset through a reference needs no reason" "green"

source_file \
    '    { name: `--rt-color-action-primary`, value: `#00f` },
    { name: `--rt-color-link`, value: `var(--rt-color-action-primary)` },
    { name: `--rt-color-link-hover`, value: `var(--rt-color-link)` },
' \
    '    { name: `--rt-color-action-primary`, value: `#080` },
'
verdict "a chain of two links resolves the same as one" "green"

source_file \
    '    { name: `--rt-color-link`, value: `var(--rt-color-link-hover)` },
    { name: `--rt-color-link-hover`, value: `var(--rt-color-link)` },
' \
    ''
verdict "a ring of references is refused rather than walked forever" "red"

source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff` },
    { name: `--rt-color-text-primary`, value: `var(--rt-neutral-900)` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "a reference to a scale step is not a following: the preset does not rewrite it" "red"

# --- SC-UKV-105: a mark that outlived what it explained --------------------------------------
source_file \
    '    { name: `--rt-color-bg-page`, value: `#fff`, presetShared: `the page is one in both sets` },
' \
    '    { name: `--rt-color-bg-page`, value: `#eee` },
'
verdict "a reason at an assignment the preset rewrites is refused" "red"
says "and the refusal says the mark is to be removed" 'remove the field'

source_file \
    '    { name: `--rt-color-action-primary`, value: `#00f` },
    { name: `--rt-color-action-primary-on-surface`, value: `var(--rt-color-action-primary)`, presetShared: `one in both sets` },
' \
    '    { name: `--rt-color-action-primary`, value: `#080` },
'
verdict "a reason at an assignment that follows through a reference is refused" "red"
says "and the refusal names the reference itself" 'var\(--rt-color-action-primary\)'

# --- what is not judged ----------------------------------------------------------------------
source_file \
    '    { name: `--rt-space-md`, value: `1rem` },
    { name: `--rt-radius-control`, value: `10px` },
' \
    ''
verdict "an assignment outside colour is not asked for an answer" "green"

suite_result "the preset completeness check"
