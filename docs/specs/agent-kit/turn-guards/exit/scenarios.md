# Scenarios: the guard of the exits of a turn

A subdomain of the domain "The guards of the end of a turn". Here are the scenarios of one guard —
the one that judges the end of a turn: what a turn lawfully ends with, what is never its end and
which tiers name the kind of the stop by name. The other guards of the end of a turn are in the list
of the scenarios of the domain next to it.

### SC-AK-647 — handing in the work without beginning the next one does not end the turn

Given a request was opened over the turn, and nothing was done on the next work
When the guard of the exits judges the end of the turn
Then the turn is given back: the handing in ends the past work, not the turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-648 — a created next task releases the turn

Given the command of creating a task was called after the opening of the request
When the guard of the exits judges the end of the turn
Then the turn passes: on the next work an action was done, not said

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-649 — a created branch of the next work releases the turn

Given the branch of the next task was created after the opening of the request
When the guard of the exits judges the end of the turn
Then the turn passes: creating the branch is the first step on the next work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-650 — a turn without an opening of a request is not judged by this tier

Given no request was opened over the turn
When the guard of the exits judges the end of the turn
Then the tier of the handing in stays silent: there is nothing to judge, the former signs work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-651 — the refusal about the handing in names the command of creating the next one

Given the turn ended with the opening of a request
When the guard of the exits refuses the end of the turn
Then the refusal names the command the next work is created by

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-652 — there was work, and the last action became a reading — the turn does not end

Given there was a commit over the turn, and the last command became a reading of the history
When the guard of the exits judges the end of the turn
Then the turn is given back: the last action of a turn is only ever work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-653 — a turn that ended with an edit of a file is released

Given there was a reading over the turn, and the last action became an edit of a file
When the guard of the exits judges the end of the turn
Then the turn passes: the work stands last

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-654 — creating a branch does not count as exploration

Given the last action of the turn became the creating of the branch of the next work
When the guard of the exits judges the end of the turn
Then the turn passes: creating a branch changes the tree, unlike switching to it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-655 — switching to a branch stays exploration

Given there was a commit over the turn, and the last command became a switch to another branch
When the guard of the exits judges the end of the turn
Then the turn is given back: a switch is a preparation, not work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-296 — a turn in which nothing was done on the work does not close

Given the work stands in a state it is moved from by the executor
When the turn ends, and over it there was neither an edit nor a command changing the tree
Then the guard gives the turn back and names the next step from the progress of the work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-297 — an edit of a file releases the turn

Given a file was edited over the turn
When the turn ends
Then the guard stays silent: the work went on

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-298 — a command changing the tree releases the turn

Given a command changing the tree or its state went over the turn
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-299 — a question to the owner releases the turn

Given a question was put to the owner over the turn by the tool of asking
When the turn ends
Then the guard stays silent: a question is a lawful exit of a turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-300 — a refusal of a guard ends the turn

Given an edit was refused by a guard over the turn
When the turn ends
Then the guard stays silent: a refused edit is either done after the condition is met or not done at
all

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-301 — a written handover of a session ends the turn

Given the handover of the session was written over the turn
When the turn ends
Then the guard stays silent: the window has ended, and this is a lawful exit

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-302 — a stop said by the owner releases the turn

Given the owner said to stop by their own remark
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-303 — a stop declared by the executor does not release the turn

Given the stop was said by the executor themselves, and the owner did not
When the turn ends
Then the guard gives the turn back: the stop would be declared by whoever finds it convenient in
that minute

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-304 — at handed-in work the turn closes

Given the work is declared handed in
When the turn ends
Then the guard stays silent: further on it is moved by the owner

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-305 — at merged work the turn closes

Given the work is declared merged
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-306 — a repeated pass over the same turn is not judged

Given the guard already refused this turn
When the turn ends again
Then the guard stays silent: otherwise the turn would never end

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-307 — work without a progress of the work is not judged

Given there is no task folder under the name of the branch
When the turn ends
Then the guard stays silent: there is nowhere to declare the state, and nothing to refuse for

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-308 — a progress of the work without a declared state is not judged

Given the progress of the work lies there, and there is no line of the state in it
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-309 — a closed stage without the command of the check does not close the turn

Given the number of the stage in the progress of the work grew against what lies in the history of
the branch
When the turn ends, and the command this stage is checked by was not run over it
Then the guard gives the turn back and names the commands that were not run

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-310 — a run command of the check releases the turn

Given the number of the stage grew, and the command of its check was run over the turn
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-311 — at an unchanged number of the stage the command of the check is not asked about

Given the number of the stage in the progress of the work did not change
When the turn ends
Then the guard does not ask about the check: there is nothing to confirm

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-625 — a taken work without a task folder does not end the turn

Given the branch under the number of the task is created, and there is no directory of the task at
it in the tree
When the guard of the exits judges the end of the turn
Then the turn is given back: the work is declared taken and not begun by a single line

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-626 — moving the column does not make the taken work a beginning

Given the command of moving the task into the column of the work was called over the turn, and there
is no directory of the task at the branch
When the guard of the exits judges the end of the turn
Then the turn is given back: the commands of creating the work do not count as its beginning

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-627 — a word of the owner about a stop releases taken work too

Given the owner said to stop, and there is no directory of the task at the branch
When the guard of the exits judges the end of the turn
Then the turn passes: the lawful exits of a turn are judged before this tier

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-628 — a gathered task folder lifts the tier

Given the directory of the task at the branch is gathered
When the guard of the exits judges the end of the turn
Then the turn passes: the fullness of the plan is invisible to a machine, and the sign is the
directory

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-629 — a branch without a number of a task is not judged by this tier

Given the name of the branch does not match the sample `<KEY>-<number>-`
When the guard of the exits judges the end of the turn
Then the tier of the taken work stays silent: branches like that are created for a probe too

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-630 — a turn of one switch and one pull does not close

Given over the turn there were only a switch of the branch and a pull of the main one
When the guard of the exits judges the end of the turn
Then the turn is given back: exploration does not count as work, however much of it there was

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-631 — reading the requests by the client of the hosting does not end the turn

Given the list of the open requests was called over the turn and nothing else
When the guard of the exits judges the end of the turn
Then the turn is given back: a reading call of the client of the hosting does not count as work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-632 — a reading mixed together with work releases the turn

Given a compound command put together a switch of the branch and a launch of a check
When the guard of the exits judges the end of the turn
Then the turn passes: the parts of the command are judged one by one, and the part that changes it
stays work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-633 — a reading part does not cancel a commit

Given over the turn there were a reading of the state of the tree and a commit
When the guard of the exits judges the end of the turn
Then the turn passes: nearness to a reading does not stop work from being work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-634 — opening a request does not count as a reading

Given a request was opened as a draft over the turn
When the guard of the exits judges the end of the turn
Then the turn passes: a writing call of the client of the hosting is not in the sample of
exploration

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-639 — a turn that ended with waiting for a run does not close

Given over the turn there were an edit and a push, and the last action became a loop until the run
is ready
When the guard of the exits judges the end of the turn
Then the turn is given back: waiting for someone else's step is never the end of a turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-640 — watching a run is never the end of a turn

Given the last action of the turn became a call of watching a run
When the guard of the exits judges the end of the turn
Then the turn is given back: the work stayed where it stood

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-641 — waiting in the middle of a turn releases the turn

Given the waiting stood in the middle of the turn, and after it there was a commit
When the guard of the exits judges the end of the turn
Then the turn passes: what is judged is the last action, and a launch of work in the background
stays work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-642 — the refusal about the waiting names the next step

Given the turn ended with a waiting, and the next step is written in the progress of the work
When the guard of the exits refuses the end of the turn
Then the refusal names that step: a said "the work is not finished" the executor rereads themselves

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-574 — a removed task folder does not end an empty turn

Given the task folder is removed by a commit of the branch, and over the turn there was neither an
edit nor a command changing the tree
When the guard of the exits judges the end of the turn
Then the turn is given back: a removed folder means the middle of the handing in, not its end

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-575 — at a removed folder the opening of a request releases the turn

Given the task folder is removed by a commit of the branch, and over the turn the client of the
hosting was called about a request
When the guard of the exits judges the end of the turn
Then the turn passes: the work is handed in

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-576 — at a removed folder an edit of the tree releases the turn

Given the task folder is removed by a commit of the branch, and a file was edited over the turn
When the guard of the exits judges the end of the turn
Then the turn passes by the second sign

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-693 — a write into the temporary directory does not count as work

Given the body of a future request was written into the temporary directory of the session over the
turn
When the guard of the exits judges the end of the turn
Then the turn is given back: a write past the working tree does not change it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-694 — a diversion of the error stream does not count as work

Given a command only whose error stream is redirected was called over the turn
When the guard of the exits judges the end of the turn
Then the turn is given back: a diversion of the error stream does not touch the tree

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-695 — a command from the list with a redirection releases the turn as before

Given a command from the list of the work was called over the turn, and its input was given by a
redirection
When the guard of the exits judges the end of the turn
Then the turn passes: it is made work by the command itself, not by the arrow at it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1123 — a service message neither starts a turn nor is a word of the owner

Given a rule was loaded over the turn, and its text carries the word «стоп»; or the feedback of a
stop guard stands in the record
When the guard of the exits judges the end of the turn
Then the turn is counted from the remark of the owner, and the service text releases nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1124 — a refusal of a guard is an exit only as the last action of the turn

Given a guard refused a call in the middle of the turn, and the turn went on with reading
When the guard of the exits judges the end of the turn
Then the turn is given back: the refusal was answered by what followed, and the turn ended with text

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1125 — the word of the owner about a stop in its other forms

Given the owner said «не продолжай», «прекрати» or «не двигайся»
When the guard of the exits judges the end of the turn
Then the turn passes: the word is the owner's

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1126 — a question at the head of an empty turn in a running stage

Given the state is `этап-идёт`, and the turn asked the owner by the tool without a single edit
When the guard of the exits judges the end of the turn
Then the turn is given back and names the parts that do not depend on the answer; after work the
same question releases the turn

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1117 — under an open epic a turn with work and a second pass are judged

Given the table of the epic names unfinished tasks, and the turn ended with an edit, or the guard
judges the same turn for the second time
When the guard of the exits judges the end of the turn
Then the turn is given back, and the refusal names the unfinished tasks; a question after work, a
refusal as the last action and the word of the owner release the turn as before

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1118 — a handover written by hand under an open epic

Given the table of the epic names unfinished tasks, and the turn ran the handover command by hand
When the guard of the exits judges the end of the turn
Then the turn is given back; the refusal of the window guard as the last action releases it

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1119 — a closed or unreadable epic keeps the former behaviour

Given the table of the epic prints nothing, answers with a non-zero code or is absent
When the guard of the exits judges the end of the turn
Then a turn with work, a second pass and a handover by hand are released as before

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1120 — the owner's standing word quoted in the waiting line

Given the waiting line of the progress quotes the owner's word in « », and the epic is open.
When the guard of the exits judges the end of the turn.
Then the turn passes with work and without it. Without a quote the line releases nothing.

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1122 — a refused closing call does not release the turn

Given the last tool result of the turn is the refusal of the guard of the closing tool, and the
epic is open.
When the guard of the exits judges the end of the turn.
Then the turn is not released; the refusal of another guard releases it as before.

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1128 — a branch named by an epic plan is not judged by the tier of the taken task

Given the branch has the shape of a task branch, there is no task folder at it, and a plan in the
plans directory names the branch in its header line
When the guard of the exits judges the end of the turn
Then the tier of the taken task is skipped. A turn with work passes, an empty turn is given back by
the second sign. A plan naming another branch releases nothing.

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.
