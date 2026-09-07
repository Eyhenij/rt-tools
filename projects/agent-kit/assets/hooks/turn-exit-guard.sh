#!/usr/bin/env bash
# rt-hook: Stop
# Requires: hooks/deny-tail.sh, hooks/turn-exit-patterns.sh
# Turn exit guard: a turn in which nothing was done on the work does not end until the work is
# handed over. Stop.
#
# Why exactly this way. The rule lists four lawful exits of a turn — a question the rules do not
# answer, a guard refusal, a filled window, work handed over with the next one started — and all
# of it is held by the executor's memory. Held badly: a turn that ended with a report of what was
# done looks more like work than any other — it is full, it names numbers and states, and the
# emptiness behind it is invisible both to the owner and to the session itself. The owner said it
# outright: stopping in the middle of work is not allowed, and the ban must be held by the machine.
#
# What counts as work: an edit of a file and a command that changes the tree or its state. Reading,
# searching and talking do not count as work — a turn that has stalled is filled with exactly
# these. A reading subcommand of `git` and of the hosting client does not count as work either, and
# this is judged by the parts of a compound command: reading joined to an edit through `&&` stays
# work.
#
# What releases a turn:
#   1. The work is handed over or merged — the work state says so itself.
#   2. There was work in the turn: an edit of a file or a command that changes the tree.
#   3. A question to the owner through the question tool.
#   4. A guard refusal — it ends the turn by the rule.
#   5. The session handover is written — the window has run out.
#   6. The owner said to stop.
#
# Work without a branch and without a task folder is judged by the second sign. It has no state,
# and there is nowhere to take the first sign from — but a turn without a single edit of the tree
# does not end here either: the owner's request "lay it out", "update it", "take a look" lives
# without a task and without a branch, and it was protected least of all. Such a turn is released
# by the same four things: a question, a guard refusal, a written handover and the owner's word
# about stopping.
#
# FAIL-OPEN: on any error, a missing `jq`, a missing turn record, task folder or state line the
# turn is ALLOWED (exit 0). A broken guard has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=turn-exit-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read

# The refusal is printed in one form: the reason, the shared tail about the two lawful moves and a
# fallback line in case there is no parser. These twelve lines used to stand as eight copies — the
# file grew faster on every new tier than on the requirement itself.
rt_te_deny() {
    rt_te_reason="$1"
    rt_te_short="$2"
    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    rt_te_tail="$(rt_deny_tail "")"
    [ -n "$rt_te_tail" ] && rt_te_reason="${rt_te_reason}

${rt_te_tail}"

    jq -n --arg r "$rt_te_reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"turn-exit-guard: %s"}\n' "$rt_te_short"
    exit 0
}

input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A second pass over the same turn is not judged: the guard has said its piece once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

# The branch, the task folder and the state line are taken while they are there. Empty — the turn
# is judged by the second sign, not released: this is where it used to leave with zero, and work by
# the owner's word ended with an announcement of intent, silently.
branch="$(git branch --show-current 2>/dev/null)"
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
progress=""
state=""
if [ -n "$branch" ] && [ -f "$root/$tasks_dir/$branch/progress.md" ]; then
    progress="$root/$tasks_dir/$branch/progress.md"
    state="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(State|Состояние):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$progress" 2>/dev/null | head -1)"
fi

# Work that has reached these two states has already waited out someone else's step: from here on
# the owner moves it, and a turn closed here drops nothing.
case "$state" in
    работа-отдана | влито) exit 0 ;;
esac

# A written plan is never the end of a turn at all. The mandatory action of this state is to do the
# first stage, and whoever starts it moves the state by the same edit: a turn left in the previous
# state has not started the first stage by definition. The second sign is no good here — it counts
# creating the task, the branch, the column and the folder as work, and a turn with only the
# preparation done passes straight through it. In one session this happened three times; twice the
# neighbouring guard over the open PR caught it, the third time nothing caught it, and for the
# owner a report about a taken task is indistinguishable from a stop.
if [ "$state" = "замысел-записан" ]; then
    plan="$root/$tasks_dir/$branch/plan.md"
    first_stage="$(grep -m1 '^### ' "$plan" 2>/dev/null | sed 's/^### //')"
    [ -z "$first_stage" ] && first_stage="the first stage of the plan"
    reason="BLOCKED by turn-exit-guard: the work stands in the state 'замысел-записан', and the mandatory action of this state — do the first stage — was not begun in the turn.

Creating the task, the branch, the column and the folder does not count as that step: all of it is preparation for work, not work. To the owner a report about a taken task is indistinguishable from a stop — they see the executor standing still.

The first stage of the plan: ${first_stage}

Begin it in this same turn and rewrite the state to '- **State:** \`этап-идёт\`'. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."

    rt_te_deny "$reason" "the plan is written and the first stage is not begun."
fi

# The same thing, but there is nothing left on disk to declare it with: the task folder is taken
# apart before the PR opens, and the progress goes away with it. The sign is taken from the branch
# history — the folder removed by its commit.
#
# A turn must not be released by that sign: the folder is removed BEFORE the PR, and between these
# two movements the work is handed over to nobody. A turn caught in that gap used to leave here
# with zero — and it was exactly one step short of the handover, and it did not make it. The sign
# therefore only lifts the state requirement: from there the turn is judged by the second sign,
# like any other. A turn in which the PR was opened or read passes the second sign by itself — it
# counts a call of the hosting client as work.
folder_archived() {
    [ -n "$branch" ] || return 1
    [ -n "$(git ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null | head -1)" ] && return 1
    main_branch="${RT_MAIN_BRANCH:-main}"
    base="$(git merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$base" ] && return 1
    had="$(git ls-tree -d --name-only "$base" -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -z "$had" ] && had="$(git log "$base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -n "$had" ]
}

archived=false
[ -z "$progress" ] && folder_archived && archived=true

# The next step out of the progress is what the guard names in the refusal: an executor told only
# "the work is not finished" re-reads the same line himself.
next_step=""
[ -n "$progress" ] && next_step="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Next step|Следующий шаг):\*\*[[:space:]]*(.*)/\2/p' "$progress" 2>/dev/null | head -1)"
[ -z "$next_step" ] && next_step="what stands in the section «Where we stand» of the progress"

# The patterns of work, of exploration, of waiting and of the handover lie in a neighbouring file:
# the guard outgrew the length limit, and patterns with their reasons read apart from the tiers.
# Without the patterns file the guard stays silent — fail-open, as on any breakage of its own.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/turn-exit-patterns.sh" 2>/dev/null || exit 0
[ -n "${work_re:-}" ] || exit 0

verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg work "$work_re" --arg read "$read_re" --arg part "$part_re" --arg wait "$wait_re" --arg handover "$handover_re" --arg started "$started_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    # An edit of a file is work by definition, whatever tool it goes through.
    | ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$"))) as $edited
    | ($uses | map(.name // "") | any(test("AskUserQuestion"))) as $asked
    | ($uses | map((.input.command // "")) | join("\n")) as $ran
    # Work is a part of the command that matched the work pattern and did not match the exploration
    # pattern: switching a branch and reading history in the same turn do not become work.
    | ([$ran | splits($part)] | map(test($work) and (test($read) | not)) | any) as $ran_work
    # The last action of the turn. Waiting for a step by anyone else is never the end of a turn,
    # however much work there was before: the work stays exactly where it stood.
    | ([$uses[] | select((.name // "") == "Bash") | (.input.command // "")] | last // "") as $last
    | ($last | test($wait)) as $waited
    # Handing the work over: the tail of the turn after the PR was opened. Everything before it was
    # done on the task handed in and says nothing about the next one.
    | ([$uses[] | select((.name // "") == "Bash") | (.input.command // "")]) as $cmds
    | (($cmds | map(test($handover)) | index(true))) as $handover_at
    | ($handover_at != null) as $handed_over
    | (if $handover_at == null then [] else $cmds[$handover_at:] end) as $tail
    | (($tail | map(test($started)) | any)
        or ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$")))) as $started_next
    # THE LAST ACTION OF THE TURN is the shared sign, and the particular tiers below only derive an
    # understandable refusal from it. Nine incident analyses in a day describe nine different stops,
    # and in all nine the last action of the turn was a text to the owner: a report, a summary, an
    # announcement of intent. A tier for every kind of stop is an endless race: there are as many
    # kinds as there are reasons to start talking. Hence one sign — the LAST action must be work.
    | ([$uses[] | (.name // "")] | last // "") as $last_tool
    | (($last_tool | test("^(Edit|Write|MultiEdit|NotebookEdit)$"))
        or ([$last | splits($part)] | map(test($work) and (test($read) | not)) | any)) as $ended_working
    # A guard refusal and a session handover — both end the turn by the rule.
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end] | join("\n")) as $out
    | (($out | test("BLOCKED by|Refused by the rules gate|Отбито гейтом")) or ($ran | test("BLOCKED by"))) as $denied
    | ($ran | test("handoff")) as $handed
    # The word of the owner about stopping: the reply itself is judged, not its retelling.
    | ([$turn[] | select(.type == "user") | .message.content
          | if type == "string" then . elif type == "array"
            then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] | join("\n")) as $said
    | ($said | test("останов|стоп|хватит|подожди|не надо|прерв|отложи")) as $told_stop
    # A question refused by the conversation guard, and a question appended as prose at the end of
    # the reply. The conversation guard judges the call of the question tool and does not see prose
    # at all: a refused question came back in the same wording one turn later and passed freely.
    | ($out | test("BLOCKED by grill-gate")) as $ask_denied
    | ([$turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "text") | (.text // "")] | last // "") as $last_say
    | (($last_say | test("\\?[[:space:]]*$")) and $ask_denied) as $asked_in_prose
    # Waiting for the word of the owner, announced by the executor. That word is read from
    # the owner: without his word in the turn and without a question to him through the tool, the
    # phrase "waiting for your word" is a stop announced by the one it suits. The set of patterns is
    # named and closed.
    | (($last_say | test("[Жж]ду (твоего|вашего|его|её) (слова|указани|решени|ответа|команды|отмашки)|[Жж]ду слова владельца|[Жж]ду, что скаж|[Оо]стаюсь ждать|[Бб]уду ждать (твоего|вашего)"))
        and (($asked or $told_stop or $handed) | not)) as $awaits_word
    | { worked: ($edited or $ran_work), released: ($asked or $denied or $handed or $told_stop), waited: $waited, handed_over: $handed_over, started_next: $started_next, ended_working: $ended_working, asked_in_prose: $asked_in_prose, awaits_word: $awaits_word, ran: $ran }
' 2>/dev/null)"

[ -z "$verdict" ] && exit 0

worked="$(printf '%s' "$verdict" | jq -r '.worked // false' 2>/dev/null)"
waited="$(printf '%s' "$verdict" | jq -r '.waited // false' 2>/dev/null)"
handed_over="$(printf '%s' "$verdict" | jq -r '.handed_over // false' 2>/dev/null)"
started_next="$(printf '%s' "$verdict" | jq -r '.started_next // false' 2>/dev/null)"
ended_working="$(printf '%s' "$verdict" | jq -r '.ended_working // false' 2>/dev/null)"
released="$(printf '%s' "$verdict" | jq -r '.released // false' 2>/dev/null)"
commands="$(printf '%s' "$verdict" | jq -r '.ran // ""' 2>/dev/null)"

# A question refused by the conversation guard and asked as prose in the same turn. A guard refusal
# releases the turn — it is the lawful end itself — but there is nothing to release here: the same
# question came back a line later, and the work stalled on what the tree had already answered. The
# tier stands before the lawful exits on purpose: a guard refusal covers exactly this case.
asked_in_prose="$(printf '%s' "$verdict" | jq -r '.asked_in_prose // false' 2>/dev/null)"
if [ "$asked_in_prose" = "true" ]; then
    rt_te_deny "BLOCKED by turn-exit-guard: in this turn the conversation guard refused a question to the owner, and the reply ends with a question in prose — the same question, asked in another form.

The refusal of the guard named the reason: the answer lies in the tree or the owner has already given it. Read the place it named and work on; what is asked is what the tree does not hold.

The guard judges one turn: the next session is not refused." "the question returned in prose after the refusal of the conversation guard."
fi

# The turn ended with waiting for the owner's word. The guard reads the word about stopping from
# the owner, and here the executor announced it: in this turn the owner said nothing about stopping
# and was asked no question through the tool. The shared tiers refuse such a turn without a name,
# and after one step it ended with the same phrase again — three turns in a row in a consuming
# tree. The tier stands before the lawful exits: a neighbouring guard's refusal releases a turn that
# named a refusal to the owner, not a turn that said "waiting".
# Incident analysis — the record
# "2026-09-04-hod-konchalsya-ozhidaniem-pri-deystvuyushchem-ukazanii" in the intake.
awaits_word="$(printf '%s' "$verdict" | jq -r '.awaits_word // false' 2>/dev/null)"
if [ "$awaits_word" = "true" ]; then
    rt_te_deny "BLOCKED by turn-exit-guard: the turn ended with words about waiting for the word of the owner, and the word about stopping the guard reads from the owner: in this turn they announced no stop, and no question was put to them by the tool.

The phrase «жду твоего слова» is a stop announced by the executor. The instruction of the owner to work holds until they cancel it, and a new fact against it is a line about the price in the reply, not waiting. A decision the tree does not hold is needed — then ask the question by the tool; otherwise do the next step in this same turn.

The next step is written in the progress: ${next_step}

The guard judges one turn: the next session is not refused." "the turn ended with waiting for the word of the owner."
fi

[ "$released" = "true" ] && exit 0

# Work that has reached the handover and has not been handed over. The two states in the `case`
# below declare that the code is written and what remains is to bring the work to a PR: run the
# suite, take the folder apart, open the PR. The second sign does not ask about this — such a turn
# is full of edits and commands, and it releases it whole; between taking the folder apart and
# opening the PR nobody sees the work, and the owner reads the previous state as "nothing was done".
#
# The tier stands after the lawful exits: a question to the owner, a guard refusal, a session
# handover and the owner's word about stopping end the turn by the rule, and locking them behind a
# state is not allowed.
case "$state" in
    этапы-кончились | разбор-кончился)
        if ! printf '%s' "$commands" | grep -qE 'gh[[:space:]]+pr[[:space:]]+create'; then
            if [ "$state" = "этапы-кончились" ]; then
                action="merge the agreement, bring the texts up to what was done and run the suite"
            else
                action="take the task folder apart by the last commit"
            fi
            reason="BLOCKED by turn-exit-guard: the work stands in the state '${state}', and no request was opened in the turn.

The mandatory action of this state is ${action}, and after it the work is brought to a request in the same turn. A report about what was done is never the end of a turn: the edit lies in a branch the owner does not see, and the former state they read as «nothing was done».

The next step from the progress: ${next_step}

Bring the work to a request in this same turn and rewrite the state. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."

            rt_te_deny "$reason" "the work reached handing over and there is no request in the turn."
        fi
        ;;
esac

# Work taken but not started. A branch by the task number is created, and there is no task
# directory next to it at all — which means the work is declared taken and not started by a single
# line. The turn does not end here, however much work there was in it: creating the branch, moving
# the column and cleaning up neighbouring branches are all commands that change the tree, and the
# second sign releases such a turn whole.
#
# This is exactly how a turn used to stall: the task is taken, the number is named to the owner,
# the report is written — and the next action of the state that means the task is taken, to write
# the plan, is not done. A report looks more like work than any other, and a guard that knows only
# "was there work in the turn" confirms it: there was work.
# Incident analysis — the record "2026-08-25-task-taken-and-turn-ended" in the intake.
#
# A folder taken apart by a branch commit does not get here: `archived` means handed-over work, and
# the previous tier judges it. A branch without a task number is not judged at all — such ones are
# created for a trial too.
if [ "$archived" != "true" ] && [ -z "$progress" ] && [ -n "$branch" ] && [ ! -d "$root/$tasks_dir/$branch" ]; then
    task_key="${RT_TASK_KEY:-}"
    if [ -z "$task_key" ] && [ -f "$root/.claude/rt-kit/checks.json" ]; then
        task_key="$(jq -r '.board.taskKey // empty' "$root/.claude/rt-kit/checks.json" 2>/dev/null)"
    fi
    [ -z "$task_key" ] && task_key='[A-Za-z][A-Za-z0-9]*'
    if printf '%s' "$branch" | grep -qE "^${task_key}-[0-9]+-" 2>/dev/null; then
        reason="BLOCKED by turn-exit-guard: the work is taken and not begun — the branch \`$branch\` is created, and there is no task folder next to it.

A created branch means the state «задача-взята», and it has one mandatory action — write the plan. A turn ending here leaves the work announced and not begun: the number is named, the column is moved, and on disk there is neither the analysis of the request nor the stages. The commands creating the branch and moving the column do not replace it — such a turn is filled with exactly those.

    npm run task:new -- <номер>   # если папки нет вовсе

Assemble \`$tasks_dir/$branch/\` and write the plan in this same turn.

The guard judges one turn: the next session is not refused."

        rt_te_deny "$reason" "the work is taken and not begun — write the plan."
    fi
fi

# The stage contract. The mark "the stage is done" is a statement about the tree, and it is backed
# by the output of a command, not by words: a stage marked from memory is, a session later,
# indistinguishable from a checked one. The guard compares the stage number with what lies in the
# branch history, and on a grown number it demands the commands from the verification line — it
# stands in the plan in backticks. A technique written as prose the guard does not read: there is
# nothing to back it with output, and this is its known limit.
stage_now=""
stage_was=""
if [ -n "$progress" ]; then
    stage_now="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Stage|Этап):\*\*[[:space:]]*([0-9][0-9]*).*/\2/p' "$progress" 2>/dev/null | head -1)"
    stage_was="$(git -C "$root" show "HEAD:$tasks_dir/$branch/progress.md" 2>/dev/null | sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Stage|Этап):\*\*[[:space:]]*([0-9][0-9]*).*/\2/p' | head -1)"
fi

if [ -n "$progress" ] && [ -n "$stage_now" ] && [ -n "$stage_was" ] && [ "$stage_now" -gt "$stage_was" ] 2>/dev/null; then
    plan="$root/$tasks_dir/$branch/plan.md"
    # The contract of the closed stage, not of the started one: what is declared done is what is backed.
    contract="$(awk -v n="$stage_was" '
        $0 ~ "^### " n "\\." { inside = 1; next }
        /^### / { inside = 0 }
        inside && /\*\*(Verified by|Чем проверяется):\*\*/ { print }
    ' "$plan" 2>/dev/null)"
    missing=""
    while IFS= read -r cmd; do
        [ -z "$cmd" ] && continue
        printf '%s' "$commands" | grep -qF -- "$cmd" || missing="$missing\n    $cmd"
    done <<EOF
$(printf '%s' "$contract" | grep -o '`[^`]*`' | tr -d '`')
EOF
    if [ -n "$missing" ]; then
        reason="BLOCKED by turn-exit-guard: the stage ${stage_was} is declared closed, and the commands it is verified by were not run in this turn:$(printf '%b' "$missing")

The mark «этап сделан» is a statement about the tree, and it is backed by the output of a command, not by words: a session later what was marked from memory is indistinguishable from what was checked.

Run them in this same turn or return the former stage number to the progress.

The guard judges one turn: the next session is not refused."
        rt_te_deny "$reason" "a closed stage is not backed by the output of a command."
    fi
fi

# The work is handed over and the next one is only named. There is more work in such a turn than in
# any other — and all of it is on the task handed in: the handover finishes the previous work, not
# the turn. Nine incident analyses in a day describe nine different stops, and in all nine the last
# action of the turn was a text to the owner: a report, a summary, an announcement of intent.
# Incident analysis — the record "2026-08-25-handover-turn-ends-on-intent" in the intake.
if [ "$handed_over" = "true" ] && [ "$started_next" != "true" ]; then
    reason="BLOCKED by turn-exit-guard: a request is open, and nothing was done about the next work in this turn.

Handed-over work ends a turn only together with the next one begun — an action about it must be done, not said. «Беру такую-то» is not an exit: the rule calls that an announcement of intent.

Everything that happened before the request was opened was done on the handed-over task and says nothing about the next one.

    npm run task:new -- <заголовок>            # завести следующую
    git checkout -b <КЛЮЧ>-<номер>-<slug>      # взять её в работу

Do the first step of the next work in this same turn. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."

    rt_te_deny "$reason" "the work is handed over and the next one is not begun."
fi

# The turn ended with waiting for someone else's step. There was work in it — that is what makes it
# deceptive: it is full, and the emptiness behind it is invisible. The last action is judged, not
# the presence of work.
if [ "$waited" = "true" ]; then
    reason="BLOCKED by turn-exit-guard: the last action of the turn was waiting for a step by someone else, and that is never a state of the work.

The run, the review by the owner and the merge go on without the executor and do not get faster from being watched. There may have been much work in the turn — it stays exactly where it stood, and the owner sees the executor standing still.

The next step is written in the progress: ${next_step}

Do it in this same turn or take the next task. Waiting in the middle of a turn is lawful — what is refused is the end.

The guard judges one turn: the next session is not refused."

    rt_te_deny "$reason" "the turn ended with waiting for a step by someone else."
fi

# The shared line. There was work in the turn — but the last action was not it, it was a text to the
# owner. The particular tiers above name the kind of stop more precisely; what reaches here is what
# they do not know by name.
if [ "$worked" = "true" ] && [ "$ended_working" != "true" ]; then
    reason="BLOCKED by turn-exit-guard: there was work in the turn, but the last action of the turn was not it.

A turn ends with work, not with an account of it. A report, a summary and an announcement of intent are not an exit: the more was done, the more convincingly they look like completion — and the next action takes exactly that place.

The next step is written in the progress: ${next_step}

Do it in this same turn, and telling about what was done can come after. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."

    rt_te_deny "$reason" "the last action of the turn was not work."
fi

# Work left in the working tree. The branch has gone ahead of its remote reference, and no PR was
# opened on it in this turn: what was done lies where nobody sees it except the one who did it. The
# sign is read without the network and stays silent where there is no reference at all — such
# branches are created for a trial too.
# Incident analysis — the record "2026-08-25-fifteen-branches-over-one-index" in the intake.
if [ "$worked" = "true" ] && [ "$handed_over" != "true" ]; then
    unpushed="$(git -C "$root" rev-list --count '@{u}..HEAD' 2>/dev/null)"
    if [ -n "$unpushed" ] && [ "$unpushed" -gt 0 ] 2>/dev/null; then
        reason="BLOCKED by turn-exit-guard: there was work in the turn, but it stayed in the working tree — commits not handed over: ${unpushed}.

The owner sees the former state and reads it as «nothing was done». Two moves from here: bring the work to the hosting — push the branch and open a request — or remove what was done if it is not needed.

What is left in the tree is named with a reason — in the words of the owner, not as a list of leftovers.

The guard judges one turn: the next session is not refused."

        rt_te_deny "$reason" "the work stayed in the working tree."
    fi
fi

[ "$worked" = "true" ] && exit 0

if [ "$archived" = "true" ]; then
    reason="BLOCKED by turn-exit-guard: the task folder was removed by a commit of the branch, and nothing was done in this turn — neither an edit nor a command changing the tree.

A removed folder means the middle of handing over, not its end: it is taken away BEFORE the request is opened, and between these two motions nobody but the one who did the work sees it. From this minute there is nothing to declare the state of the work by, so the turn is judged by the second sign — whether there was work in it.

One step is left: open the request as a draft. The request is already open — then take the next task: waiting for a run by someone else is not work and does not end a turn.

The guard judges one turn: the next session is not refused."
elif [ -z "$state" ]; then
    reason="BLOCKED by turn-exit-guard: nothing was done in this turn — neither an edit nor a command changing the tree. This work has no task folder, and there is nowhere to take the state from, but that does not end the turn.

A turn ends in four ways and there are no others: a question to the owner the rules do not answer; a refusal of a guard; a filled session window; work handed over with the next one begun. A command named and not run is not an exit: the line «сейчас запущу» is an announcement of intent, and that is named outright as a false end of a turn.

Work by the word of the owner — «разложи», «обнови», «посмотри» — goes without a task and without a branch, and there is nothing to stop it by except this sign.

Run what is named in this same turn. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."
else
    reason="BLOCKED by turn-exit-guard: the work is in the state '${state}', and nothing was done about it in this turn — neither an edit nor a command changing the tree.

A turn ends in four ways and there are no others: a question to the owner the rules do not answer; a refusal of a guard; a filled session window; work handed over with the next one begun. A report about what was done is not an exit — it looks more like work than any other, and the emptiness behind it is invisible.

The next step is written in the progress: ${next_step}

Do it in this same turn. The owner said to stop — then write so: the guard reads their word, not a retelling.

The guard judges one turn: the next session is not refused."
fi

rt_te_deny "$reason" "the work is not finished — the next step stands in the progress."

exit 0
