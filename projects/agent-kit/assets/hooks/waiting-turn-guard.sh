#!/usr/bin/env bash
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# Waiting guard: a turn that tells the owner about someone else's step does not end until it holds
# at least one action on the next task. Stop.
#
# Why this way. The article "waiting for a run is not what work is spent on" is held by the
# executor's memory, and held badly: the sample message to the owner ends with a phrase about the
# next task, and the phrase is carried out as a promise — the session says it and ends the turn. A
# turn in which nothing was done gives itself away by nothing: no file edit, no command — and the
# miss is seen only by the owner, only by the work not moving, and only when they ask directly.
#
# Someone else's step is known by two signs, and both are taken from the turn, not from the
# network. The first is a PR opened: the work is handed in, and from there the owner moves it. The
# second is a red run read: it has to be fixed, but a turn that read it and did nothing is the same
# emptiness. Reading the run is not a sign by itself: the end of a run is also read to go and fix
# it; the sign is a red answer, and it lies in the command output — in the same turn record.
#
# Asking the hosting would be more precise, but a network call at the end of a turn fails together
# with the connection and would refuse the work instead of the miss.
#
# What counts as an action: creating a task, creating a branch, moving the task to the work column,
# creating the task folder. Moving to the review column and removing the folder are not in it —
# those are steps of closing the previous work, not the start of the next. The set is open and
# grows by edits — its completeness is an open question, not a promise.
#
# What the guard does not judge. A turn that says nothing about someone else's step — here it stays
# silent: an empty turn cannot be told from a turn that had nothing to do. This is its known
# boundary. A green run it does not judge either: after it comes work of one's own — cleanup and
# lifting the draft — not someone else's step.
#
# FAIL-OPEN: on any error, missing `jq`, missing turn record or a repeated call on the same turn
# the turn is ALLOWED (exit 0). A broken guard has no right to jam the conversation.

# Its own name in observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=waiting-turn-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated call on the same turn is not judged: the guard said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Opening a PR differs per hosting, and the guard moves between them whole: the set names all
# three forms, not the one this tree uses. Editing the PR body is not in it — it opens nothing.
opened_re='gh[^|;&]*pr[[:space:]]+create|api[^|;&]*-X[[:space:]]+POST[^|;&]*/pulls|glab[^|;&]*mr[[:space:]]+create|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+create'

# Reading a run is the second case of someone else's step. By itself it means nothing: the end of
# a run is also read to go and fix it. The sign is a red answer, and it lies not in the command
# but in its output — in the same turn record, and no network is needed for that.
read_re='run[[:space:]]+(list|view|watch)|pipelines[[:space:]]+runs'
red_re='completed[[:space:]]+failure|"conclusion"[[:space:]]*:[[:space:]]*"failure"|conclusion:[[:space:]]*failure|completed with .failure.|run[[:space:]]+failed'

# The first action on the next task. Listed is what taking a task CAN BE, not what counts as an
# action: the list of work-closing steps is open and grows, while the list of actions on the next
# task is closed — a list of "what it can be" has no hole for a closing step.
#
# Moving the closed task to the review column and removing its folder are left out on purpose:
# both are mandatory steps of closing work, and both stand in the same turn that opened the PR.
# While the sign listed them alongside taking a task, it always matched, and the guard let through
# the very turn it was made for — work stopped three times in one session that way.
#
# A code edit in the branch of the same PR does not count as an action on the next task — it fixes
# the previous one and does not move the work on.
taken_re='task:new|checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|task:move[^|;&]*in-progress|(cp|mkdir)[^|;&]*/tasks/'

# The task folder is also created without the shell: the file-editing tool writes its first file,
# and no command line stands behind that. So next to the commands the edit path is judged — with a
# pattern of its own, since no command name is in it.
taken_path_re='/tasks/'

# How the turn shows it carried the handed-in work to the end rather than leaving it a draft.
# Lifting the draft is the obvious case; reading the run is the one where there is nothing to lift
# yet, but the executor looked instead of saying "waiting". Two ready PRs stood as drafts precisely
# because the next task was taken instead of this, not on top of it.
ready_re='pr[[:space:]]+ready|run[[:space:]]+(list|view|watch)|pr[[:space:]]+checks|check-runs|check:board|board\.mjs'

# One's own named action. An empty turn that declared what it will do next gives itself away by
# nothing: it opened no PR, read no run, and both earlier signs are silent. It is caught by form —
# a set of future-tense patterns about one's own step — not by understanding the meaning; and no
# call may stand behind the words, otherwise the declaration was said along the work, not instead
# of it.
vow_re='дальше беру|дальше возьму|дальше иду|следующим шагом|следующий шаг:|затем сделаю|затем возьму|потом сделаю|после этого сделаю|далее беру'

# The turn is everything recorded after the owner's last real input. A tool result arrives under
# the same role, so lines with `tool_result` do not count as input.
#
# A 400-line tail: the turn record grows all session, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r \
    --arg opened "$opened_re" --arg taken "$taken_re" --arg taken_path "$taken_path_re" \
    --arg read "$read_re" --arg red "$red_re" --arg ready "$ready_re" --arg vow "$vow_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    | ($uses | map((.input.command // "")) | join("\n")) as $ran
    # The edit path is the second way to create a task folder. Only the writing tools are judged:
    # reading has the same path and is not work.
    | ($uses | map(select(.name == "Write" or .name == "Edit" or .name == "MultiEdit")
          | (.input.file_path // "")) | join("\n")) as $wrote
    # The tool result is taken as text, not as the JSON record: there a tab and a quote leave
    # escaped, and the pattern misses them entirely. It arrives both as a string and as a list of
    # blocks — both forms are brought to one text.
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end] | join("\n")) as $out
    | ($ran | test($opened; "i")) as $opened_pr
    | (($ran | test($read; "i")) and ($out | test($red; "i"))) as $red_run
    | (($ran | test($taken; "i")) or ($wrote | test($taken_path; "i"))) as $went_on
    | ($ran | test($ready; "i")) as $checked
    | ([$turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "text") | .text] | join("\n")) as $said
    | ($said | test($vow; "i")) as $announced
    | ($uses | length) as $tools
    | if $opened_pr and ($went_on | not) and ($checked | not) then "owe:both"
      elif $opened_pr and ($went_on | not) then "owe:pr"
      elif $opened_pr and ($checked | not) then "owe:draft"
      elif $went_on then "pass"
      elif $red_run then "owe:run"
      elif $announced and $tools == 0 then "owe:vow"
      else "pass" end
' 2>/dev/null)"

# Neither of the two actions: the refusal names both at once. Before, it named only the first and
# was lifted by the first too — the executor took the next task, the open-PR sign left with the
# turn, and the second demand evaporated without ever sounding.
if [ "$verdict" = "owe:both" ]; then
    reason="BLOCKED by waiting-turn-guard: в этом ходе открыт PR, а по отданной работе не сделано ни одного из двух действий — ни состояние её не спрошено, ни следующая задача не взята.

Действий именно два, и снять отказ одним нельзя: отданное доводится до снятого черновика тем, кто его отдал, а следующая берётся сверх этого, а не вместо. Взятая следующая уносит признак открытой заявки с собой — второе требование после неё не прозвучит уже никогда.

    gh run list                                # состояние отданного
    npm run task:new -- <заголовок>            # следующая работа

Гард судит один ход: следующий заход не отбивается."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: по отданной работе не сделано ни одного из двух действий."}\n'
    exit 0
fi

# A turn that declared its next action and did nothing on it. The refusal names the declaration
# itself: an executor told "the turn is empty" will rewrite the words rather than take the step.
if [ "$verdict" = "owe:vow" ]; then
    reason="BLOCKED by waiting-turn-guard: за ход не сделано ни одной правки и не позвана ни одна команда, а следующее действие названо словами — «дальше беру», «следующим шагом», «затем сделаю».

Объявление своего же шага работой не бывает: оно точнее всякого обещания и пустоты за ним не видно никому. Сделай названное этим же ходом — либо скажи владельцу, что работу останавливает, и назови, чем именно.

Гард судит один ход: следующий заход не отбивается."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: следующее действие названо словами, а за ход не сделано ничего."}\n'
    exit 0
fi

# A draft left while the next task is taken is a separate refusal: there the demand is not about
# the next task but about carrying the handed-in one to the end.
if [ "$verdict" = "owe:draft" ]; then
    reason="BLOCKED by waiting-turn-guard: в этом ходе открыт PR, следующая задача взята, а состояние отданной работы не спрошено ни одной командой.

Черновик читается владельцем как «работа не кончена»: кнопка слияния у него заблокирована самим хостингом, и по списку заявок готовое от недоделанного не отличить — серое и там и там. Довести отданное до снятого черновика обязан тот, кто его отдал.

Спроси прогон на вершине этим же ходом — `gh run list`, `gh pr checks` или сверку очереди работ — и сними черновик, когда он зелёный, а ветка сливается. Прогон ещё идёт — так и скажи владельцу, назвав его вывод.

Следующая задача берётся сверх этого, а не вместо: обе готовые заявки простояли черновиками ровно на такой подмене.

Гард судит один ход: следующий заход не отбивается."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: отданная работа осталась черновиком — спроси прогон и сними черновик."}\n'
    exit 0
fi

case "$verdict" in
    owe:pr) said="в этом ходе открыт PR" ;;
    owe:run) said="в этом ходе прочитан красный прогон" ;;
    *) exit 0 ;;
esac

reason="BLOCKED by waiting-turn-guard: ${said}, а действия по следующей задаче в нём нет ни одного. Ожидание чужого шага заходом не занимают: прогон, разбор и слияние идут на стороне и быстрее от взгляда не становятся.

Сказать «беру следующую задачу» — не то же самое, что взять её: фраза живёт до конца хода, а работа не двигается, и заметить это может только владелец.

Тем же ходом делается первое действие по следующей задаче — заведение задачи, ветки или папки:

    npm run task:new -- --title '<Что не так>' --slug <slug>
    git checkout -b <КЛЮЧ>-<номер>-<slug>

Конец прогона узнаётся возвратом фоновой команды, а не взглядом на страницу.

Гард судит один ход: следующий заход не отбивается."

# The shared deny tail: two lawful moves. The file may not be laid out — then there is no tail,
# and the reason for the refusal stays as it was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"waiting-turn-guard: PR открыт — тем же ходом берётся следующая задача."}\n'

exit 0
