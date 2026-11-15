# Scenarios: the task flow as an executable scenario

A subdomain of the domain "The guards of the end of a turn". Here are the scenarios of the language
the task flow is described in and of the engine that measures it.

### SC-AK-1471 — literals, references, arrays and objects are parsed into a model

Given a description with strings, numbers, `true`, `false`, `null`, references, arrays and objects
When the parser reads it
Then the model holds the same values, a reference as `{"ref": "<path>"}`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1472 — a function in the description is refused

Given a description with a `function` or an arrow function as a value
When the parser reads it
Then it refuses, saying the description executes nothing

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1473 — an expression is refused

Given a description with an arithmetic or a logical operator between values
When the parser reads it
Then it refuses, saying an expression is not allowed

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1474 — a repeated key is refused

Given an object of the description that names one key twice
When the parser reads it
Then it refuses and names the key

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1475 — a tail after the closing semicolon is refused

Given a description followed by a statement after `);`
When the parser reads it
Then it refuses: nothing may follow the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1476 — comments and dots in a string are data, not execution

Given a description with comments around it and strings that hold `//`, `/* */` and dots
When the parser reads it
Then the comments are skipped and the strings keep their text

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1477 — a call of a reference with literals and references is parsed

Given a value `measure.count(1, 'b', source.git, [true])`
When the parser reads it
Then the model holds the call with its reference and its four arguments

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1478 — a reference to an unknown section is refused

Given a reference that starts with a name outside the six sections, or a `require` call
When the parser reads it
Then it refuses and names the section list or the word

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1479 — the description has exactly six sections, an extra one is refused

Given a description with the six sections, one with a seventh, and one without `expect`
When the model is built
Then the first is accepted, the extra section is named, the missing one is named

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1480 — a name outside [A-Za-z][A-Za-z0-9]* is refused

Given an entry named by a string with a dash
When the model is built
Then it refuses and names the entry

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1481 — `measure.x` is the file x.mjs of the measurer directory, a capability is its export

Given a measurer entry `plan` with the capability `approved`
When the model is built
Then the component points at the file plan.mjs of the measurer directory and holds the capability `approved`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1482 — ports that are not the signature are refused, naming the component

Given a capability whose ports lack a name its factory takes
When the model is built
Then it refuses and names `measure.<entry>.<capability>`, the ports and the signature

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1483 — a signature with a default or a renaming is refused

Given a factory declared as `({ git = 1, marks })` or as `({ git: repo, marks })`
When the model is built
Then it refuses: a port carries a default, a renaming or a pattern

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1484 — a missing capability is an explicit error, without a substitute

Given a description naming a capability its file does not export
When the model is built
Then it refuses and names the capability

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1485 — a cycle of references is refused

Given two measurers whose ports point at each other
When the model is built
Then it refuses and names the cycle

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1486 — the order of the states is the order of the description

Given two states written one after the other
When the model is built
Then the states come in the written order

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1487 — a repeated state title is refused

Given two states with one title
When the model is built
Then it refuses and names the title

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1488 — a measurer importing a path not starting with `./` is refused

Given a measurer that imports `node:fs` or a file of a neighbouring directory
When the model is built
Then it refuses: the import leaves the directory

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1507 — `import()` in a measurer is refused

Given a measurer with a dynamic `import()`
When the model is built
Then it refuses and names `import()`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1508 — `process` in a measurer is refused

Given a measurer that reads the environment through `process`
When the model is built
Then it refuses and names `process`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1509 — `createRequire` and `require` in a measurer are refused

Given a measurer that calls `createRequire` or `require`
When the model is built
Then it refuses and names the word

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1533 — a neighbour file of a measurer importing `node:fs` is refused

Given a file of the measurer directory that the measurer imports, and that imports `node:fs`
When the model is built
Then it refuses and names the neighbour file

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1534 — `globalThis` in any file of the measurer directory is refused

Given a neighbour file of a measurer that reaches `globalThis`
When the model is built
Then it refuses and names `globalThis`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1529 — the layout header as a line comment before the description is skipped

Given a laid-out description whose first line is the layout header as a `//` comment
When the parser reads it
Then the header is skipped and the model holds only the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1510 — `all` is met when every part is met

Given a state whose exit is `all` over two measurers
When the exit is measured with both results true and with one false
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1511 — `any` is met when one part is met

Given a state whose exit is `any` over two measurers
When the exit is measured with one result true and with none
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1512 — `not` inverts a measurer

Given a state whose exit is `not` over a measurer
When the exit is measured with the result false and with it true
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1513 — nested conditions are parsed and measured

Given a state whose exit is `all` over a measurer and an `any` holding a `not`
When the model is built and the exit is measured
Then the model keeps the nesting, and the exit follows every level

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1514 — a condition over an unknown measurer is refused

Given an exit naming a capability the measurer lacks, a `when` naming an absent measurer, an object of two keys or a reference to a source
When the model is built
Then it refuses and names the place of the condition and the reason

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1515 — a state exit built from a condition without code is measured

Given a state whose exit is `any` over two measurers, one under `not`
When the exit is measured by the results, once with a result absent
Then it is met by the results, and an absent result counts as unmet

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1516 — the exceptions of the stop words are taken from `words`

Given a description whose `words` name the stop words and their exceptions
When a message of the owner is judged, and a second description names other words
Then a stop word says stop, an exception lifts it, a word inside another word does not count, and a list that is not a list or an unknown key is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1517 — the write commands of case 3 are taken from `words`

Given a description whose `words.write` names two commands
When a compound command, a read and a longer word are judged
Then the compound command is a write, the read and the longer word are not, and an empty entry is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1518 — the options of the refusal menu are taken from `words`

Given a description whose `words` name the menu and the nudge pattern
When the model is built
Then the model holds the menu in its order and the pattern matches, while an option that is not a string and a pattern that does not compile are refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1519 — the way a form of the expected result is compared is the field `compare`

Given a description with the forms `exit`, `line`, `regex` and `number`
When runs are compared with expected texts of each form
Then each form compares by its way, a non-zero code fails a text, an unknown text has no form, and an unknown way is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1520 — the order of the release cases is the field `order`, and a repeat is refused

Given two release cases written in reverse order, two with one order, and one with a fraction
When the model is built
Then the cases come by their order, the repeat names both cases, and the fraction is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1365 — exit 1 is met by the grill of the branch

Given the grill of the branch in the working copy, the same grill only in the history, and a grill left as the sample wrote it
When exit 1 is measured
Then it is met by the first two and unmet by the sample

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1366 — exit 1 is met by a draft grill

Given a draft folder in the working copy with an answered grill, and one without a grill
When exit 1 is measured on a branch without a task number
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1367 — exit 3 is met by the agreement directory from the history

Given a plan naming a directory under proposed/ that only the main branch holds in its history, and one naming a directory that never existed
When exit 3 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1368 — exit 3 is met by the reason there is no agreement

Given a plan with `**Behaviour:** unchanged — <reason>`, a grill with `**Описание фичи:** не нужно — <reason>`, and a reason left as the sample wrote it
When exit 3 is measured
Then it is met by the first two and unmet by the sample

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1369 — exit 5 is met when the approval mark lies

Given a plan the branch added with checks of known forms and an approval mark beginning with «Одобряю», and the same plan with a check of an unknown form
When exit 5 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1370 — exit 5 is unmet without the mark, and the work stays in «задача-взята»

Given a plan the branch added and no approval mark
When exit 5 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1371 — an approval given in another working copy holds

Given an approval mark written in the common directory from one working copy, and then a mark that does not parse
When the marks are read from the second working copy
Then the first is seen, the second reads as absent

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1372 — the answer «переделай» to the approval menu gives no mark

Given an approval mark whose answer asks for rework
When exit 5 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1373 — exit 6 is met by exactly one step going on

Given versions of the progress with one step going on, with two, and with a renamed step
When exit 6 is measured
Then only the first meets it

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1374 — a done step without its mark does not count

Given a progress with every step done, a green mark for one step, then for both
When exit 7 is measured
Then it is unmet with one mark and met with both

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1375 — a plan without check lines is judged by the done marks

Given a plan without a single check line and a progress with every step done
When exit 7 is measured without step marks
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1376 — exit 8 measures only the rows marked edited

Given a footprint with a marked row and an unmarked one, and a change under one of them
When exit 8 is measured
Then it is met when the marked row changed and unmet when only the unmarked one did

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1377 — a plan without marked rows is judged by proposed/ alone

Given a plan whose rows carry no mark and whose rules were not changed, and a plan whose agreement directory under proposed/ still stands in the head
When exit 8 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1378 — exit 9 is met by a record in the archive

Given a commit that removed the task folder and added a record to the archive, and one that only removed the folder
When exit 9 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1379 — exit 2 is met by the epic branch on the server

Given the epic branch on the server with the epic card in work, and the same with the card in the first column
When exit 2 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1380 — exit 2 is met by an epic merged into the main branch after its branch is removed

Given no epic branch on the server and a merged PR of the epic into the main branch, then neither
When exit 2 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1381 — the memory of exits 2 and 4 survives a commit

Given exit 4 met once, then a commit and a card that cannot be read; exit 2 kept before; a task in the first column; the real source remembering exit 2 before a commit
When the exits are measured
Then the kept exits stay met across the commit, the task in the first column is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1382 — an answer for exits 10–13 older than sixty seconds is read anew

Given an answer read at a moment, then asked thirty and sixty-one seconds later
When the answer is asked
Then it is read once for the first two and anew for the third

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1383 — a call of the hosting client drops the answers

Given an answer kept by the clock, then a reset
When the answer is asked again
Then it is read anew

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1384 — a read the hosting failed once is repeated

Given a read that fails once and then answers, and a read that fails twice
When the source reads
Then the first answers and the hosting is not silent; the second throws `HostSilent` and the hosting is silent

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1385 — with the hosting silent the first unmet local exit is measured

Given every hosting exit unanswered and exit 3 unmet
When the states are measured
Then the measured state is «разбор-закрыт» without a reason

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1386 — with the hosting silent on a hosting exit the turn is released with its reason

Given every hosting exit unanswered and every local exit met
When the states are measured
Then the measured state is the first hosting exit, with the reason that the hosting did not answer twice

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1387 — exit 10 is met by a PR in any state with a reviewer

Given a closed PR with a reviewer and the folder commit on the server, the same without a reviewer, and without the commit on the server
When exit 10 is measured
Then only the first meets it

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1388 — exit 11 is met by the branch of the next unblocked task

Given the next task with a branch on the server, without one, and an epic with no next task
When exit 11 is measured
Then the first and the last meet it, the second does not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1389 — a task waiting for the owner's step is passed over

Given a next task waiting for the owner's step, with and without the owner's message holding its quote, and a branch of the task after it
When exit 11 is measured
Then it is met when the owner said the step and unmet when the owner did not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1390 — a deferred task is passed over

Given a deferred task before a task with a local branch
When exit 11 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1391 — exit 12 is met when the merged tasks are marked

Given a merged task marked merged, and a merged task left unmarked
When exit 12 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1392 — exit 13 measures the commits of a cascade

Given a task whose PR went into the branch of the previous task, with both tips in the epic branch, and with the previous one not yet there
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1393 — exit 13 is met when the PR of the epic is merged

Given every tip in the main branch with the PR of the epic merged, and every tip in the epic branch without a PR of the epic
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1394 — deferred tasks do not count for exit 13

Given a deferred task whose tip lies nowhere next to tasks that landed
When exit 13 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1466 — a task branch removed after its merge gives its tip from the PR

Given a task without a local or server branch whose merged PR names its head
When exit 13 is measured
Then the tip comes from the PR and the exit is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1395 — a branch without a task number reads the epic of the copy

Given the epic branch and the main branch of a copy the assignment table gives a live epic
When the copy and exit 2 are measured
Then the work has an epic, and exit 2 is met by the epic of the copy

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1396 — the main branch assigned to a merged epic is outside the scenario

Given the main branch of a copy assigned an epic whose PR into the main branch is merged
When the copy is measured
Then it is outside the scenario

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1397 — an epic with a closed card counts as absent

Given the main branch of a copy assigned an epic whose card is closed
When the copy is measured
Then the work has no epic

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1398 — a draft is measured by states 1–4

Given the main branch without an epic and a draft folder with an answered grill
When the copy and the states are measured
Then the copy stays in the scenario, and the measured state is «эпик-заведён»

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1399 — a branch without a task number and without an epic is outside the scenario

Given a branch without a task number, a copy without an epic and no draft, and a task branch
When the copy is measured
Then the first is outside the scenario, the task branch is not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.
