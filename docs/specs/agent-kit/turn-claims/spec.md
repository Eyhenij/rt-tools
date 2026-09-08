# Statements to the owner

**Status:** in force · **Revision:** 2026-08-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

Everything an answer to the owner says about the tree they read as a checked fact: "pushed",
"checked", "the run is green". What is said without a command the owner learns last — and learns it
from someone else's work that leaned on that statement. Eight incident analyses in a row fell on this
miss, and now it is held by a machine.

Here belongs the repeat of a miss already taken apart: it is about what is said too, only it is
compared not against a command but against the records about the incidents.

What the other guards of the end of a turn judge is a neighbouring subdomain: there it is about the
exits of a turn, the window of the session and the state of the work.

## Terminology

- **A statement about the state of the tree** — a word of an answer to the owner behind which a
  command of the same turn and its output must stand.
- **The kind of a command** — what shows exactly this statement: a run of the tests, `git push`, a
  call about a request. A general sign "there was a command" would confirm one thing by another.
- **A shape of waiting** — the same statement said about someone else's step: "waiting for the run"
  instead of "the run is green". There is the same thing for them to lie about.
- **A finding of the conscience** — a repeat of a miss already taken apart by a record about an
  incident.

### What it is called in the interface

The subdomain has no interface: the guards speak with the executor by a refusal, and with the owner
they do not speak at all.

## Rules

- **The guard of the statements waits for the text of the answer, it does not judge the record as it
  found it.** The text lands in the record of the turn no earlier than the host calls the hook, and
  a record read too early looks like a turn without a single word to the owner. Not having waited for
  the text, the guard gives the turn back. The refusal belongs to one guard: were all three that
  judge the text to print a decision, the output would stop being parsed whole.
- **Words about waiting for someone else's step are judged on a par with the other statements.**
  "Waiting for the run" and "the run has not started" speak of the state of the hosting, and there is
  something for them to lie about: a run is sometimes green for an hour, and sometimes has not
  started at all.
- **A statement about the state of the tree said to the owner is confirmed by a command of the same
  turn.** A turn in which a statement is said and there was no command does not end. The answer to
  the owner is read by no check: the gate answers for a file, the author for the answer, and the
  price of a mistake in the answer is paid by the owner.
- **Every word of a statement has a kind of command of its own named.** A run of the suite confirms
  "checked", a call of the push "pushed", a call of the removal "the branches are removed", a search
  over the tree "there is nothing of the kind here". A general sign "there was at least some command"
  would confirm one thing by another.
- **The command is looked for in the same turn, not in the past ones.** The state of the tree
  changes, and the output of a past turn no longer speaks of the present one.
- **What is judged is what was said to the owner, not the output of a tool.** The same words that
  arrived as the answer of a command or were written into a file the guard does not touch: they are
  read by the gate and the checks.
- **A promise does not count as a statement.** "I will run the suite", "I will check now" speak of
  the future, and there is nothing for them to lie about.
- **The refusal names the statement it found.** Told "not confirmed" without the word itself, the
  executor reads it as nitpicking and edits the neighbouring phrase.
- **Someone else's word does not count as a statement about the tree.** A quotation in quotation
  marks, a quoting line, code and a sentence with a condition speak of someone else's text, not of
  the state of the tree. A guard refusing them teaches not to write quotation marks, not to check the
  tree.
- **The refusal names as the first exit the removal of the statement, not the launch of the
  command.** In a turn where the owner asked for no command, a launch for the sake of lifting the
  refusal leads into a delivery more dangerous than the one the guard watches.
- **A wrong conclusion the guard does not judge.** About a sample judged by one of its files, and
  about a way a person will not go, a machine has nothing to judge by: there is neither a word of a
  statement nor a command to compare with. That is its known boundary, not a promise.
- **The guard of the statements lets the work through at any breakage.** There is no record of the
  turn, there is no parser, the text of the answer is empty — the turn is allowed.
- **A turn in which the conscience found a repeat of a miss already taken apart does not end.** The
  analysis explains the mechanism, but it is read by whoever opens the directory themselves; the miss
  one has to be reminded of is exactly the one the executor does not remember at that minute.
- **A finding is lifted by an action, not by words about it.** Work put right, an analysis created or
  the repeat named to the owner — any of the three; silence lifts nothing.
- **The rightness of a finding the guard does not judge.** That is decided by the executor, and their
  decision is the work of the next turn: a false finding is named to the owner the same way as a true
  one.
- **A finding is the answer of the role, not the mark met in the turn.** The mark printed in the
  answer of a tool that reads or writes files, and the mark quoted in the executor's own text, are
  not a finding: a record of the past naming that mark in its list of what is deliberately kept
  turned every reading of it into a refusal by a finding that never was. The call whose answer is
  discarded is recognised by its identifier, so one such call does not mute the answers of all the
  rest.
- **The deed by a finding is looked for over the whole record of the turn.** The analysis is created
  by a command, the work is put right by an edit, and the word to the owner lies in the reply text:
  narrowed to where the role answers, the search would lock the turn for good.
- **The refusal quotes the answer it judged.** Taken by a search over the raw record, the quotation
  names the first mark met — that is, the read file — and sends the executor to look for a finding
  where there is none.

## What is out of scope

- The exits of a turn, the window of the session and the state of the work: a neighbouring subdomain.
- The rightness of a conclusion from a right command: the guard knows the words and the commands and
  does not know whether the conclusion is right.
- The analysis of the record about the incident itself: that is the rule of the conduct of work.

## Contract

The guard gets the end of a turn with the path to the record of the turn. The answer is a decision to
refuse with a reason, or silence.

### Refusal codes

Not applicable: the guard answers with a decision in the output and exits with zero, and it has no
refusal codes.

## Data

The guards have no data of their own: they read the record of the turn and the directory of the
records about the incidents.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

The refusal about a text not waited for belongs to one guard: were all three that judge the text to
print a decision of their own, the output would stop being parsed whole.

## Open questions

There are no open questions.

## History of changes

- **2026-08-24** — the subdomain was split out of the guards of the end of a turn: the scenario file
  had outgrown the length limit, and it is split by subject, not by moving the boundary. The scenario
  numbers were not recounted at the move: the number ties the scenario to the test title.
