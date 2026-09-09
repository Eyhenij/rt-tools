# The reading of what was taken in

**Status:** in force · **Revision:** 2026-08-21 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`, `lists`, `entity-editing`, `navigation`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what a person reads what was taken in by. What
they introduce themselves to the intake by — the entry, the account and its commands — stands as a
subdomain next to it: `docs/specs/message-bus/admin-auth/`. What is shared — the terminology of the
domain, the cross-cutting requirements and the decisions — lies in the spec of the domain next to it.

## Why

Reading the cargo by a request to the database from the node itself can be done only by whoever has
access to the node, while the service goes out into the internet: knowing the tokens of the trees
alone, it would give what was taken in to anyone who reached its address and would not answer the
question of who read it.

Hence the admin application: what a person gets after the entry. There are three sections — by the
kind of the cargo; the entry itself is described by the subdomain next to it.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what lives in the reading:

| Term                         | What it is                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| The admin application        | The application a person reads the taken-in cargo by. There are no edits of the cargo in it at all                                    |
| A section                    | A screen of the admin application with an address of its own. An item of the menu leads into it                                       |
| A list                       | The page of a section: a row per record, a toolbar above it and a pagination below it                                                 |
| A panel of details           | A panel with one record whole, sliding out at a press on a row                                                                        |
| A filter                     | A condition narrowing the list. It stands in the toolbar and is visible on the screen                                                 |
| A page of a list             | A stretch of the list arriving by one request. The number of the page and the size are named by the request                           |
| A selection                  | The page, the size, the sorting and the filter together. It lives in the address of the section                                       |
| A slot                       | A place on the common page a section puts its markup into. An unoccupied one takes no place                                           |
| The host of a list page      | The one the page asks for the reading, the page, its size, the order and the setting of the columns                                   |
| A hint of the heading        | A short text at the name of a section: what lies in the section                                                                       |
| The prefix of a section      | The short name of a section the anchors of a check on its page are put together from                                                  |
| An anchor of a check         | The value of `qa-dataid` at an element: by it an end-to-end spec finds the element, and by it it is named in a measurement            |
| An empty state               | The look of a section that has no records: a sign, a heading and a word about where the records come from                             |
| The language of the markup   | The form a screen declares a ready component by: an element of the kit, not an attribute on markup of its own                         |
| A section of the panel       | A part of the panel of details with a heading of its own: the properties of a record, its text. It is given by a component of the kit |
| A list of the properties     | The pairs "name — value" inside a section of the panel. It is given by a component of the kit                                         |
| A row of a property          | One pair: the name on top, the value under it. While the reading goes, a skeleton is in the place of the value                        |
| The header of a section      | The upper block of the page: the name of the section and the hint at it                                                               |
| The place of the actions     | The right part of the header: there stand the actions over the section whole, if it has any                                           |
| The sample                   | The template of a list in the showcase of the second kit: a screen of a section put together from the same components                 |
| The filter by state          | A condition narrowing the list of a section to the records of one state. It stands to the right of the filter by tree                 |
| A lifted filter              | The value "all the states": the list is narrowed by nothing, and there is no parameter in the address at all                          |
| The steps of the sorting out | The order a record goes through the states in: new, taken into the sorting out, fixed, released                                       |

### What it is called in the interface

| In the agreement              | On the screen                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| a section                     | the item of the menu and the page behind it                                         |
| a panel of details            | the panel sliding out on the right at a press on a row                              |
| the filter by tree            | the choice of the project in the toolbar above the list                             |
| the selection                 | the parameters of the address: the page, the size, the order, the filter            |
| the left slot of the toolbar  | the left part of the strip above the list — there stands the filter                 |
| the right slot of the toolbar | the right part of the same strip — there stand the buttons                          |
| the slot above the table      | the strip between the toolbar and the first row of the list                         |
| a hint of the heading         | the explanation at the name of the section                                          |
| the header of a section       | the large name on top, the grey line under it and the place on the right            |
| the host                      | the section itself: the page is visible to a person, the host is not                |
| an empty state                | the sign, the line "Записей нет" and the line about where they come from            |
| a section of the panel        | the heading inside the panel that slid out and what is under it                     |
| a list of the properties      | the column of pairs "a name and a value under it"                                   |
| a row of a property           | one such pair                                                                       |
| the state of a record         | the column "Состояние" in the list of a section                                     |
| new                           | "Новое" — the record arrived, and nothing was done with it yet                      |
| in progress                   | "В работе" — the record is taken into the sorting out                               |
| ready                         | "Готово" — the shortcoming is fixed, but there has been no release with the fix yet |
| released                      | "Выпущено" — the fix went away with a release                                       |

A tree is called a project on the screen. A word of the vocabulary of the project says nothing to a
person: they open the admin application to look at their projects, not at trees. The analysis of the
miss is the record "2026-08-19-tree-word-shown-to-users" in the intake.

## Rules

**What the admin application shows.**

- **The admin application reads the cargo and does not edit it.** An edit of what was taken in would
  diverge from the tree of the source silently, and the next run would overwrite it.
- **An item of the menu is created together with its screen.** An item leading nowhere reads as a
  breakage, not as a promise of a future section.
- **A section opens by an address of its own — by a direct link and after a reload.** A section living
  as a tab inside a foreign screen is not passed by a link and does not outlive a reload.
- **The selection lives in the address of the section.** Otherwise a reload at the second page of a
  filtered list brings back to the first, and a link to what was seen is passed to nobody.
- **The labels of the screens are taken from the dictionary of the application, they are not written in
  the markup.** The labels the kit draws are taken from there too: otherwise the English default of the
  kit stands next to Russian headings, and that is visible only on the assembled screen.

**The lists of the cargo.**

- **Every section is put together by one and the same list screen.** The heading, the toolbar, the
  table and the switch of the pages are one at all the sections; rewritten anew, they diverge silently.
- **A section declares the table by an element of the kit, not by an attribute on its own markup.** An
  attribute leaves the section markup of its own the kit does not see: the overlay of the reading and
  the cards of a narrow screen it draws by nodes that are never children of a `<table>`. A divergence
  of the look is then cured in the section, not in the kit, as many times as there are sections.
- **Every record is shown by a row of its own, and every property of it by a column of its own.**
- **A press on a row opens the panel of details.** A requirement of the owner. There are no actions
  over a record in a row — the admin application edits nothing.
- **The panel shows the record whole, and a row of the list does not.** An analysis arrives as text
  whole, and a page carrying the texts of all its rows grows in weight without a limit.
- **The text of the cargo is shown as markup, not as raw text.** It is taken apart by a pure function of
  its own with a closed list: raw HTML is not taken apart at all and stays visible text, so a tree with
  a token gets no execution of its text in the browser of whoever entered.
- **The list of the markup is closed and sewn into the component.** Into the output get the headings,
  the bold, the italic, the struck-through, the lists, the tables, the code in a line and in a block,
  the quote and the link. The component has no input the list is set by: nothing to weaken either.
- **The marked-up content is built by nodes, it is not glued in as a string.** Not a single part of the
  admin application gives a string of markup to the page: the nodes are drawn by the template.
- **The pictures and the embeds do not get into the output, and a link leads outward by three schemes.**
  An external picture is a request into a foreign network from the browser of whoever entered. An
  address of `http`, `https` and `mailto` becomes a link, any other scheme stays visible text.
- **A block of code is monospaced, of one colour and scrolls sideways itself.** The word of the language
  at the fence is taken apart and does not affect the look: colouring would demand a second library in
  the runtime of the kit. A long line inside a block does not stretch the width of the panel.
- **A single line break stays a break.** The texts of the cargo are written by trees, and a break there
  is put on purpose: the lines of a scenario, enumerations, short notes.
- **The component of the showing is one for all three sections of the cargo.** Put together apart, the
  analyses, the proposals and the digests would diverge in look one at a time.
- **The digest of a month arrives as the body of a run and is declared a block of code at the turning
  into text.** Nobody writes it as markup: a tree sends it by fields. Shown as a paragraph, it would
  lose the indents it is laid out by.
- **There is no text — there is no section of the panel.** An empty string, a string of spaces alone and
  an absence of the value do not draw the section about the text at all; at a digest its line about
  there being no digest stays.
- **The list arrives by pages, not whole.** The number of the records grows with every tree, and
  "reading everything" runs into the weight of the answer earlier than into anybody's patience.
- **The size of a page is named by a default and is limited from above.** Otherwise the rule about the
  pages is gone around by a request with a page of a hundred thousand rows — through a parameter.
- **A page past the end of the list answers with an empty page and the total number, not with a
  refusal.** A list that got shorter between two requests is an ordinary thing; a refusal at that reads
  as a breakage.
- **The order by default is the fresh ones on top, and it is named on the screen.** At equal values the
  order is set apart by a second key: otherwise one and the same record is visible on two pages in a
  row, and the neighbouring one is visible on neither.
- **The state of a record arrives by the reading — both by the list and by one record.** A list without
  it shows equal rows, and the panel of a record would answer about the record otherwise than the row of
  the list.
- **The state is visible as a column at the sections of the analyses and of the proposals.** Without it
  the memory of the intake about which step a record stands at is not visible to a person at all.
- **The words of the states are taken from the dictionary of the application.** Written in the markup,
  they will diverge between the column and the panel of a record, and the first to get that is a person.
- **A person changes the order by the heading of a column and gets which order is applied.**
- **The composition and the order of the columns are chosen by the person, and the choice is kept.** The
  key it is kept under is of its own at every section.
- **The filter by tree names the trees by names, not by signs.** A sign is the hash of the address of a
  repository, and by it a person does not recognise their tree; the sign is what is filtered by at that.
- **The filter outlives a transition to another page of the list.** A filter that was reset is not
  noticed at once, and foreign rows are read as one's own.
- **An answer that caught up with its list after the next request is not shown.** Otherwise the rows of
  the former filter stand under the new one — and that cannot be told from cargo that arrived just now.
- **While the list is being read, in the place of the rows it is visible that the reading goes.** An
  empty area cannot be told from a list that has nothing in it.
- **An empty list explains why it is empty.** A filter that gave not a row and a tree that sent not a
  single record are different answers, and the second means a sound service.
- **An empty list shows an empty state, not a phrase inside the table.** A phrase standing in the place
  of the rows reads as one of them, and an empty section is no different from one that did not finish
  loading: both are a table without rows.
- **An empty state names where the records come from.** "There are no records" answers the question "is
  it broken", but not the question "what am I to do": at the sections of the cargo the records are
  brought by the tree, at the section of the invitations by the button above the list.
- **A list that was not read says why, and the attempt is repeated by one action.** An empty screen
  after a refusal of the service reads as "there are no records" and leads away from the real reason.
- **A closed panel brings the list back in the same state.** A reset to the first page turns the reading
  of ten analyses in a row into ten searches.
- **A record that does not exist the panel does not draw as empty.** A link to a record outlives its
  appearance and its disappearance, and an empty panel reads as a breakage of the reading.
- **Whoever entered gets the cargo of all the trees.** An account belongs to the service, not to a tree,
  and the filter by tree narrows what is shown, not the access.
- **The time is shown in the zone of whoever is looking, and is kept in the universal one.** A zone
  chosen silently shifts the order "the fresh ones on top" at the boundary of a day.
- **The filter by state is put into the page by the section, the page does not know it itself.** By the
  same technique the filter by tree stands there: the page knows nothing about the kinds of the filter,
  and a second kind creates it neither an input nor an event.
- **The filter by state stands to the right of the filter by tree, in the same slot of the toolbar.** Set
  apart at different edges of the strip, they read as a filter and an action, not as two conditions.
- **The filter by state is at the sections of the analyses and of the proposals and only at them.** A
  record of a month has no state, and a filter by it would narrow by a condition it does not carry.
- **The first item of the filter is "all the states".** A lifted filter is chosen by the same movement as
  any state; a separate button of the reset is a second way to do the same, and a person looks for the
  one that is not on the screen.
- **The words of the states in the filter are the same as in the column and are taken from the dictionary
  of the application.** Written in the markup, they will diverge between the filter and the column.
- **The filter by state lives in the address of the section on a par with the page, the size and the
  order.** Otherwise a reload brings back to the first page, and the link passes on the wrong list.
- **A lifted filter does not stand in the address.** A value equal to the default is lifted by emptiness:
  a link to a list that is not narrowed stays the same, from whichever side it is come to.
- **The filter by state adds up with the filter by tree, it does not replace it.** Otherwise the second
  choice silently lifts the first, and a person reads the cargo of a foreign tree as their own.
- **A chosen state resets the list to the first page.** A narrowed list may have no former page at all,
  and a person lands on an empty one.
- **A word that is not in the set of the states the intake refuses with a refusal with the name of the
  parameter.** A default substituted silently would show a list other than the one that was asked about.
- **The screen does not send a foreign word from the address to the intake.** The address is edited by
  hand, and an unreadable value is replaced with a lifted filter, not with a refusal onto an empty screen.
- **A list that gave not a row at any filter explains that by the filter, not by an emptiness of the
  service.** A tree that sent not a single record is another answer, and it means a sound service.
- **The state is a sortable field at the analyses and at the proposals.** The person changes the order by
  the heading of the column of the state, by the same movement as at the rest of the columns.
- **The order by state goes by the steps of the sorting out, not by the alphabet.** A person reads the
  states as a queue of work — new, taken, fixed, released — and the alphabet mixes that queue up.

**The panel of details.**

- **The sections of the panel are drawn by a ready component of the kit, not by a heading of one's own.**
  Written by a tag of its own, a heading diverges from the neighbouring panels and is edited in each apart.
- **The properties of a record are shown by a ready list of the kit, not by markup of a list of
  definitions of one's own.** A handwritten list knows neither about the skeletons of the reading nor
  about where the name stands at a value: both live in the kit and are changed there once.
- **While the record is being read, a skeleton is in the place of the value.** An empty place in the
  place of a value cannot be told from a record whose field is not filled in.
- **The sign of a check stands at the panel, at its header and at every row of a property.** With a sign
  at one value alone, a spec that needs the panel whole or its header cannot catch hold of them.
- **The text of the fix is visible in the panel of details and is not visible in the list.** There are a
  hundred rows in the list, and a text in a column would read as a fragment; the panel shows it whole.
- **At a record without a text of the fix there is no row in the panel at all.** A label with an empty
  value reads as "there was no fix", although the record may not be waiting for a fix yet.
- **The version of the release is visible in the panel of details and is not visible in the list.** A
  column under the version is the work of the task about the filter, not of this one.
- **At a record without a version of the release there is no row in the panel at all.** A label with an
  empty value reads as "there was no release", although the record may not be waiting for one yet.

**A refusal visible to a person.**

- **A refusal of the service names the number of the request to a person, and the same number stands in
  the journal.** Otherwise a breakage is told about by the words "it does not work", and there is nothing
  to find it in the journal by.
- **The waiting for an answer is limited by a term.** A request hanging without a limit looks the same as
  a working service, and a person waits instead of repeating.
- **The model of a record of the cargo carries the state as a value of a set, not as a string.** A value
  outside the set is read as "new": shown as it is, it would reach the screen as a machine string.
- **The admin application reads the same records the intake puts.** There is no second copy under the
  reading: a copy that diverges would show yesterday's cargo as today's.

The neighbouring subdomains: the common page of a list — `docs/specs/message-bus/admin-list-page/`; the
shell of the application — `docs/specs/message-bus/admin-shell/`; the section of the invitations with its
issuing and revocation — `docs/specs/message-bus/invites/`; the entry — `docs/specs/message-bus/admin-auth/`.

## What is out of scope

- **A digest over several trees and charts.** The word of the owner: the lists are shown, and a digest is
  appointed when there are three trees.
- **The entry and the accounts.** What a person introduces themselves to the intake by and how their
  record is created — the subdomain `docs/specs/message-bus/admin-auth/`.
- **The edit of the taken-in cargo.** The admin application reads, it does not edit — the state of a
  record included.
- **A multiple choice of the states in the filter.** The word of the owner: one state at a time, as at
  the filter by tree. Two filters in one slot look the same and read as one.
- **The filter by state at the section of the digests.** A record of a month has no field of the state.
- **Remembering the filter between the sections.** The selection belongs to the address, and one filter
  for three sections would mean that a section opened by a link shows not what is in the link.
- **The column, the filter and the order by the version of the release.** The word of the owner: a task
  of its own. It needs a migration with an index, and it rolls back apart.
- **An entry of creating a record at the sections of the cargo.** A section that creates nothing needs no
  button of creating. The only exception is the section of the invitations, described next to it.
- **The section of the invitations itself.** Its list, revocation and issuing — the subdomain
  `docs/specs/message-bus/invites/`.
- **The filter by tree by chips, as at the sample.** The number of the trees is not limited, and a strip
  of chips would go sideways; the filter stays a choice from a list.
- **A slot of its own at the switch of the pages.** It stays at the page: the page arrives in the answer of
  the intake, and the section decides nothing about it.
- **The colouring of a block of code by languages.** The word of the owner: a second library in the
  runtime of the kit for the sake of colour is not created.
- **The folding of a long text of the cargo.** The panel shows it whole and scrolls it.

## Contract

A person introduces themselves by the entry; a token of a tree does not open the operations of the
reading. Without an entry not a single operation gives the cargo.

| Operation                | What it does                                                                  |
| ------------------------ | ----------------------------------------------------------------------------- |
| GET /api/trees           | gives back the trees by names and signs — for the filter                      |
| GET /api/postmortems     | a page of the analyses without the text whole, with the state of every record |
| GET /api/postmortems/:id | one analysis with the text whole and its state                                |
| GET /api/proposals       | a page of the proposals with the state of every record                        |
| GET /api/proposals/:id   | one proposal whole and its state                                              |
| GET /api/summaries       | a page of the records of the months without the digest whole                  |
| GET /api/summaries/:id   | a record of a month with the digest whole                                     |

A page of a list is requested by the number, the size, the order and the filter — by tree, and at the
analyses and the proposals also by state. The answer carries the rows and the total number of the
records: without it the pagination does not know how many pages there are.

The parameter of the state is accepted by the page of the analyses and by the page of the proposals: one
state from the set or nothing. It adds up with the parameter of the tree — named together, they narrow
the selection by both conditions. The state also stands in the set of the sortable fields at both
operations.

The operations of the section of the invitations — the reading of a page, the issuing and the revocation
— stand in the subdomain next to it.

The common page of a list creates no operations of its own — it does not go to the intake at all. Its
contract is what it has the right to ask of the host:

| What the page asks                 | What the host does                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| to read the list anew              | the reading begins, and in the place of the rows it is visible that it goes                         |
| to go to a page                    | it changes the address; the filter and the order stay the same                                      |
| to change the size of the page     | it changes the address and brings back to the first: at a larger size the former one may not exist  |
| to open the setting of the columns | it opens the panel of the kit for the table of this section                                         |
| in which state the reading is      | it gives back the busyness, the refusal, the number of the page and the total number of the records |

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the domain.
Where the reading is obliged to refuse instead of staying silent:

| What happened                                                            | Code  | What it says                                                    |
| ------------------------------------------------------------------------ | ----- | --------------------------------------------------------------- |
| there is no entry, it has expired or the record is taken off             | `401` | that the operation demands an entry                             |
| a token of a tree was presented to an operation of the admin application | `401` | the same as without an entry                                    |
| the number or the size of the page is not a number                       | `400` | which parameter was not taken apart and what its boundaries are |
| the state came as a word outside the set                                 | `400` | which parameter was not taken apart and which values it has     |
| the requested record does not exist                                      | `404` | that there is no record                                         |
| the storage is unavailable                                               | `503` | that it was not read, and the number of the request             |

## Data

The reading creates no tables of its own: it reads what the intake put. The account and the entry belong
to the subdomain of the entry next to it: `docs/specs/message-bus/admin-auth/`.

No index under the filter by state is created. The lists go in hundreds of rows, not in millions, and a
query by a column of a set costs less by a walk over the table than the keeping of an index at every
record costs; when the lists grow, an index is created by a task of its own — together with the
measurement that shows it is needed.

## Screens and states

| Screen                             | States                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The incident analyses              | reading · a page with rows · empty · empty by the filter · a refusal of the reading with a repeat                                    |
| The proposals                      | the same five states                                                                                                                 |
| The filter by state                | lifted · a state chosen · added to the filter by tree · at the digests there is none at all                                          |
| The digests of the trees           | the same five states                                                                                                                 |
| The panel of details               | reading · the record whole · there is no record · a refusal of the reading                                                           |
| The text of the cargo in the panel | marked up · without markup · empty: there is no section · the digest as a block of code                                              |
| The toolbar                        | the filters of the section on the left · the buttons of the section and the common ones on the right · the slot is occupied or empty |
| The page of a section              | it fits into the window · it scrolls whole: the last row and the switch are visible                                                  |
| The heading of a section           | the name alone · the name with a hint                                                                                                |
| The place above the table          | empty and taking no place · occupied by what the section put there                                                                   |
| The empty state                    | a sign, a heading and a line about where the records come from; there are no rows of the table                                       |

The table of the states is checked by nothing: a state the code does not know how to come into reads here
as a description of something working. The states are confirmed by scenarios and by a measurement in the
browser.

## Cross-cutting requirements

### Locales

The language is one — Russian. The labels of the admin application lie in the dictionary of the
application, not in the markup. The labels of the kit are taken from there too: it has a dictionary of
its own in eight languages, and without that the pagination and the empty state come out in English next
to Russian headings.

### SEO

Not applicable: everything except the screen of the entry stands behind the entry, and nothing is shown
to the search engines.

### Mobile layout

A row of a list on a narrow screen is shown as a card — this is an entry of the table of the kit, not
markup of its own. A screen put together past it loses the narrow layout silently.

The parts of the toolbar on a narrow screen wrap, they are not cut: the filters and the buttons do not
fit onto one line there, and a cut toolbar hides the filter without saying so. The sections of the cargo
have two filters, and on a narrow screen both are visible whole. It is confirmed by a measurement, not by
a look.

### Several objects

A person who has entered gets the cargo of all the trees: an account belongs to the service, not to a
tree, and the filter by tree narrows what is shown, not the access.

## Decisions

- **Three list screens, not one.** The word of the owner: the analyses, the proposals and the digests by
  one piece of work. Rejected: one screen with the harness paying off on it.
- **The look of a list screen is a requirement of the acceptance.** The word of the owner: a table with a
  toolbar and a pagination, a press on a row opens the panel of details. What is put together otherwise
  is not accepted.
- **The text of the cargo is shown as markup, and raw HTML stays text.** The word of the owner: the
  former decision — to show it as text — stood on an argument of security, and the argument is lifted by
  the parser not knowing raw HTML at all. A foreign library with raw HTML switched off was rejected: the
  security would stand on its setting.
- **The selection lives in the address.** Otherwise the rule about a reload is broken to the letter. The
  price: the taking apart and the putting together of the parameters of the address at every section.
- **The order by default is the fresh ones on top, the second key is the identifier of the record.**
  Without the second key records with equal time jump between the pages.
- **The filter is put by the section.** Rejected: leaving the filter in the page and creating an input
  "whether to show it" — then the page knows about every kind of filter that will ever be needed and
  grows together with their number.
- **The link goes by the host, not by inputs and events at every action.** Rejected: leaving the events
  and appending a pair per action — the count of the inputs and the events grows with every action, while
  a forgotten connecting is visible only on the assembled screen.
- **The host is answered by the common base of the mechanics, and a section points at itself by one
  line.** It cannot be otherwise: the injection looks for what the screen itself declared, and the base
  has no selector and cannot declare itself for it. Rejected: writing the answers in every screen — three
  repetitions of one and the same, diverging one at a time.
- **The refreshing and the setting of the columns stay at the page.** Rejected: handing them out to the
  sections together with the rest of the buttons — what is one and the same, handed out to three,
  diverges.
- **The anchors are put together from the prefix of the section.** The price: the anchors of the common
  page change at all the sections at once, and what refers to them is edited by the same work.
- **The table is declared by an element of the kit, not by an attribute on markup of one's own.**
  Rejected: leaving the attribute — on it the kit shows neither the overlay of the reading nor the cards
  of a narrow screen, because it draws them by nodes that are never children of a `<table>`. The price: a
  tag of one's own has no role of a table, and the kit puts it itself — the roles of the rows and the
  cells are given by the CDK, and it has no role of a table at all.
- **The harness stops growing with the window.** In that mode the kit cuts the zone of the content and
  waits for a scroll from every zone inside; the page of a list creates none, and the rows simply
  disappear. Rejected: keeping the mode and creating a scroll inside the zone of the table — then the
  switch of the pages goes away under the lower edge.
- **The common look of the page is edited, not four sections.** The page of a list is one for all four,
  and an edit in it cannot diverge between the sections. Rejected: editing the sections one at a time —
  they would diverge already at the second one.
- **The emptiness is shown by a look of its own, not by a phrase inside the table.** Rejected: leaving a
  short phrase in the place of the rows — it reads as one of the records, and an empty section looks the
  same as one that did not finish loading. The price: the label of the emptiness became two lines, and the
  second one every section names for itself.
- **The filter by state is a choice of one value.** The word of the owner. Rejected: a multiple choice —
  it diverges from the neighbouring filter in look and in the taking apart of the address, while
  "everything except the released" is closed by the order by the steps of the sorting out.
- **The order by state is taken from the declaration of the set in the storage.** The enumeration is
  declared in the order of the steps of the sorting out, and the storage orders the set by the
  declaration: the order comes for free. Rejected: a list of the order of one's own in the code — a second
  copy of the same knowledge, and such copies diverge silently.
- **A foreign word in the parameter is refused by the intake, and the screen does not send it.** The two
  sides answer different questions: the intake guards its contract, the screen does not fell the list at a
  typo in the address. Rejected: substituting the default silently at the intake — then a person who asked
  for one thing gets another and does not know about it.
- **No index under the filter by state is created.** The size of the lists does not demand it, and an
  index costs a write at every intake of the cargo. Rejected: creating it in advance — in advance it would
  have stayed, and there is no measurement that would show the need.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it. The reading has one of
its own:

- **Q-31. How the filter is shown when there are more than four states.** The set is given by the steps of
  the sorting out and grows together with them; a choice of one value out of ten reads worse than out of
  four. The set has grown to five — the quarantine was added to it — and the filter shows them as before:
  the question stands open until the reading becomes worse than a list of five.

## History of changes

- 2026-08-16 — the subdomain was split out of the spec of the domain, which had outgrown the length limit.
  The rules, the scenarios and the bindings of the reading moved here as they were: the scenario numbers
  were not recounted.
- 2026-08-17 — the agreement of the task RT-780 about what a section speaks to the common page of a list
  by was merged: the slots of the toolbar and of the place above the table, the host of a list page, the
  hint of the heading and the anchors from the prefix of the section. The scenarios `SC-MB-110`…`SC-MB-116`
  moved with their former numbers.
- 2026-08-17 — the agreement of the task RT-781 about the single language of the lists was merged: the
  table is declared by an element of the kit, the anchors of the table and of the rows are put together
  from the prefix of the section, an empty list shows an empty state and names where the records come
  from. The scenarios `SC-MB-129`…`SC-MB-136` moved with their former numbers. Two rules — about the
  filter in a slot and about an unoccupied slot — did not move: they already stand here since RT-780.
  The number of the sections in the explanations of the rules was fixed to four.
- 2026-08-19 — the agreement of the task RT-878 about the issuing of an invitation from the admin
  application was merged, and by the same movement the section of the invitations was split into the
  subdomain `docs/specs/message-bus/invites/`: with it the spec outgrew the length limit. The rules of the
  section, the scenarios `SC-MB-128` and `SC-MB-154`…`SC-MB-162` and their bindings went there with their
  former numbers; the empty state there now names the button, not the command of the node. The labels of
  the screens were translated from the word of the vocabulary to the word of a person — the analysis of
  the miss is the record "2026-08-19-tree-word-shown-to-users" in the intake.
- 2026-08-20 — the agreement of the task RT-944 about the look of the page of a list was merged: the page
  grows under the content and scrolls whole, the header of a section is folded as a row with the place of
  the actions on the right, the margins are taken from the sample. The scenarios `SC-MB-163`…`SC-MB-166`
  moved with their former numbers; the rule about a section without a hint already stands here.
- 2026-08-21 — two rules of the agreement of the task RT-910 were merged: the text of the fix is visible
  in the panel and not in the list, and at a record without a text there is no row at all. The scenarios
  `SC-MB-189` and `SC-MB-190` moved with their former numbers; the rest went to the neighbouring specs.
- 2026-08-21 — two rules of the agreement of the task RT-911 were merged: the version of the release is
  visible in the panel and not in the list, and at a record without a version there is no row at all. The
  scenarios `SC-MB-205` and `SC-MB-206` moved with their former numbers; the rest went to the neighbours.
- 2026-08-21 — the agreement of the task RT-913 about the filter and the order by the state of a record was
  merged: the filter stands in the toolbar to the right of the filter by tree, lives in the address, adds
  up with the filter by tree, and the state became a sortable field with the order by the steps of the
  sorting out. The scenarios `SC-MB-222`…`SC-MB-236` moved with their former numbers. Three rules of the
  agreement did not move: about a filter outliving a transition to another page and a return from the
  panel, about the second key of the order and about the unchanged order by default — all three already
  stand here. The line about the filter by state left "What is out of scope": it became in scope.
- 2026-08-21 — the entry, the account and its commands were split into the subdomain
  `docs/specs/message-bus/admin-auth/`: with the merged agreement about the filter by state the spec
  outgrew the length limit. The rules of the entry, the scenarios `SC-MB-33`…`SC-MB-45`,
  `SC-MB-56`…`SC-MB-61`, `SC-MB-79` and `SC-MB-80`, their bindings, the operations of the entry, the codes
  of its refusals and both entities of its own went there with their former numbers.
