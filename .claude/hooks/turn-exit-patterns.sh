#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/turn-exit-patterns.sh · d38860be2a96 · правится надстройкой, не здесь
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
wait_re='gh[[:space:]]+(run[[:space:]]+watch|pr[[:space:]]+checks[^|]*--watch)|until[[:space:]].*sleep|while[[:space:]].*sleep|^[[:space:]]*sleep[[:space:]]'

# Handing work over and starting the next. The rule calls handed-over work a lawful end of a turn —
# but on a condition: the next one is started, and an ACTION has been done on it, not spoken.
handover_re='gh[[:space:]]+pr[[:space:]]+create'
started_re='task:new|task:move|board\.mjs[[:space:]]+move|git[[:space:]]+checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|git[[:space:]]+switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c'
