# Statements to the owner

**Status:** in force · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

Everything an answer to the owner says about the tree they read as a checked fact: "pushed",
"checked", "the run is green". What is said without a command the owner learns last — and learns it
from someone else's work that leaned on that statement. Eight incident analyses in a row fell on this
miss. It is held by the agent hook on the Stop event: a model reads the reply and the calls of the
turn, because a list of words could not tell a statement from a quote, a plan or a negation.

Here belongs the repeat of a miss already taken apart: it is about what is said too, only it is
compared not against a command but against the records about the incidents.

What the other guards of the end of a turn judge is a neighbouring subdomain: there it is about the
exits of a turn, the window of the session and the state of the work.

## Terminology

- **A statement about the state of the tree** — a word of an answer to the owner behind which a
  command of the same turn and its output must stand.
- **A finding of the conscience** — a repeat of a miss already taken apart by a record about an
  incident.

### What it is called in the interface

The subdomain has no interface: the hook and the guard speak with the executor by a refusal, and with
the owner they do not speak at all.

## Rules

- **A statement about the state of the tree said to the owner is confirmed by a command of the same
  turn.** A turn in which a statement is said and no tool result of the turn shows it does not end.
  The agent hook on the Stop event judges it by meaning: a quote, a plan and a negation are not
  statements about a done action. The price of a mistake in the answer is paid by the owner.
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
- The rightness of a conclusion from a right command: the hook judges whether a result of the turn
  shows the stated fact, not whether the conclusion drawn from it is right.
- The analysis of the record about the incident itself: that is the rule of the conduct of work.

## Contract

The hook and the guard get the end of a turn with the path to the record of the turn. The guard
answers with a decision to refuse with a reason, or silence; the hook answers with `{"ok": true}` or
`{"ok": false, "reason": …}`.

### Refusal codes

Not applicable: the guard answers with a decision in the output and exits with zero, the hook answers
with JSON, and neither has refusal codes.

## Data

There is no data of its own: the record of the turn and the directory of the records about the
incidents are read.

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

A statement is judged by a model, not by a list of words: the list refused a quote of someone else's
word, a negation and a description of a command, and missed a statement worded in a way it did not
know.

## Open questions

There are no open questions.

## History of changes

- **2026-08-24** — the subdomain was split out of the guards of the end of a turn: the scenario file
  had outgrown the length limit, and it is split by subject, not by moving the boundary. The scenario
  numbers were not recounted at the move: the number ties the scenario to the test title.
- **2026-11-14** — the guard of the statements was removed; a statement about the tree is judged by
  the agent hook on the Stop event.
