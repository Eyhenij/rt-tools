# Scenarios — the rules gate

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-45 — the config of the linter demands a rule under it

Given the config of the code linter or of the style linter is edited
When the gate judges the edit
Then it demands the rule about types or about styling

### SC-AK-46 — the check of repeats demands one rule

Given the check of repeats or its list of exceptions is edited
When the gate judges the edit
Then it demands one rule, not two in a row

### SC-AK-92 — the sign of application code does not judge a path outside the root of the tree

Given a file outside the root of the working tree is edited, and its path matches the sample
When the sign of application code is asked about this path
Then it gets no sign, and the edit demands no plan of the branch

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-93 — creating a working tree loads the rule of delivery

Given a command of creating or removing a working tree goes
When the gate map is asked which rule is under it
Then it names the rule of delivery

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-99 — a layer demands a rule on top of the domain one

Given the edit goes into a file that has a domain rule, and a sign of a layer stands in its text
When the gate decides what to demand
Then it names both rules — the domain one and the rule of the layer — not one instead of the other

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-100 — a sign invisible in the path is judged by the text

Given the path of the file says nothing about the sign, and in the content of the edit there is a
call to the runtime environment
When the gate decides what to demand
Then the rule of the layer is demanded, although the path did not name it

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-101 — a place where the sign is allowed gets no layer

Given the edit goes into a file to which direct access to the runtime environment is allowed by a
rule
When the gate decides what to demand
Then the rule of the layer is not demanded, and the domain one stays

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-102 — a layer without a parser of the input lets the edit go

Given there is nothing to parse the input with
When the gate calls the layers
Then the edit passes, and the gate ends with a zero code

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-109 — a mention of a command does not count as a call

Given the name of the command stands inside the text of another command, not at the start of a call
When the gate decides what to demand
Then no rule is demanded: what counts as a command is a call, not a mention

Covered: `projects/agent-kit/tests/defaults.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-110 — merging a PR demands two rules

Given a command of merging a PR goes
When the gate decides what to demand
Then it names the rule of delivery and the rule of the conduct of work, and demands the first
unloaded one

Covered: `projects/agent-kit/tests/defaults.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-111 — a check through the browser demands the rule under the tool

Given a tool of the browser is called, and no file is edited
When the gate decides what to demand
Then it demands the rule of checking through the browser

Covered: `projects/agent-kit/tests/defaults.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-249 — the same edit put by a shell command is refused

Given a guard refuses an edit of a file by a tool, and the same edit goes by a redirection, an
appending, `sed -i` or an interpreter with a heredoc
When the command comes to the guard
Then it refuses it on a par with an edit by a tool: the way of writing lifts no requirement

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`,
`projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-250 — reading and searching by the same path the guard does not touch

Given the command reads a file or searches over a directory, naming that very path
When the command comes to the guard
Then it stays silent: what is judged is a write, not every mention of a path

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`,
`projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-251 — the same command from the terminal of the environment is judged on a par with the shell

Given a command of a write comes not by the shell but by the terminal of the development environment
When it comes to the guard
Then it refuses it the same way: a declared event whose body it does not parse is worse than an
undeclared one — from outside it looks closed

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`,
`projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-252 — a nested command of a universal executor is parsed down to the real one

Given the real command of a write stands as a nested line at `--command`
When the call comes to the guard
Then the nested line is parsed, not the wrapper: otherwise the path stands behind a quotation mark
and not a single sample reaches it

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`,
`projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-253 — for a write by a command the gate demands the same rule as for an edit of the file

Given a file that has a rule of its own by the map is written by a shell command
When the command comes to the rules gate
Then it demands the same rule it would demand for an edit of this file by a tool

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-254 — the marker of a departure in the command itself lifts the sign

Given the command puts into a file a line with the marker of a departure and the reason
When it comes to the guard of uniformity
Then it lets it through: a deliberate departure works the same by both doors

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-255 — a command writing outside the tree demands no rule

Given the command writes a file of a neighbouring repository on the same machine
When it comes to the rules gate
Then it stays silent: the rules of this tree act on the files of this tree

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-260 — a guard subscribed to something other than it declares is found by the check

Given the sample in the setting of the agent diverged from the declaration of the guard
When the check of the layout goes
Then it turns red and names both sides: a guard with a foreign sample looks working, while the
branch of its body everything was written for is never carried out

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-261 — a sample that came out even does not count as a divergence

Given the sample in the setting of the agent coincides with the declaration of the guard
When the check of the layout goes
Then it stays silent

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-533 — the paths are taken at the writing piece of the command, not at the whole line

Given a command in which a write of one file stands next to a read of another
When the rules gate picks the rule under it
Then the rule is demanded only for the written path: the read one brings no rule of its own, and a
mention of a path in the body of a document does not count as a target of a write

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-800 — one's own edition does not count as a dependency

Given an edit of the manifest changes the line `"version"` of this same package When the rules gate
picks the rule under it Then it demands no rule about dependencies: the line speaks of the release of
the package itself, not of a foreign version it pulls. A foreign version edited by the same commit
brings the rule as before

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-850 — a command publishing the body of a task or a request demands the rule of the wording

Given a call of the hosting client opens a request or creates a task and carries a body — by an
argument or by a file
When the rules gate checks the command
Then it demands the rule of the wording and its pattern about texts for a person. A call without a
body and a mention of such a command in a search demand no rule: both signs are checked at once

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1049 — the record of loaded rules is removed on compaction

Given the gate holds a record of the rules loaded in this session When the session reports a
compaction or a clearing Then the record is removed and every area asks for its rule anew: the sign
of the session stayed as it was, while the text of the rules left the context

### SC-AK-1050 — the re-arming is told to the session in words

Given the record is removed When the answer of the hook is read Then it carries a line about the
re-arming: a silent one reads as breakage — the summary says the rules are loaded, and the gate
answers that they are not

Given the input carries no sign of the session, or there is no input at all When the hook judges the
call Then it removes nothing and leaves with zero: it is a removal of a temporary file, and it
refuses nothing

Covered: `projects/agent-kit/tests/skill-gate-rearm.test.sh`.

### SC-AK-1088 — the subject of the rollout rule is demanded by the rollout rule

Given an edit of the image description, of the compose file, of the proxy config or of the sample of
the production environment When the gate picks the rule Then it demands the rule of the rollout: the
rule about tasks and branches says nothing about the server, the ports or the variables the image is
raised with

Given an edit of the pipeline When the gate picks the rule Then it demands the rule of the rollout
first and the rule about tasks and branches after it: the pipeline says both what runs before the
merge and what reaches production after it

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.
