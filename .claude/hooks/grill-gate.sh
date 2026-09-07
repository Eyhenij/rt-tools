#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/grill-gate.sh · 89092beafc10 · правится надстройкой, не здесь
# Requires: hooks/deny-tail.sh
# rt-hook: Stop
# The conversation guard: the owner is not asked a question until the laws and rules have been read
# within the same turn. It judges two events, and that is not duplication; the second is declared
# by the neighbouring resource `hooks/grill-gate-ask.sh`, which hands the call over here.
#
# Why exactly this way. The requirement "the rules are read before the conversation" is enforceable
# right up to the moment the question is sent. A check at the turn end refuses after the fact: by
# the time of the refusal the question is already with the owner, and the owner sees it together
# with the refused turn — the requirement fires, but it does not save the work. So a turn with a
# question is judged on the question tool, before sending.
#
# This one interception does not close the hole: a question is more often asked in prose, and that
# is exactly how the one that brought this guard about was asked. A prose question is not a tool,
# and it can be caught only at the turn end — the event gets the path to the turn record and sees
# the turn whole. Hence two events: the menu is caught before sending, prose after. They are
# declared by different resources so that a tree whose question tool is already taken by a guard of
# its own can take one half instead of dropping the requirement whole.
#
# Reading the rules counts as any of three paths: loading a rule, reading a file of the laws or the
# rules, searching through them. To demand loading exactly would drive the executor to it where one
# search was enough — the guard would hinder the work instead of straightening it.
#
# But reading anything at all from the rules layer does not close the question: an incident
# analysis someone else read and a search over the catalog counted on a par with the rule this work
# actually needs — and the answer to the question put to the owner lay exactly in that rule. So,
# when the area of this turn's work is known, only the rule of that area counts as reading. The
# area is taken from where the rules gate takes it: from the paths edited in the turn.
#
# FAIL-OPEN here too: there are no edits in the turn, there is no gate map, the area did not come
# out — any reading counts, as before.
#
# FAIL-OPEN: on any error, with no turn record and on a repeat pass the turn is ALLOWED (exit 0).
# A broken guard has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=grill-gate

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Which event arrived. A tool call has its name, the turn end does not.
tool="$(rt_hook_tool)"

# A repeat pass over the same turn is not judged: otherwise the turn would never end — the guard
# said its piece once and lets go. This does not apply to a tool call: there the call itself is
# judged.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ -z "$tool" ] && [ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The tree profile: the directories of laws, rules and specs differ from tree to tree, and they are
# needed both for the sign of reading and for the hint in the refusal.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Substitution without a colon is deliberate: set to empty means the tree drops the requirement,
# and that must not be replaced by a default. The default goes only to the one who did not set the
# variable at all.
laws_dir="${RT_LAWS_DIR-docs/constitution}"
rules_dir="${RT_RULES_DIR-.claude/skills}"
specs_dir="${RT_SPECS_DIR-docs/specs}"
# The plan of an epic and the archive are read on a par with the laws: the decision that ties the
# tasks of an epic together lies exactly there. Whoever had read the plan was refused on a par with
# whoever had read nothing, and that refusal was lifted by a search over three directories among
# which the needed one was not.
plans_dir="${RT_PLANS_DIR-docs/plans}"
archive_dir="${RT_ARCHIVE_DIR-docs/archive}"

# A tree that has neither laws nor rules gets no requirement: there is nothing to read.
[ -z "$laws_dir" ] && [ -z "$rules_dir" ] && exit 0

# The gate map: by it the rule name is got from the edit path. There is none — the area does not
# come out, and everything stays as before.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for map in "$rt_hooks_dir/../rt-kit/defaults/gate-map.sh" "$rt_hooks_dir/../defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/gate-map.sh"; do
    # shellcheck disable=SC1090
    [ -f "$map" ] && . "$map" 2>/dev/null
done

# The pattern by which a tool call counts as reading the rules. The directories go into it as they
# are: the dot in `.claude` matches any character and brings nothing extra here.
read_re="$(printf '%s' "$laws_dir|$rules_dir|$specs_dir|$plans_dir|$archive_dir" | sed 's/^|*//; s/|*$//; s/||*/|/g')"
[ -z "$read_re" ] && exit 0

# The area of this turn's work: the rules the gate demands of the paths edited in the turn. The
# paths are got by the same parse of the turn as below — by a call of its own, so that the reading
# pattern is ready for the main parse.
need_re=''
if command -v skill_for >/dev/null 2>&1 && [ -n "$rules_dir" ]; then
    edited="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
        def is_input:
            .type == "user"
            and ((.isCompactSummary // false) | not)
            and (((.message.content // []) | if type == "array"
                    then ([.[] | select(.type == "tool_result")] | length)
                    else 0 end) == 0);
        (map(is_input) | rindex(true)) as $i
        | (if $i == null then . else .[$i + 1:] end)
        | [.[] | select(.type == "assistant") | (.message.content // [])[]
            | select(.type == "tool_use") | select(.name == "Edit" or .name == "Write" or .name == "NotebookEdit")
            | (.input.file_path // .input.notebook_path // "")]
        | map(select(. != "")) | unique | .[]
    ' 2>/dev/null)"
    for path in $edited; do
        for rule in $(skill_for edit "$path" '' 2>/dev/null); do
            case "|$need_re|" in
                *"|$rule|"*) ;;
                *) need_re="${need_re}${need_re:+|}${rule}" ;;
            esac
        done
    done
fi

# A turn is everything recorded after the last real input from the owner. A tool answer comes in
# under the same `user` role, so lines with `tool_result` do not count as input: otherwise the turn
# would be the piece after the last tool call, and reading the rules at its start would be lost.
#
# A tail of 400 lines: the turn record grows all session, and only the last turn is judged.
# On the tool call event the question is already known — it is the call; only whether the rules
# were read within this turn is judged. At the turn end the question is looked for in the text of
# the replies: the menu has by then already been refused earlier.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg re "$read_re" --arg tool "$tool" --arg need "$need_re" --arg rules "$rules_dir" '
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
    | (if $need == "" then
          $uses | map(
              (.name == "Skill")
              or ((.name // "") | test("^(Read|Grep|Glob)$")) and ((.input | tostring) | test($re))
              or ((.name == "Bash") and ((.input.command // "") | test($re)))
          ) | any
      else
          # The area of the work is known — only the rule of that area counts: an incident
          # analysis someone else read does not answer the question that was asked.
          ($need | split("|")) as $rules_needed
          | $uses | map(
              ((.name == "Skill") and (((.input.skill // "") | tostring) as $s | $rules_needed | index($s) != null))
              or (((.name // "") | test("^(Read|Grep|Glob|Bash)$"))
                  and ((.input | tostring) as $text
                       | $rules_needed | map(. as $rule | $text | test($rules + "/" + $rule + "(/|\\b)")) | any))
          ) | any
      end) as $read
    | (($texts | join("\n")) | test("\\?[[:space:]]*$"; "m")) as $asked_prose
    | ($tool != "") as $asking_now
    | if ($asked_prose or $asking_now) and ($read | not) then "ask" else "pass" end
' 2>/dev/null)"

# The second sign of the same guard: the owner has already answered this question.
#
# The first sign judges whether the rules were read, and stays silent on work that is allowed. But
# the miss can be another one: the owner gave an instruction in a direct reply, the executor found
# a fact that changes the price of the instruction but not its meaning — and instead of a line
# about the price asked a menu where two options out of three offered to cancel the owner's
# decision. The work stopped until an answer, having been allowed a minute earlier.
#
# What is judged is the overlap of words: the question going out now against the owner's last reply
# — and only where the record already holds a call of the question tool, that is, the owner has
# answered a question. There is no understanding of the text here and none is needed: three shared
# significant words mean the same subject, while a grill of six questions runs over different
# subjects and does not reach the threshold.
#
# FAIL-OPEN: no question in the call, no reply from the owner, no earlier question — the sign stays
# silent.
if [ -n "$tool" ]; then
    asked_json="$(printf '%s' "$input" | jq -r '(.tool_input.questions // []) | tostring' 2>/dev/null)"
    seen="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg now "$asked_json" '
        def is_input:
            .type == "user"
            and ((.isCompactSummary // false) | not)
            and (((.message.content // []) | if type == "array"
                    then ([.[] | select(.type == "tool_result")] | length)
                    else 0 end) == 0);

        def words: [splits("[^\\p{L}\\p{N}]+")] | map(select(length >= 5)) | unique;

        (map(is_input) | rindex(true)) as $i
        | if $i == null then "no" else
            (.[$i] | (.message.content // []) | if type == "array"
                then ([.[] | select(.type == "text") | .text] | join(" "))
                else (. // "") end) as $said
            | ([.[:$i][] | select(.type == "assistant") | (.message.content // [])[]
                 | select(.type == "tool_use") | select(.name == "AskUserQuestion")] | length) as $before
            | if $before == 0 or ($said | length) == 0 then "no" else
                (($now | words) - (($now | words) - ($said | words))) as $common
                | if ($common | length) >= 3 then "answered" else "no" end
              end
          end
    ' 2>/dev/null)"

    if [ "$seen" = "answered" ]; then
        reason="BLOCKED by grill-gate: the owner has already answered this question in this conversation — go on with the work instead of asking again.

An instruction of the owner holds until they cancel it. A new fact against a standing instruction is a line in the reply about the price, not a new question: what is asked again is only what the instruction does not cover. The miss here is not in the form of the question but in stopping work that is already allowed.

The question really is about another matter — then name in it what the former answer of the owner lacks: the sign judges the shared words of the question and of the last message of the owner, not the meaning."

        # The shared deny tail: the two lawful moves and the lawful form of bypass, if the
        # refusal has one.
        # shellcheck disable=SC1090
        [ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
        command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
        deny_tail_text="$(rt_deny_tail "")"
        [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

        jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
            || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"grill-gate: this question has already been answered."}}\n'
        exit 0
    fi
fi

[ "$verdict" = "ask" ] || exit 0

if [ -n "$tool" ]; then
    head="BLOCKED by grill-gate: the question to the owner has not left yet, and this is the only moment when the requirement can be met."
else
    head="BLOCKED by grill-gate: the reply carries a question to the owner, and the laws and rules were not read in this turn."
fi

reason="$head A question whose answer is already written down is not asked of the owner — the rule of work conduct. Run a search by the words of the subject and answer from what is found; ask only what the documents do not cover:

    grep -rn -i \"<a word of the subject>\" $laws_dir $rules_dir $specs_dir $plans_dir $archive_dir

The guard judges one turn: the next session is not refused."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

# The form of the refusal differs between the two events: a tool call is refused by a decision
# about access, and the turn end by a decision about the turn. One form for both events silently
# does not fire.
if [ -n "$tool" ]; then
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"grill-gate: read the laws and rules on the subject before asking the owner."}}\n'
else
    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"grill-gate: read the laws and rules on the subject before asking the owner."}\n'
fi

exit 0
