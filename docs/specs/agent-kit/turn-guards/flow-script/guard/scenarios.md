# Scenarios: the guard of the course of work

A subdomain of the task flow as an executable scenario. Here are the scenarios of the guard that
holds the edits moving the scenario past the measurement.

### SC-AK-1414 — a done mark set by an edit is refused

Given a progress whose step 1.1 is current and no mark of that step
When an edit marks step 1.1 done
Then it is refused naming the command that measures the step and marks it done

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1415 — done and current marks out of order are refused

Given a progress with no step done
When an edit marks step 1.2 done, marks step 1.2 current, or marks step 1.1 current
Then the first two are refused and the third passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1416 — a state line ahead of the measured state is refused

Given a branch without a grill, which the engine measures at the first state
When an edit sets the state line to `этап-идёт`, and another keeps the first state
Then the first is refused and the second passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1417 — a shell write into the progress and the plan is refused

Given the task folder of the branch
When a shell command appends to the progress, edits the plan in place, or only searches the progress
Then the first two are refused and the search passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1418 — a shell write into the directory of the marks is refused

Given the directory of the marks in the common directory of git
When a shell command writes a mark there, and the engine is called to measure a step
Then the write is refused and the call of the engine passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1419 — Edit and Write into the directory of the marks are refused

Given the directory of the marks
When Write puts a step mark there and Edit changes the approval mark
Then both are refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1420 — a shell write into the epic plan is refused

Given the directory of the epic plans
When a shell command appends to an epic plan
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1421 — a done mark of a plan without check lines passes

Given a plan without a single check line and no mark of its steps
When an edit marks step 1.1 done
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1422 — a done mark of a plan added before the engine passes

Given a branch of the closed list `words.legacyBranches` and no mark of its steps
When an edit marks step 1.1 done
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1536 — a branch outside the closed list is judged as a new one

Given a branch with a plan of check lines that the closed list does not name
When an edit marks a step done without its mark
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1423 — «отложено» without the owner's word is refused

Given an epic plan and the owner's last word «ок»
When an edit sets «отложено» on the line of task RT-5
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1424 — the owner's last word naming the task allows «отложено»

Given the owner's last word «отложи RT-5»
When an edit sets «отложено» on the line of task RT-5
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1425 — the owner's word without the number does not allow «отложено»

Given the owner's last word «отложи эту задачу»
When an edit sets «отложено» on the line of task RT-5
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1426 — «отложено» is lifted only by the owner's word

Given task RT-6 marked «отложено» in the epic plan
When an edit lifts the word with the owner's last word naming RT-6, and with a word that does not
Then the first passes and the second is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1521 — an edit of the override without the owner naming its key is refused

Given a tree override with the key `nudge` and the owner's last word that does not name it
When an edit changes `nudge`
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1522 — the owner's last word naming the key allows the edit

Given the owner's last word naming `nudge`
When an edit changes `nudge`
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1523 — `null` with a reason the owner did not say is refused

Given the owner's last word naming `nudge` without the words of the reason
When an edit sets `nudge` to `null` with a reason
Then it is refused naming the reason

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1531 — a menu option naming the key counts as the owner's word

Given the owner chose a menu option that names `nudge`
When an edit changes `nudge`
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1524 — an edit of the description outside a task with this footprint is refused

Given a branch whose plan names no path of the description in an edited footprint row
When an edit changes the package description `flow.js`
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1525 — a task whose approved plan names the path may edit it

Given a plan whose edited footprint row names the directory of the package description
When the description is edited before the approval mark, and after it
Then the first edit is refused and the second passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1526 — a shell write into the description is judged by the same conditions

Given a branch without the footprint and an approved branch with it
When a shell command writes the package description
Then it is refused on the first and passes on the second

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1819 — a shell command that does not write to a guarded file passes

Given commands of the records refused by the old guard: a read by an inline script, `grep -ln`, a
run of the engine, an inline script that imports an engine file to read, a copy of a template into
the scratchpad, `git restore --staged` of the progress and a commit whose message names the plan
When the step guard judges them
Then each passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1820 — a write to a guarded file by a target that is not a literal path is refused

Given a copy of a template into the task folder by a script, a path built by `$(ls …)` or by the
environment inside a script, a copy into the directory of the progress, a script with `open(p,'w')`
that names the plan, and a script written and run by one command
When the step guard judges them
Then each is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1530 — a plan added before the engine with the footprint row may edit

Given a branch of the closed list whose plan names the directory of the description in an edited row and no approval mark
When the description is edited
Then it passes

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1532 — the laid-out description is guarded the same way

Given a branch whose plan names no path of the description
When Write puts the laid-out `tools/task-flow/flow.js`
Then it is refused

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.

### SC-AK-1940 — a check whose form hides its result is refused when the plan is written

Given a plan of the branch with no approval mark
When Write or Edit puts a check that is a pipe without `pipefail` before it, or one that counts an absence by
`grep -c` with any keys, `rg -c` or `grep | wc -l`
Then the write is refused and names the step, the command and the form to write; a pipe with `pipefail`, an
«||», a bar inside quotes, a substitution, a `case` or a test, a count behind «|| true», a count of what is
found and another file pass

Given the same plan committed, or an approval mark of the branch
When `plan-red` runs, or the plan is written
Then neither asks the form: an approved plan keeps its checks, and `plan-check` still names it

Covered: `projects/agent-kit/tests/flow-plan-forms.test.sh`.

### SC-AK-1971 — a plan without the section of the decision is named, and one line with a reason passes

Given a plan text
When the decision is read
Then a section that is not there or holds no row is named with all nine rows, one that stands twice is named, and
a block of code and the text after the section are not the section; line ends are of either system; the heading
«Решение» and «Decision» are one, and «Решения нет: <reason>» or «No decision: <reason>» of two words passes;
without a reason, with one word or with the brackets of the template it is named, and beside a table it lifts nothing

Covered: `projects/agent-kit/tests/flow-decision.test.sh`.

### SC-AK-1972 — every row of the decision stands and names its place, number and suite

Given a plan whose decision holds the nine rows, in either language and number
When one row is taken out, left empty, of one word or in the brackets of the template
Then it is named; an unknown row passes, and every row of input is judged

Given a module or a pattern without a place, with a line number instead, with a place in a suite, or with the place
only after the word «dropped»; a coupling in words; an input without a scenario number or a suite; a budget
without a path and a number, new code files or new dependencies
When the decision is read
Then the row is named with what it lacks; «no pattern», «no code», «no input» and «no number» with a reason pass;
every pattern of the row is judged, whether it starts a sentence or follows «;» or «<br>», and a product file with
«spec» or «test» in its name is a place and no suite

Covered: `projects/agent-kit/tests/flow-decision.test.sh`.

### SC-AK-1973 — a plan of the branch whose decision is not complete is neither written nor approved

Given a plan of the branch with no approval mark
When Write or Edit puts a decision that is not complete
Then the write is refused, names all that lacks in one line and the line that replaces the table; a template filled
in by edits passes while a step keeps the name of the template, and the untouched template is refused

Given the same plan committed
When `plan-check` or `plan-red` runs
Then both name it, pushed or not, and `plan-red` says that the fix goes into the commit of the plan; a plan whose
commit does not hold the module the history holds now is not asked, and an engine outside the history asks always

Given an approval mark, the plan of another branch or of an epic, another file or a broken input
When it is written
Then it passes

Covered: `projects/agent-kit/tests/flow-decision.test.sh`.

### SC-AK-2004 — the guard judges a call on a machine without `timeout`

Given a machine whose commands hold no `timeout`: only `gtimeout`, only perl, or none of the three
When an edit marks a step done by hand, an edit leaves the marks as they are, or a plan with a
hidden check is written
Then the hand mark is refused with the command of the step, the plain edit passes, and the plan write
is refused with the pipe named; `gtimeout` is called with the limit 60, perl with `alarm` and 60 for
both calls of the engine, with `timeout` beside them only `timeout` is called, with `gtimeout` and
perl both only `gtimeout`, a limiter without the exec bit is passed over, and with none of them the
engine runs without a limit

Covered: `projects/agent-kit/tests/flow-step-guard.test.sh`.
