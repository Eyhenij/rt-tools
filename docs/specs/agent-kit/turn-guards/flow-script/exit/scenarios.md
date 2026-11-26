# Scenarios: the guard of the exits of a turn

A subdomain of the task flow as an executable scenario. Here are the scenarios of the verdict at
the end of a turn and of its release cases.

### SC-AK-1427 — the end of the scenario releases the turn

Given the measurer of the end of the epic met
When the release cases are read
Then the turn is released as the end of the scenario

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1428 — outside an epic, exit 10 releases the turn

Given a copy outside an epic whose branch handed its work over by a request, and the same copy without a request
When the release cases are read
Then the first is released as the end of the scenario and the second is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1912 — a stop word of the owner releases the turn

Given a session that wrote, and the owner's last word «Стоп, на сегодня хватит», «хватит останавливаться, продолжай» or «Стой, не туда — делай RT-12»
When the hook on Stop reads the turn, and the release cases are read
Then the first is released as «a stop word of the owner», and the other two are held: one asks to go on, the other orders work
And «стоп» in the running stage with a step not done releases the turn
And «стоп» lifts the CI hold: a fresh head with no run, a red run and a running one with no watch
And the text of the model hook on Stop lets the turn end on a word to stop

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-2010 — the owner's stop holds until a working order

Given the owner's words of a record in order: typed, queued, Esc, a menu answer, the text of a refused call
When the measure reads them by the transitions
Then Esc, a stop word at the opening of a message, «не двигайся» and «остановить работу» anywhere in it, and `/stop` from the queue set the stop
And «хватит тупить, чини», «подожди CI и вливай», «вливай и подожди CI» and «вливай, не жди CI» do not set it
And a message within two seconds after the mark of Esc is judged alone
And a question, swearing, «пиши инцидент», «не вливай пока», «без предпочтения», a notice and a message of another session leave it standing
And a working order, a choice of work in a menu and «Одобряю план» lift it
And «отправь отчёт об инциденте в приёмник, затем продолжай работу» lifts it: the order stands in a part of its own

Covered: `projects/agent-kit/tests/turn-exit-guard-stop.test.sh`.

### SC-AK-2013 — the checks at the end of a turn release it while the owner's stop stands

Given a turn the draft check, the conscience check or the cargo mark check would refuse
When the owner's last words are «стоп» and a question
Then the check releases the turn
And after «стоп», then «продолжай» it refuses as before

Covered: `tools/tests/git-guard-draft-ready.test.sh`, `projects/agent-kit/tests/conscience-guard.test.sh`, `projects/agent-kit/tests/cargo-mark-guard.test.sh`.

### SC-AK-1839 — Esc releases the turn until the owner writes again

Given the mark of Esc with and without a tool call, and the owner's last word «стоп», «Стоп, на сегодня хватит», «не сейчас» or «подожди»
When the interrupt is measured, and the release cases are read for a session that wrote
Then only the mark of Esc is an interrupt, and it releases the turn as «the owner interrupted the turn»
And through the hook after a write the mark of Esc is released
And after Esc neither a red run nor a running one with no watch holds the stop, and a new word of the owner brings the hold back
And a message typed mid-turn, kept as a queued command from a person, is the owner's word, and after Esc it holds the turn again; a queued notice of a task or a wrapper is no word
And a mark of Esc a second and a half or a minute after a typed order releases the turn
And a pasted text queued after Esc is a word and holds the turn again, and a wrapper of a shell or a command after Esc is none
And the pattern of the owner's words in the model hook on Stop takes the mark of Esc from a record of the owner and not from a request blob that repeats it next to a newer word
And that hook reads an order sent a second before the mark as stopped by it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1432 — a session without a write releases the turn

Given a session that only read and searched, one that edited a file and one that committed
When the write is measured and the release cases are read for the first
Then only the first wrote nothing, and its turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1433 — a session without a write after «ну что там?» holds the turn

Given a session without a write and the owner's last word «ну что там?»
When the release cases are read
Then the push is measured and the turn is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1440 — a branch outside the scenario releases the turn

Given a branch outside the scenario on which the session wrote
When the release cases are read
Then the turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1465 — a branch outside the scenario releases the turn after a push of the owner

Given a branch outside the scenario and the owner's last word pushing the work on
When the release cases are read
Then the turn is released: the engine has no next step to name

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1434 — a role session releases the turn

Given a role whose header names no edit tool, and a role with Edit
When the role is measured, and the hook is called for the first after a write
Then the first is a role session and its turn is released; the second is not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1435 — the silent hosting releases the turn with its reason

Given a measurement that stopped on the silent hosting, and one that stopped on an unmet local exit after a silent read
When the release cases are read
Then the first is released as the silent hosting and the second is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1444 — a menu of a refusal lost a second time in a row releases the turn

Given two refusals naming the menu, each followed by a menu that was not answered; one such refusal; and a second menu answered
When the lost menu is measured
Then only the first is lost, and its turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1436 — a failed engine releases the turn and writes the journal

Given an engine that exits with an error
When the hook is called after a write
Then the turn is released and the journal holds «движок упал»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1437 — an engine past its limit gives the same outcome

Given an engine that runs longer than the limit
When the hook is called
Then the turn is released and a second line «движок упал» is in the journal

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1438 — an engine that cannot be called gives the same outcome

Given a path to an engine that does not exist, and a Stop branch the dispatcher stops at its limit
When the hook and the dispatcher are called
Then both release the turn and write «движок упал»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-1464 — after a failure of the engine the next turn starts with a line about it

Given a journal holding «движок упал» written by a Stop branch the dispatcher stopped at its limit
When the owner's next prompt is dispatched, and the one after it
Then the first carries a line about the failure, and the second does not

Covered: `projects/agent-kit/tests/dispatch.test.sh`, `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1439 — the eighth refusal in a row is written to the journal

Given a branch whose scenario is not over
When the hook holds the turn eight times in a row
Then the journal holds one line about the eighth refusal

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1442 — a step another check forbids makes the refusal name the menu about that check

Given two refusals of calls by one guard for one reason, a write between two refusals, and two reasons
When the forbidden step is measured and the turn is held
Then only the first is forbidden, and the refusal names the guard and the menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1443 — a blocked task leaves the work to the next unblocked one

Given the owner's menu
When the refusal is read
Then it says that a deferral takes the next unblocked task

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1842 — the stuck and idle menu asks for a way, not for a stop

Given a held turn on the branch of task 7 refused twice by another check, an idle stop after refusals of the engine and of the model check, and the options without a task
When the menu is named
Then it carries «отложить RT-7» and «подскажу путь» and no «стоп»; without a task the first stays «отложить RT-N»
And the refusal says the way goes into the free field of the same menu, and names what follows a bare «подскажу путь»
And the text of the menu hook lets one question with a free field through after a bare «подскажу путь»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1930 — before the boundary of an autonomous session the default takes the place of the menu

Given a held turn whose next move is the owner's menu, and a newest morning list whose head carries «Автономно до:» with a moment ahead
When the refusal is named
Then it names the boundary, the default of the rule `autonomous-work` and that list, and no menu and no option of it
And it still names the check that refused the step twice
And an idle stop is told its step, and a step refused twice is not called again
And the default tells work that waits for an outside step or a guard's window, whose card and branch stay, from stopped work, whose card goes back
And a passed boundary, a boundary in words, a moment the clock does not have, a row of the table quoting the line, an older list, a list that cannot be read or no list gives the menu
And a step of the scenario, an unread or hung background task and a refusal of another stop hook are named as by day

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-exit-guard-night.test.sh`.

### SC-AK-1931 — the head of a new night does not live by the past one

Given the block of the command `/night` that starts the morning list, and lists of past nights on disk
When it is run by bash or by zsh, from the root or from a subdirectory
Then a list whose boundary lies ahead is continued: run unfilled, its head stays; run with the owner's new words, its head is rewritten and its rows stay
And a list with a passed boundary, with none or with one the guards cannot read gives a new one with this night's boundary and words; the old one is put aside, not erased, where it would stand newer
And quotes, several lines and a substitution in the words, and a missing directory, break nothing
And a boundary that is no moment ahead or a value left unfilled starts no list and is named, and a failed write is not called done

Covered: `projects/agent-kit/tests/turn-exit-guard-night.test.sh`.

### SC-AK-1467 — an option of the menu is the owner's word and releases no turn

Given the owner chose «подскажу путь» in the menu
When the owner's word and the interrupt are read
Then the word is «подскажу путь», and it is no interrupt

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1468 — the option «отложить RT-N» lets the deferral mark be set

Given the owner chose «отложить RT-7», and a last word «ок»
When the plan of the epic is edited to mark RT-7 «отложено»
Then the first edit passes and the second is refused

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1701 — a stop with no call after a refusal names the owner's menu

Given a refusal of a stop that named a move, and a second stop with no call after it
When the hook on Stop measures the session
Then the session is idle, and the refusal names the owner's menu; a call after the refusal or a first stop is no idle

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1554 — the engine measures the copy of the session

Given the main checkout on a task branch with open work, and a session that wrote in a worktree
When the hook on Stop gets the directory of that worktree in the field `cwd`
Then a worktree on a branch outside the scenario releases the turn, though the main checkout holds
And a worktree whose branch does not carry the engine is not judged and writes nothing to the journal
And a role is read from the agents of the worktree

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1555 — a write is recognised past the variables and the options of git

Given commands `NAME=x git commit`, `git -c key=value -C dir commit` and `sed -i`
When the measurer of a write reads the session
Then each is a write, and `sed -n` is not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1759 — the session source names the start and the end of a background task

Given a record with a command sent to the background, an asynchronous agent, a notice of a task with a final status and a call that stops a task
When the session source reads the events of the record
Then each start is an event with the call, the task and the time, and each end names the call or the task
And a plain call, a refused start, a monitor and a notice with no final status are neither
And a stop summary with no refusal is the event of an ended turn
And a turn the agent closed is ended once a word of the owner or a new call follows it
And it is not ended when the feedback of a stop hook follows, when only service entries of the harness do, or when nothing does
And an agent a message resumed is a start again, and its notice «is waiting on its own background work» is no end
And an entry of a subagent gives no event, and a meta entry of a hook ends no turn
And a notice that names several tasks ends each of them

Covered: `projects/agent-kit/tests/task-flow-script-session.test.sh`.

### SC-AK-1760 — the session record is read by pieces

Given a record whose line is longer than a piece
When the lines are read by pieces of seven bytes and by one piece larger than the file
Then both give the same lines, and a line break at the end adds no line
And the source of the records reads its entries by the same reader

Covered: `projects/agent-kit/tests/task-flow-script-session.test.sh`.

### SC-AK-1761 — a stop with a background task of the session running is released

Given a session that wrote to the tree and started a background task three minutes ago
When the hook on Stop measures the session
Then the session waits, and the turn is released by the case of a background task
And a task that ended, by its call or by its task, is no wait; one task of two still running is
And the interrupt of the owner by Esc is asked before the case
And the hook writes the release to the journal
And an end written before its start leaves no task running, and a late copy of the notice of a former run does not end a resumed agent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1762 — a background task past the bound releases nothing

Given a background task started ninety-one minutes ago, or one with no time of its start
When the hook on Stop measures the session
Then the session does not wait, and the turn that wrote is held; at fifty-eight minutes it waits
And the bound is ninety minutes
And a turn that ended on the task spends it: a second stop with no call is held, and a call makes the task fresh
And a refused stop does not spend the task
And two running tasks release two stops, and the end of one gives its stop back
And a turn that ended while the notice of one of two tasks stood in the queue left the stop of the other whole; after the delivery the next ended turn takes it
And a task whose start is stamped ahead of the clock is no wait

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/background-delivery.test.sh`.

### SC-AK-1838 — a background task past the bound is hung, and the hold names it

Given a session that wrote and started a background task ninety-five minutes ago with no notice
When the hung task is measured and the turn is held in the running stage
Then the task is hung with its number, its ninety-five minutes and its output file
And the hold names the task, its minutes and its output, and offers no owner's menu
And after a refusal of a stop the hung task comes before the idle stop, and a step another check refused twice comes before the hung task
And a task of fifty-eight minutes, or one that ended, is not hung
And an agent of a hundred and five minutes is neither hung nor a wait

Covered: `projects/agent-kit/tests/turn-exit-guard-wait.test.sh`.

### SC-AK-1840 — a watch of a CI run is a wait, a server is not

Given a background watch of a CI run, the servers `serve:stand`, `storybook:ui-kit-v2` and `nx serve`, and a showcase build `build-storybook`
When the wait is measured five minutes after each start
Then the watch and the showcase build are waits, and each server is no wait
And a script `serve:db` or `serve:auth` whose body runs `docker compose up -d` is a wait, alone and chained before a check
And a stand raised in the background before a test run, and a search that names a server, are waits; a server as the last part, after a variable, a `cd` or before a pipe, is none
And a bare `sleep` with an `echo` is no wait and not hung, and a pause before a test run is a wait
And a server two hundred minutes old is not hung
And a watch of a CI run that lifts the CI hold also releases the stop as a wait

Covered: `projects/agent-kit/tests/turn-exit-guard-wait.test.sh`, `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1841 — a read notice with no step holds the stop and names the step

Given a session that wrote, started a background task, got its notice and read its output file
When the hook on Stop measures the session in the running stage
Then the session neither waits nor has an unread task, the stop is held, and the hold names the next step
And the text of the model hook on Stop lets a turn end while a background task of the session still runs

Covered: `projects/agent-kit/tests/turn-exit-guard-wait.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1763 — a waiting stop after a refusal names no owner's menu

Given a refusal of a stop and a second stop with no call, while a background task of the session runs
When the hook on Stop measures the session
Then the session is not idle, and the refusal names no owner's menu, spent task or fresh

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1764 — a stop in the state that sends work to the background is held

Given a session that waits for a background task, on a branch whose exit 10 is met
When the release cases are asked
Then the case of a background task is not met, and the turn is held
And a hosting that does not answer about the PR does not hold the wait

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1765 — the forecast lets a waiting stop go and names the longest run

Given recorded sessions that wrote and stopped: with a background task running, twice on one task, with the task over, and with a task started two hours before the stop
When the forecast replays them
Then the first stop is released, and the second on the same task, the stop after the end and the stop past the bound are held
And the line names the longest run of held stops in a row, which a word of the owner and a released stop break

Covered: `projects/agent-kit/tests/task-flow-script-forecast.test.sh`.

### SC-AK-1797 — an unread background task is the first move, not the owner's menu

Given a background task of the session whose notice ended it after the last call, and a refusal of a stop
When the hook on Stop measures the session
Then the stop is not idle, and the refusal names the task and its output file and offers no owner's menu
And for an agent the refusal names its report in the notice, not the file of its transcript
And the refusal still names the next step of the state
And the menu of a step another check forbids is not offered over it either
And the first call or menu after the notice reads it, and a late copy of the notice does not make it unread again
And the forecast takes a named unread task for a move, not for the menu
And a task the session stopped itself, one the harness killed, or one with no start in the record holds nothing
And a late copy of the notice of a former run does not end the run a message resumed
And a task running past the bound is not unread, and a stop with no call after a refusal is idle
And a refusal with no unread task still names the menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/task-flow-script-session.test.sh`, `projects/agent-kit/tests/task-flow-script-forecast.test.sh`.

### SC-AK-1833 — a step that fails twice on a taken-apart folder: the revert move and its number

Given a taken-apart task folder and a done step that does not match on either run before the PR
When the final rerun runs
Then it names the step and the move `git revert --no-edit <the commit that took the folder apart>`
When the turn is held in the running stage
Then the refusal names that step by its number with the command that measures it and the same move, and no `step N.M`
When the folder is brought back by that move and the turn is held again
Then the refusal names the same step by its number
And the refusal of the PR opening names the command of each unmatched step by its number
And a step the plan names and the progress lacks is the one the stage waits for

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1830 — a refusal of a stop names the hook that refused

Given refusals of a stop: «BLOCKED by <name>» at the start of the line or after the opening of the model check, that opening with no name, and a line with neither
When the record is read
Then the first two name their hook, the third names the model check, and the last names none
And a name below the first line is not taken
And a refusal of the model check that quotes another hook further in its text is the model check's

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1831 — a stop after a refusal of the draft check names it, not the menu

Given a write, then a refusal of a stop by the draft check, and no background task
When the executor stops again with no call
Then the stop is no idle one
And the refusal names the draft check and the next step, with no owner's menu
And refusals of the draft check and of the model check in one stop are both named

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1832 — a stop after a refusal of the engine itself is still idle

Given a write, then a refusal of a stop by the engine, or a refusal that names no hook
When the executor stops again with no call
Then the stop is idle, as before

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1836 — refusals of the engine and of the model check in one stop give the menu

Given a write, then refusals of one stop by the engine and by the model check
When the executor stops again with no call
Then the stop is idle, and the refusal names the owner's menu
And a refusal of the engine before the last call is not counted
And a stop with no call after the hold that named a foreign refusal is idle: the engine refused it

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1837 — a refusal of the model check with no name is no idle one

Given a write, then a refusal of a stop with the opening of the model check and no name
When the executor stops again with no call
Then the stop is no idle one, and the refusal names the model check
And a refusal with neither a name nor that opening is idle, as before

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.
