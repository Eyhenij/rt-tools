# The notifications of the chat

**Status:** proposed · **Revision:** 2026-09-21 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the site, the conversation and the taking in), `chat/operator-panel` (the answer and the closing), `chat/event-stream` (the events of an open screen)
**Laws:** `observability`, `access`, `verifiability`, `code-structure`
**Procedures:** none — the service calls outward; it declares no operation of its own by this work

The agreement of the task RT-2183 of the epic RT-2177: what the service says outward while nobody
is looking at the panel. It merges into the spec of the domain by the last commits of the work.

## Why

The stream of the events reaches an open screen alone. A visitor writes at night, the panel is
closed, and the remark lies until somebody opens it by chance: the service wakes nobody at all. A
chat that answers only while a person watches it is bought by no consumer.

The service has no way of its own to reach a person — neither mail nor a messenger, and the word of
the owner is to hold the expenses as low as they go. So it tells the application that put the widget
in: that application already has the mail of its operators and its own screens, and it decides how
to wake them.

## Terminology

| Term                    | What it is                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| The call outward        | One request of the service to the address of the application of the site; it carries one event          |
| The address of the call | The address on the record of the site the calls go to. Empty — the site gets no calls at all            |
| The secret of the site  | What the call is signed by: by it the application tells the service from anyone who learnt the address  |
| The agreed time         | The minutes without an answer after which the conversation wakes the operator. Zero — the waking is off |
| The unanswered talk     | A conversation whose last remark is of the visitor and older than the agreed time                       |
| The record of a sending | What went out, by what event, when and how it ended — the only place the outcome of a call is read from |

### What it is called in the interface

Not applicable: this work has no screen. The calls go from the service to an application and are
read by a machine; the words a person sees are written by the application that took the call.

## Rules

**What goes outward.**

- **The service calls the address of the site, and there is no second road outward.** Mail, a
  messenger and a screen of its own are the business of the application that took the call: two
  roads outward would each have their own refusal, their own repetition and their own silence, and
  they would diverge unnoticed.
- **A site without an address of the call gets none.** An empty address is a lawful state of a site
  whose application does not want the calls, and it is not a misconfiguration to be refused.
- **Three events go outward: a remark of the visitor, the closing of a conversation and a talk left
  unanswered.** The answer of the operator does not: the application learns of it from the very
  panel the operator answered in.
- **Every call is signed by the secret of the site.** The address of an application is open to
  whoever saw the traffic, and a call nobody signed is indistinguishable from a call of a stranger.
- **The event carries what the taking in already knows and nothing besides.** The conversation, the
  message, the side, the minute of the taking in and the key of the site: a text of a person a
  neighbouring service does not need is not put into a call it has no right to.

**When they go.**

- **The call does not hold back the answer to the visitor.** The remark is taken in and answered at
  once, and the call leaves after that: an application that does not answer would otherwise stop the
  chat of every site of its own.
- **A conversation wakes the operator once, not every minute.** The waking is marked on the
  conversation, and the mark is cleared by the answer of the operator: a talk repeated every minute
  teaches the application to ignore it.
- **The agreed time belongs to the site.** Sites differ by what counts as late, and a number one for
  all would be wrong for every one of them.
- **A conversation wakes nobody while the operator answers within the hours of the site.** The hours
  of answer already promise the visitor when the answer comes, and a waking earlier than that
  promises the operator a lateness there was none of.

**What happens to a call that did not go through.**

- **A refusal of the receiving side is not a refusal of the taking in.** The remark is already in
  the storage; the call is repeated, and the conversation lives on.
- **A call is repeated a limited number of times, and the number is named by the service.** A repeat
  without a limit holds the address of an application that is down forever.
- **The outcome of every call is read from its record, not from the success of the sending.** A call
  that went out and was refused, and a call that never left, look the same in the storage of the
  chat without such a record.

## What is out of scope

- **The rollout of the service on the node** — the task RT-2184 of the same epic.
- **Mail to the operator.** There is no mail in the tree at all, and starting it for the sake of one
  notification costs more than handing the event to an application that already has the ways to
  reach a person.
- **The screen for editing the address, the secret and the agreed time.** As the greeting and the
  hours of answer, they lie on the record of the site, and no screen for the settings of a site
  exists in the tree.
- **The sign of the unread in the panel of the operator.** The task speaks of a closed panel, not of
  a counter in an open one.
- **The incoming calls of an application into the chat.** Nothing of the service is written by a
  call from outside: the operator answers in the panel.

## Contract

The service declares no new operation by this work: it calls outward. One address, one shape of the
call, three kinds of event.

| What goes out                   | When                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| the event of a remark           | a remark of the visitor is taken into a conversation of the site                   |
| the event of a closing          | the operator closes a conversation                                                 |
| the event of an unanswered talk | the last remark of a conversation is of the visitor and older than the agreed time |

| What is in every call                   | What it says                                                      |
| --------------------------------------- | ----------------------------------------------------------------- |
| the kind of the event                   | which of the three came                                           |
| the key of the site                     | the site of the conversation; the application holds more than one |
| the identifier of the conversation      | the talk the event is about                                       |
| the minute of the event by the service  | the clock of the service, not of the sender                       |
| the signature by the secret of the site | what the application tells the service by                         |

### Refusal codes

Not applicable in the sense of codes of its own kind: the service refuses nobody here — it is the
one that calls. What the receiving side answers is written into the record of the sending as it
came: the code of the answer, or the reason there was no answer at all.

## Data

The record of the site gains three fields: the address of the call, the secret of the signature and
the agreed time in minutes. The conversation gains the minute it last woke the operator by — an
empty one means it never woke anybody.

Every call lives as a record: the site, the conversation, the kind of the event, the minute of the
sending, how many attempts there were and how the last one ended.

## Screens and states

Not applicable: this work has no screen. What a person sees is drawn by the application that took
the call.

## Cross-cutting requirements

### Locales

The calls carry no text for a person: the words are written by the application that took the call.

### SEO

Not applicable: nothing of this work reaches a page.

### Mobile layout

Not applicable: this work has no screen.

### Several objects

Every site has an address, a secret and an agreed time of its own, and a call names the site by its
key: an application holding several sites tells them apart by it. A conversation belongs to one
site, and its events go to that site alone.

### The refusals and the limits

- **The limit of the attempts is named by the service in one place.** A second copy of the number
  diverges silently, and the record of the sending is read against it.
- **The calls of the chat are not counted in the observations of the rules layer.** That cargo is
  about the sessions of the executors and has nothing to do with the visitors of a site.
- **A call is never made without an address and a secret.** A site that has one of the two is a site
  whose settings were half filled in, and the service treats it as one with no address at all.

## Decisions

- **The operator is woken through the application, not by the service itself.** The word of the
  owner: the expenses on the infrastructure are held as low as possible. Rejected: mail of the
  service — a sender, its settings and its address for every space, for the sake of one line of
  text.
- **One address for the three events.** Rejected: an address per kind — three addresses go stale
  apart, and the application sorts the kinds out by the field of the call more cheaply than by three
  handlers.
- **The waking is marked on the conversation, not held in memory.** Rejected: a mark in memory — the
  service is restarted by every rollout, and after it every old conversation would wake the operator
  anew.
- **The agreed time is counted from the minute of the taking in of the last remark, not from the
  creation of the conversation.** A talk where the operator answered and the visitor wrote again is
  late by the second remark, not by the first.

## Open questions

- Whether an application may ask the service to repeat the events it missed while it was down. The
  record of the sending holds them, and there is no operation to give them out by; nobody has asked
  for one yet.
- Whether the service stops calling a site whose address has been refusing for a long time. Today
  every event repeats its attempts on its own, and the limit of the attempts is the only brake.

## History of changes

- 2026-09-21 — written before the code by the task RT-2183 of the epic RT-2177.
