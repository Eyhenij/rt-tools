#!/usr/bin/env bash
# The scenarios of the boolean-input check: what it refuses, what it lets through and what it says
# about a list entry that outlived the input it excused.
#
# Covers SC-UKV-136 of the agreement `docs/specs/ui-kit-v2/proposed/boolean-input-attribute`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the boolean-input check"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-boolean-inputs.mjs" "$WORK/tools/"

KIT="$WORK/projects/ui-kit-v2/src/lib/components/sample"
mkdir -p "$KIT"

# The component the check reads. The first argument is the whole declaration of its input — the
# fixture writes it out rather than assembling it, so that every scenario is readable on its own.
component_file() {
    printf 'import { Component } from "@angular/core";\n\n@Component({ selector: "rt-sample" })\nexport class RtSampleComponent {\n%s\n}\n' \
        "$1" > "$KIT/rt-sample.component.ts"
}

# The list of what is accepted; the argument is the body of the «accepted» key.
allowlist() {
    printf '{\n  "check": "check-boolean-inputs",\n  "what": "a fixture",\n  "accepted": {%s}\n}\n' "$1" \
        > "$WORK/tools/boolean-inputs-allowlist.json"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-boolean-inputs.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-boolean-inputs.mjs" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

allowlist ''

# --- the coerced input passes ---------------------------------------------------------------
component_file '    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });'
verdict "a boolean input with coercion passes" "green"

component_file '    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });'
verdict "a required one with coercion passes too" "green"

# --- SC-UKV-136: a declaration without coercion fells the check ------------------------------
component_file '    public readonly open: InputSignal<boolean> = input<boolean>(false);'
verdict "a boolean input without coercion is refused" "red"
says "and the refusal names the component and the input" 'rt-sample\.component\.ts:open'
says "and it names the way out" 'transform: booleanAttribute'

# A transform of one's own is no coercion: it would differ from the framework's on the value
# «false», and the difference would live where nobody looks for it.
component_file '    public readonly open: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: (value: unknown): boolean => value !== null,
    });'
verdict "a transform of one's own does not count as coercion" "red"

# --- an input boolean by declared type alone --------------------------------------------------
component_file '    public readonly pressed: InputSignal<boolean | null> = input<boolean | null>(null);'
verdict "boolean by type alone and not named is refused" "red"
says "and the refusal offers the list" 'accepted'

allowlist '
    "projects/ui-kit-v2/src/lib/components/sample/rt-sample.component.ts:pressed": {
      "reason": "a tri-state: the third value is not the same as falsehood",
      "task": "RT-2082"
    }
  '
verdict "named with a reason, it passes" "green"

# --- the list only shrinks --------------------------------------------------------------------
component_file '    public readonly pressed: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });'
verdict "an entry that outlived what it excused is refused" "red"
says "and the refusal asks for the line to be removed" 'remove the line'

# --- an entry without a reason ------------------------------------------------------------------
component_file '    public readonly pressed: InputSignal<boolean | null> = input<boolean | null>(null);'
allowlist '
    "projects/ui-kit-v2/src/lib/components/sample/rt-sample.component.ts:pressed": {
      "reason": "",
      "task": "RT-2082"
    }
  '
verdict "an entry with an empty reason is refused" "red"

# --- a nested generic in the second type argument -------------------------------------------------
allowlist ''
component_file '    public readonly open: InputSignalWithTransform<boolean, Coerce<string, number>> = input<boolean, Coerce<string, number>>(false, {
        transform: booleanAttribute,
    });'
verdict "a nested generic next to it does not shift the reading of the type" "green"

# --- what the check does not read -----------------------------------------------------------------
component_file '    public readonly size: InputSignal<number> = input<number>(1);'
verdict "an input that is not boolean is not judged" "green"

suite_result "the boolean-input check"
