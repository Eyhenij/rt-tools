# The rollout of the chat

**Status:** proposed · **Revision:** 2026-09-21 · **Scenario prefix:** `SC-CH`
**Depends on:** `chat` (the operations of the visitor), `chat/widget` (what stands on a foreign page), `message-bus` (the node, the images and the pipeline)
**Laws:** `delivery`, `access`, `verifiability`
**Procedures:** none — this work declares no operation; it takes what exists to the node

The agreement of the task RT-2184 of the epic RT-2177: how the chat reaches the node and how a page
of a foreign application starts talking to it. It merges into the spec of the domain by the last
commits of the work.

## Why

The chat lives on the machine of whoever writes it. A site that wants it has nowhere to take the
widget from, and the visitors of that site write nowhere. Everything the epic built is bought by
this one step.

The node is the same one the intake lives on — that is the word of the owner: the expenses on the
infrastructure are held as low as they go, and the node, the pipeline and the dumps are already
paid for.

## Terminology

| Term                   | What it is                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| The node               | The rented machine the intake lives on. The chat lives inside it, not beside it             |
| The road               | The image with the proxy: it holds the name, the certificate, the static of the admin panel |
| The file of the widget | One built file the page of a consumer takes by a tag of a script                            |
| The name of the chat   | The subdomain the widget and the operations of the visitor are called by                    |
| The permission to call | What the browser of a foreign page asks the service for before it lets the call through     |
| The asking beforehand  | The request the browser sends before a call it has not been permitted yet                   |

### What it is called in the interface

Not applicable: this work has no screen. The words of the widget are named by the subdomain of the
widget, the words of the panel by the subdomain of the panel.

## Rules

**Where the chat lives.**

- **The chat lives inside the receiver, and no second application is started on the node.** Its
  operations are declared by the controllers of the same application, and its section by the same
  admin panel: a second process would cost memory on a node that has 961 MB of it.
- **The file of the widget rides in the image of the road, not in the image of the receiver.** It is
  taken by the browser of a foreign page, and it is given out by the same proxy that gives out the
  admin panel.
- **The name of the chat points at the same node and the same proxy.** The certificate for it is
  issued by the proxy itself, as for the name of the intake: a second way of issuing would go stale
  apart from the first.

**What lets a foreign page in.**

- **The browser of a foreign page asks the service for permission, and the service answers by the
  list of the addresses of the site.** The list already guards the operations of the visitor, and a
  second list for the same thing would diverge from the first silently.
- **An address that is not in the list gets no permission.** It gets no refusal of its own either:
  the service answers without the permission, and the browser stops the call itself — the page
  learns exactly as much as it does about a site it was never put in.
- **The asking beforehand is answered by the same list as the call itself.** A browser that was
  permitted beforehand and refused afterwards looks to the page like a broken service.
- **The permission is given by the receiver, not by the proxy.** The list of addresses lies on the
  record of the site, and the proxy knows nothing of sites: a permission given by it would be given
  to everyone at once.
- **The file of the widget is given to any page.** It is a script, not an operation: whoever took it
  still gets nothing without the key of a site and its list of addresses.

**What the rollout is made of.**

- **The chat is rolled out by the same step of the pipeline as the receiver.** Two images travel to
  the node, and both already carry it: a step of its own would mean a second rollout of the same
  thing.
- **The dumps carry the tables of the chat from the first migration.** The dump takes the storage
  whole and has no selection at all; what is checked is that the sums by the tables match, and the
  chat needs nothing of its own here.
- **The description of the start next to the receiver names the chat.** Whoever raises the node
  reads it, and a service not named there is a service nobody knows how to raise.

## What is out of scope

- **A second node and moving the receiver.** The epic promised the owner the opposite: the same
  node, the same pipeline, the same dumps.
- **A separate application of the chat.** It lives inside the receiver, and a second process would
  cost the memory of the node.
- **The screen for editing the settings of a site.** Neither the greeting, nor the hours of answer,
  nor the address of the call outward has one, and this work does not start it.
- **The name of the receiving side of a consumer.** The application of a site takes the calls
  outward at its own address, and the service knows nothing of how it is arranged.

## Contract

This work declares no operation. It changes what the answers of the existing ones carry when the
call comes from a foreign page.

| What is answered                                               | To whom                                                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| the permission to call with the address of the page            | a page whose address stands in the list of the site                     |
| an answer without the permission                               | a page whose address is not in the list, and the browser stops the call |
| the permission to ask beforehand, with the methods and headers | the same pages, by the same list                                        |

### Refusal codes

Not applicable in the sense of codes of its own kind: the codes of the refusals of the chat are
named by the spec of the domain, and this work adds none. A page without the permission gets no
refusal at all — the browser does not let its call through, and the service never learns of it.

## Data

Nothing of its own. The list of the addresses of a site is the one that already lies on its record.

## Screens and states

Not applicable: this work has no screen.

## Cross-cutting requirements

### Locales

Nothing for a person travels in the answers of this work.

### SEO

Not applicable: the file of the widget is taken by a script of a page and adds nothing to what is
indexed.

### Mobile layout

Not applicable: this work has no screen.

### Several objects

Every site has a list of addresses of its own, and the permission is given by the list of that site
whose key the call names. A page of one site gets no permission by the list of another.

### The refusals and the limits

- **The permission does not widen what the key of a site gives.** Whoever got it can still only take
  in a remark of a visitor and read their own conversation.
- **The file of the widget is given out without the permission of anybody.** It is a script, and a
  script of a page is taken by the browser without asking.

## Decisions

- **The chat is rolled out inside the receiver.** The word of the owner: the expenses are held as
  low as they go. Rejected: an application of its own — a second process on a node with 961 MB of
  memory, its own image and its own step of the pipeline.
- **The permission is given by the receiver, by the list of the site.** Rejected: giving it by the
  proxy — it knows nothing of sites, and its permission would be one for all of them.
- **The file of the widget is given out by the road.** Rejected: giving it out by the receiver — a
  file that never changes between the rollouts would travel through the application that answers
  the operations.

## Open questions

- Whether the file of the widget is given out with a version in its name. Today it is one file at
  one address, and a page that took it gets the new one on the next rollout; nobody has asked for
  the old one to stay.
- Whether the name of the chat is separated from the name of the intake at all. They point at one
  node and one proxy, and a visitor sees neither.

## History of changes

- 2026-09-21 — written before the code by the task RT-2184 of the epic RT-2177.
