# Scenarios — the guards of the end of a turn

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-95 — a turn with an admission of a miss does not close without a record

Given an admission of a miss sounded in the turn, and no record about an incident appeared in the
tree
When the turn ends
Then the guard refuses it and names the directory of the records

Covered: `projects/agent-kit/tests/postmortem-guard.test.sh`.

### SC-AK-797 — the directory of the records is named by the setting of the tree

Given the tree took the directory of the analyses out of history and named it by the key
`postmortems` in the setting
When a turn with an admission of a miss ends without a record
Then the guard refuses it — it takes the directory from the setting, not from the former default

A key named empty lifts the requirement: that is a refusal of the tree of it, and the setting says
here the same as an environment variable. The variable beats the setting — it is a bypass for one
launch.

Covered: `projects/agent-kit/tests/postmortem-guard.test.sh`.

### SC-AK-96 — the record appeared, and the turn closes

Given an admission of a miss sounded in the turn and a file appeared in the directory of the records
When the turn ends
Then the guard lets the end through

Covered: `projects/agent-kit/tests/postmortem-guard.test.sh`.

### SC-AK-97 — a turn with a question to the owner is refused before the question is sent

Given neither the laws nor the rules were read during the turn
When the executor calls the tool of a question to the owner
Then the guard refuses the call, and the question does not go to the owner

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-98 — a question in prose is still caught at the end of the turn

Given neither the laws nor the rules were read during the turn, and the question is asked in prose
When the turn ends
Then the guard refuses it: a question in prose is not a tool

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-199 — a turn with a request for a proposal does not close without a sending

Given the owner said to create or send a proposal to the rules layer, and there was no sending in
the turn
When the turn ends
Then the guard refuses it and names the command of the sending

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-200 — a sending in the same turn lifts the requirement

Given the command of the sending was called in the same turn without a dry run
When the turn ends
Then the guard lets the end through, and a dry run lifts no requirement

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-674 — the refusal names a command executable in this tree

Given the package stands as a dependency — the binary lies in the dependencies of the tree
When the guard refuses the turn
Then the refusal names the call through the binary of the dependencies

Given the package lives in the tree as sources — there is no binary, and there is a built entry
When the guard refuses the turn
Then the refusal names the call of the built entry, not of a binary that is not in the tree

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-201 — work on proposals that already arrived gets no requirement

Given the owner said to take the proposals apart, not to send them
When the turn ends
Then the guard lets the end through: there is no verb of sending in the request

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-246 — a turn that opened a PR and did not take the next task does not close

Given a call of opening a PR was made in the turn, and there is not a single other command in it
When the turn ends
Then the guard of waiting refuses it: the work is handed in for review, and the next one is not
begun

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-247 — the first action on the next task lifts the requirement

Given in the same turn the opening of the PR is followed by the creating of a task, a branch or a
task folder
When the turn ends
Then the guard of waiting stays silent: the waiting is taken by work, not by a look at the run

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-812 — a step of closing the work does not count as taking the next task

Given in the same turn the opening of the PR is followed by moving the task being closed into the
column of the review or removing its folder
When the turn ends
Then the guard of waiting refuses it: both are mandatory steps of closing the work, and the next
task was not taken by them

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-248 — a turn in which nothing is said about someone else's step the guard of waiting does not judge

Given there is neither a call of opening a PR nor a red run read in the turn
When the turn ends
Then the guard stays silent: an empty turn is indistinguishable from a turn that had nothing to do

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-262 — a red run that was read is judged on a par with an opened PR

Given a red run was read in the turn and not a single action was done on the next task
When the turn ends
Then the guard refuses it: the red is fixed, but a turn in which it was read and nothing was done is
the same emptiness as a turn with an opened PR

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-263 — a green run and a reading without a red answer the guard does not judge

Given a run was read in the turn, and its answer is not red
When the turn ends
Then the guard stays silent: after a green run comes work of its own — the tidying and the lifting
of the draft — not someone else's step; a red word without a reading of the run is no sign either,
the guard judges the pair

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-433 — the thresholds of the guard and the thresholds of the squeeze are read from one setting

Given the size of the window, both shares of the guard and the pair of the squeeze are declared in
the setting of the agent
When the thresholds are read
Then all five numbers arrive together, not one at a time from two places

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-434 — the pairs that drifted apart are each named by a line of their own

Given the guard has a window of a million and a stop at a half, and the squeeze has a window twice
as small and a share of 92 per cent
When the pairs are checked
Then there are two divergences — by the size of the window and by the share — and at each of them
the numbers of both sides are named

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-475 — the guard reminds before the threshold of the squeeze

Given the filling of the window reached the share of the reminder and has not yet reached the
threshold of the squeeze
When any action goes
Then the guard reminds to choose a point of stopping and does not refuse the work

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-476 — between the threshold of the squeeze and the threshold of the stop the guard does not refuse the work

Given the filling of the window passed the threshold of the squeeze but has not reached the
threshold of the stop
When any action goes
Then the guard lets it through: this is the margin in which the client squeezes the context

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-477 — after the threshold of the stop the guard refuses as before

Given the filling of the window reached the threshold of the stop, and there was no squeeze after
all
When an action goes that does not belong to closing the session
Then the guard refuses it and names what passes after the threshold

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-583 — handed-in work is brought to a lifted draft

Given a request was opened in the turn and the next task was taken, and the state of the handed-in
work was not asked
When the guard of waiting judges the end of the turn
Then the turn is given back; a lifted draft and the check of the work queue lift the requirement

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-591 — a written plan does not let the turn go

Given the work is in the state of a written plan, and the task, the branch, the column and the
folder were created during the turn
When the guard judges the end of the turn
Then the turn is refused: the preparation for the work does not count as a step of the first stage

### SC-AK-592 — the refusal names the first stage of the plan

Given the work is in the state of a written plan, and the plan has its first stage named by a
heading
When the guard refuses the end of the turn
Then the heading of the first stage stands in the refusal, not general words about unfinished work

### SC-AK-880 — work that reached the handing in does not let the turn go

Given the work is in the state of stages that have ended or of a folder taken apart, and no request
was opened during the turn
When the guard judges the end of the turn
Then the turn is refused and the refusal names the mandatory action of the state: the edit lies in a
branch the owner does not see, and the former state they read as work not done

Given by the same turn a request was opened and the next work was begun, or the owner said to stop
When the guard judges the end of the turn
Then the turn is let go: the lawful exits are not locked by a state

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-911 — the guard reads the English keys of the progress of the work and of the plan

Given the progress of the work names the state by the line "- **State:** `замысел-записан`", and
the plan carries the stages by headings "## Stages" When the turn ends Then the guard does not let
it go and names the first stage of the English plan; a stage in progress declared by an English key
lets the turn go

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-593 — a begun stage is judged by the former sign

Given the work is in the state of a stage in progress and there is an edit of the tree during this
turn
When the guard judges the end of the turn
Then the turn is let go: the branch of the written plan does not extend to the other states

### SC-AK-775 — a path to a file orders no work

Given the last remark of the owner is one path to a file, and application code was edited during the
turn
When the guard of the start of work judges the end of the turn
Then the turn is refused, and the refusal names the edited file and what the remark was

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-776 — a request of the owner lets the turn go

Given the remark of the owner asks to finish the work, and application code was edited during the
turn
When the guard judges the end of the turn
Then the turn is let go: the work was ordered in this same turn

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-777 — one word is never a request

Given the remark of the owner is of one word, and application code was edited during the turn
When the guard judges the end of the turn
Then the turn is refused: a request is caught by its shape, and one word is never one under any
reading

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-778 — what is judged is application code, not every edit

Given the remark carries no request, and during the turn only texts were edited or nothing was
edited
When the guard judges the end of the turn
Then the turn is let go: the exploration and the editing of texts go before the request, and
demanding the word of the owner at them would mean forbidding the analysis

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-779 — an interruption of the owner is never a request

Given the last remark is a service mark about an interruption, and application code was edited
during the turn
When the guard judges the end of the turn
Then the turn is refused: there is no request of their own in the mark

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-780 — the guard lets the work go when there is nothing to judge by

Given a second pass over the same turn, a missing record of the turn or a tree that declared no sign
of application code
When the guard judges the end of the turn
Then the turn is let go: a broken guard has no right to jam the work

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-781 — what is judged is the last turn, not the whole record

Given the code was edited a turn earlier, and there are no edits of code in the last turn
When the guard judges the end of the turn
Then the turn is let go: the guard judges one turn, and a past edit does not refuse it

Covered: `projects/agent-kit/tests/work-start-guard.test.sh`.

### SC-AK-816 — a squeeze summary is never a request of the owner

Given a squeeze summary retelling a former request of the owner lies in the record of the turn
When the guard looks for the last remark of the owner
Then the summary does not count as a remark, and the turn is not refused by its retelling

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-818 — the owner has already answered this question

Given the owner gave an instruction by a remark, and a call of a menu of questions was already in
the record of the turn
When the executor sends a menu whose topic overlaps with this remark by significant words
Then the call is refused, and the refusal orders to go on with the work, not to ask differently

Given the topic of the new menu does not reach the shared significant words with the remark of the
owner
When the executor sends this menu
Then the call passes: the analysis of a request goes by questions about different subjects

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-840 — a request to the owner to sign in or type a password does not close the turn

Given a request to type a password, to sign in themselves or to fill the sign-in form stands in the
answer of the executor
When the guard checks the end of the turn
Then the turn does not end, and the refusal lists how to remove the obstacle on one's own: the
substitution of the value by the tool of the form, switching off the extension in the way, a stand at
another address, a pair from the seeding

Covered: `projects/agent-kit/tests/stand-login-guard.test.sh`.

### SC-AK-841 — a request to switch the mode of work is allowed

Given in the answer the executor asks for the ordinary mode of work instead of the automatic one,
and does the input themselves
When the guard checks the end of the turn
Then the turn ends: the guard tells "switch the mode" from "type it for me". A report about a
sign-in that was done and ordinary work pass too

Covered: `projects/agent-kit/tests/stand-login-guard.test.sh`.

### SC-AK-883 — a question that came back in prose after a refusal of the guard of the conversation

Given during the turn the guard of the conversation refused a question to the owner, and the answer
of the executor ends with a question in prose
When the guard judges the end of the turn
Then the turn is refused: the guard of the conversation judges a call of the tool of a question and
does not see prose, and the refused question came back with the same wording a line later

Given there was no refusal of the guard of the conversation during the turn, or the answer does not
end with a question
When the guard judges the end of the turn
Then the turn is judged by the former signs

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-891 — a turn that ended with waiting for the word of the owner

Given there was an edit during the turn, and the last text of the executor ends with the words
"waiting for your word"
When the guard judges the end of the turn
Then the turn is refused, and the refusal names the phrase a stop declared by the executor

Given the same phrase, and during this turn the owner said to stop, or a question was asked of them
by a tool
When the guard judges the end of the turn
Then the turn is let go: the word about the stop came from the owner

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1066 — a turn whose last action is a background run of the checks

Given a stage is going, and the last action of the turn is a run of the checks in the background
When the guard judges the end of the turn
Then the turn is refused: a run started in the background and left last is a declared wait

Given the same run in the middle of the turn, with a step of the executor's after it
When the guard judges the end of the turn
Then the turn is let go

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1067 — a turn whose last action is a read of a background task's log

Given a stage is going, and the last action of the turn is a read of the output file of a
background task
When the guard judges the end of the turn
Then the turn is refused: nothing of the tree is changed by such a read

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1068 — a turn that ended with a promise to do the work in the next turn

Given there was an edit during the turn, and the last text of the executor promises to do the rest
in the next turn
When the guard judges the end of the turn
Then the turn is refused, and the refusal names the promise an announcement of intent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1069 — a turn whose last action is taking a task

Given a stage is going, and the last action of the turn is creating a task, a branch or a move of
the column
When the guard judges the end of the turn
Then the turn is refused: taking a task is preparation, and the work of the taken task did not begin

Given the same taking with a handed-over PR in the same turn
When the guard judges the end of the turn
Then the turn is let go: the taking answers for the handed-over work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1070 — a turn that ended with waiting for the owner under their own standing word to work

Given during the session the owner said to work without stops and did not cancel it, and the turn
ends with waiting for their word
When the guard judges the end of the turn
Then the turn is refused whether or not there was work in it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.
