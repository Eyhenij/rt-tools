# Scenarios: the code against the decision of the plan

A subdomain of the task flow as an executable scenario. Here are the scenarios of the measurer that
compares the code of the head with the decision of the plan at the end of the stages.

### SC-AK-1974 — a place, a suite and a new file that differ from the decision are named

Given a decision whose modules name a place, whose input row names a suite and a scenario, and a branch that adds a file
When the measurer reads the head
Then a place removed or left only in a comment, an import or a call is named
And a suite absent or without the number and a new file of code nobody named are named
And a place declared by a function, a method, a key, a field, a type, a shell function or a class of styles is silent
And a suite touched or carrying the number before, a new suite, a laid-out copy and a text are silent
And a function of Python, a shell function without brackets and a method behind a decorator are declarations, and an import of Python is none
And «No decision» names a new file of code, a new suite and a new function, class or export of an own commit, a list of exports and a default one among them
And a plan without a decision is not judged, and a number inside a longer number is not carried

Covered: `projects/agent-kit/tests/flow-design.test.sh`.

### SC-AK-1975 — a budget past its number is named, and a lift with a reason lets it go

Given a decision with «до N», «плюс N», «новых файлов кода: N» and «новых зависимостей: N»
When the head holds longer files, more new files of code or a new dependency
Then each excess is named, and a binary file, a removed file, a number without a path and what a merge brought are not
And an item of the decisions of the progress, or of an own commit once the folder is taken apart, with the path whole or by its tail, the word of an overrun and a reason lifts it
And an item without a reason or the word, outside the decisions, of a foreign commit, of a commit while the folder stands or of another task does not
And a lift of the path of a budget leaves a removed place of the same file named, a lift by the place or the symbol lets it go, and a line of links lifts no budget
And a refusal of the coupling command, a new cycle and an import past an entry among them, is never lifted here

Covered: `projects/agent-kit/tests/flow-design.test.sh`.

### SC-AK-1976 — the refusal of the coupling command and a decrease not reached are named

Given a decision whose coupling row names outgoing links of a module before and after
When the coupling command refuses, answers or does not answer, and the module has its links now
Then the line of the refusal is named, an answer without a refusal and no answer are silent
And a decrease not reached, reached in part or of a module not touched is named; one reached, passed, of a removed module, an unchanged number and a folder are silent
And a short path is the module beside its laid-out copy, a short path of two modules and a touched module the command did not print are not judged, and a budget line lifts no decrease
And the answer is kept by the head; another head, another branch, an unsaved edit and a new file outside the history ask again
And a command that crashed, is absent or knows no revision answers nothing, and no answer is kept
And after a merge the command runs against the tip the merge brought, and a merged tip of the branch itself or one without the lower task of a stack leaves the plan as the base

Covered: `projects/agent-kit/tests/flow-design.test.sh`.

### SC-AK-1977 — a footprint path with a mask is touched

Given footprint rows `tools/*.mjs`, `**/x.sh`, `dir/*/a`, `a.b/*.mjs` and a path without a mask
When a changed file is matched against them
Then `tools/a.mjs`, `a/b/x.sh`, `x.sh` and `dir/b/a/c.md` touch them, and `tools/a/b.mjs`, `dir/a/c.md`, `aXb/c.mjs` and `tools/a.mjs.bak` do not
And the path without a mask answers as before

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1978 — the engine holds the end of the stages on a mismatch

Given a branch whose plan promises a symbol and no outgoing links, and the real coupling command in the tree
When the symbol is removed, returned and the module imports another
Then the engine stands at `этапы-кончились` and prints the symbol, goes on once it is returned, and names the growth of links
And the laid-out copy of the engine answers the same
And the refusal at the end of a turn names the mismatch and how to lift it
And a file a merge of the main branch brought is no new file, and a commit after the folder is taken apart lifts a place by its text

Covered: `projects/agent-kit/tests/flow-design.test.sh`.
