# The delivery guards and the push gate

**Status:** in force · **Revision:** 2026-08-20 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`, `verifiability`
**Procedures:** none

## Why

The push is the entry into the pipeline: a merge into the main branch starts the rollout, and
everything not checked before the push is checked already on production. The subdomain names what
the package watches on the road outward — the freshness of the branch base, the signature of a
machine commit, the readiness to open a PR — and what holds the promise that what was pushed will
not arrive red: the push gate set is never narrower than the pipeline set, and an undeclared step
refuses the push.

## Terminology

- **The machine record** — the account the executor commits on behalf of.
- **The declared mail** — the mail of the machine record as a whole value; the tree names it in its
  profile.
- **The login of the record** — the left part of the declared mail: up to the at sign and after the
  plus, if there is one.
- **A machine commit** — a commit that named itself by the machine record: its login stands as the
  author name or as the left part of its mail.
- **The contribution of a branch** — the commits from the tip of the main branch at the hosting to
  the tip of the working one: what will leave by this push.
- **Readiness for delivery** — all the conditions under which the work is handed in at once: a fresh
  branch base, the signature of the commits, the state of the task together with its column and the
  review at the PR. About the task and about the PR the subdomain of conducting work asks; here it is
  what is read in the tree itself.
- **A condition that did not come together** — a readiness condition the guard did not confirm; in
  the refusal it stands together with what it is lifted by.
- **The gate set** — the lines the tree profile prints; the guard runs them before the push.
- **The pipeline file** — the description of the run on the hosting side; every kind of hosting has
  a name of its own, and the tree names it in the setting.
- **The declared list** — the correspondence "a pipeline step → a line of the gate set" the tree
  writes in its setting.
- **An exception** — a pipeline step declared as not belonging to the gate, together with a reason.
- **The composition of an edit** — how the branch differs from main by the kinds of files touched;
  by it the gate set picks the heavy steps.

### What it is called in the interface

| In the agreement            | In the launch line                                          |
| --------------------------- | ----------------------------------------------------------- |
| the gate set                | a function of the tree profile, one command per line        |
| the gate completeness audit | the push gate check against the pipeline file               |
| the delivery guard          | the guard on the call of creating a branch, of a push, a PR |
| the push gate guard         | the guard on the call of a push, running the set            |

## Rules

- **The final set before the push is printed by the state report, not only by the guard at the
  minute of the push.** The set is assembled from two files, and there was nothing to read the
  assembly with: the profile function had to be called by hand from the shell. A tree writing an
  override did not see the default and appended a repeat into it — a check raising a shadow storage
  was run twice per push.
- **The set in the state report is called, not retold by reading.** It branches by the content of the
  tree — whether there is a layout setting, a style linter config, which checks are laid out — and
  parsed by the text of the function it will diverge from the real one silently.
- **What the default printed and what did not get into the set is named by a line of its own.** The
  line `rt_push_checks_default "$@" | grep -v …` looks like a setting and is sometimes a lifting of
  the watch, and a check cut out is indistinguishable from one the default does not have at all. The
  difference is NOT called a lifting of the watch: the tree may have replaced the command by its own
  variant of the same check, and from here that looks the same — they are told apart by the override,
  and it is read by a person.
- **The guard once per session names what its set is narrower than the pipeline by.** The rule
  demands that the gate not be narrower than the pipeline, and there is nothing to assemble that
  demand with: the pipeline file is different in every tree. Silence at that reads as "everything is
  checked", and the divergence is learned from a red pipeline after the request. On every push the
  same line would repeat dozens of times per session.

- **The main branch is merged into the task branch before the PR is opened.** A PR opened from a
  diverged branch shows the reviewer the edit mixed with someone else's, and the checks on it are run
  from a stale base.
- **Opening a PR is refused while the main branch is not merged.** The guard checks that the tip of
  the main branch is an ancestor of the current one, and names how many commits it went ahead by.
- **The delivery conditions that did not come together are named by one refusal.** A refusal at the
  first miss makes them fixed one at a time: every round costs one more call, though everything that
  did not come together was known already at the first one.
- **Every condition that did not come together is named together with what it is lifted by.** A
  refusal without an action is bypassed, not carried out.
- **A condition known at the start of the work is asked at the start.** The freshness of the base and
  the mail the working copy signs the commits with are known when the branch is created; left for the
  push and for opening the PR, they are fixed by a merge with a conflict resolution and by rewriting
  the whole branch.
- **The base named by the command is judged, not the tip of the working copy.** A branch is created
  from the tip of the main branch outright as well — by that very command the base is taken fresh; a
  base the tree knows nothing of is not judged at all.
- **The freshness of the local reference to the main branch is asked when the branch is created
  too.** Without the second tier the silence of the first means "the base is no older than my
  reference" and reads as "the base is fresh".
- **The body of a request carries the section about the remaining step from the minute it is
  opened.** The merge button is pressed by a person at the hosting, where the guard does not reach,
  and they merge as soon as they see green: everything the delivery conditions are held by there is
  what the owner read on the request page. A section appended before the ask to merge is late by the
  whole length of the run.
- **The sample of the mandatory section is named by the tree, not by the package.** The heading is
  written in the language of the request, and an invented default would match nothing; not named by
  the tree, the section is not judged at all.
- **A body passed as a file is judged on a par with a body in the argument of the command.**
  Otherwise a bypass appears by itself, without a single decision: a call with the body in a file
  passes the sign silently.
- **The body flag is recognised only as a separate word.** The tail of a branch name `-b` in the base
  argument read as the flag, and the next word of the command became the body — `--head`, `2>&1`: the
  guard answered that the body holds no section, though the section is in the file. The request could
  be opened only with the name as the last argument and without the tail of the command.
- **The task number is taken out of the branch name by the profile, not by the guard.** The guard
  already asks the profile for the shape of the name, and the prefix in it is not always the task
  key: `feat/88-slug` is exactly as lawful as `RT-88-slug`. A parse hardwired into the guard by one
  shape left such a branch without a number — and the check of the branch number against the number
  of the request title was skipped silently, looking as if it came together, while the shape check at
  the creation never fired once. Two questions to one name are split by names: the shape answers "is
  it fit", the parse answers "which one is it".
- **A branch without a task number gets no delivery conditions.** A local branch for a trial is
  lawful, and demanding a fresh base of it would mean refusing work that will not go into main.
- **The push gate calls what the tree laid out.** A created check stands in it, not only in the
  umbrella target nobody runs by themselves: a new line in the known list goes into the main branch
  silently, while the list reads as an acting watch.
- **A postponed edit does not count as a push.** A command putting an edit into the stash of the
  working copy sends nothing outward, and the word of the push stands in it as a separate word — by
  that sign alone the guard ran the whole set on it and refused the call at the first red check. The
  stash is cut out of the line, and the sign is counted over the rest: a real push standing next to
  it in the same command is recognised as before.
- **Switching a branch in the same command refuses the push whole.** The guard takes the command
  apart before it is run, and it runs the set in the tree that lies now: a compound "switch and push"
  passes the gate by the former branch, checking the wrong thing silently. Creating a new branch does
  not fall under this — for a fresh branch the tree is the same as it was.
- **The signature of a machine commit is judged before the commit leaves.** The refusal stands at the
  push: before it the signature is rewritten in place for the whole branch at once, after it by a
  forced send, and the price of the miss jumps exactly here.
- **A machine commit is recognised by its claim, not by its mail.** What is judged is a commit that
  named itself by the machine record; one that named itself by somebody else is not judged at all —
  otherwise the guard would refuse work a person did with their own hands in the same tree.
- **The mail of the machine record is checked as a whole value.** A sample "number, plus, login,
  domain" would pass with a foreign number, that is with exactly the miss the signature is read for.
- **The contribution of the branch is judged, not the whole history.** Commits already merged into
  main are not fixed by this branch, and a refusal over them would refuse the work instead of the
  miss.
- **The signature is read on the machine, without the network.** A network call would fall together
  with the connection and would refuse work where the signature is right.
- **A refusal about the signature names the commit by name and both mails.** A miss in one character
  is not found by eye: without the found and the declared value side by side the refusal would have
  to be taken apart by hand.
- **A tree that named no mail of a machine record gets no demand.** The package has no machine record
  of its own, and an invented one would refuse work in a foreign tree.
- **The identity of the machine record is confirmed by the answer of the hosting, not by recognising
  a string.** A familiar look of a string is never a confirmation: the miss looked familiar. What
  exactly to ask with the tree knows — for a limited record a search by number answers "not found"
  even by its own token, and what is left is the answer about itself, where the login and the number
  arrive together.
- **The work queue demands no token of the machine record.** A tree that did not name it reads the
  queue and edits it by the account the hosting client is signed in under. Demanding a token would
  hold the queue back from a tree that created no machine record at all, and from a tree whose record
  the hosting limited: the quota for the board query language at such a record is zero, and the
  hosting answers with a text about an exhausted limit — it reads as temporary, and the work stops
  over a reason that looks passing.
- **The commit signature and the work with the queue are different properties of the machine
  record.** The first is read on the machine and without the network, the second goes to the hosting:
  a limit that removed the second does not touch the first, and a tree that removed the queue token
  does not lose the signature of a machine commit.
- **The push gate set is never narrower than the pipeline set.** A pipeline step that has neither a
  line nor a declared exception in the gate set refuses the push. A gate promising more than it checks
  is worse than an absent one: an absent one does not read as a confirmation.
- **The completeness is held by the declared list, not by parsing the pipeline file.** The steps
  there are arbitrary, and part of them are locally unexecutable — a cache, an upload of traces, a
  sign-in to a registry. The tree declares what each step is closed by in the gate, and an undeclared
  step turns red: the hole is visible on the spot, not derived by comparing two lists by eye.
- **An exception is declared with a reason and next to the set.** The reason is the only thing that
  tells a permanent hole from a forgotten line; an empty reason does not count as an exception.
- **A tree without a pipeline file gets no audit.** A check falling where there is no pipeline would
  refuse work instead of a miss. This is the same refusal in favour of the work as at the other
  guards.
- **The completeness check itself stands in the gate set.** A check that has to be remembered does
  not live to its second month; a created check stands where it is called without a person.
- **A heavy step of the set is picked by the composition of the edit.** The stand, the showcase
  snapshots and the image builds go only when the branch touched more than texts: otherwise a push of
  a commit with one edited line takes minutes, and the owner reads it as hung. The sign errs towards a
  surplus run, not towards a missed one, and at an empty base it stays silent — then the whole set is
  run.

- **A fallen step of the pipeline is not restarted while its journal is not read.** Red comes in two kinds, and in the
  list of runs they look the same: a refusal of the hosting on the preparation step is cured by a
  restart, a defect of the branch is not cured by it at all, and the round repeats until the journal
  is opened. The guard judges the order — the journal before the restart — not the cause of the fall:
  what is written in the journal a person judges.
- **The journal of that very step counts as read.** In the list of the runs the steps stand side by side,
  and the journal of a neighbouring one says nothing about ours. The number in the reading is checked
  against the number in the restart.
- **A restart without a named number of a step is not judged.** A restart of the last fallen one is called
  without a number too; guessing which step is meant means refusing at random.
- **The verb of a command is looked for in its position, not as a substring across the whole line.**
  A bare search for "git commit" misses in both directions: a call with a key between the command and
  the verb goes past — `git -c user.name=… commit` — and reading the history with the word `commit`
  in an argument is refused for nothing. A refusal on a read costs more than a miss: a guard that gets
  in the way of reading is switched off on the very first day.
- **Creating a branch is recognised with a flag between the verb and `-b` too.** The sample
  `checkout -b` sees one shape of writing, while branches are created as `checkout -q -b` as well: in
  one session three branches were created that way, and the guard judged not one of them by base or by
  name, and the closing of the turn did not see the work taken. The sample is one for all the guards —
  otherwise they diverge silently.
- **The push gate writes an observation line for every outcome of its own.** There are three of them
  — the set was run and is green, the set is red, no set was found — and only refusals were recorded.
  A gate that never found a check looks in the record like a gate where everything is green: both stay
  silent.
- **A refusal of the push gate names three moves, not two.** Red comes in two kinds, and by the exit
  code they are indistinguishable: when the check itself errs, "fix it and push again" orders fixing
  code nobody touched. The third option is to take the refusals apart by name, show the analysis to
  the owner and fix the check.
- **What is disputed is not put into the known list.** The list keeps the accepted, not the results
  of a broken check.

## What is out of scope

- Signing a commit by a key: the key lies outside the tree, and the machine record has nothing to
  sign with it.
- The point of the commit at the signature check: the mail is set by the variables of the command
  itself, and parsing it from the text would catch the same line that already stands before the eyes
  of whoever typed it.
- Commits that named themselves by a person: which of the people has the right to commit in the tree
  is not the subject of the package.
- Already merged history: it is fixed by rewriting and a forced send, and that is the owner's
  decision.
- The state of a task and the state of a PR: they are read by the subdomain of conducting work — the
  same place where the work queue is asked by commands.
- **Parsing the pipeline file by a machine.** Rejected by the owner's decision: three kinds of hosting
  would give three parsers of a foreign format, and half the steps are not executable locally at all.
- **A step-by-step match of the commands.** The coverage is checked, not the text: the pipeline calls
  the target of the runner with its own keys, the gate with its own.
- **The freshness of the pipeline file itself.** An edit of the pipeline is checked by a run of its
  own — that is already said in the delivery rule.
- **Reading the body of an already open request:** the section there is rewritten by the same call the
  body is edited by, and the miss is cheaper — the owner has already seen the request.
- **Taking a compound command apart deeper than its shape.** The guard reads that the command holds a
  branch switch and does not take apart which branch exactly: to learn that for sure it would have to
  run half the command before deciding about it.

## Contract

The surface is the guards on the calls of creating a branch, of a push and of opening a PR, and the
check of the completeness of the gate set against the pipeline file. The guard refuses a call before
it is carried out and names the way to lift the refusal; the completeness check leaves with zero when
every pipeline step is closed by something, and with one when it is not.

### Refusal codes

Not applicable: the check answers with an exit code and a text, not with named codes.

| What happened                                               | Code | What it says                                                    |
| ----------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| the mail of a machine commit diverged from the declared one | `1`  | the commit by name and both mails                               |
| a pipeline step is closed by nothing in the gate set        | `1`  | the name of the step and what it is declared by                 |
| the main branch is not merged, and a PR is being opened     | —    | how many commits it went ahead by and what lifts this           |
| several delivery conditions did not come together           | —    | all that did not come together at once, each with its action    |
| a branch is created from a base without the tip of main     | —    | how many commits it fell behind by and how to take a fresh one  |
| the working copy signs commits with a foreign mail          | —    | both mails and the command the signature is fixed by            |
| a line of the gate set fell before the push                 | —    | the fallen line and the tail of its output                      |
| a branch switch stands in the same command as the push      | —    | which branch the set would be run by and how to split the calls |

A refusal of a guard has no command exit code: it refuses the call before it is carried out and names
the way to lift the refusal.

## Data

There is no storage of its own. The gate set is printed by a function of the tree profile, the
declared list of steps lies as a key of the check setting, and the declared mail of the machine record
as a value of the profile.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output of the guards and of the check is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guards are one set for all trees, and the mail, the name of the main branch, the gate set and the
declared list are read from the setting of the tree. What the tree did not name is not judged at all:
silence means "there is no rule about this", not "the rule is kept".

## Decisions

- **The demand to merge the main branch is held by words and by a guard.** Words act until the first
  rush — that is exactly why the rules gate became a guard in its time, not a line in a hint.
- **The signature is refused at the push, not printed at the commit.** A printed warning reads as
  permission — that was checked on this tree by another agreement. At the commit the miss has not left
  yet, and a refusal there would get in the way more often than it would help.
- **The sign of a machine commit is the login, not the mail.** In such a commit it is exactly the mail
  that is wrong, and recognising by it would mean skipping exactly the case the guard was created for.
- **The login is read from the declared mail, it is not declared as a second property.** Two
  declarations of one name would diverge silently. The already declared assignee of the task was
  rejected too: where the hosting limited the machine record, a person is set as the assignee, and the
  commit stays a machine one.
- **Refuse, do not print.** The first record of the proposals asked to print the divergence aloud, the
  second — after the second red pipeline — to refuse. The second was taken: a printed warning reads as
  permission.
- **The list is declared by the tree, not by the package.** The package knows neither the names of the
  steps nor what they are closed by: every tree has its own pipeline and its own runner targets.
- **The check stays silent where there is no pipeline.** Otherwise the very first tree without one
  gets a red check for nothing and takes it out of the set whole.
- **The declared list lives in the check setting.** The check reads it directly, and the gate set is
  asked of the profile by its own shell: two places instead of one, but each answers for its own — the
  setting for the declarations, the profile for the execution. A separate profile function was
  rejected: it would return the declarations by the same shell as the set, and the divergence between
  them would stop being visible.
- **The name of a step is taken by a sample the tree names.** Every hosting has its own shape of
  writing; the default is written for the most widespread kind, the other trees name their own.
- **A compound command is refused whole, it is not taken apart into pieces.** Parsing up to the switch
  with the set run after it was rejected: the guard stands before the command is carried out, and
  "carry out half to decide about the rest" turns the parse into an execution.
- **The list of checks is printed by what lies on the disk.** The push gate does not call a check that
  is not in the tree: a refusal "there is no such file" reads as a breakage of the machine, not as a
  rule.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-05 — creating a branch is recognised with a flag before `-b`, task RT-1799.

- 2026-08-20 — the subdomain was split off from the spec of the tree checks, which had outgrown the
  length limit. The rules, the scenarios and the bindings of the delivery guards and of the push gate
  moved here unchanged: the scenario numbers were not recounted.
