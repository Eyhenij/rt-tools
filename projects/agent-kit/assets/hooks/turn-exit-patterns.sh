#!/usr/bin/env bash
# The patterns of the turn-exit guard. NOT a guard: it has no `rt-hook:` declaration and hooks into
# no agent event. The turn-exit guard sources it — the same way guards source the shared reading of
# the input and the deny tail. It was moved out when the guard outgrew the file length limit: the
# patterns and the reasons beside them read apart from the tiers that apply them.
#
# Every pattern is a shell variable; the guard passes them as arguments to the parsing of the turn
# record.

# A command that changes the tree or its state. Reading and searching are deliberately not included
# here: they are exactly what a stalled turn is filled with.
#
# Output redirection is not here, and it was taken out after an analysis: the guard refused two
# turns out of the seven that stood without work, and counted five as work by that very sign. The
# body of a future PR was written into the session's temporary directory — outside the working tree
# — and one of the waits carried only a diversion of the error stream into the null device. Neither
# of the two changes the tree, and to the pattern they were indistinguishable from writing to a
# working file: it saw the arrow itself and did not ask where it led. What stays as the sign is an
# edit of a file by the editing tool and the commands listed here.
work_re='git (add|commit|push|checkout|merge|rm)|npm run|pnpm (run|exec)|nx (build|test|run)|gh (pr|issue|api|run)|task:(new|move)|mkdir|cp |mv |rm |sed -i|tee '

# Exploration. The same words as in the work pattern, but the subcommand is a reading one:
# switching a branch, pulling, looking through the history, reading PRs and runs. The work pattern
# calls them work, because it knows only the first word — `git` and `gh` stand in it whole — and a
# turn in which the executor switched to the main branch, read the history and wrote the owner a
# report left here with a zero. The analysis is the record
# "2026-08-25-read-only-turn-counted-as-work" in the intake.
#
# Exploration looks like work better than anything else: it has commands, numbers and exact answers.
# That is what makes it dangerous — a turn stuffed with it reads as full both to the owner and to
# the session itself.
read_re='^[[:space:]]*(([^[:space:]]*/)?git[[:space:]]+(show|log|ls-tree|ls-files|ls-remote|diff|status|branch|tag|rev-parse|remote|describe|blame|fetch|pull|(checkout|switch)(?!([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-[bc][[:space:]]))|([^[:space:]]*/)?gh[[:space:]]+(pr|issue|run|repo)[[:space:]]+(list|view|status|checks|diff|download|logs))([[:space:]]|$)'

# The parts of a compound command are judged one by one: a turn gathers reading and work into one
# line through `&&`, and judging it whole would release exploration on the very first changing part.
part_re='&&|\|\||;|\n'

# Waiting for someone else's step. A run, the owner's review and a merge go on without the executor
# and do not get faster from being looked at — the rule says outright that this is never a work
# state. Only the LAST action of the turn is judged: waiting in the middle is lawful, and starting
# work in the background stays work. The analysis is the record "2026-08-25-turn-ended-on-waiting"
# in the intake.
#
# The former sign asked one thing: was there work during the turn. A turn where a conflict was
# resolved, a commit and a push were made, and the last action became a loop until the run was ready
# passed it whole — there was work, and plenty. It is exactly that fullness that deceives: the
# emptiness behind such a turn is not visible.
# Two more kinds of last action were added after an analysis. The first is a run of the checks
# started in the background: the guard is given the background sign appended to the command, and on
# the foreground the same command stays work — it holds the turn to its own end. The second is a
# read of a background task's log: the run was started, the log was read, a report was written, and
# the tree did not change by a single sign; such a turn stands exactly as long as an empty one.
wait_re='gh[[:space:]]+(run[[:space:]]+watch|pr[[:space:]]+checks[^|]*--watch)|until[[:space:]].*sleep|while[[:space:]].*sleep|^[[:space:]]*sleep[[:space:]]|(nx[[:space:]]+(affected|run-many|test|build|lint|e2e)|npm[[:space:]]+run[[:space:]]+(lint|test|check:|e2e)|pnpm[[:space:]]+run|playwright[[:space:]]+test|vitest|jest|bash[[:space:]].*tests?/)[^&]*&[[:space:]]*$|(cat|tail|head|less|grep)[^|]*\.(log|output)([[:space:]]|$)|tasks/[A-Za-z0-9]+\.output'

# A promise to do the work in the next turn. The same announcement of intent as a command named and
# not run, only it sounds politer and is therefore recognised as a stop less often. An offer to the
# owner to object to the announced intent is part of the promise, not a question: a turn ends with a
# question when the work does not go without the answer, and here it did go.
promise_re='следующим ходом|в следующий раз|дальше возьму|дальше допишу|допишу остальн|доделаю остальн|доделаю в следующ|продолжу в следующ|беру[^.]{0,40}следующим|возьму[^.]{0,40}следующим'

# The owner's standing word to work without stops. It holds until they cancel it, and a turn that
# ended with waiting for their word invents that cancellation. Without this the word about a stop
# was read out of it by the piece «останов» in «без остановок» — the instruction to work was taken
# for its opposite.
standing_work_re='работай[^.]{0,40}(без остановок|без пауз|сам)|не останавливайся|продолжай[^.]{0,40}(без остановок|без пауз)|работай дальше'

# Handing work over and starting the next. The rule calls handed-over work a lawful end of a turn —
# but on a condition: the next one is started, and an ACTION has been done on it, not spoken.
handover_re='gh[[:space:]]+pr[[:space:]]+create'
started_re='task:new|task:move|board\.mjs[[:space:]]+move|git[[:space:]]+checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|git[[:space:]]+switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c'

# How many steps of the plan are not done yet. The progress mirrors the steps of the plan with a
# mark each — `[x]` done, `[>]` going on right now, `[ ]` not begun — and a check keeps the two
# lists matched. The reading is a local file, not a call to the hosting: it costs nothing and is
# asked on every turn, unlike the state of the epic.
#
# Prints the number and answers non-zero when there is nothing to read: no progress, or a progress
# with no list of steps. A tier that REFUSES a turn must tell "the work goes on" from "there is
# nothing to ask with" — the same reason the count of the epic's tasks is printed rather than folded
# into an exit code.
rt_te_steps_left() {
    [ -f "$1" ] || return 1
    grep -qE '^-[[:space:]]+\[[x> ]\][[:space:]]+[0-9]+\.[0-9]+[[:space:]]' "$1" 2>/dev/null || return 1
    printf '%s' "$(grep -cE '^-[[:space:]]+\[[> ]\][[:space:]]+[0-9]+\.[0-9]+[[:space:]]' "$1" 2>/dev/null || printf '0')"
    return 0
}

# The step going on right now: its number and its name, as the progress writes them. Empty when no
# step carries the mark — the refusal then names the count alone.
rt_te_step_now() {
    [ -f "$1" ] || return 0
    sed -nE 's/^-[[:space:]]+\[>\][[:space:]]+([0-9]+\.[0-9]+[[:space:]]+.*)$/\1/p' "$1" 2>/dev/null | head -1
}

# The refusal about a step that is not done. The text lies here and not in the guard for the same
# reason as the one about the epic: the guard stands at its length limit.
#
# Why the tier exists. The tier about the epic judges the whole: while the epic holds tasks, a turn
# does not end. It says nothing about a turn inside one task — the epic may hold a single task, and
# the work inside it breaks off in the middle all the same. The stage tier next to it reads the
# «Verified by» command of a stage declared closed, and a stage nobody declared closed it does not
# touch either.
rt_te_steps_reason() {
    printf '%s' "BLOCKED by turn-exit-guard: ${1} steps of the plan are not done, and the turn ends without the word of the owner about stopping.

The step going on right now: ${2:-none is marked as going on}

Work is not finished while the plan holds steps that are not done. A turn that did work and then reported is no exception: the report ends the account, not the work.

The steps are listed in the progress and counted by «npm run check:work-steps»; the plan holds the same list and is not edited.

Do them in this same turn. Lawful exits stay as they were: a question to the owner through the tool, a refusal of another guard, a session handover, and the owner's own word about stopping — the guard reads that word from them, not from a retelling."
}

# The tier itself: the steps of the plan are not done. It lies here and not in the guard for the
# same reason as the text above — the guard stands at its length limit. The tier judges the
# progress of the current task and says nothing about the epic: the tier next to it does that.
rt_te_steps_deny() {
    _steps_left="$(rt_te_steps_left "$1" 2>/dev/null)" || return 0
    [ "${_steps_left:-0}" -gt 0 ] 2>/dev/null || return 0
    rt_te_deny "$(rt_te_steps_reason "$_steps_left" "$(rt_te_step_now "$1")")" "${_steps_left} steps of the plan are not done."
}
