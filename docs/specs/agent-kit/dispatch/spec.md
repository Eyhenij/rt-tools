# The dispatcher of the agent's events

**Status:** in force · **Revision:** 2026-08-23 · **Scenario prefix:** `SC-AK`
**Depends on:** `layout` — the record of the declaration is written by the layout
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

The agent calls a hook by a process of its own and gives every one of them the same input. While
every guard parsed that input itself, one tool call cost more than a hundred parses of one text:
eighteen guards at six or seven calls of the parser in each. The subdomain names what must be true at
that: who reads the input, who checks the call sample and what the dispatcher does with the refusal
of a branch.

What each guard judges the subdomain does not touch at all — those are neighbouring subdomains: the
edit guards and the turn-closing guards.

## Terminology

- **An event** — what a hook is subscribed to: a tool call, its completion, the end of a turn, the
  start of a session, the compaction of the context.
- **A branch** — a guard that declared this event by an `rt-hook` line in its header. The file stays
  the same, only who calls it changes.
- **The call sample** — the expression at the declaration of the event: the names of the tools the
  branch is called on. An empty sample means "on any".
- **A direct call** — running a guard without the dispatcher: that is how the scenario suites and a
  person call it.

## Rules

- **An event of the agent is called by the dispatcher, not by a list of guards.** The dispatcher
  reads and parses the input once, puts the fields into the environment and calls the branches of the
  event. The measurement of the tree where this was counted: 826 milliseconds per call before and 441
  after.
- **The call sample is carried by the header of the guard itself, and the dispatcher checks it.** A
  list written out separately would diverge from the set of files at the very first guard added, and
  there would be nothing to notice that by: the guard simply would not be called.
- **The sample is checked against the name of the tool whole, not against a piece.** Otherwise the
  sample `Edit` would catch `NotebookEdit` too, and the branch would judge a call it has nothing to
  do with.
- **The subject of the check is picked by the event: the tool name where there is one, the kind of
  the start where there is none.** At the entry into a session there is no tool name, and the sample
  there names the kind of the start — a start, a continuation, a compaction, a clearing. A check
  against an empty name never matched once: not one entry hook was called through the dispatcher, and
  the session began without the body of laws, without the glossary, without the state of the work and
  without the handover of the previous session. There is no refusal at that — a zero code and empty
  output, that is exactly what the rule of the entry calls indistinguishable from a broken one.
- **All the event declarations of a file are read, not the first one.** A guard has the right to
  stand on two events at once, and the setting of the agent knows this — while the dispatcher read one
  line and never called the second branch once. The silence at that is complete: from outside such a
  guard is indistinguishable from one that looked and let through. A declaration matched — the branch
  is called once, however many lines matched.
- **The refusal of a branch arrives as a decision in the output on a par with the exit code.** The
  turn-closing guards refuse by a decision and leave with zero: the dispatcher, looking only at the
  code, went on and glued their object together with the output of the next branch — and what is glued
  does not parse, and the refusal vanished whole.
- **A refusal said into the error stream reaches the executor.** The error stream of a branch on a
  successful move is noise, and it does not go outward; on a refusal it is the reason itself. A guard
  printing its refusal there arrived as a line about a broken file — at a whole file and an
  understandable text nobody saw: in one session two refusals vanished that way in a row. The name of
  the branch is named only where both streams are empty — then there really is nothing to fix.
- **The refusal of a branch is given to the agent as it is, and the branches after it are not
  called.** The exit code and the output belong to the guard: the dispatcher does not rewrite them and
  adds no text of its own to them.
- **What is laid out and needs a record in the setting of the agent reaches it.** A guard is called
  not by a file but by a record, and one laid out without it is indistinguishable from a working one
  from outside: the file lies there, it is committed, the audit is green — and the call its body is
  written for it never sees. The record is written by the layout itself, by the same move it puts the
  file by; the printed piece with a request to insert it by hand stays where the setting cannot be
  parsed as JSON.
- **A record in the setting of the agent only adds.** Not one record standing there is rewritten or
  removed — neither a package one nor a foreign one: a tree that removed a guard by its own decision
  is not punished by an edit. The argument the package formerly wrote nothing there by — the silent
  loss of what did not match when merging foreign JSON — is removed by construction: there are as
  many events as lines, and there is nothing to replace at the write.
- **A guard called directly works as before.** It asks the environment for the fields and parses the
  input itself when there is no environment. Otherwise the scenario suites would check not the guard
  but the dispatcher.
- **The input stream is read by a command, not by a substitution.** A substitution goes in a subshell,
  and what is remembered there dies with it: the first call would read the stream out, the second
  would get emptiness — and the guard would let through a call it was bound to refuse.
- **The refusal of a closing guard is checked on the link with the dispatcher, not on the guard
  alone.** The guard refuses by a decision in the output and leaves with zero, and whether that output
  reaches the agent depends on the dispatcher: the declaration of the event, the search for the branch
  and the giving out of the output lie in it. A guard whose refusal is lost on the way does not count
  as protection, and its silence reads as agreement. A hand-written branch does not show this — it
  checks the giving out of the output and does not check that the real guard is called at all.
- **A broken dispatcher does not jam the work.** No event as an argument, an empty or unparsable input
  — an exit with zero: this is the same rule of refusing in favour of the work the guards themselves
  live by.
- **A branch that left with a non-zero code and said nothing is named by name.** Such an outcome is
  indistinguishable from a refusal on the merits from outside, and there is nothing to fix it with:
  the dispatcher mutes the error output of the branches, and nobody knows which file is broken. The
  name is named by the dispatcher itself — otherwise nothing speaks about a broken branch.

## What is out of scope

- What each guard judges: those are the neighbouring subdomains.
- The order of the branches inside an event: it is derived from the file names and does not count as a
  separate agreement.
- Merging guards into one file: what changes is the entry point, not the construction.
- Returning into the setting a record the tree took out of it: the layout says what is missing and does
  not restore what was removed by the decision of the tree.

## Contract

The dispatcher is called with the name of the event as an argument and gets the input as a stream. The
answer is the exit code of the branch that first returned a non-zero one, and its output; not one
branch refused — zero.

### What it is called in the interface

Not applicable: the harness of the agent has no screens.

### Refusal codes

Not applicable: the exit code belongs to the branch, the dispatcher does not rewrite it and creates
none of its own.

## Data

There is no data of its own. The fields of the input travel to the branches by the environment: the
tool name, the command line, the edit path, the working directory and the input whole.

## Screens and states

There are no screens: this is the harness of the agent.

## Cross-cutting requirements

### Locales

The text of a refusal belongs to the branch; the dispatcher writes no text of its own.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- 2026-08-23 — the subdomain was split off from the spec of the edit guards: that one had outgrown the
  length limit, and the dispatcher has a subject of its own — not what the guards judge, but who calls
  them and in which order.

## Open questions

- `Q-D-1` — the order of the branches inside an event is derived from the file names. While there are
  few branches this is unnoticeable; whether a declared order will be needed the first case will show,
  when it matters to two branches which comes first.

## History of changes

- 2026-08-23 — the subdomain was created.
