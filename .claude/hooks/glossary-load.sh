#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/glossary-load.sh · 6b9014a7042e · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# SessionStart: the project glossary goes into the context in full, on every session start.
#
# Memory does not hold this: the glossary is read before a text is written, while the conversation
# with the owner goes on without reading — and a word from the left column of "Not written here"
# surfaces in a reply, though the files no longer have it. Here the glossary arrives before the
# first message and applies to texts and replies alike.
#
# FAIL-OPEN: no file or no `jq` — leave silently. The session matters more than the glossary.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

GLOSSARY="${CLAUDE_PROJECT_DIR:-.}/docs/GLOSSARY.md"
[ -f "$GLOSSARY" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Where a word is introduced. The glossary may be laid out by the package — then an edit in its
# place is lost on the next layout, and until then the layout refuses the whole file. The preamble
# that every session reads must point to the override: it is the only text about the glossary that
# is guaranteed to reach the reader, and by pointing to the assembled file it would cancel
# everything said on the other layers. The correction stands one line lower, in the layout header,
# but reads as a service line of the build: it begins with a version and a digest, not with a word.
#
# The address is derived from the resource id in the header itself, not hard-coded: each tree has
# its own override directory, and a hard-coded path would lie in the first tree that keeps them
# differently. No header — the glossary belongs to the tree as a whole, and "introduced right here"
# is true as it is.
header="$(head -1 "$GLOSSARY" 2>/dev/null)"
resource="$(printf '%s' "$header" | sed -n 's/.*rt-kit v[^ ]* · \([^ ]*\) · .*/\1/p')"

if [ -n "$resource" ]; then
    where="$(printf 'The glossary is laid out by the package and is not edited in place: a new word goes to the override\n.claude/rt-kit/overrides/%s — it merges by `## ` section and survives the layout.\n' "$resource")"
else
    where='The glossary belongs to the tree as a whole: a new word is added right here, by the same edit.
'
fi

{
    printf 'PROJECT GLOSSARY — `docs/GLOSSARY.md`, in full below.\n\n'
    printf 'A word from here is used in the meaning given here: in files and in replies to the owner alike.\n'
    printf 'The "Not written here" section works the same way: its left column is neither written nor said anywhere.\n'
    printf 'A word that is not here does not exist for the reader either: it is introduced by the same change\n'
    printf 'that first uses it, or replaced with a word that already exists.\n'
    printf '%s\n' "$where"
    cat "$GLOSSARY"
} | jq -Rs '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}'
