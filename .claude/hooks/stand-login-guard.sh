#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/stand-login-guard.sh · 216cafb487b3 · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# Guard of signing in to the stand. The Stop event. It does not let a turn end in which the executor
# asks the owner to sign in to the stand or to type a password.
#
# Why. The stand, the sign-in and the accounts for checking are prepared by the agent. That demand
# rested only on the executor's memory and did not hold: in one session the request "sign in
# yourself" or "type the password" sounded four times in a row, each time with a new reason — the
# field does not take input, a foreign extension is installed in the browser, the profile switched
# off. The reason is real, so the request looks fitting; but the obstacle must be removed by the
# agent all the same.
#
# The guard stands at the end of the turn, not at a tool call: the request is written as the text of
# the reply, and until the turn ends it is not visible.
#
# The boundary. The guard checks a set of patterns: a verb of asking next to a word about a
# password, a sign-in or a form. A request in other words, or through a menu of options, the guard
# does not recognise. The set grows by an edit; its completeness is not guaranteed.
#
# What is allowed: asking to switch to the ordinary mode of work instead of the automatic one. The
# typing is done by the agent, only the mode is asked of the owner — the guard tells these requests
# apart.
#
# On an error the guard passes: on a failure, a missing turn record and a repeated call the turn is
# ALLOWED. A broken guard must not block the conversation.
#
# FAIL-OPEN: no input, no jq, an already active turn — the turn ends as it did. A guard of the end
# of a turn that refuses on doubt leaves the session with no lawful end at all.

# The guard's name for the observations: it is written by the shared deny tail.
RT_GUARD_NAME=stand-login-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated call on the same turn is not judged: the guard says its refusal once.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The patterns of the request. The first group is a request to type instead of the agent, the
# second a request to sign in oneself. A word about the mode of work is not in the set: asking for
# it is allowed.
asked_re='(введи|введите|набери|наберите|вбей|вбейте|заполни|заполните|подставь|вставь)[^.!?\n]{0,40}(пароль|учётн|учетн|логин|креды|форму входа)'
asked_re="$asked_re"'|(войди|войдите|залогинься|залогиньтесь|авторизуйся|авторизуйтесь)[^.!?\n]{0,40}(сам|сами|рукой|руками|за меня|вместо меня|пожалуйста)?'
asked_re="$asked_re"'|(нужно|надо|прошу)[^.!?\n]{0,20}(чтобы ты|чтобы вы)?[^.!?\n]{0,20}(ввёл|ввел|ввели|вошёл|вошел|вошли)[^.!?\n]{0,30}(пароль|вход|систему)'

# The turn is everything recorded after the owner's last real input. A tool answer arrives under the
# same role, so lines with `tool_result` do not count as input.
#
# The last 400 lines are read: the record grows all session long, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg re "$asked_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then . else .[$i + 1:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "text") | .text] as $texts
    # Case is ignored by a flag, not by lowercasing: lowercasing works only for the Latin alphabet,
    # and a request written with a capital letter would not match the pattern.
    | if (($texts | join("\n")) | test($re; "i")) then "asked" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "asked" ] || exit 0

reason="BLOCKED by stand-login-guard: the executor asks the owner to sign in or to enter a password. The stand, the sign-in and the accounts for checking are prepared by the agent. An obstacle before the asking — a field that does not accept input, a foreign extension in the browser, a profile that dropped out — is removed by the agent.

How to remove the obstacle by yourself:

    substitute the value by the form tool through a reference to the element
    switch off the interfering extension in the browser profile
    raise the stand on another address
    sign in with a pair from the seed of the local database instead of a production account

What is asked of the owner is the mode of work, not input: the ordinary mode instead of the automatic one; the sign-in in it is done by the agent, and the automatic mode is returned by the same turn.

The guard checks one turn: the next session is not blocked."

# The shared deny tail: two lawful moves. The file may not be laid out — then there is no tail, and
# the reason for the refusal stays.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"stand-login-guard: the sign-in to the stand is done by the agent, not by the owner."}\n'

exit 0
