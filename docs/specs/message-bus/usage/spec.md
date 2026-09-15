# Usage of the rules in the sessions of the trees — the intake, the reading and the section

**Status:** in force · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (the observation lines are read from the tree and sent by it)
**Laws:** `verifiability`, `entity-models`, `lists`, `reuse-first`, `frontend-application`, `lib-imports`, `observability`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": the observation lines from the storage to the
screen. It stands apart from the intake subdomain and the admin subdomain because both are at the
length limit and the subject is one from the storage to the screen. The sending side — what a line
carries and how it leaves — is the subdomain "Cargo outward" of the package domain.

## Why

The owner of the intake wants to see, per consumer tree, which skills and rules the sessions load
and how many times — over any period and by session. The digest of a month cannot answer that: it
covers the last three days, replaces the former one whole, and loses the session and the time at
summing.

The trees now send their observation lines as they lie, grouped by day, with the kind of every
loaded skill. This agreement names what the intake does with the lines, how they are counted and
what the section of the admin application shows: a digest of the period above the table — a chart
of the loads by day and the lists of the top skills, the kinds and the refusals — a table of skills
over a tree and a period, and the sessions behind one skill.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what the lines bring:

| Term                   | What it is                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An observation         | One row of the storage: a tree, the sign of its working copy, the day, the time, the event, the resource, the kind, the session sign, the package version  |
| The observation cargo  | The lines of the window of a run of the sending, grouped by day, with the sign of the working copy — the fourth kind of cargo                              |
| The working copy sign  | The checksum of the root of the working copy that sent the lines; one tree has several copies with one tree sign                                           |
| The kind of a skill    | One of four: a rule of the package, a pattern of the package, another skill of the package, a skill of the tree's own                                      |
| A load                 | An observation of the event "a skill was loaded"                                                                                                           |
| A refusal of the gate  | An observation of the event "the rules gate refused an edit"; the resource names the rule that was not loaded                                              |
| The session sign       | The checksum of the session id, as the tree wrote it; sessions are counted by it and named by nothing                                                      |
| The usage of a skill   | One row of the table: the skill, its kind, the loads, the sessions that loaded it, the refusals of the gate about it                                       |
| The period             | The days the usage is counted over, both ends included, in universal time                                                                                  |
| The digest of a period | What stands above the table: the loads, sessions and refusals of every day of the period, the loads by kind, five top skills by loads and five by refusals |
| The keeping term       | How long an observation lies in the storage: a year from the day of the line                                                                               |

### What it is called in the interface

| In the agreement        | On the screen                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| the section             | «Использование» in the row of the sections, after «Сводки деревьев»                                  |
| the usage of a skill    | a row of the table; the columns «Скил», «Род», «Загрузок», «Сессий», «Отказов»                       |
| the kind of a skill     | «правило», «паттерн», «скил пакета», «свой скил дерева»                                              |
| the filters             | the tree and the period above the table; the period is two days, the default is the last thirty days |
| the quick period        | a toggle «7 дней», «30 дней», «90 дней» next to the day pickers                                      |
| the digest of a period  | the cards above the table: «Загрузки по дням», «Топ скилов», «По роду», «Отказы»                     |
| the sessions of a skill | the panel «Сессии» opened by a row: a list of day, session sign and how many times                   |
| the right               | `usage:read` — a person with it sees the section and reads the usage                                 |

## Rules

**The intake.**

- **The observation cargo is taken in by an operation of its own, by the tree token.** As every
  kind of cargo: the digest, a proposal and an analysis each have theirs, and the lines join them.
- **A line lands as a row of its own, as it arrived.** The intake adds the tree and the day and
  invents nothing: the counting happens at the reading, in the storage, and a row holds what the
  reading counts by — the day, the event, the resource, the kind, the session sign.
- **A day of one working copy is replaced whole.** The rows of the pair "tree — copy — day" are
  deleted and the arrived lines land in their place, in one transaction: the windows of two runs
  overlap by days, and a line kept from the former run would count twice.
- **A day of another working copy of the same tree is not touched.** One tree has several copies
  with one tree sign; replaced by the tree and the day alone, the last copy to send would erase the
  neighbour's lines.
- **A line of an unknown event kind or without a session sign refuses the cargo whole.** The four
  kinds are declared by the sending side; a row outside them is counted by nothing, and a row without
  a session is counted wrongly. A refusal names the day and the place of the line.
- **A field of a line longer than its cap refuses the cargo, it is not trimmed.** A resource name is
  a package name or a skill name, and a longer one is not a name; a trimmed row would count as a
  skill nobody has.
- **A cargo with more lines than the cap is refused without a row.** The cap is declared by a
  setting of the intake next to the weight limit; a tree that ran the send for the first time in a
  month sends the window of the run, not the month, and stays under it.
- **A row is kept a year from the day of the line, and older rows are removed by the cleaning of the
  intake every night.** The cleaning deletes by age only, writes one line of the journal per tree with the
  count, and a failure of the cleaning is a line of the journal, not a fall of the intake. The term is one
  for every kind of event.
- **The digest of a month stays as it was.** The lines do not replace it: the digest answers "how
  are things now" by the last run, the lines answer "how much and by whom" over a period.

**The reading.**

- **The usage is counted by the storage, not by the rows in memory.** A tree over a year holds
  hundreds of thousands of rows; grouped by the storage, they answer in one request.
- **The usage of a skill counts three numbers: the loads, the sessions with a load, the refusals of
  the gate.** The sessions are distinct session signs among the loads of the skill; the refusals are
  the rows of the gate event whose resource is the skill. A skill with refusals and no load has a row
  too: that is the rule nobody loads.
- **The usage answers a page, and the order is one of the sortable fields, loads descending by
  default.** The section stands on the common list base, and the base reads a page by page, size,
  sort and dir; at equal values the rows go by name. The sortable fields are declared once in the
  common lib, and a field outside them is refused.
- **A period the request did not name is the last thirty days of the receiver, and the answer names
  it.** The clock is the receiver's, not the screen's; the section shows in its filter the period
  that was counted. One day of the two is refused, not read as an open edge.
- **The period is at most four hundred days, and a longer one is refused.** The rows live a year;
  a period past that counts nothing more and costs a scan of the whole table.
- **The sessions of a skill are read by a request of their own: the day, the session sign and how
  many times the session loaded the skill, newest day first.** The table does not carry them: a row
  of the table is one skill, and its sessions are a list of their own.
- **The reading is closed by the right `usage:read`.** A right of its own, not the right of the
  digests: the section is its own, and the closed set of rights names every section by name.
- **An empty period answers with an empty page, not a refusal.** A tree that sent nothing over the
  period has no usage, and that is an answer.
- **The digest of a period is read by an operation of its own, and it carries every day of the
  period.** The page changes with the sort and the page number, the digest only with the period; a
  digest inside the page would be read anew on every sort. A day without rows is a row of zeros:
  the chart draws a bar per day, and a hole between days would read as a day without a bar.
- **The digest carries the loads by kind and two lists of five skills — by loads and by refusals.**
  The lists are rows of the table counted by the same grouped query with a page of five; a skill
  without loads does not enter the list by loads, and one without refusals — the list of refusals:
  a zero in a top reads as a place nobody took.

**The section.**

- **The section is a list page of the admin application, on the common base.** The header, the
  filter slot, the table and the states of the reading come from the base; the section points at
  itself by one declaration, as the neighbouring sections do.
- **The filters are the tree and the period, and a change of either re-reads the table.** The tree
  is chosen from the list of the created trees; the period is two days, the last thirty by default.
- **The quick period is a toggle of 7, 30 and 90 days next to the day pickers.** A press counts the
  pair from the screen's today by a pure function and puts it into the address as any pick of the
  period does; the toggle lights when the address holds exactly that pair.
- **The digest stands above the table in a grid of cards: a wide card with the chart of the loads
  by day, and three bar lists — the top skills, the loads by kind, the refusals.** The chart is bars
  scaled to the largest day, one bar per day, with the numbers in the hint of the bar, and under
  the bars an axis of two labels — the first and the last day of the period; the lists are the
  kit's bar list with the share counted from the leader. A change of the tree or the period
  re-reads the digest together with the table; a change of the sort or the page does not.
- **A row of the table shows the skill, its kind, the loads, the sessions and the refusals.** The
  kind is shown by a word of the domain, not by the word of the cargo: the person behind the screen
  has read no rule of the layer.
- **A row opens the panel of the sessions of its skill.** The panel is the kit's aside on the common
  base; it lists the day, the session sign and how many times, and names the skill in its heading.
- **While the table re-reads, the former rows stay dimmed under the sign of reading.** A table that
  empties on every change of the period blinks; the numbers are replaced when the new ones arrive.
- **An empty period draws the empty state of the base, not a text of its own.** The sections share
  one wording for "nothing here".
- **A failure of the reading is one message of the shared list page for the section.** Not a
  paragraph in the table and not a message per row.
- **The labels of the section, the columns, the kinds and the panel lie in the dictionary of the
  application.** Not in the markup, as the labels of the neighbouring sections.
- **The numbers of the section are checked against the print of the digest at the tree.** The
  acceptance of the work is a tree sending its lines and the section showing, for that tree and the
  days of the window, the same loads as `agent-kit stats` printed on the tree; a section checked by
  reading its own code is not checked.

## What is out of scope

- **A digest over several trees.** The section shows one tree over one period; the digest over
  trees stays out of scope by the word of the owner, as the domain spec says.
- **The session time and the token cost.** Named by the owner outright.
- **Editing or deleting the lines from the admin application.** The lines are what the tree sent;
  the only removal is by age.
- **A screen of the refusals of the guards and the outcomes of the push gate.** The lines land and
  are kept; the first screen is about the loads, with the refusals of the gate as a column next to
  them. A screen of the rest is a work of its own when the owner asks.
- **Naming a session.** The tree sends a checksum, and the intake stores what it sent.
- **A comparison with the equal period before.** One period at a time.

## Contract

| Operation                      | What it does                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| POST /api/intake/observations  | takes the observation cargo in by the tree token: a day of a copy is replaced whole              |
| GET /api/usage                 | a page of the usage of the skills of a tree: `tree`, `from`, `to`, `page`, `size`, `sort`, `dir` |
| GET /api/usage/:skill/sessions | the sessions of one skill of a tree over the period: `tree`, `from`, `to`; newest day first      |
| GET /api/usage/digest          | the digest of the period of a tree: `tree`, `from`, `to`; the days, the kinds, the two tops      |

The body of the intake operation is the observation cargo as the sending side declares it: `{ schema,
tree, origin, days: [{ day, lines: [{ t, ev, res, kind?, sid, v, skill? }] }] }`. The form is declared
once, in the cargo module of the package, and the intake reads it from the same declaration.

The answer of the intake names the tree, how many days were replaced and how many rows landed. The
answer of the usage is a page `{ rows, total, page, size, from, to }` of rows `{ skill, kind, loads,
sessions, denials }`, and `from`, `to` name the period counted; the answer of the sessions is a list
of rows `{ day, sid, count }`; the answer of the digest is `{ from, to, days, kinds, top, denied }`
with `days` of `{ day, loads, sessions, denials }` for every day of the period, `kinds` of `{ kind,
loads }`, and `top`, `denied` of the rows of the table. All three readings are closed by
`usage:read`.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where it is obliged to refuse:

| What happened                                        | Code  | What it says                                 |
| ---------------------------------------------------- | ----- | -------------------------------------------- |
| a line of an unknown event kind or without a session | `400` | the day and the place of the line            |
| a field of a line longer than its cap                | `400` | the day, the place of the line and the field |
| more lines than the cap                              | `413` | the cap and how many arrived                 |
| the period is longer than four hundred days          | `400` | the limit                                    |
| the period is not two days, or `to` is before `from` | `400` | what is missing or reversed                  |
| the tree is not named or not found                   | `404` | that the tree is not known                   |
| no right `usage:read`                                | `403` | that the right is missing                    |

The rest — the token, the schema version, the weight, the storage — as at every operation of the
intake.

## Data

**An observation** — a row per line, in a table of its own:

| Field  | What is in it                                                                               |
| ------ | ------------------------------------------------------------------------------------------- |
| tree   | the tree the token belongs to                                                               |
| origin | the working copy sign, as the cargo named it                                                |
| day    | the day the line belongs to, as the file of the day was named — `YYYY-MM-DD`                |
| t      | the time of the event                                                                       |
| ev     | the event: a load, a refusal of the gate, a refusal of a guard, an outcome of the push gate |
| res    | the resource: the rule, the skill or the guard the event is about                           |
| kind   | the kind of the edited file at a refusal of the gate; empty at the rest                     |
| skill  | the kind of the skill at a load: rule, pattern, skill, own; empty at the rest               |
| sid    | the session sign                                                                            |
| v      | the version of the package that wrote the line                                              |

Indexed by the pair "tree — day" and by "tree — origin — day": the reading walks a tree over a
period, the intake replaces a day of a copy. No uniqueness: two lines of one session may be equal to
the character, and the tree sends what it wrote.

## Screens and states

| Screen                      | States                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The section «Использование» | reading: the former rows dimmed under the sign of reading · rows · empty state of the base · one message of the bus at a failure     |
| The digest                  | reading: the cards under the sign of reading · the chart and the lists · an empty period: zero bars and the empty state of the lists |
| The filters                 | the tree not chosen: the table is empty and asks for a tree · the tree chosen and the period default · the period edited             |
| The panel «Сессии»          | opening: the sign of reading · rows of day, sign and count · empty: the skill had no load over the period                            |

## Cross-cutting requirements

### Locales

The language is one — Russian; the labels of the section, the filters, the columns, the kinds and
the panel lie in the dictionary of the application, not in the markup.

### SEO

Not applicable: the screen stands behind the entry.

### Mobile layout

The table of the kit shows a row as a card on a narrow screen; the filters wrap under the heading;
the panel of the sessions takes the whole width.

### Several objects

The rows of one tree do not get into the reading of another: the reading takes the tree from the
request and walks its rows alone. The copies of one tree are told apart by the working copy sign at
the intake and summed together at the reading: the owner asks about the tree, not about a copy.

## Decisions

- **Raw lines in a table of their own, not a month block inside the digest.** The owner chose the
  raw lines and named the sample: a module of analytics with a raw event table, counting in the
  storage and a year of keeping. Rejected: a block counted by the tree and shown from the record of a
  month — it keeps the counts without the sessions and the days.
- **A day of a copy is the unit of replacement.** The day file is the unit on the disk of the tree,
  the windows of the runs overlap by days, and the intake needs no sign of a run. Rejected: a run id
  and a dedup by line.
- **A section of its own with a right of its own.** The owner's answer. Rejected: a table in the
  panel of a record of a month under the right of the digests.
- **The keeping term is a year, one for every kind, deleted nightly.** The sample's term, taken as a
  default without asking: the owner said the module is ordinary. Cost of a mistake: one number in a
  setting.
- **The caps of the intake are a line count per cargo and a byte length per field.** The weight
  limit of the request stands as before; the two caps are the sample's, taken as a default. Cost of a
  mistake: two numbers in the settings.
- **The period is at most four hundred days.** The sample's limit: the rows live a year, and a
  longer period reads nothing more.

## Open questions

- `Q-33` — whether the section should show, next to the loads, the refusals of the guards and the
  outcomes of the push gate as columns of their own. The work goes with the loads and the refusals of
  the gate: the owner named the first screen as the screen of the loads.
- `Q-34` — whether the copies of one tree should be shown apart in the section. The work sums them:
  the owner asks about the tree.

## History of changes

- 2026-09-15 — the digest of the period: the operation, the cards above the table, the quick
  period. The owner named the sample screen and its charts; the line about charts in "out of
  scope" had misread the owner's word about a digest over several trees.
- 2026-09-14 — created from the grill of the owner's request about the statistics of rule usage in
  the sessions of consumer trees. Rewritten the same day: the roles had replaced the raw lines by a
  month block inside the digest and the section by a table in the panel of a record, against three
  answers of the owner; the owner's answers hold. The numbers `SC-MB-327`…`SC-MB-336` issued by that
  version are not reused.
