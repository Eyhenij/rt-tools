# The panel of the operator

**Status:** in force · **Revision:** 2026-09-21 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the conversation and the message), `chat/operator-reading` (the operator and their sites), `chat/event-stream` (the stream)
**Laws:** `access`, `navigation`, `reuse-first`, `lists`, `verifiability`
**Procedures:** none — the operations are declared by the controllers of the chat

A subdomain of the chat: the screen the operator answers a visitor from. The taking in of a remark
is described by the spec of the domain, the sites of an operator and the reading of the lists by the
subdomain about their reading, and the arrival of a new remark by the subdomain about the stream.

## Why

The operations exist and the screen does not. A remark taken in from a visitor reaches the storage
and stops there: the operator can read it only by calling the service by hand, and answer it by
nothing at all. The visitor writes into a chat nobody answers.

## Terminology

| Term            | What it is                                                                               |
| --------------- | ---------------------------------------------------------------------------------------- |
| The panel       | The section of the admin application where the operator reads the talks and answers them |
| The list        | The conversations of the sites the operator answers for, the freshest talk first         |
| The feed        | The messages of one conversation, oldest first, both sides in one thread                 |
| The sending box | The field the operator writes an answer in                                               |
| The sent remark | An answer shown in the feed before the service has answered about it                     |

### What it is called in the interface

The section is named "Чат" in the menu and in the title of the tab. The list is headed by the name
of the site and the minute of the last message; the state of a talk is said by the words "живой"
and "закрытый". The sending box carries the placeholder "Ответ посетителю", and the refusal of a
send — "Реплика не ушла".

## Rules

**Who the section is open to.**

- **The section is closed by the right of its menu item, and the address of the section is closed
  by the same right.** A hidden item closes a section only in appearance: the address opens by a
  direct link.
- **What is seen inside the section is decided by the record of the operator, not by the right.**
  The right says whether the section is shown at all; the sites of the talks are the same set the
  reading works from — a second answer to the question "whose is this" would diverge from the first.
- **A person who holds the right but is an operator of nothing sees an empty list, not a refusal.**
  They are signed in and the section is theirs; there is simply nothing in it.

**What the panel shows.**

- **The list is the conversations of the sites of the operator, the freshest talk first.** The
  order is the one the reading gives; the panel does not sort anew.
- **The list is narrowed by the site and by the state of a talk.** Both narrowings go into the
  request, not into the drawn list: a narrowing done after the reading leaves a foreign talk in the
  count of the rows.
- **The feed of one conversation is read by pages, oldest first, and both sides stand in one
  thread.** Two threads would make the operator read the talk twice to see its order.
- **The screen is assembled from the ready-made of the kit.** The list, the field and the messages
  of the thread are the kit's; one's own primitive is created only by the word of the owner.
- **The thread and the field of the answer are the ready-made chat of the kit, not views of their
  own.** The same thing drawn twice in one tree diverges silently: an edit of the kit does not
  reach a view of one's own, and the two answer differently to one story about a remark.
- **The model of the panel is translated into the model of the kit by one place.** The kit knows
  nothing of the sides, the minutes of the taking in and the states of the sending of this domain:
  a second translation written at the place of drawing diverges from the first, and the divergence
  shows as a remark standing in the thread the wrong way round.
- **The word about the sending is translated by its meaning, not by its name.** A remark that has
  left and has had no answer of the service is "sending" for the kit, while the panel calls that
  state by the word the kit gives to a remark the service has written down: a translation by the
  name would show a confirmed remark in place of an unconfirmed one.

**The answer.**

- **The answer of the operator is written by an operation of its own, closed by the entry of a
  person.** The stream only carries the event about it: a second road for writing would give two
  orders of the messages in one talk.
- **A sent remark is shown in the feed at once, before the service has answered about it.** The
  operator answers several talks in a row, and a field that waits for the service reads as a lost
  remark.
- **A remark the service refused is marked in the feed and is not taken out of it.** Taken out, it
  would leave the operator with nothing to send again from, and the text they wrote would be gone.
- **A refused remark is sent again from the feed itself.** The mark alone leaves the operator to
  retype what they have already written, and the text of it stands right there on the screen.
- **An answer into a conversation of a foreign site is refused as a not-found conversation.** The
  same refusal the reading gives: a different one would say that such a talk exists.
- **A remark of the visitor arrives into the open feed without a reload.** That is what the stream
  of the events is for; the panel subscribes to it by the entry of the person.

## What is out of scope

- **The widget, the notifications and the rollout** — the tasks RT-2182 … RT-2184.
- **The sign that the visitor is typing.** Neither the body of the task nor the spec of the service
  promises it.
- **The search over the text of the talks.** An open question of the spec of the domain; the epic
  does not hold it.
- **The split of the chat into an application of its own.** It is deferred to the rollout, RT-2184,
  and the panel lies where the operations lie.

## Contract

| Operation                                 | What it does                                     |
| ----------------------------------------- | ------------------------------------------------ |
| POST /api/chat/conversations/:id/messages | the answer of the operator into one conversation |

The operations of the reading, the state and the streams already exist and are described by the
subdomains next to this one.

### Refusal codes

Not applicable in the sense of codes of its own kind: the answer of the operation carries a code of
the vocabulary shared with the taking in of a remark, and the panel words it by that code.

| What happened                                   | Code                       | What it says                            |
| ----------------------------------------------- | -------------------------- | --------------------------------------- |
| the conversation is foreign or does not exist   | `chatConversationNotFound` | that there is no such conversation      |
| the text of the answer is empty                 | `chatTextEmpty`            | that a remark without text is not taken |
| the text of the answer is longer than the limit | `chatTextTooLong`          | that the limit is named in the answer   |

The words are the ones the taking in of a visitor's remark already uses: a second vocabulary for the
same refusals would diverge from the first.

## Data

The panel keeps nothing of its own: the talks, the messages and the sites live in the storage of the
chat, and the sent remark lives in the memory of the open screen until the service answers about it.

## Screens and states

| Screen            | State               | What is shown                                                   |
| ----------------- | ------------------- | --------------------------------------------------------------- |
| The list of talks | is being read       | the waiting of the kit in place of the rows                     |
| The list of talks | empty               | the words that there are no talks; for a non-operator the same  |
| The list of talks | read                | the rows, the freshest first, with the narrowings above them    |
| The feed          | no talk chosen      | the words that a talk is to be chosen                           |
| The feed          | is being read       | the waiting of the kit in place of the messages                 |
| The feed          | read                | the messages of both sides in one thread, oldest first          |
| The sending box   | the remark is sent  | the remark in the feed, marked as not confirmed by the service  |
| The sending box   | the send is refused | the remark in the feed, marked as refused, and the text is kept |

## Cross-cutting requirements

### Locales

The labels of the section stand as keys of the admin vocabulary, in both of its sets: a label of one
set alone leaves the other language with a machine word on the screen. The text of the talk itself is
not translated — it is written by the people talking.

### SEO

Not applicable: the admin application is closed by an entry and is not indexed.

### Mobile layout

The list and the feed stand one above the other on a narrow screen, as the sections of the admin
application already do; the sending box stays at the bottom of the feed.

### Several objects

The operator answers for several sites, and the list holds the talks of all of them at once: the
site is named in every row, and the narrowing by site is a narrowing, not the only way to read.

## Decisions

- **The panel is the eighth section of the admin application of the receiver.** Rejected: an
  application of its own for the chat — the split is deferred to the rollout RT-2184, and a second
  application for one screen would cost a second rollout where the expenses are held as low as
  possible.
- **The menu item is closed by the right `chat:read`, and the data by the record of the operator.**
  Rejected: a section open to everyone signed in — the law of navigation asks a right of an item and
  of an address, and the names of the rights come from one set, the receiver's. The name is added to
  that set, and the epic promised not to touch the accounts of the receiver: the addition is named to
  the owner in words.
- **A sent remark is shown before the answer of the service.** Rejected: waiting for the answer — the
  operator answers several talks in a row, and a field that waits reads as a lost remark.

## Open questions

- Whether the operator sees the talks of a site they were removed from while the screen is open.
  Today the list is read on every opening, and the stream carries only the sites of the entry.

## History of changes

- 2026-09-20 — written before the code by the task RT-2181 of the epic RT-2177.
- 2026-09-20 — merged into the spec of the domain as a subdomain together with the bindings of the
  rules to the code.
- 2026-09-21 — the thread and the field of the answer are said to be the ready-made chat of the kit
  by the task RT-2284: four rules about the drawing, the translation of the model and the word about
  the sending, and the scenarios `SC-CH-80` … `SC-CH-82`.
