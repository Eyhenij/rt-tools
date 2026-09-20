# The chat with the visitors

**Status:** proposed · **Revision:** 2026-09-20 · **Scenario prefix:** `SC-CH`
**Depends on:** `message-bus` (the node, the storage and the pipeline of the rollout are shared)
**Laws:** `verifiability`, `code-structure`, `lib-imports`, `entity-models`, `observability`
**Procedures:** none — the operations are declared by the controllers of the chat

The agreement of the epic RT-2177. It is written before the code and describes the service whole;
what the first work carries out is named in "What is out of scope" — the rest arrives by the
following tasks of the epic and is added to this text by them.

## Why

A visitor of a public site writes into the chat and gets an answer from the admin application.
Several applications need this, and there will be more of them. Written anew in every application,
the chat diverges: somewhere the attachments get lost, somewhere there are no unread ones, and the
operator keeps as many panels open as they have applications.

Hence a service of its own for all the applications: its own storage, its own operators, a key per
site. The visitor writes without an entry, the operator answers in one panel where the
conversations of every site they answer for lie. The widget is put in by one script with the key of
the site and demands neither a framework nor a database from the application.

The service lives on the node of the intake by a word of the owner: the node is paid for, the
pipeline of the rollout and the taking of the dumps are the same ones — the expenses on the
infrastructure do not grow.

## Terminology

| Term                              | What it is                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| The space                         | The owner of the chat: the sites and the operators of one client of the service. Everything of the chat lies inside a space |
| The site                          | The place where the widget stands. It belongs to one space and has a key of its own                                         |
| The key of the site               | The open sign by which the widget names the site. It lies in the script of the page and is not a secret                     |
| The list of the allowed addresses | The addresses of the pages from which the operations of this site are called. What is not in the list is refused            |
| The visitor                       | The one who writes from the site without an entry. They are recognised by a sign the service issues                         |
| The sign of the visitor           | The secret the service gives out at the first turning to it; the widget keeps it and passes it along                        |
| The conversation                  | The talk of one visitor on one site. A visitor has one live conversation per site                                           |
| The message                       | One remark: from the visitor or from the operator. It carries the text and the minute of the taking in                      |
| The operator                      | A person of the space who answers in the panel. Their entry and the panel are the following tasks of the epic               |

### What it is called in the interface

The screens of this service — the panel of the operator and the widget of the visitor — arrive by
the following tasks of the epic, and the words on them are named there. This text has no screen of
its own.

## Rules

**The space, the site and the key.**

- **Everything of the chat lies inside a space, and no operation crosses its boundary.** A site, a
  visitor, a conversation and a message belong to one space; without that a client of the service
  would see the conversations of a neighbour by the first mistake in an address.
- **The key of the site names the site and gives no rights besides taking in a remark.** It lies
  open in the page of the site, so by it one can neither read the conversations of others nor
  answer them.
- **The operations of the widget are called from the addresses of the list of the site.** The
  address of the page comes in the request, and one that is not in the list is refused: an open key
  copied to a foreign page otherwise writes into a foreign conversation.
- **An empty list of the addresses refuses everything.** A site whose list is not filled in is not
  yet put anywhere, and "empty means any" would open it to the whole network at the minute of
  creating.

**The visitor and their conversation.**

- **The visitor is recognised by a sign the service issues, not by what the page passes.** The sign
  arrives in the answer to the creation of the conversation and comes back in every following
  request; an identifier invented by the page would let one read a foreign conversation by a guess.
- **A visitor has one live conversation per site.** The second creation with the same sign gives
  back the conversation that exists: otherwise a reload of the page would tear the talk into pieces
  the operator sees as different people.
- **A remark is taken into the conversation of its visitor only.** The sign of the visitor and the
  conversation are checked together: their divergence is refused as a not-found conversation, and
  the two reasons are not told apart in the answer.
- **The order of the messages is set by the minute of the taking in by the service.** The clock of
  the sender is not asked for: a wrong clock of one page would mix the talk for everyone reading it.

**The limits of what is taken in.**

- **The stream from one visitor is held by a limit of the frequency.** Without it one page opened
  fills the storage of the service and the panel of the operator with nobody pressing anything.
- **The text of a message has a limit of the length, and an empty text is refused.** The limit is
  named by the service and stands in the answer of the refusal: the widget has no way to guess it.
- **The service keeps what it promised and nothing besides.** There are no attachments, no address
  of mail and no name of the visitor in this agreement: what is not described is not taken in even
  when the request carries it.

**The storage.**

- **The removal of a site takes its conversations away with it.** They belong to it and mean
  nothing without it; left behind, they lie in the storage as the talk of nobody.
- **The tables of the chat stand apart from the tables of the intake.** One storage, different
  entities: the accounts, the rights and the cargo of the intake are not touched by the chat at
  all, and the epic promised the owner exactly that.

## What is out of scope

- **The reading of the conversations by the operator, the stream of the events, the panel, the
  widget, the notifications and the rollout** — the tasks RT-2179 … RT-2184 of the same epic. This
  text is added to by them.
- **The entry of the operator and the rights inside the space.** The first work takes in the
  remarks of the visitor; there is nobody to answer them yet.
- **The search over the text of the conversations, the calls, the video and the answering bots** —
  the epic does not do them.
- **The rights and the accounts of the intake.** The chat has its own operators and its own space.

## Contract

The visitor turns to the service without an entry. Two operations, both by the key of the site; the
address of the page comes in the header `Origin`, as the browser sends it.

| Operation                    | What it does                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| POST /api/chat/conversations | creates the conversation of the visitor on the site by the key, or gives back the live one, and issues the sign of the visitor |
| POST /api/chat/messages      | takes in a remark of the visitor into their conversation                                                                       |

The mandatory fields:

| Operation                      | What is obliged to be in the request                                           |
| ------------------------------ | ------------------------------------------------------------------------------ |
| the creation of a conversation | the key of the site; the sign of the visitor — when the widget already has one |
| the taking in of a remark      | the sign of the visitor, the identifier of the conversation, the text          |

### Refusal codes

The service answers with a code of the answer of HTTP, without named codes of the domain.

| What happened                                    | Code  | What it says                                                         |
| ------------------------------------------------ | ----- | -------------------------------------------------------------------- |
| the key of the site is not named                 | `400` | that the key is mandatory                                            |
| the key is not found or the site is switched off | `401` | that the key is not accepted; which of the two is not named          |
| the address of the page is not in the list       | `403` | that the site does not accept the calls from this address            |
| the sign of the visitor did not match            | `404` | that there is no such conversation; the divergence is not told apart |
| the text is empty or longer than the limit       | `400` | the limit of the length and that the text is obliged to be non-empty |
| the remarks come more often than the limit       | `429` | the limit of the frequency and after how long it may be repeated     |

## Data

| Entity           | What it holds                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| The space        | The name; the minute of the creation                                                                    |
| The site         | The space, the readable name, the key, the list of the allowed addresses, the sign of being switched on |
| The visitor      | The site, the sign the service issued, the minute of the first turning                                  |
| The conversation | The site, the visitor, the minute of the creation and of the last message                               |
| The message      | The conversation, who wrote it — the visitor or the operator — the text, the minute of the taking in    |

The key of the site and the sign of the visitor are kept as they are given out: the key is open by
its purpose, and the sign of the visitor opens one conversation of one site and nothing besides.

## Screens and states

Not applicable: this work has no screen. The widget of the visitor and the panel of the operator
arrive by the tasks RT-2181 and RT-2182 and describe their states themselves.

## Cross-cutting requirements

### Locales

The answers of the service carry no text for a person: the widget and the panel word the refusal
themselves, by the code. The language of the talk is the language of the visitor and is not judged.

### SEO

Not applicable: the widget is drawn after the page is loaded, and the talk is closed.

### Mobile layout

Not applicable: this work has no screen. The widget is drawn on a phone as well, and that is
described by the task RT-2182.

### Several objects

There are many spaces and many sites, and each visitor reaches their own conversation alone: the
site is taken from the key, the visitor from their sign, and the conversation is checked against
both. A request that names a conversation of a foreign site is refused as a not-found one.

### The refusals and the limits

- **Every refusal of the service names the reason by the code of the answer, not by the text
  alone.** The widget stands in a foreign page and reads the code, not the words.
- **The operations of the visitor are not counted in the observations of the rules layer.** That
  cargo is about the sessions of the executors, and the visitors of a site have nothing to do
  with it.
- **The limit of the frequency and the limit of the length are named by the service in one place.**
  Two copies of a number diverge silently, and the widget takes them from the answer of the refusal.

## Decisions

- **The service stands as an application of its own on the node of the intake, not as a section of
  the intake.** The word of the owner: the expenses on the infrastructure are held as low as
  possible; the node is paid for and the pipeline is the same. Rejected: a separate node — it costs
  money every month for what one node carries.
- **The storage is shared with the intake, and the tables are separate.** One database on the node
  means one dump and one address; separate tables mean the cargo and the accounts of the intake are
  not touched.
- **The visitor is not asked for a name or mail.** The first remark must cost the visitor one
  press; whoever needs the mail asks for it in the talk.

## Open questions

- Whether the operator sees the address of the page the visitor writes from. It is useful in the
  talk and is a sign of the person by the letter of the law of the country of the client; decided
  by the task of the panel, RT-2181.
- How long the conversations are kept. The storage of the node is not infinite, and nobody has
  named a term yet.

## History of changes

- 2026-09-20 — written before the code by the task RT-2178, the first of the epic RT-2177.
