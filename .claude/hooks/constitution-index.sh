#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/constitution-index.sh · 1a32eeb6877b · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# Entry into the laws layer. SessionStart.
#
# A law file by itself brings nothing into the context — it is read only when someone went for it.
# The hook prints an index (file name and its title) once per session: the layer is known to exist,
# and it is opened when a decision touches it.
#
# The index is READ FROM THE DIRECTORY, not written out by hand: a hand-written one would drift from
# what is actually laid out, and there would be nothing to say so with.
#
# FAIL-OPEN: any error starts the session without the added context (exit 0). A broken entry has no
# right to stop the session.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

dir="${CLAUDE_PROJECT_DIR:-.}/docs/constitution"
[ -d "$dir" ] || exit 0

index=""
for law in "$dir"/*.md; do
    [ -f "$law" ] || continue
    title="$(grep -m1 '^# ' "$law" 2>/dev/null | sed 's/^# //')"
    [ -z "$title" ] && continue
    index="${index}  docs/constitution/$(basename "$law") — ${title}"$'\n'
done
[ -z "$index" ] && exit 0

read -r -d '' context <<EOF
PROJECT LAWS (the @rt-tools/agent-kit layer, laid out in docs/constitution/).

A law says WHAT must be true and knows neither paths nor file names. A rule — by which
technique it is done — lives in .claude/skills/, and the names of this tree next to it are in
implementation.md alongside. A law does not cancel a rule and is not replaced by it: before a
decision the law touches, the law is read in full, the rule as usual.

${index}
Laid-out files are edited not by hand but through the override in .claude/rt-kit/overrides/<resource>:
an in-place edit is lost on the next \`agent-kit sync\`, and sync refuses it. Check the laid-out
files against the package: \`agent-kit sync --check\`.
EOF

jq -n --arg c "$context" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}' 2>/dev/null || exit 0

exit 0
