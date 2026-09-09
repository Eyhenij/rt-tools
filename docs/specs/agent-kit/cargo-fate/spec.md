# The fate of one's own records in the intake

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** `message-bus` (the intake gives out the records of a tree by its token)
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

A tree sends a proposal and hears nothing back. To go on working it puts an override next to the
laid-out resource, and that override lives for ever: the fix left in a new edition long ago, while
the section still replaces what the package now holds itself.

Half of the link exists. The section of the override carries a mark — the resource, the article and
the day of the send — and the layout names the sections whose article the new edition already
holds. The other half is missing: what happened to the record itself. Whether anybody took it into
work, what it was fixed by, in which edition the fix came out — the tree has nothing to ask that
with, because all reading of the intake is closed by a person's sign-in.

The subdomain names the command that asks the intake about the tree's own records, what it shows
next to each of them and what it does not do.

## Terminology

| Term                        | What it is                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------- |
| The fate of a record        | its state in the intake, what it was fixed by and in which edition the fix came out |
| A local edit of the harness | an override section, put next to the laid-out resource until the fix arrives        |
| The mark of a section       | `<!-- rt-proposed: <resource> · «<article>» · <day> -->` inside an override section |
| The laid-out edition        | the version of the package resources lying in the tree at the minute of the call    |

### What it is called in the interface

The command has no interface: it is read by the executor as the lines of its output. The same
records are shown to a person by the admin panel of the intake, and that is a neighbouring domain.

## Rules

- **The fate of its own records is asked by a command of the tree, not by a person's sign-in.** A
  consumer has no account of the intake and will have none: accounts are created by the owner of
  the intake, while the tree has only its token.
- **The reading is closed by the token of the tree — the same one the send goes under.** A second
  secret would have to be delivered to every consumer, and a tree that has already enrolled would
  have to enrol a second time.
- **Every record is shown with its state, what it was fixed by and the version of the release.**
  Two of the three answer the question the tree asks: is the fix in the package, and from which
  edition on.
- **An override is tied to a record by the mark of its section, not by a guess from the resource
  name.** One resource collects a dozen proposals over a month, and a guess by name would name a
  section put for a neighbouring article.
- **The lifting of a section is advised by the laid-out edition, not by the word of the intake.**
  The intake says in which edition the fix came out; whether it has reached this tree is said by
  the resource lying in it. A section lifted on the word of the intake alone takes away what the
  installed edition does not hold yet.
- **A released record whose article the laid-out edition does not hold is named as an update, not
  as a lifting.** The tree is a version behind, and the answer to that is an installation, not an
  edit of the override.
- **The command lifts nothing itself.** The mark holds one article, and the section may have been
  written into since: a blind lifting takes away what the mark never covered.
- **A mark whose record the intake does not give out is named apart, not dropped.** It means the
  proposal never left, or left from another tree, or the intake lost it — three different reasons,
  and silence about them reads as "there is no such section".
- **A missing token or intake address is refused before the network, and the refusal names where
  they live.** A refusal without an address leaves the executor before the same question the call
  failed over.

## What is out of scope

- Moving the state of a record: that is the mark command, a neighbouring subdomain.
- Sorting out somebody else's cargo: it is read by the owner of the intake, by their own command
  and their own account.
- Editing an override: sections are lifted by a person, and how they are written is the skill
  about extending the package.

## Contract

Not applicable: the subdomain owns no procedures. The command asks the intake by one request and
reads the tree by files.

### Refusal codes

Not applicable: the command answers with a return code of the launch line, and named codes of the
domain it has none. Where it is obliged to refuse instead of staying silent:

| What happened                                | Return code | What it says                                      |
| -------------------------------------------- | ----------- | ------------------------------------------------- |
| the tree named no token or no intake address | `1`         | where both live and what they are created by      |
| the intake did not accept the token          | `1`         | that the reading was refused, and by which answer |
| the intake did not answer at all             | `1`         | that the call did not take place, and why         |

## Data

Not applicable: the command owns no records. It reads the answer of the intake and the overrides of
the tree.

## Screens and states

Not applicable: there are no screens. The output has three parts — records with an override next to
them, records without one, and marks the intake gave no record for.

## Cross-cutting requirements

### Locales

Not applicable: the output is read by the executor, in the one language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The tree is one, and its records are given out by the token: no second tree arrives in the answer.

## Decisions

- **The reading is closed by the token of the tree** — the consumer has no account, and the token
  is already in its hands. Rejected: an account for every consumer — it is created by hand by the
  owner of the intake, and there are as many consumers as there are trees.
- **The intake filters by the tree itself, and the request names no tree** — a filter in the
  request would mean somebody else's records are given out to whoever asks.
- **The lifting is advised by the laid-out edition** — the word of the intake says when the fix
  came out, not whether it has reached this tree.

## Open questions

- `Q-CF-1` — the article of a mark is matched against the text of a record by a plain search of the
  text. A proposal reworded after the send stops matching, and its section is named as one without
  a record. The work goes with that: rewording a sent proposal is not the accepted order, and a
  stricter match has nothing to stand on.

## History of changes

- 2026-09-09 — the subdomain is created: the command of the fate of one's own records.
