# Scenarios — the turn guards and the rules gate

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and the
numbers were not recounted on the move into the subdomain: the number ties a scenario to a test title.

### SC-AK-22 — a question to the owner without reading the rules does not end a turn

Given the rules and the laws were not read during the turn When the turn ends with a reply holding a
question Then the guard gives the turn back to the executor and names what is read before a question

### SC-AK-23 — a rule that was read allows a question

Given a rule was loaded during the same turn When the turn ends with a reply holding a question Then
the guard lets it through

### SC-AK-24 — a search over the rules counts as reading on a par with loading

Given a search over the constitution directory went during the turn, and no rule was loaded When the
turn ends with a reply holding a question Then the guard lets it through

### SC-AK-25 — a repeated pass over the same turn is not judged

Given the guard already gave this turn back once When the turn ends again Then the guard lets it
through

### SC-AK-26 — a broken conversation guard does not stop the work

Given there is no record of the turn in place When the turn ends with a reply holding a question Then
the guard lets it through

### SC-AK-35 — the window guard stays silent up to the reminder threshold

Given the fill of the window is below the reminder threshold When the session makes a tool call Then
the guard stays silent

### SC-AK-36 — at the reminder threshold the session gets a hint

Given the fill of the window is above the reminder threshold and below the stop threshold When a tool
call is finished Then the guard says the share of the fill and orders picking a stopping point

### SC-AK-37 — the reminder repeats by steps

Given the reminder for this step of the fill has already sounded When the next tool call is finished
Then the guard stays silent

### SC-AK-38 — after the stop threshold the work is refused

Given the fill of the window is above the stop threshold When the session edits application code Then
the guard refuses and names what the session is closed by

### SC-AK-39 — closing the session after the stop threshold passes

Given the fill of the window is above the stop threshold When the session edits the course of the
work, writes a handover or calls a delivery command Then the guard lets it through

### SC-AK-40 — a tree without a window size gets no watchman

Given the size of the window is not set in the setting of the tree When the fill of the window is
above any threshold Then the guard lets it through silently

### SC-AK-41 — a broken window guard does not stop the work

Given there is no record of the session in place When the session makes a tool call Then the guard
lets it through

### SC-AK-42 — a guard with two declarations reaches the setting by both

Given a guard declared two events of the agent When the ready piece of the setting is assembled Then
both events are in it, and each calls the dispatcher by its own name: the path of the guard itself
does not stand there — the dispatcher gathers the branches by the declarations in the headers

### SC-AK-88 — the hook says which profile function it is missing

Given the tree profile holds no function the hook calls before any behaviour When the hook fires Then
it names the name of the function and the file it is defined in, instead of leaving silently

Covered: `projects/agent-kit/tests/profile-check.test.sh`.

### SC-AK-89 — what is missing is said once per session

Given there is no profile function, and the hook fired during the session not for the first time When
the hook fires again Then there is no message about what is missing: it was said once

Covered: `projects/agent-kit/tests/profile-check.test.sh`.

### SC-AK-90 — a missing profile function refuses no action

Given there is no profile function, and the hook watches an edit When the edit goes Then the hook lets
it through: it reports its own incompleteness, it does not judge the edit

Covered: `projects/agent-kit/tests/profile-check.test.sh`.

### SC-AK-91 — the state report lists the missing profile functions

Given the hooks calling profile functions are laid out, and part of them the profile does not define
When the report of the state of the layout runs Then it lists the expected functions and names the
undefined ones

Not covered: the output of the state report is not checked by a run — it was checked by running it on
this tree.

### SC-AK-342 — a session with a handover and without the rule leads no edit

Given the first reply of the owner names a session handover, and the rule of conducting work is not
loaded When a file is edited Then the guard refuses the edit and names the four steps of the entry

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-343 — a loaded rule opens the entry

Given the rule of conducting work is loaded during this session When a file is edited Then the guard
stays silent

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-344 — a session without a handover is not judged by the guard

Given the replies of the owner say nothing about a handover When a file is edited Then the guard stays
silent: there is nothing to judge

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-345 — a handover inserted as text is caught too

Given the handover is given not by a path but as text When a file is edited without a loaded rule Then
the guard refuses the edit

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-346 — reading a rule as a file counts on a par with loading

Given the rule was read by a command, not by the rules tool When a file is edited Then the guard stays
silent: the path to the rule is the same

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-929 — a write by a shell command is judged on a par with an edit

Given a session begun from a handover writes a file by a shell command without a loaded rule When the
guard checks the call Then it refuses it; a command that writes nothing passes — the order of entry
begins with reading the tree

Covered: `projects/agent-kit/tests/handoff-entry-guard.test.sh`.

### SC-AK-410 — the refusal names two lawful moves and the shape of a bypass

Given the guard refuses a call, and the refusal has a lawful shape of a bypass When the refusal reaches
the reader Then both lawful moves are named in it — fix what is named or bring the owner the price of a
bypass — and the shape of the bypass itself is named; a refusal without a lawful shape says so outright

Covered: `projects/agent-kit/tests/docs-guard.test.sh`.

### SC-AK-559 — a call with an assignment before the command is judged on a par with a bare one

Given the command is typed with an assignment of an environment variable before the name — the shape
the check of the identity of a call demands When it is judged by a guard that recognises its own call
by the start of the command Then the call is recognised and the subject of the guard is judged; an
assignment with no command name after it does not count as a call, and a mention of the command in
quotes does not become one

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-668 — the word of an interpreter inside the body of a document opens no body

Given a command writes a document as a heredoc body, and the text of the document holds the word
`bash` next to a path under the code directory When the guard takes the paths of the command apart Then
the path from the text does not count as the target of a write: the header of the command is judged,
and the body belongs to the command that opened it

### SC-AK-669 — an interpreter in the header still opens the body

Given a command calls an interpreter, and the path of the write stands in the heredoc body When the
guard takes the paths of the command apart Then the path from the body counts as the target of a write:
code arrives to an interpreter exactly as a body

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-675 — an arrow in the text of a command does not count as a redirection

Given a command prints a table, and its text holds an arrow — `->`, `=>` or the closing bracket of a
markup comment When the guard takes the command apart Then the command is not declared a writing one:
the sign in an arrow is the same as at a write into a file, but in the shell an arrow means nothing

### SC-AK-676 — a markup quote does not count as a write

Given a command prints a line starting with a quote mark and a word in words When the guard takes the
command apart Then the command is not declared a writing one: the target of a real redirection looks
like a path, not like a word

### SC-AK-677 — a real write is visible in every shape of the target

Given a command writes into a file — by a bare name, by a target in quotes, by a target in a variable,
by appending or by the body of a document When the guard takes the command apart Then the command is
declared a writing one: narrowing the target would weaken the guard, had these shapes not been named

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-749 — the target of a write is taken from the command, not from a word in its text

Given a piece of a command writes by a redirection alone, and its text holds the name of a foreign
file — as an argument or as content When the guard takes the command apart Then only the target of the
write is declared a destination path: a name named in the text does not count as an edit of that file,
and a refusal over it ends the turn with nothing to bypass it by. An edit in place, a copy, a move and
an interpreter are taken apart as before: for them the path stands in the command itself and not in one
place

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-750 — a declared action of one's own does not count as work

Given the turn made not a single edit and called not a single command, and named the next action in
words — "next I take", "as the next step", "then I will do" When the waiting guard judges the end of
the turn Then the turn does not close, and the refusal names the declaration itself: the emptiness
behind a promise is visible to nobody. A turn where a call stands behind the same words passes — there
the declaration is said in the course of the work, not instead of it

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-689 — a suite that accumulates a count of checks gives it back by the exit code

Given a scenario suite calls the shared counter of checks and does not call the line of the total When
the resource review walks the suites Then it names that suite by name: its failures affect the colour
of the run in no way

Covered: `projects/agent-kit/tests/syntax.test.sh`.

### SC-AK-703 — an epic plan is read on a par with the laws

Given during the turn a plan outliving one task was read, and no rule was loaded When the turn ends
with a reply holding a question Then the guard lets it through: the decision tying the tasks of an epic
lies there, not in the rules

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-704 — the archive is read on a par with the laws

Given a search over the archive directory went during the turn, and no rule was loaded When the turn
ends with a reply holding a question Then the guard lets it through

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-705 — the hint of the refusal names every directory whose reading it counts

Given the turn ends with a question, and nothing was read during the turn When the guard gives the turn
back Then its hint names both the directory of the plans and the directory of the archive: a refusal
lifted by a search over an incomplete list of directories cost a second refusal in a row

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-710 — the laid-out rules layer is judged on a par with application code

Given a file carrying the layout header is edited, and the branch has no plan When the plan guard
judges the edit Then it refuses: the rules layer is covered by the code paths nowhere, and a hundred
and fifty of its files landed without a single response. The same path without the header stays harness
and gets no demand

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-721 — the task folder is found by the name of the branch

Given the tasks directory holds a folder named by the name of the current branch When the session
starts Then the course of the work travels into the context: the plan and the state arrive before the
first reply

### SC-AK-722 — a folder under another name is named by name

Given there is no folder by the name of the branch, and the tasks directory holds a folder under
another name When the session starts Then the refusal stays a refusal and in addition names the folder
found: the stages of one task go as separate branches at a shared folder, and by the name of the branch
it is not found

### SC-AK-723 — an empty tasks directory is not listed

Given the tasks directory is empty When the session starts Then the refusal is the former one, word for
word: there is nothing to name

Covered: `projects/agent-kit/tests/task-context-load.test.sh`.

### SC-AK-909 — the English "where we stand" section survives the size threshold

Given the course of the work outgrew the size threshold, and the section is headed "## Where we stand"
When the session starts Then the state from that section arrives in the context, and the rest of the
record is trimmed: on a large folder the state itself would otherwise leave the session

Covered: `projects/agent-kit/tests/task-context-load.test.sh`.

### SC-AK-756 — the rule of the area of the work counts as reading the rules

Given during the turn a file was edited for which the rules gate names its own rule, and another one
was read When the turn ends with a question to the owner Then the guard refuses: what was read does not
answer the question asked. The rule of the area — read as a file or loaded — lifts the refusal, and a
turn without edits is judged by the former sign: any reading of the rules layer

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-754 — a task folder taken apart reads as work that is closing

Given the branch itself took the task folder apart by a commit after the common ancestor with main When
the session starts Then the hook says the work is closing and gives no instruction to assemble the
folder anew: the state is held by the request and by the session handover. A branch that created no
folder of its own at all is judged by the former refusal

Covered: `projects/agent-kit/tests/task-context-load.test.sh`.

### SC-AK-910 — the handover is assembled from the English keys of the course of the work

Given the course of the work names the state, the stage and the next step by the lines "- **State:**",
"- **Stage:**" and "- **Next step:**" When the compaction of the context arrives Then all three get
into the handover the same way as from the owner's-language keys

Covered: `projects/agent-kit/tests/handoff-write.test.sh`.

### SC-AK-724 — a file written by a redirection is linted

Given a shell command writes into a code file by a redirection When the edit is applied Then the linter
goes by the written path: a write by the shell changes the same file an edit by a tool does

### SC-AK-725 — a file written by an interpreter is linted

Given the path of the write stands in the body of an interpreter command, not in the line of its call
When the edit is applied Then the linter goes by it too: the sign of a write is read the same way as by
the rules gate

### SC-AK-727 — a directory in a write command is not expanded

Given the write command names a directory too — the working one, not the target of the write When the
edit is applied Then the linter goes only over the written files: an expanded directory would hand it
half the tree

### SC-AK-726 — a read does not call the linter

Given a shell command writes nothing When it has finished Then the hook leaves silently: otherwise the
linter would be run on every search over the tree

Covered: `projects/agent-kit/tests/lint-after-edit.test.sh`.

### SC-AK-728 — the refusal of the window watchman names the shape of the call

Given the stop threshold is passed, and the session does what does not pass after it When the watchman
refuses the call Then the refusal names not only the demand but the shapes that pass, and says that the
command is judged by the start of the line: entering a directory before it removes the match

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-734 — the refusal of the gate names what will be needed further

Given a command writes files of different kinds, and several rules are needed for them When the gate
refuses the call Then it demands one rule, as it demanded, and names those that will be needed further
by this same command: a list of demands would read as "load three", and the length of the path the
session did not see at all

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-735 — half of the conversation guard is declared by a resource of its own

Given the question to the owner is asked by a tool, and the laws and the rules were not read during the
turn When the call goes through the resource declaring this event Then it is refused by the same body
and the same refusal as the closing of a turn; the body is lost — the call is let through, and a tree
whose question tool is taken by a guard of its own cancels one half and keeps the other

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-736 — the agreement is named by a domain spec too

Given the tree writes the agreement straight into a domain spec, and it has no "proposed" directory
When the guard of the course of the work reads the plan Then it accepts a line naming a spec on a par
with a line about a separate document: the named spec must exist, and a plan without both lines is
refused by the former refusal

### SC-AK-737 — the task creation command is not judged by the guard of the course of the work

Given the task creation command carries the body of the task, and it holds a quote and a path to code
When the guard of the course of the work takes the call apart Then it lets it through: it does not
count as an edit of code, while it fits both of its signs whole — and it is refused by the very guard
that prints it in the text of its own refusal. An edit of code by the same shell is refused as before

### SC-AK-879 — removing overstayed records about finished work is not judged by the guard of the course of the work

Given the tree named the removal command in its profile, and the branch brings the work by merges and
holds no task folders When the guard of the course of the work takes the call apart Then it lets the
removal command through whole: the records age by the calendar, and the time check turns red without a
single edit in the branch. The whole command is checked, not an occurrence — a removal in a bundle with
an edit of code is refused, and a tree that named no command behaves as before

### SC-AK-740 — removing an untracked path does not count as an edit of the product

Given a command removes its own temporary directory under the applications root, and it has no history
When the guard of the course of the work takes the call apart Then it lets it through: restoring a plan
for the sake of tidying up after oneself means carrying out a demand written about another action.
Removing a path lying in the history is refused as before — a removed code file changes the behaviour
the same way a rewritten one does

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-741 — a built tree demands no rule

Given the path lies under the build or the dependencies directory — it came from a command that runs an
artefact, not edits it When the rules gate picks a rule Then it stays silent: both the map and the tiers
on top of it. The same path under the sources demands its own rule as before — under an artefact lie the
same directory names, and the exit branch stands first

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-747 — not one of two actions is done about handed-in work

Given a turn in which a request is opened, and the state of the handed-in work is not asked and the next
task is not taken
When the waiting guard judges the end of the turn
Then the refusal names both actions at once: the next one taken carries the sign of an open request away
with it, and the second demand after it will never sound again

Covered: `projects/agent-kit/tests/waiting-turn-guard.test.sh`.

### SC-AK-748 — work left in the working tree does not end a turn

Given the branch went ahead of its remote reference, there was work during the turn, and no request was
opened at it
When the watchman of the exits judges the end of the turn
Then it refuses the turn and names the number of unhanded commits; a branch level with the remote one
and a turn with an open request pass

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-773 — a request for a proposal is caught in Latin too, and a tree without the directory is not judged

Given the owner asks for a proposal in English — a verb next to the word about a proposal and a
neighbour about the rules layer When the proposal guard judges the end of the turn Then it demands the
send the same way as in the owner's language; a send in the same turn lifts the demand, a word without a
neighbour is not judged, and a tree that has no proposals directory on the disk gets no watchman at all

Covered: `projects/agent-kit/tests/proposal-guard.test.sh`.

### SC-AK-804 — the section of the course of the work survives the compaction under a locale with national settings

Given the course of the work holds the section about the state and the former handover section, and the
shell declared a locale with national settings
When the compaction of the session puts a new handover as a section
Then the former handover is replaced by one new one, and the section about the state stays in place

Covered: `projects/agent-kit/tests/handoff-write.test.sh`.

### SC-AK-885 — a linter command without the path of the edited file is named

Given the tree profile prints a linter command in which the path of the edited file is absent
When the linter hook on the trail of the edit runs it
Then it says into the error stream that the command named no file, and names where the sample of the
path substitution stands: the work is not stopped at that — a walk over the whole tree is
indistinguishable from an empty run by this sign alone

Given a second file is edited in the same session
When the hook runs the same command
Then it stays silent: a line on every edit would repeat dozens of times per session

Given the linter command does name the path
When the hook runs it
Then it says nothing

Covered: `projects/agent-kit/tests/lint-after-edit.test.sh`.

### SC-AK-844 — an assignment before a call hides no call

Given the request opening command stands after an assignment whose value is a substitution, a string in
quotes or a word without spaces
When the guard checks the command line
Then the call is recognised in all three shapes, including after a separator and a full path, while a
mention of the same command in quotes and a search over the tree do not count as calls

Covered: `projects/agent-kit/tests/cmd-bound.test.sh`.

### SC-AK-849 — a file put by the layout demands no pair

Given a file with the layout header goes into a commit, and the profile names a pair for it
When the documents guard checks the commit
Then it lets it through: such a file has one author in a consumer tree — the package, and the document
about it lies there too. The same file without the header still demands a pair

Covered: `projects/agent-kit/tests/docs-guard.test.sh`.

### SC-AK-857 — an interpreter is checked by its body, not by its name

Given a command calls an interpreter and gives it the path of a file as the first argument
When the gate decides whether it writes
Then it does not count as a write; an interpreter with a document at the input, with code as an
argument and an edit in place stay writes

Covered: `projects/agent-kit/tests/defaults.test.sh`.
