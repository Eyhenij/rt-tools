# Scenarios — the guard of the conversation

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

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

### SC-AK-1194 — with edits in the turn the refusal names the rules of their area

Given during the turn a file was edited for which the rules gate names its own rule, and no rule was read
When the turn ends with a question to the owner
Then the refusal names that rule, says that a load before the owner's last message does not count and gives no advice to search the directories

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1196 — an edit outside the tree does not make up the area of the work

Given during the turn only a draft outside the tree was edited, and a rule of another area was read
When the turn ends with a question to the owner
Then the guard lets it through: the draft demands no rule, and any reading counts

Given the same draft lies inside the tree
When the turn ends with the same question
Then the guard refuses it: the rule of the draft's area was not read

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

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

### SC-AK-1195 — a short command of the owner does not answer the next question

Given the owner answered an earlier menu and then wrote a remark of fewer than five significant words, such as «take task N»
When a menu about another decision on the same task goes out and shares the number and the words of the subject with that remark
Then the second sign lets the menu out: a command is not a decision

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1197 — a question after a refusal carries what was done without the answer

Given a guard refused a call in the turn, and the rules were read
When the executor asks the owner by a menu or in prose without the line of what was done, or with the
line but only a read or a status command after the refusal
Then the question does not leave, and the refusal orders to do the mechanical part of the blocker first

Given the line stands and an edit or a working command followed the refusal, or the turn had no refusal
When the executor asks the owner
Then the question leaves

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1168 — a loaded rule and a subagent report are not the owner's remark

Given the owner's last remark has nothing in common with the new menu, and after it the record holds
a loaded rule or a subagent report marked `isMeta` that shares the menu's words
When the executor sends this menu
Then the call passes: the menu is compared with what the owner wrote, and the rule loaded before
the question counts as read in this turn

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1169 — the keys of the menu are not words of its topic

Given the owner's remark shares with the new menu only the field names of the menu call —
`question`, `label`, `description`
When the executor sends this menu
Then the call passes: the words are taken from the questions and the options, not from the call

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1134 — two answers «recommended» in a row close the remaining questions by assumption

Given the owner took the recommended option on the last two menus of the record
When the executor sends the next menu
Then the call is refused, and the refusal orders to close the remaining questions by assumption and
name them to the owner in one line

Given the owner answered the last menu with an option of their own, or only one menu was answered
When the executor sends the next menu
Then the call passes: the streak is broken by any other answer, and one answer is not a streak

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1208 — a menu answer of the second form counts the same

Given the last two menu answers start with «Your questions have been answered:» and take the recommended option
When the executor sends the next menu
Then the call is refused, the same as for «The user answered:»

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.

### SC-AK-1202 — a question with an option past a check does not leave

Given the menu offers to send once past the check, or to add a bypass line to the command
When the executor sends this menu
Then the call is refused, and the refusal orders to fix the cause or the check itself

Given the last reply ends with a question about a commit with `--no-verify`
When the turn ends
Then the turn is held by the same refusal

Given the menu asks how to fix the check itself
When the executor sends this menu
Then the call passes

Covered: `projects/agent-kit/tests/grill-gate.test.sh`.
