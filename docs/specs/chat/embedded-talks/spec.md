# The embedded page of the talks

**Status:** proposed · **Revision:** 2026-09-23 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the conversation, the message and the key of the site), `chat/operator-reading` (the reading of the lists and the answer), `chat/event-stream` (the stream)
**Laws:** `access`, `reuse-first`, `lists`, `verifiability`
**Procedures:** none — the operations are declared by the controllers of the chat

A subdomain of the chat: the page the consumer application embeds into its own admin so that its
people see the talks of their visitors. The panel of the operator is described by the subdomain next
to this text; here — the page for a foreign admin and the entry into it.

## Why

The talks are seen by the operator of the service alone, in their panel. The people of the consumer
work in their own admin and will not leave it for a foreign panel for the sake of one section, while
a store of talks of their own is exactly what the service took away from them.

The entry of the operator does not fit them: the reading is closed by the session of the intake, and
the people of the consumer have no account there and will not have one — the chat keeps its own
space and its own operators.

## Terminology

| Term                   | What it is                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| The embedded page      | The section of the talks drawn inside the admin of the consumer                                 |
| The secret of the site | The value the consumer keeps on its server; the service holds its own copy beside the site      |
| The signature          | The sign the consumer makes over the key of the site and the minute with the secret of the site |
| The sign of the page   | What the service gives out in exchange for a signature; the operations are called under it      |

### What it is called in the interface

The section is named «Переписки» inside the admin of the consumer. The refusal of the entry is said
by the words «Страница переписок не открылась», the expiry of the sign — «Вход устарел, обновите
страницу».

## Rules

**Who the page is open to.**

- **The consumer decides who to let in, and the service checks only the signature.** The people of
  the consumer are known to the consumer alone: accounts of them in the service would mean a second
  entry and a second password for one person, and a store of people the service is not asked for.
- **The signature is made on the server of the consumer, never in the page.** The secret of the site
  put into a page is read by whoever opens that page.
- **The signature carries the minute and lives by it.** A signature without a minute, once taken from
  the answer of a server, opens the talks for as long as the secret lives.
- **The sign of the page is given for a time and is asked for anew.** The page whose sign expired
  says so and takes a new one by the same road, without the person typing anything.
- **The sign of the page opens one site.** The talks of a neighbouring site of the same space are
  answered as of a foreign one — the consumer sees its own visitors and nobody else's.

**What the page shows.**

- **The page shows the same as the panel of the operator, for one site.** The list of the talks, the
  feed of one talk, the answer and the closing of a talk. The screens are drawn by the ready-made
  pieces of the kit — the list and the chat — the same ones the panel is drawn by.
- **The page carries no choice of a site.** The site is named by the key it was embedded with.

**The answer.**

- **An answer from the embedded page is a remark of the operator.** For the visitor it is
  indistinguishable from an answer out of the panel: one talk, one thread.

## What is out of scope

- **The store of the people of the consumer and their rights.** The consumer answers for them.
- **The search over the text, the calls, the video and the answering bots** — the chat has none.
- **The settings of the site and the issuing of its key** — the text of the domain speaks of them.

## Contract

| The operation                 | What it takes                             | What it answers                     |
| ----------------------------- | ----------------------------------------- | ----------------------------------- |
| The exchange of the signature | the key of the site, the minute, the sign | the sign of the page and its expiry |
| The page of the talks         | the sign of the page, the state, the page | the page of the rows                |
| The messages of one talk      | the sign of the page, the talk            | the page of the messages            |
| The answer                    | the sign of the page, the talk, the text  | the message                         |
| The closing of a talk         | the sign of the page, the talk            | the row of the list                 |

### Refusal codes

Not applicable in the sense of codes of its own kind: the answers carry the codes of the vocabulary
shared with the taking in of a remark, and the page words them by the code.

| What happened                            | What the code says                                       |
| ---------------------------------------- | -------------------------------------------------------- |
| No signature, or it does not add up      | the entry is refused, without saying which part failed   |
| The minute is outside the allowed spread | the entry is refused by the age of the signature         |
| The key of the site is unknown           | the entry is refused, and nothing is said about the site |
| The sign of the page has expired         | the operation is refused, and a new sign is asked for    |
| The talk belongs to a foreign site       | not found                                                |

## Data

The subdomain stores nothing of its own. The sign of the page lives as long as it is given for and
is kept by the page in the memory of the tab, not in the store of the browser: a tab closed is an
entry ended.

## Screens and states

| The state             | What the person sees                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| The entry is going on | the place of the list with the sign of waiting                                |
| The entry is refused  | «Страница переписок не открылась» and the reason in the words of the consumer |
| There are no talks    | the empty state of the list of the kit                                        |
| The talks are there   | the list, the feed of the chosen talk, the box of the answer                  |
| The sign expired      | «Вход устарел, обновите страницу», the list stays on the screen               |

## Cross-cutting requirements

The page is drawn by the pieces of the kit, not by its own markup: the uniformity check reads this.
The addresses the operations are called from are taken by the list of the allowed addresses of the
site, the same one the widget is checked by.

### Locales

The labels of the page stand as keys of the kit vocabulary, in every one of its sets: the consumer
chooses the language of its own admin, and a label of one set alone leaves the others with a machine
word on the screen. The text of the talk itself is not translated — it is written by the people
talking.

### SEO

Not applicable: the page stands inside the admin of the consumer, behind its entry, and is not
indexed.

### Mobile layout

The list and the feed stand one above the other on a narrow screen, as they do in the panel of the
operator; the box of the answer stays at the bottom of the feed. The width is taken from the place
the consumer embedded the page into, not from the width of the window.

### Several objects

One page serves one site: the key it was embedded with names it. A consumer with several sites
embeds the page as many times, and the pages know nothing of one another.

## Decisions

- **The entry goes by the signature of the consumer, not by the accounts of the service.** Two paths
  were weighed and left: the operators of the chat given out to the consumer — a person then keeps a
  second entry and a second password; one token of the site in the settings of the consumer — a leak
  opens every talk of the site and there is nothing to withdraw it by but a change.
- **The sign of the page is short-lived and taken anew without the person.** Otherwise the page
  either asks a person about what they do not know, or holds an entry that outlives the workday.

## Open questions

- `Q-CH-1` — whether the consumer is given the count of the unread for its own menu, and by which
  operation.

## History of changes

- 2026-09-23 — the text is written before the code, by the first task of the epic RT-2309.
