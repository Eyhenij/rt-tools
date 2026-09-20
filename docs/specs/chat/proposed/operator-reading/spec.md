# The reading by the operator

**Status:** proposed · **Revision:** 2026-09-20 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the space, the site, the visitor, the conversation and the message)
**Laws:** `verifiability`, `lists`, `access`, `code-structure`
**Procedures:** none — the operations are declared by the controllers of the chat

The agreement of the task RT-2179 of the epic RT-2177: what the operator sees and how the talk of
a visitor reaches a person at all. It merges into the spec of the domain by the last commit of the
work.

## Why

A remark taken in is visible to nobody: the service holds the conversations and gives them out to
no one. The first work of the epic closed the side of the visitor; this one opens the side of the
person who answers.

An operator answers for several sites at once and sees the conversations of all of them in one
place. What they do not answer for they do not see at all — a client of the service and their
neighbour share a node, and the boundary between them is held by the reading, not by the screen.

## Terminology

The vocabulary of the domain is in the spec next to it; here only what the reading adds.

| Term                        | What it is                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The operator                | A person of the space who reads the conversations and answers them. A record of the chat, not a right of the intake     |
| The sites of the operator   | The sites the operator answers for. What is not in that set is invisible to them                                        |
| The state of a conversation | Whether the talk is live or closed. There are two words, and the list of the conversations is filtered by them          |
| The page                    | A piece of a list: how many rows, from which one, in which order — the same reading the cargo of the intake is taken by |

### What it is called in the interface

The panel of the operator arrives by the task RT-2181 and names the words on the screen itself.
This text has no screen of its own.

## Rules

**The operator and what they see.**

- **The operator is a record of the chat, and their entry is the entry of a person into the
  receiver.** The epic promised the chat its own operators and its own space, and the record holds
  that boundary: the rights of the receiver the chat neither reads nor adds to. A second door of
  its own — a name, a password, a term of the entry — the epic did not promise, and it costs a work
  of its own.
- **An operation of the reading is closed by the entry of a person, not by the key of the site.**
  The key lies open in the page of the site: closed by it, the reading would give the talk of the
  visitors to whoever opened the page code.
- **A request without an entry is refused as unauthenticated, and an entry that is not an operator
  of the chat — as a not-found conversation.** The first is cured by signing in, the second is not;
  and the second does not say whether the conversation exists.
- **The operator sees the conversations of their sites, and the rest do not reach the answer at
  all.** Not hidden on the screen, not filtered out after the reading: the set of the sites goes
  into the query itself, otherwise the count of the rows tells the neighbour's talk by its number.
- **A site named in the request but not in the set of the operator gives an empty page, not a
  refusal.** The refusal would answer the question "does such a site exist", and the empty page
  answers nothing.

**The list and the page.**

- **A list is read by pages, and the page is taken by the reading the cargo of the intake is taken
  by.** How many rows, from which, in which order and how the whole count is given back is decided
  once for the tree; a second reading of its own would diverge from the first at the first edit.
- **The list of the conversations is ordered by the minute of the last message, the freshest
  first.** That is the order the operator works in: the talk that is waiting stands at the top.
- **The messages of one conversation are read by pages too, oldest first.** A talk is read from its
  beginning, and the page of a long one is asked for by the same reading.
- **The list of the conversations carries the last message itself, not only its minute.** Without
  it the panel asks a second time for every row, and the list stops being one request.

**The state of a conversation.**

- **A conversation has two states: live and closed.** A third word is added to this text first and
  to the code after — the set is read by the screen, and a value it does not know shows there as a
  machine string.
- **A conversation is created live, and the state is changed by the operator.** The visitor does not
  close their talk: for them the talk ends by itself, and the closing is the work of whoever
  answered.
- **A remark of a visitor into a closed conversation opens it again.** The person came back, and a
  closed talk with a fresh message in it is invisible to the operator exactly when it must not be.
- **The state is changed only by an operator of that site.** The same boundary as the reading, and
  it is checked by the same set of the sites.

## What is out of scope

- **The answer of the operator to the visitor** — the panel, the task RT-2181.
- **The stream of the events, the widget, the notifications and the rollout** — the tasks RT-2180,
  RT-2182, RT-2183 and RT-2184.
- **The creation of the operators and of the sites by a person.** While there is no panel they are
  created by a direct write into the storage.
- **The search over the text of the conversations.** The epic does not do it.

## Contract

The operator turns to the service as a signed-in person of the receiver: by the cookie of the
entry, the same one the admin application works by.

| Operation                                | What it does                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| GET /api/chat/conversations              | a page of the conversations of the sites of the operator, filtered by the site and by the state |
| GET /api/chat/conversations/:id/messages | a page of the messages of one conversation, oldest first                                        |
| POST /api/chat/conversations/:id/state   | changes the state of the conversation: live or closed                                           |

The mandatory fields:

| Operation                 | What is obliged to be in the request                                            |
| ------------------------- | ------------------------------------------------------------------------------- |
| the list of conversations | nothing; the page, the site and the state come as the parameters of the address |
| the messages of one       | the identifier of the conversation in the address; the page as the parameters   |
| the change of the state   | the identifier of the conversation in the address and the state in the body     |

### Refusal codes

Not applicable in the sense of codes of its own kind: the service answers with a code of the answer
of HTTP, and the named code in the body comes from the vocabulary shared with the intake —
`signInRequired`, `chatConversationNotFound`, `chatStateUnknown`. Where the reading is obliged to
refuse instead of staying silent:

| What happened                                         | Code  | What it says                                                           |
| ----------------------------------------------------- | ----- | ---------------------------------------------------------------------- |
| there is no entry in the request                      | `401` | that the operation demands an entry                                    |
| the signed-in person is not an operator of the chat   | `404` | that there is no such conversation                                     |
| the conversation belongs to a site that is not theirs | `404` | that there is no such conversation; the two reasons are not told apart |
| the state in the body is not from the set             | `400` | that the value is not one of the two words                             |
| the page asked for is not readable                    | `400` | which parameter of the page is wrong                                   |

## Data

| Entity                   | What it holds                                                                    |
| ------------------------ | -------------------------------------------------------------------------------- |
| The operator             | The space, the account of the receiver it answers by, the minute of the creation |
| The site of the operator | The pair "operator and site": what they answer for                               |
| The conversation         | Gains the state: live or closed                                                  |

## Screens and states

Not applicable: this work has no screen. The panel of the operator is the task RT-2181 and
describes its states itself.

## Cross-cutting requirements

### Locales

The answers carry no text for a person: the panel words the refusal by the code. The language of
the talk is the language of the visitor and is not judged.

### SEO

Not applicable: the reading is closed by the entry.

### Mobile layout

Not applicable: this work has no screen.

### Several objects

Several spaces, several sites and several operators: every reading goes from the set of the sites
of the one who asks, and a request naming a foreign site gives an empty page.

## Decisions

- **The entry of the operator is the entry of a person into the receiver.** Rejected: a door of its
  own for the chat — the epic did not promise it, and it costs a work of its own; the owner is told
  this in words.
- **A foreign site gives an empty page, not a refusal.** Rejected: `403` — it answers the question
  "does such a site exist" to whoever has no right to ask it.
- **A remark into a closed conversation opens it again.** Rejected: leaving it closed — the person
  came back, and their message would lie where nobody looks.

## Open questions

- Whether the operator sees the conversations of a site they were removed from. Today they do not;
  what happens to a talk they were in the middle of is decided by the panel, RT-2181.

## History of changes

- 2026-09-20 — written before the code by the task RT-2179 of the epic RT-2177.
