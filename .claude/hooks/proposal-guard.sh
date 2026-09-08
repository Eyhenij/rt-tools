#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/proposal-guard.sh · 05cdc265e18b · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# Proposal guard: a turn in which the owner said to write or send a proposal to the rules layer
# does not end until the sending has happened. Stop.
#
# Why this way. What is written and not sent lies in the tree indistinguishable from what was
# sent: it has no record of its own in the rules layer, and the owner reads the work as done until
# they ask directly. Sending is inconvenient in exactly one place — it writes marks into the
# proposal files and makes the tree dirty — and with that argument the executor closes the
# silence of the rules.
#
# The request is caught by samples, not by understanding the meaning: the appraisal "the owner
# asked to send" would be assigned by whoever it hinders. The verb is mandatory: "go through the
# proposals" is work on what has already arrived, and it does not end with sending. The word
# "proposal" alone does not count either — it appears in every second turn about something else,
# and next to it a word about the rules layer or about the package is needed.
#
# Sending is a call of the package command without a dry run, made in the same turn: a dry run
# shows what would leave, creates nothing and leaves no trace outside.
#
# FAIL-OPEN: on any error, missing `jq`, missing turn transcript and a repeated pass, the turn is
# ALLOWED (exit 0). A broken guard has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=proposal-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated pass over the same turn is not judged: the guard has said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The proposals directory is the tree's own. Set to empty, it is the tree's opt-out from the
# requirement: a tree that does not take the portable rules layer gets no guard imposed on it. No
# directory on disk — the same: the tree does not use the mechanism, and the guard is not imposed
# on it. Judging by one variable alone would demand sending where there is nothing to send with
# and nowhere to send to.
root="${CLAUDE_PROJECT_DIR:-.}"
proposals_dir="${RT_PROPOSALS_DIR-.claude/rt-kit/proposals}"
[ -z "$proposals_dir" ] && exit 0
[ -d "$root/$proposals_dir" ] || exit 0

# The owner's request. The set is open and grows by editing: its completeness is an open question
# of the agreement, not a promise.
#
# Latin script is read on equal terms: a session the owner conducts in English differs from a
# Russian one by its words, and the requirement in it is the same. It gets no branch of its own —
# both pairs stand in one sample, otherwise one of them would be edited while the other is
# forgotten.
asked_re='(завед|напиш|отправ|пошл|зашл|отошл|выгруз|send|file|open|submit|raise|report)[а-яёa-z]*[^.!?]{0,40}(пропозал|предложени|proposal)|(пропозал|предложени|proposal)[а-яёa-z]*[^.!?]{0,40}(завед|напиш|отправ|пошл|зашл|отошл|выгруз|send|file|open|submit|raise|report)'

# The neighbour without which the word "proposal" does not count as a request about the rules
# layer.
context_re='пропозал|слою правил|слоя правил|слой правил|пакет|agent-kit|наверх|proposal|rule layer|upstream|package'

# A turn is everything recorded after the owner's last real input. A tool result arrives under
# the same role, so lines with `tool_result` are not counted as input.
#
# A compaction summary is not input either, although it arrives under the owner's role and is not
# a tool result. It retells turns that have already ended, and a request fulfilled yesterday reads
# in it as said now: a turn in which not a word was said about proposals was refused on a retelling
# of someone else's request — the proposals directory was empty at the time, and there was nothing
# to send at all. By its words the summary is indistinguishable from the owner's speech and richer
# than it, because it retells the whole session at once; it is recognised by a mark on the record,
# not by the text.
#
# A 400-line tail: the transcript grows all session long, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg asked "$asked_re" --arg ctx "$context_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    def text_of:
        (.message.content // []) | if type == "array"
            then ([.[] | select(.type == "text") | .text] | join("\n"))
            else (. // "") end;

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | (if $i == null then "" else ($turn[0] | text_of) end) as $said
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    # The sign is case-insensitive by a flag, not by lowercasing: lowercasing knows Latin script
    # only, and a capitalised "Send the Proposal" in Cyrillic would pass the sample set silently.
    | (($said | test($asked; "i")) and ($said | test($ctx; "i"))) as $wanted
    | ($uses | map(
          ((.name // "") | test("^Bash$"))
          and ((.input.command // "") | test("agent-kit[^|;&]*propose"))
          and ((.input.command // "") | test("--dry-run") | not)
      ) | any) as $sent
    | if $wanted and ($sent | not) then "owe" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "owe" ] || exit 0

# The sending command is named as the one that runs in this tree. A tree that installed the
# package as a dependency calls the binary from its dependencies; a tree where the package lives
# as sources has no binary at all — there the built bin is called. A command named at random
# costs the executor a turn: the refusal reads as an instruction, and a `npx agent-kit` call in
# such a tree answers with an installation refusal.
if [ -x "$root/node_modules/.bin/agent-kit" ]; then
    propose_cmd="npx agent-kit propose"
else
    built="$(ls "$root"/dist/*/bin/agent-kit.js 2>/dev/null | head -1)"
    if [ -n "$built" ]; then
        propose_cmd="node ${built#"$root"/} propose"
    else
        propose_cmd="npx agent-kit propose"
    fi
fi

reason="BLOCKED by proposal-guard: the owner said to create or send a proposal to the rules layer, and no sending happened in this turn. What is written and not sent lies in the tree indistinguishable from what was sent: it has no record of its own in the rules layer, and the owner reads the work as done until they ask outright.

A proposal is written as a file in \`$proposals_dir/\` and leaves in the same turn:

    $propose_cmd

A dry run is not a sending: it shows what would have left and leaves no trace outward. The sending writes marks into the proposal files and makes the tree dirty — with an open PR they land as a second commit in the same branch, and that is their place, not a reason to postpone.

The guard judges one turn: the next session is not refused."

# The shared deny tail: the two lawful moves. The file may not be laid out — then there is no
# tail, and the reason for the refusal stays the same.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"proposal-guard: the owner asked for a proposal — send it by the command of the package."}\n'

exit 0
