# Reading the cargo from the intake

**Status:** in force · **Revision:** 2026-08-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The cargo intake was arranged one way only: a tree sent incident analyses and proposals and moved
the state of its own records, and it had nothing to read with what lies in its intake — all reading
is closed by a person's sign-in. Because of that the sorting-out order was not carried out whole:
over two hundred records stood as new, because there was nothing to fetch them with, and only those
whose file still lay on the tree's disk were marked.

The subdomain names what the tree fetches the cargo with, what that is closed by and in what shape
what was read is fit for a mark. The state mark is a neighbouring subject: there the records are
moved, here they are read.

## Terminology

- **Cargo** — the records that arrived in the intake: an incident analysis and a proposal about the
  rules layer.
- **A service account** — a record of the intake the executor signs in by. It does not belong to a
  tree: it sees the cargo whole, because one tree fixes it while several send it.
- **A pair** — the name and the password of the service account, lying outside the repository.
- **The mark key** — what a record is named by when its state is moved: for an incident analysis the
  name of the file, for a proposal the sign of its text.

### What it is called in the interface

The command has no interface: only the executor sees it — as the lines of its output. The same cargo
is shown to a person by the admin panel of the intake, and that is a neighbouring domain.

## Rules

- **The cargo is fetched by a command of the tree, not by a person's sign-in to the admin panel.**
  The cargo is sorted out by the executor, and what they cannot read they do not sort out.
- **The reading is closed by the sign-in of a service account, not by the token of the tree.** The
  token opens the intake and only of its own tree, while the whole cargo about resources has to be
  sorted out: several trees send it, and one fixes it.
- **The pair of the account lies outside the repository.** By the same technique as the token: put
  into the tree, it leaves into the history and into every copy of it, and there is nothing to
  revoke it from there with.
- **A missing pair is refused before the network, and the refusal names where it lies and what it is
  created by.** A refusal without an address leaves the executor before the same question the call
  failed over.
- **An unknown kind of cargo is refused before the network and lists the known ones.** There are two
  kinds, and both are named by a word; a call refused over a typo would otherwise look like an empty
  list.
- **Next to a record the key it is marked by is printed.** A key counted by one's own disk finds only
  what still lies there: a deleted analysis file and a rewritten proposal text are never marked.
- **The key of a proposal is counted from its text by the same technique as at the intake.** The
  storage does not give it out, and the shape of the count is declared by one side — by the intake —
  and the second is bound to count the same way.
- **A page reads the texts of the records through.** The list does not carry them, and without the
  text a proposal is visible but not markable: its key is the sign of the text. An overview without
  texts stays a separate argument and speaks of its own incompleteness itself.
- **A record whose text was not read through does not drop out of the list.** It arrives without a
  key, and the line about it says so: having vanished silently, it would read as sorted out.
- **The reason of the quarantine is printed next to the record, in the row and in the record
  whole.** A list of the disputable naming no reason answers only "this one is disputable", and the
  record is taken apart anew — which is what the quarantine was started against. The row carries the
  reason cut to its width, the record whole carries it as it lies.
- **The filter by state and by tree leaves in the request line, it is not sifted on one's own
  side.** Sifting after the reading would show a page in which the needed records may not be at all,
  and the page count would lie along with it.
- **A record whose article already stands in the sources of the package is picked by the command,
  not by eye.** An edit arrives by an edition later than the send, and such a record hangs in "new":
  the next session reads the proposal, opens the resource and finds the article standing. Over one
  night that happened five times in a row on one rule.
- **The pick goes by the title of the proposed article and by nothing beyond it.** A proposal carries
  a quote, an article has a title, and it either stands in the sources or not. A record whose
  proposal landed in the tree in other words is not found by the command — that is its boundary, and
  the output names it.
- **The pick writes nothing outward and prints the mark calls.** The mark is set by the mark command,
  and it is called by whoever read the list: a pick by title is an argument, not a confirmation.
- **Two mark calls are printed: the order of the states is not skipped over.** The intake refuses a
  move from "new" straight into "done" line by line, and one printed call would be refused whole.
- **A record taken into work whose work has ended is picked by the same call.** The mark "done" is
  set by the state step `влито`, and the turn about a task does not always end: over one sorting out,
  forty-six records stood in "in work" with the edit lying in the main branch. There are two signs
  and either is taken — the article title stands in the sources, or the full key is named in the
  archive; the second catches what landed in the tree in other words.
- **A key from the archive is judged in full.** Eight characters are not enough for the mark command:
  it answers a short one with "the tree has no such record", and a list gathered by it would be
  refused line after line.
- **An answer of the intake that did not parse differs from a refusal of the intake.** The first
  means a miss of the parsing, the second a check that fired on that side, and they are fixed in
  different places.

## States

| What happened                        | What the executor sees                                    |
| ------------------------------------ | --------------------------------------------------------- |
| there is no pair                     | a refusal with the address of the pair and its command    |
| the kind is named by a wrong word    | a refusal with the list of known kinds                    |
| the pair was not accepted            | a refusal with the answer of the intake                   |
| the cargo was read                   | the total count, the page count and records with keys     |
| a record's text was not read through | a line of the record without a key and words about it     |
| the filter names the quarantine      | the records of the quarantine, each with its reason       |
| nothing fell under the filter        | the count "total 0" and an empty list: this is no refusal |

## What is out of scope

- The state mark of a record: it goes by its own command and its own closing key — the token of the
  tree.
- Sorting out the cargo itself: deciding what of what was read becomes an edit is the gathering of
  proposals, a separate step of the rule.
- Creating the service account: it is created by a command of the intake on its own side.
- Showing the cargo to a person: that is the admin panel of the intake, a neighbouring domain.

## Contract

The surface is the launch line of the command. The answer is either the lines of the cargo or a
refusal naming what was missing. Outward the command goes by a sign-in and by reading the list of
the intake; it has two closing keys, and it creates none of its own: the pair arrives from a file
named by the setting of the tree.

### Refusal codes

Not applicable: the command has no named codes — it answers zero when the cargo is read and one when
it is not.

| What happened                                         | How it ends | What it says                                       |
| ----------------------------------------------------- | ----------- | -------------------------------------------------- |
| no pair or no address of the intake                   | one         | where this is set and what it is created by        |
| the kind is named outside the set                     | one         | the list of known kinds                            |
| the sign-in was not accepted                          | one         | the answer of the intake in words and its number   |
| the intake did not answer or the answer did not parse | one         | what exactly happened, without guessing the reason |
| the cargo was read, an empty one included             | zero        | the count and the records with their keys          |

## Data

There is no storage of its own. The address of the intake and the path to the pair are taken from
the setting of the tree or from the environment; the pair itself is two lines of a file outside the
repository. What was read does not land on the disk: the cargo lives in the intake, and a second
copy of it at the tree would diverge from the first silently.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output of the command is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The cargo in the intake lies there from several trees, and the reading sees them all: the list can
be narrowed to one tree by an argument, but by construction the access is not narrowed. The mark
stays one's own at that: nobody has the right to move a neighbour's states, and it is closed by the
token of one's own tree.

## Decisions

- **We read by the sign-in of the service, not by the token of the tree.** So the owner decided. The
  receiver is not edited by a single line at that, and the cargo about the package resources is
  visible whole. Rejected: reading one's own records by the token — it is both simpler and leaves the
  neighbours' proposals invisible to whoever fixes them. Rejected: a sign of the resource owner at
  the tree — it demands editing the storage and leaves the foreign incident analyses closed anyway.
- **The key is counted on the tree's side, it does not arrive as a field.** Giving it out as a line
  of the list would mean editing the intake, and the shape of the count is already declared by the
  intake and is repeated here verbatim.
- **The texts are read through by the page, not one record at a time on demand.** There is nothing to
  open a record by a separate call with: the output holds no sign of the record, and printing it next
  to the key would mean showing two similar values of which one is fit for nothing.
- **The pair is read as two lines of a file, not as one with a separator.** A password has the right
  to hold any character, and a separator met inside it would cut the pair silently.

## Open questions

- `Q-CR-1` — what was read lands nowhere, and the sorting out goes in the same session. A session
  that ended before the sorting out starts by reading anew; how much that costs has not been measured
  yet.

## History of changes

- 2026-08-24 — the subdomain was created together with the reading command: before it the tree read
  no cargo at all.
- 2026-09-09 — the reading prints the reason of the quarantine next to the record; `Q-CR-2` is
  closed: a record no work will be done on goes into the quarantine.
