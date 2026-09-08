# The edit guards

**Status:** in force · **Revision:** 2026-08-23 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

The rules layer is held not by texts alone: part of it is the hooks that stand at the actions of the
agent and refuse what a rule forbids. The subdomain names what must be true at that for the guards
judging the edit itself: the plan behind it, missing profile functions and the tail of a refusal. How
a rule is picked for an edit is the neighbouring subdomain "The rules gate"; and why a broken guard
lets the work go instead of stopping it.

The guards judging the closing of a turn are a neighbouring subdomain: their subject is the turn, not
the edit, and they grow apart.

## Terminology

- **The domain tier of the gate** — the pick of one rule by the path of a file: an edit has one
  subject, and there is one rule for it.
- **A tier on top** — a demand arriving at the domain rule in addition. It judges the path, the text
  of the edit or both.
- **A sign in the text** — what is visible only in the content of the edit: an access to a global
  object, a check of the runtime environment.
- **A profile function** — a function the hook expects from the tree profile. The hook does not define
  it and is not whole without it.
- **A dead guard** — a laid-out hook that left with zero over a missing profile function. From outside
  it is indistinguishable from a working one.
- **An incident** — a session in which the executor did the wrong thing and the rules layer did not
  refuse it.
- **An incident record** — a file in the records directory: the mechanics of the miss step by step,
  what was available before it, what it was caught by, what went into the rules layer.
- **Admitting a miss** — a reply of the executor in which they called their action wrong. It is caught
  by a set of samples, not by understanding the meaning.
- **The fill of the window** — the share of the session's room it has already taken: the entry, the
  one-off write into the cache, what was read from the cache and the output of the last answer,
  divided by the size of the window.
- **The reminder threshold** — the fill from which the executor is told to pick a stopping point.
- **The stop threshold** — the fill from which only the closing of a session passes.

### What it is called in the interface

The subdomain has no launch line of its own: the guards speak by a refusal and a hint in the course of
the work.

| In the agreement               | What the executor sees                                                      |
| ------------------------------ | --------------------------------------------------------------------------- |
| a refusal by the rules gate    | a refusal with the name of the rule and how to load it                      |
| a reminder about the threshold | a line about the fill of the window and about the stopping point            |
| a refusal after the threshold  | a refusal on everything except closing the session                          |
| a word about what is missing   | a line with the name of the profile function and the file it is expected in |

## Rules

- **The scenario suite takes a port from the system, it does not assign it by a number.** The runner
  stands on one machine, and a run going next to it takes the assigned number: the double falls with
  the refusal "the address is taken", and with it every check of the suite. The run turns red over a
  cause that is not in the edit, and that reads as a breakage of the branch.
- **A suite that accumulates a count of checks gives that count back by the exit code.** The count
  lives in a variable of the harness, and one line of the total moves it onto the code; without it the
  suite ends with whatever stood last — that is, always with zero. A check that failed is printed as a
  line at that and affects the colour of the run in no way.
- **A hook that is missing a profile function says so instead of staying silent.** Once per session,
  with the name of the function and of the file it is defined in. Silence would mean at once "there is
  nothing to check", "there is nothing to check with" and "all is well".
- **A message about what is missing does not turn the hook into a refusal.** The hook still lets the
  action through: it reports its own incompleteness, it does not judge an edit there is nothing to
  judge with.
- **The state report lists the profile functions the laid-out hooks expect, and those of them that are
  not defined.** Otherwise what is missing is visible only to whoever is editing a file at that minute.
- **A session begun from a handover edits no files while the rule of conducting work is not loaded.**
  The handover lies outside the tree and is read by no check; it is read as an assignment and the work
  is taken up past the rule.
- **The handover is recognised both by the path to it and by a word about it.** It is given as text no
  less often than as a path.
- **The plan guard judges the declared transition, not the presence of files.** An artefact on the disk
  does not say whether the work has reached the editing of code: an empty plan put there to lift the
  refusal lies the same way a written one does. The state of the work is declared by a line in the
  course of the work, and it is what lifts the refusal.
- **A refusal by state names the mandatory action of the state that is declared.** An executor told
  only "the wrong state" rewrites the state line instead of making the step.
- **Only a word from the list counts as a state name.** A word of one's own says nothing about the
  entry, the exit or the mandatory action, and the list names all three.
- **The state is judged before the agreement and its bypass.** A bypass lifts the demand of a product
  agreement, not the demand to reach the state in which code is edited.
- **The task folder is asked of the history of the branch too, not only of the disk.** Four demands of
  the guard look at the working tree, and a folder never committed passes them all without a single
  refusal — while the sign of handed-in work is taken from the history, and there it is not. The
  refusal arrives at the last point, at the opening of a request, when the folder is already taken
  apart by one's own hands. There is no history at all — there is no demand: there is nothing to ask.
- **The sign of an interpreter is read at the line that opened the body, not at the whole command.** A
  heredoc body has a place in the parse only when an interpreter opened it: code arrives to it exactly
  as a body. A sign reading the whole text at once switched the cutting off over one word inside the
  document — the line "Checked by: `bash …`" in a plan made the writing of the plan an edit of
  application code, and the guard refused the writing of the very file whose absence it refuses over.
- **The sign of application code is judged relative to the root of the tree.** A directory with a word
  from the sample is met outside the repository too; an edit of a file outside the root is not
  governed by the plan of the branch at all.
- **A refusal of a guard names two lawful moves.** Fix what is named and repeat the call — or bring
  the owner the price of a bypass and wait for their word. An empty place here is taken by a third
  move that is not in the rules: to bypass silently — by a shell command, by a neighbouring tool, by
  editing the guard itself. In one hour two refusals in a row were bypassed that way, and both times
  the edit landed past the guard.
- **The lawful shape of a bypass is named by the same tail, and its absence too.** A bypass known to be
  lawful is looked for by the words of the refusal, not past the guard. A refusal that has no lawful
  shape says so outright: silence reads as "there is a shape, it is simply not named".
- **The tail of a refusal is assembled by a shared function, not by every text on its own.** Written
  one at a time, it is skipped where the refusal was created later, and the skip is visible only to
  whoever got that refusal. A guard that refuses nothing gets no demand at all.

- **The start of a call counts variable assignments as part of the command, and it is declared in one
  place.** A call with an assignment before the command name is an ordinary shape, and part of the set
  demands it outright: the identity of the call that opens a request is visible from the command only
  by an explicit substitution of the token. A sign without assignments goes blind on this shape
  silently — it does not refuse and does not warn, it does not count the call a call, and the whole
  subject of the guard stays unjudged. That is how a push, an opening of a request, a lifting of a
  draft and a merge went past their own guards. The sign is bound to err towards a surplus firing: a
  guard that did not recognise a call looks sound, and one that fired on a surplus is seen at once. The
  assignment itself does not count as a call — the name of a command must stand after it.
- **An assignment before the name of a command hides no call — whatever the shape of its value.** A
  value comes without spaces, as a substitution and in quotes; a sample that accepted only the first
  shape did not recognise the command requests are opened by in the tree, and the silence of the guard
  read as permission.
- **The sign stays a sample, not a shell parser.** A substitution is taken up to the first closing
  bracket, a quoted string up to the closing quote of the same kind; the sample parses no nested
  brackets and quotes.
- **The sign is bound to err towards a surplus firing.** A guard that did not recognise a call stays
  silent and looks sound; one that fired an extra time is seen at once and is fixed.
- **A file put by the layout demands no pair of "an edit and its document".** It has one author in a
  consumer tree — the package. Otherwise the very first layout demands a bypass over its whole volume,
  and a bypass declared over a hundred files lifts the demand from the future edits of those files by
  hand too.

- **A linter command that did not name the edited file is named by a word, not by a refusal.** Such a
  command does one of two things: it walks the whole tree or checks nothing — and in both cases it
  looks like a clean linter. There is nothing to tell a miss from an honest run over the whole set, so
  the hook speaks into the error stream and stops no work: a refusal would break a tree that lints the
  whole set by one command. The word is said once per session — on every edit the same line would
  repeat dozens of times and would stop being read.

## What is out of scope

- Judging whether a stopping point is a good one: the window guard sees the fill, not the state of the
  work.
- The pick of a domain rule: the tiers come on top of it and do not cancel it.
- A rule for a linter config that is not in the tree: the gate stays silent about a rule that was not
  laid out.
- Understanding the meaning of a reply: an admission of a miss is caught by samples, and a miss
  admitted in words outside the set the mechanism lets through.
- Taking a defect in code apart: it has a product agreement, and it does not become an incident record.
- Editing the rules layer automatically by an incident record: the record obliges the executor, not the
  machine.
- Walking every profile function at the place of a call: the hook speaks about the one it was missing.

## Contract

The surface is the events of the agent the hooks are subscribed to: editing a file, calling the shell,
a question to the owner, the closing of a turn. The answer of a hook is either a pass or a refusal with
a text naming what the refusal is lifted by.

### Refusal codes

Not applicable: the hook refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                                     | How it ends      | What it says                                              |
| ------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| an edit without a loaded rule                     | the call refused | the name of the rule, the law under it and how to load it |
| a question to the owner without reading the rules | the turn refused | what to read and what counts as reading                   |
| an admission of a miss without a record           | the turn refused | the records directory and the composition of a record     |
| the fill is above the stop threshold              | the call refused | what passes after the threshold                           |
| the hook was missing a profile function           | a pass           | the name of the function and the file it is defined in    |
| the tier has nothing to read the edit text with   | a pass           | nothing: the side work of the gate stays silent           |

## Data

There is no storage of its own. The window guard remembers the reminder step by the session sign as a
file on the disk; the rest is read from the record of the turn and from the tree profile.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guards are one set for all trees, and the names they judge by arrive from the tree profile. A hook
that got no profile function says so and refuses no work: the package has no names of its own.

## Decisions

- **The fill thresholds are counted from the last record of the spend, not from the sum over all.**
  What was read from the cache repeats in every record, and the sum comes out many times larger than
  the window.
- **The reminder step is remembered by the session identifier.** A file on the disk outlives the guard
  calls, which know nothing about one another.
- **The branch of a rule and a pattern in the gate map stands before the branch of any document.**
  Otherwise they go under the wording rule, and that one is about words, not about construction.
- **The repeats check demands one rule, not two.** The demand of the lib layout was lifted: it speaks
  of the check by one line with a reference, and the bindings of the signs stand at another rule.
- **The hook speaks about what is missing once per session.** On every call it would repeat the same
  thing dozens of times per session, and the message would stop being read. Rejected: a message on
  every call.
- **An admission of a miss is caught by samples, not by judging the meaning.** The judgement would be
  assigned by whoever it hinders. The set of samples is visible, is added to by an edit and misses
  noticeably. Rejected: a decision by the meaning of the reply.
- **The incident guard judges the closing of a turn, and the conversation guard the tool of the
  question.** By the moment of the admission the miss has already happened, and there is nothing to
  catch earlier; a question can be caught before it is sent, and only there the demand is executable.
  Rejected: one moment of firing for both cases.
- **The tiers are moved into a file called from the gate, not into a guard of its own.** A separate
  guard would repeat the parse of the input and would diverge from the gate silently.
- **The switched-off roles are listed in the setting of the tree, and the guard at them stays
  standing.** A line cut out of the agent setting by hand is lost at the very first edit of that file,
  and there is nothing left to bring the role back with. Rejected: giving up the file of the role — it
  removes the role together with the possibility of calling it, while the guard at it goes on refusing.
- **The list of switched-off roles is read by the guards themselves, not by a setting parser.** A hook
  has no parser, and dragging one there costs more than reading one list. Rejected: an environment
  variable in the tree profile — the profile speaks of paths and commands, not of the composition of
  the rules layer.
- **The sign of a call lives in the map, not in the gate.** The gate hands the map the text of the
  command whole, and parsing the boundaries of a call belongs to whoever judges by that text. Rejected:
  a separate parse of the command in the shell of the gate — it would diverge from the map of the tree
  silently.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-17 — the subdomain was split off from the domain spec, which had outgrown the length limit.
  The rules, the scenarios and the bindings of the turn guards and of the rules gate moved here
  unchanged: the scenario numbers were not recounted.
- 2026-08-23 — two subdomains were split off from this one: the exam on the rules and the rules gate.
  The subdomain had outgrown the length limit, and it is split by subject: here the guards judging the
  edit itself stayed.
