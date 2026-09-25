# The talks open as a workspace

**Status:** in force · **Revision:** 2026-09-24 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat/operator-panel` (the screen of the operator), `chat/embedded-talks` (the page in a foreign admin)
**Laws:** `reuse-first`, `lists`, `frontend-application`, `verifiability`
**Procedures:** none — the screens are assembled from the operations already declared

A subdomain of the chat about one thing: how a talk is laid out on the screen. It says nothing about
what is read or written — that is the panel of the operator and the embedded page — and applies to
both of them at once.

## Why

Both screens are assembled by a grid of their own: the list on the left, the feed on the right, and
the state of the talk standing as a text link above the feed. The kit carries a ready-made workspace
for exactly this — a list, a card and a panel of details, with columns a person drags and widths
that are remembered — and the tree does not use it. What comes of that:

- The properties of a talk are shown nowhere. Whose site it is, when the last remark came — the
  person reads none of it, though the reading already answers it.
- The action over a talk stands in the feed, where the remarks are. An action is not a remark, and
  the place says nothing about what it will do.
- A row of the list is one line of text with a word of the state appended. A state said by a word
  among words is not seen at a glance over fifty rows.
- The two screens are assembled twice, and they have already diverged: the panel shows the site of a
  talk in the row, the page does not.

The owner named the miss on the delivered work: the talks must be laid out the way the ready-made
workspace of the kit lays them out.

## Terminology

| Term             | What it is                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| The workspace    | The three columns of the screen: the list, the feed, the details of the talk       |
| The details      | The right column: the properties of the chosen talk and the actions over it        |
| The mark         | The state of a talk shown in a row of the list as a tag, not as a word among words |
| The shared parts | The row, the properties and the title — written once and shown by both screens     |

### What it is called in the interface

The details are headed «Разговор». Its properties are named «Площадка», «Состояние», «Последняя
реплика». The actions are «Закрыть разговор» and «Открыть снова». The mark of a live talk says
«Живой», of a closed one «Закрытый». The title of the feed is the last remark of the talk, cut to one
line.

## Rules

**How the screen is laid out.**

- **The talks are laid out by the workspace of the kit, not by a grid of the screen's own.** The
  columns are dragged and their widths are remembered; a grid of one's own gives neither, and every
  screen that writes its own diverges from the next one.
- **The three columns are the list, the feed and the details, in this order.** The person reads from
  the choice to the talk to what is known about it.
- **Each screen remembers its widths under a key of its own.** The embedded page stands in a foreign
  admin, and the widths a person set there are not the widths of the panel of the operator.
- **With no talk chosen the feed says so itself, and the details stay empty.** Two columns saying
  the same thing twice is the same screen drawn twice.

**What stands where.**

- **An action over a talk stands in the details, not in the feed.** The feed holds the remarks; an
  action placed among them reads as a remark until it is pressed.
- **The state of a talk is shown by a mark in the row, and by a property in the details.** The row
  answers "which of these fifty", the details answer "what is with this one".
- **The properties of a talk are the ones the reading already answers.** A property invented for the
  sake of the column is filled by nothing and stands empty on every talk.
- **The title of the feed is the last remark of the talk.** The talk has no name of its own here,
  and a title made of an identifier says nothing to a person.

**What both screens share.**

- **The row, the properties, the title and the actions are written once and taken by both screens.**
  Written twice, they diverge silently — that has already happened to the site in the row.
- **The shared parts know nothing about the screen they are shown on.** The panel has the narrowings
  and the page has the sign of entry; a shared part that knew which screen it is in would carry
  both.

**What does not change.**

- **The operations of reading and writing stay as they are.** The workspace is assembled from what
  is already answered; a screen is not a reason to add an operation.
- **The narrowing by the site and by the state stays in the list of the panel.** It belongs to the
  choice, and the workspace changes the place of the choice by nothing.
- **The embedded page carries no choice of a site.** The page of a site shows that site.

## What is out of scope

- **The properties the reading does not answer.** The name and the language of the visitor, the
  unread, the attachments, the marked-up text — the models of the chat hold none of them. Filling
  the details with them is work over the receiver and is named by a task of its own.
- **The widget of the visitor.** It is not a workspace and is assembled differently.
- **The narrowings of the embedded page.** Its site is one, and the state is shown by the mark.

## Contract

Not applicable: the subdomain declares no operation of its own. The screens call what the panel of
the operator and the embedded page already call — the list of the talks, the feed of one talk, the
answer and the change of the state.

### Refusal codes

Not applicable: with no operations of its own there is nothing to refuse. A refusal of a call is
worded by the subdomain the call belongs to.

## Data

The subdomain stores one thing — the widths of the columns, and the kit stores them: the workspace
keeps them in the storage of the browser under the key the screen names. The widths belong to the
person at the screen and travel nowhere.

## Screens and states

| The state          | What the person sees                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| No talk chosen     | the list, the feed with its own hint, the details empty                                                |
| A talk is chosen   | the list with the row marked, the feed with the title, the details with the properties and the actions |
| The talk is live   | the mark «Живой» in the row, the action «Закрыть разговор» in the details                              |
| The talk is closed | the mark «Закрытый» in the row, the action «Открыть снова» in the details                              |
| The list is empty  | the empty state of the list of the kit, the details empty                                              |

## Cross-cutting requirements

The screens are assembled from the pieces of the kit and add no markup of their own beyond the
placing: the uniformity check reads this.

### Locales

The labels of the details and the marks stand as keys of the vocabulary of the admin, in every one
of its sets. The text of the remarks is not translated — it is written by the people talking.

### SEO

Not applicable: both screens stand behind an entry and are not indexed.

### Mobile layout

On a narrow screen the workspace of the kit shows one column at a time and gives the bar with the
buttons «назад» and «подробности»; the screens add nothing to that. The width is taken from the
place the screen is embedded into, not from the width of the window.

### Several objects

The details show one talk — the chosen one. Two talks open at once are not a state of this screen.

## Decisions

- **The action over a talk moves from the feed to the details.** Weighed and left: leaving it above
  the feed — the place then says nothing about what the action does, and the feed holds remarks, not
  buttons.
- **The shared parts live in the libraries of the admin of the chat, not in each screen.** The
  embedded page is allowed to depend on them by the boundaries; the two screens have already
  diverged on the site in the row.

## Open questions

- `Q-CH-2` — whether the details are given the count of the remarks in a talk: the reading answers
  the pages, not the count, and one more operation is needed for the number.

## History of changes

- 2026-09-24 — the text is written before the code, by the task RT-2336 of the epic RT-2335.
- 2026-09-24 — the code of both screens is written, and the text moves into the domain by the task
  RT-2338 of the same epic.
