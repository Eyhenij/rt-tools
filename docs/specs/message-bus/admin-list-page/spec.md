# The common page of a list

**Status:** in force · **Revision:** 20 August 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`, `lists`, `navigation`
**Procedures:** none — the page has no operations of its own

A subdomain of the domain "the intake of the cargo": what all the list screens of the admin
application are put together on — the look of the page, its slots, the conversation of a section with
it and the anchors of its elements. What every section shows and what a person is allowed to it by is
the subdomain of the reading of what was taken in next to it. What is shared — the terminology of the
domain, the cross-cutting requirements and the decisions — lies in the spec of the domain.

## Why

There are four sections of the cargo, and they are put together by one screen: a table, a toolbar, a
switch of the pages, a panel of the setting of the columns. A layout of its own written in every
section diverges silently — the screens start to differ in the size of the name, in the padding above
the table and in the place of the buttons, and the first to get that is a person, not a run.

Here: what the page is obliged to be, what a section puts into it, what they speak to each other by
and by which anchors a check finds it.

## Terminology

The vocabulary of the domain whole is in the spec of the domain. Here only what lives on the page of a
list:

| Term       | What it is                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| The page   | The common list screen: the header of the section, the toolbar, the table and the switch of the pages |
| A slot     | A place of the page a section puts its own into: the filter, the actions, the row above the table     |
| The host   | What the page asks for the reading, the page, its size, the order and the setting of the columns      |
| The prefix | The word a section names itself by: the anchors of the page and of its table are put together from it |

### What it is called in the interface

| In the agreement           | On the screen                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| the header of the section  | the name with a hint on the left, the place of the actions on the right                   |
| the toolbar                | the strip above the table: the filter on the left, the actions over the list on the right |
| the switch of the pages    | the line under the table: the numbers of the pages and the number of the rows on a page   |
| the setting of the columns | a panel opened by an address of its own at every section                                  |

## Rules

**The look of the page.**

- **The page grows under the content, and it scrolls whole.** A harness nailed to the height of the
  window cuts off everything past the lower edge — both the rows and the switch of the pages. The page
  does not scroll by zones apart: the switch goes away under the lower edge, and there is nothing to
  reach it by.
- **All the records of the page are reachable by scrolling.** The number of the rows is chosen by the
  person by the switch of the size, and any of the sizes is obliged to be reachable down to the last
  row.
- **The switch of the pages is reachable at any number of rows.** It stands under the table and goes
  away together with it, it does not stay beyond a cut edge.
- **The name of the section is set in the size and the drawing of the sample.** Screens alike in look
  diverge in the size of the name first of all, and they diverge silently.
- **The header of the section is a row with a wrap: the name with a hint on the left, the place of the
  actions on the right.** A column instead of a row takes from the section the place under the actions,
  and a section that needs them has nowhere to put them.
- **The hint stands under the name, not next to it.** Next to it, it lengthens the row of the header and
  at a narrow window wraps in the middle of the name.
- **The margins of the page and the gaps between its blocks are the same as at the sample.** The gap is
  set by the column of the page, not by paddings at the toolbar and at the switch of the pages: a
  second declaration of a padding argues with the first.
- **The look of the page is declared once for all the sections.** The sections hold no layout of their
  own at all: declared at every one of them, it diverges silently — the screens start to differ in the
  size of the name and in the padding above the table.

**What a section speaks to the page by.**

- **The filter is put into the page by the section, the page does not know it itself.** Sewn inside, the
  filter is one and the same at all the sections by force: a section that needs another one has nowhere
  to put it, and the page grows an entry for every new kind of filter that will ever be needed.
- **An unoccupied slot takes no place on the screen.** An empty strip above the table and an empty half
  of the toolbar read as a breakage of the markup, not as free space.
- **The filter stands on the left, and the actions over the list whole on the right.** Mixed together
  they read as one set of buttons, and it is unclear what changes what is shown and what does something
  to the list.
- **The refreshing of the list and the setting of the columns are drawn by the page, they are not
  brought by the section.** They belong to all the sections and are one and the same; handed out to the
  sections, they will diverge in the label, in the sign and in the place, and the first to get that is a
  person, not a run.
- **The buttons of the section stand to the left of those the page draws.** The refreshing and the
  setting of the columns are at every section, and a person looks for them at one and the same place at
  the edge of the toolbar; inserted between the buttons of the section, they move with every section.
- **Above the table there is a place for what concerns the whole list at once.** What is said about the
  whole list, put as a row into the list itself, reads as one of the records.
- **There are no actions over one record in the toolbar.** The toolbar speaks about the list whole; an
  action over a record standing above the list answers the question "over which one exactly" only by a
  selection, and there is no selection in the list at all.
- **The operation of the reading of a section answers with a page, even where the records are few.**
  The common base of the mechanics reads only that shape: the rows, their total number, the number of
  the page and its size. A section answering with a bare array has to be read past the base, and it
  diverges at once from every neighbouring section. The number of the records is not the sign: it
  grows, and the divergence is found by whoever adds the first filter.

- **The page asks the host for the reading, the page, its size, the order and the setting of the
  columns, it does not give them outward by events.** An event per action grows in number with every new
  action, while the host declares them once; the connecting at that stops being the business of whoever
  puts the page into the markup — a forgotten connecting is visible only on the assembled screen.
- **The host is answered by the common base of the mechanics, and a section only points at itself by one
  line.** The mechanics are one for all the sections and are already there; written in every screen, they
  repeat one and the same thing as many times as there are sections, and diverge as many times.
- **The panel of the setting of the columns opens by an address of its own at every section.** An
  address is also a link and a place in the history of the browser: with one address for all the
  sections there is no saying whose columns are being set, and a person who came back by the link lands
  in the settings of the section that opened first.
- **The page shows the state of the reading that the host named.** The busyness, the refusal, the number
  of the page and the total number of the records come from it, they are not put together by the page
  anew: two sides counting one and the same thing apart diverge at the very first refusal.
- **The heading accepts a hint, and a section without a hint shows the name alone.** An empty place left
  under the hint shifts the heading at the sections that have none.
- **The anchors of the elements of the common page are put together from the prefix the section names.**
  Equal anchors at different sections do not answer the question of whose element a check found: a spec
  that opened the wrong section finds the same anchor and passes green.
- **The prefix names the section by the same word as its table.** A second name of the same section means
  that by an anchor neither the table can be found from the page nor the page from the table.
- **The anchors of the table and of its rows are put together from the same prefix as the anchors of the
  page.** Written as a string at every element, they diverge from the prefix silently, and a spec that
  opened the wrong section finds the same anchor and passes green.

## What is out of scope

- **What every section shows.** The columns, the filter and the panel of details — the subdomain of the
  reading of what was taken in next to it.
- **The shell of the application.** The top row of the sections, the popup of the profile, the theme and
  the language — the subdomain of the shell.
- **The entry of a person.** What they are allowed to the sections by — the subdomain of the reading of
  what was taken in.
- **The edit of a record from the page.** The lists of the cargo only read: the tree that sent it edits.

## Contract

Not applicable: the page has no operations of its own. What to show the page asks of the host, and the
host is answered by the common base of the mechanics of a section.

### Refusal codes

Not applicable: the page creates no refusals of its own. The state of the reading — the busyness, the
refusal, the number of the page and the total number of the records — comes from the host; a refusal
visible to a person is described by the subdomain of the reading of what was taken in.

## Data

Not applicable: the page has no entities of its own. The setting of the columns and the size of the page
are chosen by the person, and they are kept by the same base that answers as the host.

## Screens and states

| State                       | What is there                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| the reading goes            | in the place of the rows the reading is there, and the empty state is not shown                       |
| the rows are read           | the table, the toolbar and the switch of the pages; the page scrolls whole                            |
| there are no rows           | the empty state of the section instead of a table without rows                                        |
| the reading did not succeed | a refusal with a repeat by one action                                                                 |
| a section without a hint    | the heading shows the name alone, and no place under the hint is left                                 |
| the setting of the columns  | a panel opened by the address of its own section; whoever came back by the link lands at the same one |

## Cross-cutting requirements

### Locales

The labels of the page come from the dictionary of the application — the same ones as at the rest of the
screens of the admin application.

### SEO

Not applicable: the admin application is closed by the entry.

### Mobile layout

On a narrow screen a row of the list is shown as a card of the kit; the header, the toolbar and the
switch of the pages stay reachable by scrolling the page whole.

### Several objects

Not applicable: the page shows what the section gave it and knows nothing about the trees.

## Decisions

The decisions of the domain are shared, and they live in the spec of the domain next to it.

## Open questions

The open questions of the domain are shared, and they live in the spec of the domain next to it.

## History of changes

- 20 August 2026 — the subdomain was split out of the spec of the reading of what was taken in, which
  had outgrown the length limit. The rules of the look of the page and of the conversation of a section
  with it, their scenarios and the bindings moved here as they were: the scenario numbers were not
  recounted.
