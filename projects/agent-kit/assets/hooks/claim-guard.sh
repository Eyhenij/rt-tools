#!/usr/bin/env bash
# rt-hook: Stop
# The claim guard: what is said to the owner about the state of the tree carries the command that
# showed it. Stop.
#
# Why exactly this way. The rule of texts itself says that no check reads the reply to the owner:
# a file is answered for by the gate, a reply by its author, and the price of a mistake in a reply
# is paid by the owner. Eight analyses in a row about one and the same thing — what lay on the disk
# was called ready, only local branches were called removed, a set narrower than the pipeline was
# called checked, a local reference that had fallen behind was called the state of the tree. Each
# time an article was added to the rule, and each time the miss repeated: the text is read at the
# start of the session, and the claim is said at its end.
#
# What is judged: the text said to the owner within this turn. Tool output and what was written
# into a file do not go here — those are read by the gate and by the checks.
#
# How it is judged: each claim word has a command kind of its own named for it. A claim about a
# green set is confirmed by a run of the set, about a pushed branch by a push call, about a removed
# one by a delete call. The command is looked for within this same turn: the state of the tree
# changes, and the output of a past turn no longer speaks about the present one.
#
# What the guard does not judge. A wrong conclusion: about a pattern judged by one of its files,
# and about a path a person will not take, a machine has nothing to judge by — there is neither a
# claim word there nor a command to check against. Those cases are held by the work-conduct rule,
# and that is a known boundary of the guard, not a promise.
#
# Someone else's word is not judged either: a quotation in quotes, an examiner's question, a
# retelling of someone else's text, a line of code and a sentence in the conditional are not claims
# about the tree. Turns refused for them cost more than the ones let through: a guard that refuses
# a quotation teaches not to check the tree but not to write quotes. So before the parse, quotes,
# code, quoting lines and sentences with a word of condition are taken out of what was said.
#
# FAIL-OPEN: on any error, a missing `jq`, no turn record or empty text the turn is ALLOWED
# (exit 0). A broken guard has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=claim-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A repeat pass over the same turn is not judged: the guard said its piece once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The text of the reply lands in the turn record no earlier than the host calls the hook: a guard
# that read the file first judges a turn that has nothing said in it at all — and stays silent,
# indistinguishable from a guard that looked and let it through. We wait for it to appear, and
# failing to see it, we return the turn: an empty record means not "nothing was said to the owner"
# but "there is nothing to read".
#
# This refusal belongs to one guard on purpose. Three of them judge the text, and were they to
# print their objects one after another, the output would stop being parsed whole — that is, the
# refusal would be lost entirely.
if ! rt_turn_has_text "$transcript"; then
    reason="BLOCKED by claim-guard: the record of the turn gave back no reply text at all, and there is nothing to judge what was said to the owner by.

The text lands in the record no earlier than the host calls the hook. A record read too early looks like a turn in which nothing was said to the owner — and every guard that judges what was said passes by in silence.

Repeat the ending of the turn: by this minute the text is already in the record. The turn loses nothing by it — what was said to the owner stays the same.

The guard judges one turn: the next session is not refused."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"claim-guard: the record of the turn gave back no reply text — repeat the ending of the turn."}\n'
    exit 0
fi

# A turn is everything recorded after the owner's last real reply: a tool answer comes in under
# the same role and does not count as a reply.
turn="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[]
        | select(.type == "text") | (.text // "")] as $said
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[]
        | select(.type == "tool_use") | (.input.command // "")] as $ran
    | { said: ($said | join("\n")), ran: ($ran | join("\n")) }
' 2>/dev/null)"

[ -z "$turn" ] && exit 0

said="$(printf '%s' "$turn" | jq -r '.said // ""' 2>/dev/null)"
ran="$(printf '%s' "$turn" | jq -r '.ran // ""' 2>/dev/null)"
[ -z "$said" ] && exit 0

# Someone else's word is taken out before the parse. A quoting line and a code block go whole,
# quotes and inline code are blanked with a space, and sentences with a word of condition are
# dropped: "would have run" and "if the lint were green" say nothing about the state of the tree.
judged="$(printf '%s\n' "$said" \
    | awk 'BEGIN { code = 0 }
        /^[[:space:]]*```/ { code = !code; next }
        !code && !/^[[:space:]]*>/' \
    | sed -E 's/`[^`]*`/ /g; s/«[^»]*»/ /g; s/"[^"]*"/ /g' \
    | sed -E 's/([.!?])[[:space:]]+/\1\'$'\n''/g' \
    | grep -viE '(^|[[:space:]])(бы|если|разве|неужели|ли)([[:space:]]|[,.]|$)' 2>/dev/null)"
[ -z "$judged" ] && exit 0
said="$judged"

# The claims map: what is said about the tree | what shows it | what to name in the refusal.
#
# The word is taken in the form it is said to the owner in. The future tense does not go here:
# "I will check" and "I will start" are not claims — they are a promise, and there is nothing in
# them to lie with.
claims=(
    'проверено|прогнал[а]?|тесты (зелёные|прошли)|линт(ер)? (зелёный|прошёл|чистый)|сборка (зелёная|прошла)|набор зелёный|проверки зелёные|спеки зелёные|всё зелен(о|ое)§nx (test|lint|build|run|affected|run-many)|npm (run|test)|pnpm (run|exec|test)|jest|vitest|playwright|check:|run\.sh§команду набора — прогон тестов, линта или сборки'
    'запушен[аоы]?|запушил[а]?|пуш прошёл|ветка уехала§git push§`git push`'
    '(PR|правка|ветка|работа)[^.]{0,20}(влит|слит|смержен)|влит[оа] в|слит[оа] в§git merge|gh pr merge§`git merge` или `gh pr merge`'
    '(ветки|ветка|файлы|файл|папка|каталог)[^.]{0,40}(снят|удал|почищ|вычищ)|снят[оыа] с§git branch|git push .*--delete|git rm|gh api|rm §команду удаления — `git branch -d`, `git push --delete` или `git rm`'
    'прогон (зелёный|прошёл|кончился)|конвейер зелёный|проверки на PR зелёные§gh run§`gh run list` или `gh run view`'
    '(работа|правка|задача) готова|можно вливать|PR открыт|черновик снят§gh pr §`gh pr create`, `gh pr view` или `gh pr ready`'
    # Waiting for someone else's step is a claim about the state too, and there is something in it
    # to lie with: a run is green for an hour, and sometimes never starts at all. Said without a
    # command, it leaves finished work a draft, and the owner learns of it last — that is exactly
    # how it went twice in one day.
    'жд[уёя][^.]{0,20}прогон|дожида[ею][^.]{0,20}прогон|прогон[^.]{0,20}(ещё идёт|не встал|не кончился|не дошёл)|черновик[^.]{0,30}(не снимаю|сниму|снимется)§gh run|gh pr checks|check-runs|check:board|board\.mjs§команду о прогоне — `gh run list`, `gh pr checks` или сверку очереди работ'
    'задача заведена|задача (в|переведена в) колонк|колонка переведена§gh issue|gh api|task:new|task:move|board\.mjs§команду очереди работ — заведение задачи или перевод колонки'
    '(в дереве|в репозитории|здесь|такого файла|такой команды)[^.]{0,30}(нет|не бывает)|не заводили|нигде не встречается§grep|rg |ls |find |git ls-files|git grep|git log|cat §команду поиска — `grep`, `git ls-files` или обход каталога'
)

for row in "${claims[@]}"; do
    words="${row%%§*}"
    rest="${row#*§}"
    proof="${rest%%§*}"
    name="${rest#*§}"

    found="$(printf '%s' "$said" | grep -oiE "$words" 2>/dev/null | head -1)"
    [ -z "$found" ] && continue
    printf '%s' "$ran" | grep -qiE "$proof" 2>/dev/null && continue

    reason="BLOCKED by claim-guard: the owner was told «${found}» — that is a statement about the state of the tree, and there was no command showing it in this turn.

A statement about the tree is worth exactly as much as the command that showed it: what is said without a command the owner reads as a verified fact and learns of the divergence last.

The first way out is to remove the statement from the reply and speak of what was done without it. It is the right one wherever the owner asked for no command: a run made to lift a refusal is sometimes more dangerous than what the guard watches — that is how a turn with nothing to deliver reached a push.

The second is to run ${name} in this same turn and name its output.

The guard judges one turn: the next session is not refused."

    # The shared deny tail: the two lawful moves. The file may not be laid out — then there is no
    # tail, and the reason for the refusal stays as it was.
    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"claim-guard: a statement about the tree is not backed by a command."}\n'
    exit 0
done

exit 0
