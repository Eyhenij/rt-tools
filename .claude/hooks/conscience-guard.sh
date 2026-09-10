#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/conscience-guard.sh · f1e71e6e05a1 · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: agents/conscience.md, hooks/roles.sh, hooks/deny-tail.sh
# Guard of conscience: a turn in which the conscience role found a repeat of an analysed miss does
# not end until the repeat has been dealt with or named to the owner.
#
# Why exactly so. An incident analysis explains the mechanism of a miss, but it is read only by
# whoever opens the directory himself. The miss that has to be recalled is exactly the one the
# executor does not remember at this minute, so calling the role is not left to his discretion: it
# would not happen where it is needed most.
#
# The role answers with its first line: «СОВЕСТЬ: повтор» or «СОВЕСТЬ: чисто». The guard judges the
# last answer of the turn and knows nothing about whether the finding is right: that is decided by
# the executor, and his decision is the work of the next turn, not the silence of this one.
#
# The turn is released when, after the finding, the executor did at least something about it:
# started an incident analysis, corrected the work or named the repeat to the owner. This is checked
# on the same turn.
#
# FAIL-OPEN: no `jq`, no turn record, the role stays silent or answers out of form — the turn is
# ALLOWED. A broken conscience has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=conscience-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A role switched off by the tree does not hold the guard: the list of the switched-off ones lies in
# the tree setting, and a helper next to it reads that list. An unreadable setting does not count as
# switching off — the guard works as before.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/roles.sh" ] && . "$rt_hooks_dir/roles.sh" 2>/dev/null
command -v rt_role_off >/dev/null 2>&1 && rt_role_off conscience && exit 0

active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The turn is everything recorded after the owner's last real remark. A tool answer arrives under
# the same role, so lines with `tool_result` do not count as a remark.
#
# The verdict of the role and the deed by the finding are read from different halves of the same
# record. The verdict is looked for only where the role can answer: a marker printed by a tool
# that reads and writes files, and a marker in the executor's own text, are not a verdict —
# otherwise reading a file with that line stands for the role having found a repeat. The deed is
# looked for over the whole record: the analysis is created by a command, and the word to the
# owner lies in the reply text.
found="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def textof:
        if type == "string" then .
        elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
        else tostring end;

    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn

    # Tools that read and write files: their answer is not a verdict of the role. The same set the
    # exam guard mutes — there the marker was forged by an echo, here it arrives by an honest
    # reading of an archive record that names the marker in its list.
    | ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
    | [ $turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null) | (.id // "") ] as $muted

    | [ $turn[] | {
          say: (if .type == "assistant" then ""
                elif .type == "user" then
                    ([ ((.message.content // []) | if type == "array" then .[] else empty end
                          | select(.type == "tool_result")
                          | select(((.tool_use_id // "") | if . == "" then null else . end) as $id
                                   | $id == null or ($muted | index($id)) == null)
                          | .content | textof),
                       (. as $rec
                        | if ($rec.toolUseResult // null) == null then ""
                          elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                                  | select(.type == "tool_result") | (.tool_use_id // "")]
                                | map(. as $id | $muted | index($id)) | any(. != null)) then ""
                          else ($rec.toolUseResult | textof) end)
                     ] | join("\n"))
                # Host records — the role completion notice and the attachment: the host chooses
                # their form, and they count whole.
                else tostring end),
          act: (if .type == "assistant"
                then ([(.message.content // [])[]
                        | if .type == "tool_use" then (.input.command // "") else (.text // "") end] | join("\n"))
                elif .type == "user"
                then ([(.message.content // []) | if type == "array" then .[] else empty end
                         | select(.type == "tool_result") | .content | textof] | join("\n"))
                else "" end)
      } ] as $flow

    | ($flow | map(.say | test("(СОВЕСТЬ|CONSCIENCE):[[:space:]]*(повтор|repeat)")) | index(true)) as $at
    | if $at == null then "no-finding"
      else (($flow[($at + 1):] | map(.act + "\n" + .say) | join("\n"))
            | if test("postmortems|разбор происшествия|analysis of the incident|(СОВЕСТЬ|CONSCIENCE): (разобрано|analysed)")
              then "analysed" else "standing" end)
           # The refusal names the finding, and it is taken from the very answer that was judged:
           # taken by a search over the record it would quote the file that was read.
           + "\n"
           + (($flow[$at].say | split("\n")) as $lines
              | ($lines | map(test("(СОВЕСТЬ|CONSCIENCE):[[:space:]]*(повтор|repeat)")) | index(true)) as $line
              | $lines[$line:($line + 4)] | join("\n"))
      end
' 2>/dev/null)"

verdict="$(printf '%s\n' "$found" | head -1)"
[ "$verdict" = "standing" ] || exit 0

detail="$(printf '%s\n' "$found" | tail -n +2)"

reason="BLOCKED by conscience-guard: the conscience found in this turn a repeat of a miss already analysed, and nothing was done about it.

${detail}

A turn does not end at the finding. Do one of three things in this same turn: fix the work, create an analysis of the incident if the mechanism is new, or name the repeat to the owner in words — what repeats and how it ended last time.

The finding is wrong — then say so to the owner: a false finding also costs a turn, and silence does not fix it.

The guard judges one turn: the next session is not refused."

# The shared deny tail: two lawful moves. The file may not be laid out — then there is no tail, and
# the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"conscience-guard: a repeat of an analysed miss is found — analyse it or name it to the owner."}\n'

exit 0
