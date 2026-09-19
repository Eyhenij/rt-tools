#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/postmortem-guard.sh · b30cd2330f92 · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# Incident guard: a turn in which the executor admitted a miss does not end while there is no
# incident record. Stop.
#
# Why exactly so. An incident — a session in which the executor did the wrong thing and the rules
# layer did not refuse it — leaves no code behind that could be fixed. Such a session ends with an
# apology in the chat: the next day the mechanism of the miss is retold already smoothed over,
# conclusions remain, and no rule follows from conclusions. An analysis happened only when the
# owner demanded it out loud.
#
# The admission is caught by patterns, not by understanding the meaning: the verdict "that was a
# miss" would be given by the one it inconveniences, and the threshold would drift. The pattern
# set is visible, is extended by an edit and misses noticeably — a session that admitted a miss
# in words outside the set is passed by the guard, and this is said out loud in the agreement
# rather than counted as closed.
#
# It is caught at the end of the turn, not on sending the reply: by the moment of the admission
# the miss has already happened, and there is nothing to catch earlier. This sets it apart from
# the conversation guard, which has a tool of its own — a question to the owner.
#
# FAIL-OPEN: on any error, with no turn record and on a repeat pass the turn is ALLOWED (exit 0).
# A broken guard has no right to jam the conversation.

# Own name in the observations: the refusal is written by the shared refusal tail, not by the
# guard itself.
RT_GUARD_NAME=postmortem-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeat pass over the same turn is not judged: the guard has said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-.}"

# The records directory is the tree's own, and the tree settings name it — by the same key the
# cargo dispatch reads it with. One name for both sides: a tree that moved the directory out of
# history would otherwise get a guard looking for records at the old address — and it would stay
# silent forever. The variable remains a bypass for one launch, and an empty string in either of
# the two is the tree's refusal of the demand: a tree that keeps no records is not forced to.
if [ -n "${RT_POSTMORTEMS_DIR+set}" ]; then
    notes_dir="$RT_POSTMORTEMS_DIR"
elif [ -f "$root/.claude/rt-kit.json" ]; then
    notes_dir="$(jq -r '.postmortems // "docs/postmortems"' "$root/.claude/rt-kit.json" 2>/dev/null)"
else
    notes_dir="docs/postmortems"
fi
[ -z "$notes_dir" ] && exit 0
[ -d "$root/$notes_dir" ] || exit 0

# Patterns of admitting a miss. The set is open and is extended by an edit: its completeness is
# an open question of the agreement, not a promise.
admitted_re='был неправ|был не прав|ошибс|моя ошибк|мой промах|промахнул|проглядел|не проверил|соврал|виноват|извин|прошу прощения|неверно утверждал|утверждение было ложн|принял на веру'

# The turn is everything recorded after the owner's last real input. A tool result arrives under
# the same role, so lines with `tool_result` do not count as input.
#
# A tail of 400 lines: the turn record grows all session long, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg re "$admitted_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then . else .[$i + 1:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "text") | .text] as $texts
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    # The sign is case-insensitive by a flag, not by lowercasing: lowercasing knows only Latin
    # letters, and a capitalised "Был неправ" would slip past the pattern set silently.
    | (($texts | join("\n")) | test($re; "i")) as $admitted
    | ($uses | map(
          ((.name // "") | test("^(Write|Edit|MultiEdit)$"))
          and ((.input.file_path // "") | test("postmortem"))
      ) | any) as $wrote
    | if $admitted and ($wrote | not) then "admit" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "admit" ] || exit 0

# A record made during this session lifts the demand even without an edit in this same turn: the
# analysis may have landed as a file a turn earlier — the one in which the miss was admitted.
if [ -n "$(find "$root/$notes_dir" -name '*.md' -newermt '-1 day' 2>/dev/null | head -1)" ]; then
    exit 0
fi

reason="BLOCKED by postmortem-guard: a miss is admitted in the reply, and there is no record of the incident in \`$notes_dir/\` for today. An incident — a session in which the executor did the wrong thing and the rules layer did not refuse it — is written down in that same session: by the next day the mechanism of the miss is retold already smoothed over, and no rule comes out of it.

The record names: the mechanism of the miss step by step, what was available before it, what caught it and what of this went into the rules layer. Without the last line it is a complaint, not an analysis.

    $notes_dir/<year>-<month>-<day>-<short name>.md

The guard judges one turn: the next session is not refused."

# The shared refusal tail: two lawful moves. The file may not be laid out — then there is no
# tail, and the reason for the refusal stays as it was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"postmortem-guard: a miss is admitted — write the analysis of the incident."}\n'

exit 0
