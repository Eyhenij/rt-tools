# The wording of the cargo leaving for the intake

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** `observations` (the send of the cargo)
**Laws:** `project-documentation`, `work-conduct`
**Procedures:** none

## Why

The records in the intake are read by a person, and they are written by a session. The session
writes in the words of the rules layer — a sign, the nearest, refused, an override — and half the
records are unreadable from the first line. The tree already has a check of wording, and a guard
calls it on every edit of a document; the cargo leaves by a command, that is, past the guard. So the
requirement of plain words holds over the tree's own texts and does not hold over what leaves for a
neighbour.

The subdomain names who writes such a record, in what shape the wording is judged before the send,
and what happens to a record that did not pass.

## Terminology

- **A cargo record** — a proposal about the rules layer or an incident analysis: what leaves for the
  intake and is read there by a person.
- **The wording check** — the tree's check of officialese, of words outside the glossary and of
  sentence length. It gives findings: the line, what was found, what to replace it with.
- **A refused record** — one whose text the check found findings in. It does not leave and stays
  lying on the disk until it is fixed.
- **The role of the writer** — the role called to write a record: it gives the text and writes no
  files.

### What it is called in the interface

There is no interface: the record is written in the executor's turn, and the refusal is a line of
the send command's output.

## Rules

- **The wording of a cargo record is judged before the send, not only on an edit of a file.** The
  guard judges an edit of a document, and the cargo leaves by a command: a record written in one
  turn and sent in another passes no check at all.
- **A record is refused by name, and the rest of the batch leaves.** The same technique as with the
  quote of the nearest statement: one unreadable record is no reason to hold up a neighbour's work.
  The refusal names the file, the line and what was found.
- **A refused record stays lying on the disk.** It leaves after the fix, and the mark of the send
  does not stand on it: a record that vanished silently would read as sent.
- **Both kinds of records are judged — a proposal and an incident analysis.** They are read by one
  person and are written by one session; a check on one kind would leave the second in the words of
  the rules layer.
- **A tree that has no wording check sends as before, and the send says so.** The check arrives by
  the layout, and a tree that dropped it has nothing to judge by: a silent pass would read as a
  check that found nothing.
- **The record is written by a role of its own, and it writes no files.** A record leaves for a
  foreign repository, and laying it on the disk is the business of whoever answers for the send. The
  role gives the text and the address.
- **The role writes into the ready-made shape, not into one of its own.** The shape of a proposal is
  judged by the machine — the heading, the address, the four lines and the quote of the nearest
  statement; a record in a shape of its own is refused by that judgement.
- **The role is asked for a text, not for a verdict on the work.** Whether the proposal is worth
  making is decided by the review of a closed task and by the executor; the role turns a decision
  already made into words a person reads.

## States

| What happened                       | What the executor sees                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| every record is clean               | the send goes as before                                    |
| one record has findings             | it is named by file and line; the rest of the batch leaves |
| every record of a kind has findings | that kind does not leave at all, and the line says so      |
| the tree has no wording check       | the send goes, and the output names that it was not judged |

## What is out of scope

- The wording of the tree's own documents: it is held by the guard on an edit, and this subdomain
  does not touch it.
- Rewriting what already lies in the intake: the check stands on the road outward from this day on.
- The judgement of whether the proposal is right: that is the comparison with the spec, a
  neighbouring subdomain.

## Contract

The surface is the send command. The answer is the same as before, plus the lines about the refused
records. Outward nothing new goes: the check works on this side, before the request.

### Refusal codes

Not applicable: the command has no named codes — it answers zero when the cargo has left and one
when it has not.

| What happened                      | How it ends | What it says                       |
| ---------------------------------- | ----------- | ---------------------------------- |
| a record is refused by its wording | zero        | the file, the line and the finding |
| every record is refused            | zero        | that nothing of that kind left     |
| the send itself did not go through | one         | what the intake answered           |

The refusal of a record is not the refusal of the send: the cargo goes without it, and the code
stays zero. A non-zero code would mean the executor must repeat the whole send, while what is to be
fixed is one text.

## Data

There is no storage of its own. A refused record lies where it lay — the proposals directory or the
directory of the analyses named by the settings.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

The records are written in the owner's language, and the check judges that language. A record in
another language the check does not see at all — its signs are written for one.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The cargo of one tree is judged on that tree's side, and a neighbour's records the check never
reaches: they lie in the intake and have already passed the send at their own place.

## Decisions

- **The check stands on the send, not on the intake side.** The intake takes cargo from several
  trees, and the signs of the check are the tree's own — the glossary and the bans live in its
  settings. Judged at the intake, they would refuse a neighbour by the rules of somebody else's
  tree.
- **A refused record does not fail the send.** The batch carries a summary and a dozen records, and
  a single non-zero code would hold them all because of one text.
- **The role writes no files.** The same reason as for the review role: what acts outside the
  session is laid down by the main agent, and a role that writes by itself leaves what nobody read.

## Open questions

- `Q-CP-1` — the check sees the listed signs and does not see coherence: a text of short sentences
  with clean words passes it whole while saying nothing. Whether the role's text is read by a person
  before the send is not decided.

## History of changes

- 2026-09-09 — the subdomain was created together with the check on the road outward: before it the
  wording of the cargo held by the memory of whoever wrote it.
