#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/skill-gate-layers.sh · d1365dcac1f2 · правится надстройкой, не здесь
# Layers of the rules gate: requirements that come ON TOP of the domain one.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The rules gate
# sources it: the layers over the domain rule are a dozen and a half, and together they do not fit
# into a map read whole.
#
# The domain rule is chosen once by the file path — an edit has one subject, and there is one
# rule for it. There are a dozen and a half layers on top of it: access to the runtime is visible
# only in the text of the edit, observability comes together with the domain rather than instead
# of it, prose and work conduct judge the same file by a second sign. Together they do not fit
# into the gate map, which is read whole — so they live here.
#
# Sourced from `skill-gate.sh` in its own shell: it reads `$input`, `$target` and `$req` and
# appends rule names to `$req`. As a separate process the layers would return the same thing
# through the disk.
#
# FAIL-OPEN: nothing to parse the input with — the layer is silent. Parsing the input is side
# work here, and its breakage has no right to stop the edit.
#
# The layers do not know the tree's addresses: where its backend, showcase and end-to-end tests
# are is said by the tree itself — by the function `skill_layer_skip <rule> <target>` in its gate
# map. Without it a layer acts everywhere its sign matched.

# What is already named is not required a second time: a refusal listing one rule twice reads as
# two different requirements.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

# A built tree is never code: the path to an artifact arrives from the command that runs it. The
# gate map already lets such a path through, and the layers must stay silent along with it —
# otherwise leaving the map lifts one requirement and leaves a dozen and a half others.
case "$target" in
    */node_modules/* | */dist/* | */build/* | */.nx/* | */coverage/*) return 0 ;;
esac

rt_layer_add() {
    case " $req " in
        *" $1 "*) return 0 ;;
    esac
    req="${req:+$req }$1"
}

# The tree may lift a layer from a place where the sign is lawful: a direct call to the runtime
# on the backend, reading the environment in the harness, creating a file in end-to-end tests.
rt_layer_allowed() {
    command -v skill_layer_skip >/dev/null 2>&1 || return 0
    skill_layer_skip "$1" "$2" && return 1
    return 0
}

# The edit text is read once for all layers: parsing the input costs more than the signs
# themselves.
rt_layer_payload=""
if command -v jq >/dev/null 2>&1; then
    rt_layer_payload="$(printf '%s' "$input" \
        | jq -r '[.tool_input.content, .tool_input.text, .tool_input.new_string, (.tool_input.edits[]?.new_string)]
                 | map(select(. != null)) | join("\n")' 2>/dev/null)"
fi

# A spec checks behaviour rather than creating it: `testing` is needed there, and the behaviour
# layers skip it.
rt_layer_is_spec=1
case "$target" in *.spec.ts) rt_layer_is_spec=0 ;; esac

# --- layer by text: a call to the runtime -----------------------------------------------------
#
# The path says WHAT file it is, while a call to the global object is visible only in the
# content: a gate that knows the path alone lets it through silently. A value obtained by
# injection does not count as a sign — that is already a dependency, not a direct call.
if [ -n "$rt_layer_payload" ] && [ "$rt_layer_is_spec" = 1 ]; then
    case "$target" in
        */main.ts|*/main.server.ts|*/server.ts|*/index.html) ;;
        *.ts|*.html)
            if printf '%s' "$rt_layer_payload" | grep -qE \
                'globalThis|PLATFORM_ID|isPlatformBrowser|defaultView|(^|[^[:alnum:]_.#$])window[[:space:]]*\.'; then
                rt_layer_allowed platform-access "$target" && rt_layer_add platform-access
            fi
            ;;
    esac
fi

# --- layer by text: observability -------------------------------------------------------------
#
# Reading an environment variable is exactly the moment a new optional capability is created.
# The startup digest lists them by hand, and one that forgot to add itself will not land in any
# of the three lists — on production it looks not switched off but non-existent.
if [ -n "$rt_layer_payload" ] && [ "$rt_layer_is_spec" = 1 ]; then
    case "$target" in
        *.ts)
            if printf '%s' "$rt_layer_payload" | grep -qE 'process\.env'; then
                rt_layer_allowed observability "$target" && rt_layer_add observability
            fi
            ;;
    esac
fi

# --- layer by text: shared code ---------------------------------------------------------------
#
# A newly created numeric setting and a newly created enumeration are the moment a copy appears
# next to what is already shared. Each copy is sound on its own, and neither the linter nor the
# build sees the second one. Specs do not count: values there are local, they are fixtures.
if [ -n "$rt_layer_payload" ] && [ "$rt_layer_is_spec" = 1 ]; then
    case "$target" in
        *.ts)
            if printf '%s' "$rt_layer_payload" | grep -qE \
                '(^|[[:space:]])(export[[:space:]]+)?const[[:space:]]+[A-Z][A-Z0-9_]*[[:space:]]*(:[[:space:]]*number[[:space:]]*)?=[[:space:]]*[0-9]|(^|[[:space:]])export[[:space:]]+enum[[:space:]]'; then
                rt_layer_allowed shared-code "$target" && rt_layer_add shared-code
            fi
            ;;
    esac
fi

# --- layer by path: Angular classes -----------------------------------------------------------
#
# A component and a store are classes too: the signal input API, change detection and where a
# subscription lives are in `angular-patterns`, while as the first layer these files go to the
# component structure and to the language conventions, where none of that is.
if [ "$rt_layer_is_spec" = 1 ]; then
    case "$target" in
        *.component.ts|*.store.ts)
            rt_layer_allowed angular-patterns "$target" && rt_layer_add angular-patterns
            ;;
    esac
fi

# --- layer by path: prose ---------------------------------------------------------------------
#
# The spec format is held by `spec-driven`, and how to word things by `doc-style`, and it is
# needed not only by specs. A check's known list is the same prose: its field explains why what
# is listed does not count as a refusal, and the text audit reads only `.md`.
#
# The agent's own housekeeping the layer skips: the rule for it is itself, and the gate map
# decides about these files whole. A layer laid on top would demand a rule where the map left it
# unnamed on purpose.
case "$target" in
    */.claude/*) ;;
    *.md|*-allowlist.json) rt_layer_allowed doc-style "$target" && rt_layer_add doc-style ;;
esac

# --- layer by path: work conduct --------------------------------------------------------------
#
# The task folder, the product agreement before the code and the epic plan are the first files
# created in work. The requirement catches on them whoever went past the order: "a new task has
# arrived" is not a tool, and there is nothing else to catch it with.
case "$target" in
    */docs/tasks/*|*/docs/specs/*/proposed/*|*/docs/plans/*)
        rt_layer_allowed task-flow "$target" && rt_layer_add task-flow
        ;;
esac

# --- layer by file creation -------------------------------------------------------------------
#
# Nothing is written from scratch, and this is asked where the decision is made — at the
# creation of a new file: an edit of an existing one has its foundation already chosen, and
# demanding the rule on every line would turn it into background.
case "$target" in
    */docs/*) ;;
    *.spec.ts|*.stories.ts) ;;
    *.ts|*.html|*.scss)
        [ -f "$target" ] || { rt_layer_allowed reuse-first "$target" && rt_layer_add reuse-first; }
        ;;
esac

# Where a newly created check goes and what shape its known list has are statements of
# `testing`, and they are needed exactly at the moment of creation: an existing check has both
# its place in the gate and the shape of its list already chosen.
case "$target" in
    */check-*.mjs|*-allowlist.json)
        [ -f "$target" ] || { rt_layer_allowed testing "$target" && rt_layer_add testing; }
        ;;
esac
