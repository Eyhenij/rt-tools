# The stream of the events

**Status:** proposed · **Revision:** 2026-09-20 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the conversation and the message), `chat/operator-reading` (the operator and their sites)
**Laws:** `verifiability`, `observability`, `access`
**Procedures:** none — the subscriptions are declared by the controllers of the chat

The agreement of the task RT-2180 of the epic RT-2177: how a new remark reaches a screen that is
already open. It merges into the spec of the domain by the last commit of the work.

## Why

A screen learns of a new remark only when the page is reloaded. The visitor writes and waits
looking at their own message; the operator sees the talk of the day before until they press the
refresh. Both sides need one thing: the message that has arrived appears where it is being read.

## Terminology

| Term             | What it is                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| The stream       | An open connection the service sends the events of one conversation or of one operator into                            |
| The event        | One message that has arrived, sent to everyone subscribed to its conversation                                          |
| The subscription | An open stream with its own sign: the visitor by their sign, the operator by their entry                               |
| The heartbeat    | An empty line the service sends while there are no events, so the connection is not closed as idle                     |
| What was missed  | The messages that arrived while the stream was broken; they are asked for by the minute of the last one the screen has |

### What it is called in the interface

The widget and the panel arrive by the tasks RT-2181 and RT-2182 and name the words on the screen
themselves. This text has no screen of its own.

## Rules

**What the stream carries.**

- **The stream carries the events of the messages, and the messages themselves are written by the
  operations of the taking in.** A second road for writing would give two orders of the messages
  in one talk, and the screen would show whichever arrived first.
- **An event carries the message whole, not a sign that something has changed.** A sign would make
  every screen ask for the message again, and the stream would cost a request per event instead of
  saving one.
- **While there are no events the service sends a heartbeat.** An idle connection is closed by the
  proxy in front of the service, and the screen would read that as an ending talk.

**Who sees which stream.**

- **The stream of a visitor is closed by their sign, and it carries the events of their
  conversation alone.** The sign is the one the service issued at the creation of the conversation;
  an unknown one is refused as a not-found conversation.
- **The stream of an operator is closed by their entry, and it carries the events of the sites
  they answer for.** The same set of the sites the reading works from: a second answer to the
  question "whose is this" would diverge from the first.
- **A person who is not an operator of the chat gets an open stream with no events.** Their set of
  the sites is empty, and an empty set is not a refusal: they are signed in, they simply answer for
  nothing.

**A break and what was missed.**

- **A broken stream is restored by the screen, and the service does not keep it.** The subscribers
  live in the memory of the raised service: a break there is ordinary, and keeping them would mean
  keeping what nobody asked to keep.
- **What was missed is asked for by the minute of the last message the screen has, not by the
  count of the events.** A count would have to be kept by both sides, and a screen that lost it
  would have no way to say where it stopped.
- **The reading of what was missed is the reading that already exists, not a second one of its
  own.** The messages of a conversation are read by pages; the screen asks for them by the same
  operation, and the stream only says that there is something to ask for.

## What is out of scope

- **The panel, the widget, the notifications and the rollout** — the tasks RT-2181 … RT-2184.
- **The answer of the operator to the visitor.** It is taken in by the panel; the stream only
  carries the event about it.
- **A bus of the events between processes.** The service is raised as one process, and a second
  service for the subscribers would cost money where it is held as low as possible.

## Contract

| Operation                          | What it does                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| GET /api/chat/stream               | the stream of one visitor: the key of the site and their sign as the parameters |
| GET /api/chat/conversations/stream | the stream of one operator: closed by the entry of a person                     |

Both answer with a stream of the events sent by the server, not with a single answer.

The stream of the operator stands among the operations of their reading, not apart: it is closed by
the same entry and answers for the same sites. What was missed is asked for by the reading that
already exists — `GET /api/chat/conversations/:id/messages` with the minute of the last message the
screen has as the parameter `since`.

### Refusal codes

Not applicable in the sense of codes of its own kind: the service answers with a code of the answer
of HTTP, and the named code comes from the vocabulary shared with the intake.

| What happened                                    | Code  | What it says                        |
| ------------------------------------------------ | ----- | ----------------------------------- |
| the sign of the visitor is unknown               | `404` | that there is no such conversation  |
| there is no entry in the request of the operator | `401` | that the operation demands an entry |
| the key of the site is not named                 | `400` | that the key is mandatory           |

## Data

The stream keeps nothing of its own: the subscribers live in the memory of the raised service, and
every event is assembled from a message that is already in the storage.

## Screens and states

Not applicable: this work has no screen.

## Cross-cutting requirements

### Locales

The events carry no text of the service: the text in them is the talk itself, in the language of
whoever wrote it.

### SEO

Not applicable: the streams are closed.

### Mobile layout

Not applicable: this work has no screen.

### Several objects

Every stream carries the events of its own conversation or of the sites of its own operator: a
foreign event does not reach either of them.

## Decisions

- **The events go one way, from the service to the screen.** Rejected: a two-way connection — the
  remarks are already taken in by an operation, and a second road for the same would give two
  orders of the messages.
- **The subscribers live in the memory of the service.** Rejected: a bus of its own — the service
  is one process, and the owner holds the expenses as low as possible.
- **What was missed is asked for by the minute, not by the count of the events.** Rejected: a
  count — both sides would have to keep it, and a screen that lost it could not say where it
  stopped.

## Open questions

- How long a stream lives without events. Today it is held by a heartbeat every half a minute;
  whether that is enough for the proxy of the node is seen at the rollout, RT-2184.

## History of changes

- 2026-09-20 — written before the code by the task RT-2180 of the epic RT-2177.
