# The widget of the visitor

**Status:** in force · **Revision:** 2026-09-30 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the site, the visitor and the taking in), `chat/event-stream` (the stream), `chat/operator-panel` (the answer of the operator)
**Laws:** `frontend-application`, `access`, `reuse-first`, `verifiability`
**Procedures:** none — the operations are declared by the controller of the taking in

The subdomain of the chat: what the visitor of a public site writes from. The text was written
before the code by the task RT-2182 of the epic RT-2177 and merged into the domain by its last
commits.

## Why

The service takes remarks in and the operator answers them, and the visitor has nothing to write
with: a public site carries no chat at all. The whole epic is bought by this one screen — without
it the talks come from nowhere.

## Terminology

| Term                | What it is                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| The widget          | The element of the page the visitor talks from; put in by one script with the key of the site  |
| The host page       | A page of a foreign application the widget stands in. Its styles do not reach the widget       |
| The bubble          | The widget folded: a round button in the corner of the page                                    |
| The greeting        | The words of the site shown before the first remark                                            |
| The hours of answer | The interval of the day the operator answers within; outside it the remark is still taken      |
| The sign of visitor | The secret of one person: it lies in the storage of their browser and opens their conversation |

### What it is called in the interface

The words of the widget are its own: the host page is of any tongue, and the service answers with
codes, not with text. The field of the first remark carries the placeholder "Напишите нам", the
button of sending — "Отправить". A remark past the limit gets "Реплика длиннее, чем принимает
сервис"; a refused sending gets "Реплика не ушла". Outside the hours of answer the widget says
"Ответим в рабочие часы". An unknown or switched-off site gets "Чат недоступен". The list of talks
is headed "Ваши обращения" and ends with the button "Новое обращение"; a closed talk carries the
mark "Закрыто"; under the name of the operator stands "Служба поддержки". A closed talk ends with the line "Разговор
завершён" and its time, and its field says "Новый вопрос? Напишите нам".

## Rules

**Where the widget comes from.**

- **The widget is put in by one script, and the page names the site by its key.** The script
  declares the element of the page, and the key comes as an attribute of the tag: the key is open
  and lies in the code of the page, so it gives no rights beyond taking a remark in.
- **The widget draws itself in a shadow tree of its own.** It stands in a foreign page, and the
  styles of that page must not reach it any more than its own reach the page: a widget repainted
  by a neighbour reads as broken, and the owner of the page has nothing to fix it with.
- **The widget carries no kit of the tree.** The kit is an application of its own with a framework
  behind it, and it would travel into every page of every consumer. The widget is written by its
  own code, and what it shares with the tree is the shape of the answers, not the components.
- **A page whose address is not in the list of the site gets no chat.** The service refuses every
  operation of such a page, and the widget says the chat is unavailable rather than staying silent:
  a page put in wrongly is told from a broken one only by words.

**What the widget shows.**

- **Before the first remark the widget shows the greeting of the site and the hours of answer.**
  Both lie on the record of the site and arrive by one reading: a second place for the same words
  would diverge from the first silently.
- **The conversation is created by the first remark, not by the opening of the widget.** A widget
  opened and left alone creates nothing: otherwise the list of the operator fills with talks nobody
  wrote in.
- **A returning visitor opens the widget on the list of their talks.** The sign of the visitor
  lies in the storage of the browser under the key of the site, and by it the widget reads the
  list. A visitor whose browser lost the sign starts a new talk — the service has no other way to
  recognise them.
- **A new talk is started by the button under the list.** It opens an empty talk with the greeting,
  and the first remark creates the conversation with the mark of a new talk: a talk the visitor did
  not ask for is never started.
- **A talk opened from the list goes back to it by the arrow of the head.** The list is the home of
  a visitor with talks; without the way back the other talks are out of reach.
- **An answer is unread until the visitor opens its talk, and the mark lives in the browser.** The
  widget keeps the minute each talk was last seen next to the sign; a talk whose last answer is
  newer carries the dot. The service keeps no reading of the visitor: a second device shows the dot
  again, and that costs less than a table nobody else reads.
- **Both sides stand in one thread, oldest first.** The same order the panel of the operator shows:
  two orders of one talk would make the two sides read it differently.
- **An answer of the operator arrives in the open widget without a reload.** The stream of the
  events is subscribed to by the sign of the visitor and carries the events of their conversations
  alone; an answer to another talk marks it unread in the list.
- **A closed talk says so under its thread, and the closing arrives without a reload.** The line
  "Разговор завершён" names the minute of the closing. Without it the visitor writes on into a talk
  nobody waits for.
- **The next remark from a closed talk starts a new talk.** The closed one stays closed and is read
  from the list: the operator closed it on purpose, and a new question is a new talk for them too.
  The service still reopens a closed talk a remark reaches; the widget does not write there any
  more.
- **Outside the hours of answer the remark is taken in all the same, and the widget says when the
  answer comes.** A chat that refuses at night looks broken; a chat that stays silent about the
  hours promises an answer it will not give.

**The look.**

- **On a narrow screen the widget takes the whole screen, on a wide one it stands in the corner.**
  A corner window of a phone leaves room neither for the thread nor for the keyboard.
- **The widget is folded into a bubble and unfolded by a press.** A page of a foreign application
  is not given away to a window nobody opened.
- **A remark of any length keeps the thread within its width.** Long words and addresses are broken,
  not let out past the edge: the widget stands in a foreign layout and has no right to stretch it.
- **The folded widget is a round button with an icon, and the open one is a window of 380 px with a
  head of the accent colour.** The head carries the title and the cross; the look repeats the
  mockup by the widget's own values, because the kit does not travel with it.
- **The remarks of the two sides are bubbles on the two sides of the thread.** The visitor's stand
  on the right, the support's on the left; each names its side and the time it was taken in.
- **Before the first remark the greeting and the hours stand in one card; outside the hours a talk
  gets a note above the thread.** Inside the hours a going talk shows no hours at all: the visitor
  already knows the answer comes.
- **A row of the list names the operator, the last remark, its time, the unread dot and the closed
  mark.** A row without a named answer says "Поддержка" by the common icon; the time of today is
  the hour, of yesterday "Вчера", earlier the day and the month.
- **The head of a talk names the operator who answered last.** The initials in a circle, the name
  and "Служба поддержки"; before a named answer — the common icon, "Поддержка" and the hours.
  There is no photo: the service keeps no files, and the mockup draws the initials.
- **The bubble of an answer names the first word of the operator's name.** An answer without a name
  says "Поддержка", as before.
- **The field is a capsule, and in focus it draws the ring of the fields of the tree.** The send
  button beside it is pale while the field is empty and stays pressable: an empty remark is not
  sent by the check of the widget, not by a switched-off button.

**The refusals.**

- **The limit of the length is named by the service and arrives in the answer of the refusal.** The
  widget writes no copy of the number: two copies diverge silently, and the visitor loses a remark
  the service would have taken.
- **A remark without text is not sent at all.** The check is the widget's own: a request for an
  empty remark is spent for nothing.
- **A refused remark stays in the field.** Taken out, it leaves the visitor with nothing to send
  again from.

## What is out of scope

- **The notifications and the rollout** — the tasks RT-2183 and RT-2184.
- **The screen for editing the settings of a site.** The greeting and the hours lie on the record
  of the site; whoever edits the records edits them, and no screen for that exists in the tree.
- **The days off.** The hours of answer are one interval for every day: nobody has asked for a week
  of their own yet, and a week of intervals costs a table where a pair of numbers is enough today.
- **Attachments, calls, ratings of the talk and the sign that the operator is typing.** The epic
  holds none of them.
- **Two sites on one page.** One page belongs to one site; a second widget on it is refused by the
  script rather than drawn.

## Contract

| Operation                           | What it does                                                       |
| ----------------------------------- | ------------------------------------------------------------------ |
| GET /api/chat/site                  | the greeting, the hours of answer and whether the site is on       |
| GET /api/chat/messages              | the messages of the own conversation of the visitor, by their sign |
| POST /api/chat/conversations        | creates the conversation and gives out the sign of the visitor     |
| POST /api/chat/messages             | takes in the remark of the visitor                                 |
| GET /api/chat/stream                | the stream of the events of the own conversations of the visitor   |
| GET /api/chat/visitor-conversations | the list of the talks of the visitor, the latest first             |

All six are open operations: they are closed by the key of the site and by the list of the
addresses, and those that speak of the visitor's talks — by the sign of the visitor as well. An
answer of the operator in the messages and in the stream carries the name of its account when it
has one.

### Refusal codes

Not applicable in the sense of codes of its own kind: the answers carry the words of the vocabulary
the taking in already uses, and the widget words them itself.

| What happened                                  | Code                       | What it says                            |
| ---------------------------------------------- | -------------------------- | --------------------------------------- |
| the key of the site is unknown or switched off | `chatSiteRejected`         | that there is no such site              |
| the address of the page is not in the list     | `chatOriginRejected`       | that the page is not put in             |
| the sign of the visitor is foreign             | `chatConversationNotFound` | that there is no such conversation      |
| the text of the remark is empty                | `chatTextEmpty`            | that a remark without text is not taken |
| the text is longer than the limit              | `chatTextTooLong`          | that the limit is named in the answer   |

## Data

The widget keeps two things of its own in the storage of the browser, under a key derived from the
key of the site: the sign of the visitor and the minute each talk was last seen. Everything else lives in the storage of the service. The
record of the site gains two fields: the greeting and the hours of answer — the minute the answer
starts, the minute it ends and the time zone they are counted in.

## Screens and states

| Screen     | State                  | What is shown                                                             |
| ---------- | ---------------------- | ------------------------------------------------------------------------- |
| The bubble | folded                 | the round button in the corner; on a narrow screen the same               |
| The widget | the site is unknown    | the words that the chat is unavailable and a hint, without a field        |
| The widget | no talk yet            | the greeting, the hours of answer and the field of the first remark       |
| The widget | the list of talks      | the rows of the talks, the latest first, and the new-talk button          |
| The widget | a talk without answer  | the common icon, "Поддержка" and the hours in the head                    |
| The widget | a talk with an answer  | the initials, the name and "Служба поддержки" in the head                 |
| The widget | a closed talk          | the thread, the line of the closing with its time, the new-question field |
| The widget | the talk is read       | the messages of both sides, oldest first, and the field                   |
| The widget | the remark is sent     | the remark in the thread, marked as not confirmed by the service          |
| The widget | the sending is refused | the words of the refusal, and the text stays in the field                 |
| The widget | outside the hours      | the same as the two above plus the words about the hours of answer        |

## Cross-cutting requirements

### Locales

The widget words everything itself, and its words live next to its code: the service answers with
codes, and a host page of another tongue takes the same script. One set of words arrives with this
work — the tongue of the owner; a second set is work of its own and is not promised here.

### SEO

Not applicable: the widget is drawn after the page is loaded and adds nothing to what is indexed.

### Mobile layout

Named by the rules above: the whole screen on a narrow one, the corner on a wide one. The field
stays under the thread, and the thread scrolls inside itself.

### Several objects

One page belongs to one site. A visitor writing from two sites has two signs and two conversations
— they lie under different keys of the storage and never meet.

## Decisions

- **The widget is written by its own code in a shadow tree.** Rejected: the kit of the tree — it
  would carry a framework into every page of every consumer, and the epic holds the expenses as low
  as they go.
- **The conversation is created by the first remark.** Rejected: creating it at the opening — the
  list of the operator would fill with talks nobody wrote in.
- **The hours of answer are one interval for every day.** Rejected: a week of intervals — nobody has
  asked for days off, and the pair of numbers is replaced by a table without touching what the
  widget shows.
- **The operator is named by the name of the account, under one word for the role, by initials.**
  Rejected: a name for the visitors and a position on the account — an edit of the accounts screen
  nobody asked for; a photo — the service keeps no files.
- **The next remark from a closed talk starts a new talk.** Rejected: reopening the same one. With
  a list of talks the reopening mixes a new question into an answer the operator already closed.
- **The unread mark lives in the browser.** Rejected: a reading of the visitor in the storage — a
  table for a dot on one screen.
- **The messages of the own conversation are read by an operation of its own, closed by the sign of
  the visitor.** Rejected: giving the visitor the reading of the operator — that one is closed by an
  entry and answers for the sites of a person, and a visitor has neither.

## Open questions

- Whether a page may put the widget in without a tag, by the script alone. Two ways of putting it in
  would diverge; the tag is chosen because the page decides where the widget stands.

## History of changes

- 2026-09-20 — written before the code by the task RT-2182 of the epic RT-2177.
- 2026-09-21 — merged into the domain as a subdomain by the same task; the scenario SC-CH-61 about
  the width of a long remark was added by the work itself.
- 2026-09-30 — the look follows the mockup by the task RT-2365 of the epic RT-2370: the round
  button, the blue head, the bubbles, the capsule field; scenarios SC-CH-99…SC-CH-102.
- 2026-09-30 — the list of the visitor's talks, the new talk and the name of the operator by the
  task RT-2367; scenarios SC-CH-107…SC-CH-111.
- 2026-09-30 — the closed talk and the next remark after it by the task RT-2364; scenarios
  SC-CH-112 and SC-CH-113.
