# Observation lines leave for the intake — the sending side

**Status:** proposed · **Revision:** 2026-09-14 · **Scenario prefix:** `SC-AK`
**Depends on:** `message-bus` (the operation that takes the lines in)
**Laws:** `verifiability`, `observability`, `delivery`
**Procedures:** none

The product agreement of the sending side. It merges into two subdomains of the domain: what a
line carries into "Observations", what leaves outward into "Cargo outward". The receiving side —
the intake, the storage, the reading and the section of the admin application — is the agreement
of the same name in the domain of the intake.

## Why

The owner of the intake wants to see, per consumer tree, which skills and rules the sessions load
and how many times, over any period and by session. The digest cannot answer that: it covers the
last three days, replaces the former one whole, drops the tree's own skills and loses the session
and the time at summing. Only the lines on the disk of the tree hold all of it — so the lines leave
as they are, and the intake counts.

The owner named the sample: an analytics module of a neighbouring tree of the same layout — raw
events with a session, counted in the database, kept a year. This agreement is the sending half of
that shape.

## Terminology

| Term                  | What it is                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| An observation line   | One row of the day file: the time, the event, the resource, the kind of edit, the session sign, the version       |
| The observation cargo | The fourth kind of cargo: the lines of the window of the run, grouped by day, plus the kind of every loaded skill |
| The kind of a skill   | One of three: a rule of the package, a pattern of the package, a skill of the tree's own                          |
| The session sign      | The checksum of the session id, as the line carries it: it counts sessions and names none                         |
| The window of the run | The days the run reads, the same as the digest's: the last three by default                                       |

### What it is called in the interface

| In the agreement      | In the launch line                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------ |
| the observation cargo | `agent-kit propose` — the line `observations — строк N за D дн.` in the print of what goes |
| the dry run           | `agent-kit propose --dry-run` — the same line, nothing leaves                              |

## Rules

- **Every line of the window leaves, of every event kind.** A load, a refusal of the rules gate, a
  refusal of a guard, an outcome of the push gate: the intake counts loads first, and a second
  edition of the cargo for the refusals would cost a second edition of the storage.
- **The lines leave grouped by day, and a day leaves whole.** The intake replaces a day whole; a day
  sent by halves would be replaced by its second half.
- **A load names the kind of its skill.** A rule of the package, a pattern of the package, a skill of
  the tree's own: the kind is read from the layout of the package at the minute of sending — a name
  the package laid out under `rules/` or `patterns/` is its own kind, anything else the tree's own.
  The tree's own skills leave by name: the owner asked for what the trees wrote for themselves.
- **A line leaves as it lies, and nothing is added to it but the kind.** The session sign stays a
  checksum, the path is absent as before; the cargo carries no more about the tree than the digest.
- **A broken line does not leave and does not stop the cargo.** The reading of the day file skips it,
  as the digest does: an observation is a side record of a guard.
- **The cargo goes by the same request as the rest, with the tree token, and only by a command.** No
  background sending: the line "nothing goes outward that a person did not send by a command" holds.
- **The check for a tree address covers the observation cargo.** A resource name is a package name
  or a skill name; a slash in a value is not written by the guard at all.
- **The schema version of the cargo rises.** A tree on the former edition sends three kinds, and the
  intake takes them as before; the version says which edition the lines came from.
- **The dry run names the observation cargo with the number of lines and days.** What leaves is
  read from the print, not remembered.

## What is out of scope

- **Measuring the session time and the token cost.** Named by the owner outright.
- **New kinds of events created for the sake of observation.** The four kinds are what the guards
  already emit.
- **Any change to the digest.** It leaves as before, next to the lines.
- **Sending from several machines into one tree file.** Every machine sends its own lines; the
  intake counts across them by the tree.

## Contract

One request per run: `POST /api/intake/observations` with the header `X-Tree-Token`; the body is
the observation cargo. The form is declared once, in the cargo module of the package, and the intake
reads it from the same declaration:

```
{ schema, tree, days: [{ day: 'YYYY-MM-DD', lines: [{ t, ev, res, kind?, sid, v, skill?: 'rule'|'pattern'|'own' }] }] }
```

### Refusal codes

The intake's, not the sender's: a refused request is printed by the send as today — the operation,
the status and the text of the refusal.

## Data

No storage on the sending side: the lines lie in the day files as before, thirty days.

## Screens and states

The launch line only: the line of the cargo in the print of `propose` and of `propose --dry-run`.

## Cross-cutting requirements

Not applicable: no screen, no locale.

## Decisions

- **Raw lines, not a month block inside the digest.** The owner chose the raw lines; a block would
  keep the counts without the sessions and the days. Rejected: a month block, counted by the tree.
- **The kind is counted by the sender, not by the intake.** Only the tree knows its layout; the
  intake knows no package. Rejected: a list of package names at the intake.
- **A day is the unit of replacement.** The day file is the unit on the disk, and the windows of
  runs overlap by days; the intake needs no sign of a run. Rejected: a run id and dedup by line.

## Open questions

- `Q-1` — whether the window of the observation cargo should be longer than the digest's three
  days, so that a tree that runs the send rarely loses no lines. The work goes with the same window;
  the number is one flag of the command.

## History of changes

- 2026-09-14 — created from the grill of the owner's request about the statistics of rule usage in
  the sessions of consumer trees. Rewritten the same day: the roles had replaced the raw lines by a
  month block against the owner's answer; the owner's answer holds.
