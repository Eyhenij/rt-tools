#!/usr/bin/env bash
# rt-kit v0.33.1 · hooks/git-guard-delivery-pipeline.sh · 9b381930fb0d · правится надстройкой, не здесь
# A draft on a base the pipeline does not wake for, for the delivery guard. NOT a guard: it has no
# `rt-hook:` declaration and hooks into no agent event. The delivery guard sources it and calls
# `rt_delivery_pull_draft` with the command text on a PR opening.
#
# A draft waits for a run. Where no run comes it waits for nothing, and the owner sees a locked
# merge button and a PR that reads as unfinished: one such draft stood half an hour waiting for a
# check that would never start. The rule said so in words; nothing held it.
#
# The bases are read from the pipeline file the tree already named for the push gate, not from a
# list of their own: a second list drifts from the file the first day the trigger changes.
#
# FAIL-OPEN: no settings, no pipeline file, a trigger without a branch filter, a pipeline of another
# host — not judged. A wrong refusal here would forbid a lawful draft, and silence costs half an hour.

# The pipeline file the tree named. Printed empty where there is none.
rt_pipeline_file() {
    local settings="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/checks.json" file
    [ -f "$settings" ] || return 0
    file="$(jq -r '.pushGate.pipelineFile // empty' "$settings" 2>/dev/null)"
    [ -n "$file" ] && [ -f "${CLAUDE_PROJECT_DIR:-.}/$file" ] && printf '%s' "${CLAUDE_PROJECT_DIR:-.}/$file"
    return 0
}

# The branch patterns of the `pull_request` trigger, one per line. Prints nothing where the trigger
# has no such list: then the pipeline wakes for every base, or the file is of another host. Both the
# list form and the inline form are read; `branches-ignore` and `pull_request_target` are not.
rt_pipeline_pull_bases() {
    awk '
        function indent(line) { match(line, /^ */); return RLENGTH }
        function clean(word) {
            sub(/[[:space:]]*#.*$/, "", word)
            gsub(/^[[:space:]"\047]+|[[:space:]"\047]+$/, "", word)
            return word
        }
        !trigger {
            if ($0 ~ /^[[:space:]]*pull_request:[[:space:]]*(#.*)?$/) { trigger = 1; trigger_at = indent($0) }
            next
        }
        /^[[:space:]]*(#.*)?$/ { next }
        indent($0) <= trigger_at { exit }
        !list {
            if ($0 ~ /^[[:space:]]*branches:/) {
                line = $0
                sub(/^[[:space:]]*branches:[[:space:]]*/, "", line)
                if (line ~ /^\[/) {
                    gsub(/[][]/, "", line)
                    count = split(line, words, ",")
                    for (i = 1; i <= count; i++) if (clean(words[i]) != "") print clean(words[i])
                    exit
                }
                list = 1
                list_at = indent($0)
            }
            next
        }
        indent($0) <= list_at && $0 !~ /^[[:space:]]*-/ { exit }
        /^[[:space:]]*-/ { line = $0; sub(/^[[:space:]]*-[[:space:]]*/, "", line); print clean(line) }
    ' "$1" 2>/dev/null
}

# Quoted text is cut first: a title may mention the flag.
rt_pull_asks_draft() {
    printf '%s' "$1" | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g" \
        | grep -qE '(^|[[:space:]])(--draft(=true)?|-d)([[:space:]]|$)'
}

rt_delivery_pull_draft() {
    local command_text="$1" file bases base pattern
    rt_pull_asks_draft "$command_text" || return 0

    file="$(rt_pipeline_file)"
    [ -n "$file" ] || return 0
    bases="$(rt_pipeline_pull_bases "$file")"
    [ -n "$bases" ] || return 0

    # The base named by the command. Absent — the host takes the default branch.
    base=''
    if command -v perl >/dev/null 2>&1; then
        base="$(printf '%s' "$command_text" | perl -0ne '
            if (/(?:^|\s)(?:--base|-B)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
                print defined $1 ? $1 : (defined $2 ? $2 : $3);
            }
        ' 2>/dev/null)"
    fi
    base="${base:-${main_branch:-main}}"

    while IFS= read -r pattern; do
        [ -z "$pattern" ] && continue
        # shellcheck disable=SC2254
        case "$base" in
            $pattern) return 0 ;;
        esac
    done <<EOF
$bases
EOF

    fault "a draft into «${base}»: the pipeline «${file##*/}» wakes for a request only into $(printf '%s' "$bases" | tr '\n' ' ' | sed 's/ $//'), so no run will come and the draft will wait for nothing. Open the request ready, without --draft, and set the reviewer in the same call."
}
