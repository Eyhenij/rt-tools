# The undelivered status of a chat reply

**Status:** in force · **Revision:** 2026-10-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The subdomain names how a reply of one's own shows that it was written down but the outside service
of the other side did not take it.

## Why

A reply goes to the person through an outside service — a messenger, a mail. The application writes
the reply down first and passes it on after. When the service refuses it, the reply exists and the
person did not get it. The status `failed` does not fit: it carries a retry button, and a retry would
write the reply down a second time.

## Terminology

| Term                 | What it is                                                                              |
| -------------------- | --------------------------------------------------------------------------------------- |
| An undelivered reply | a reply of one's own written down by the application and refused by the outside service |
| The caption          | the visible line under the text of the reply that names the status                      |

### What it is called in the interface

| In the spec          | On the screen                                              |
| -------------------- | ---------------------------------------------------------- |
| An undelivered reply | the reply with a warning icon and the line «Не доставлено» |

## Rules

- **The status `undelivered` is a value of the reply status next to `sending`, `sent`, `read` and `failed`.** A reply carries one status, and a flag beside it could contradict it.
- **An undelivered reply draws a warning icon and a visible caption under its text.** The other statuses are icons with a text for a screen reader only; this one is read by the eye too, because the person has to act on it outside the chat.
- **An undelivered reply has no retry button.** A retry would write the reply down a second time.
- **The caption is a label of the kit, and the application overrides it like the other status labels.**

## What is out of scope

- **Why the service refused.** That is the application's data.
- **What the person does next.** The kit offers no action on an undelivered reply.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: the status is a value of the reply model, nothing is stored.

## Screens and states

| State                | What is visible                                                      |
| -------------------- | -------------------------------------------------------------------- |
| An undelivered reply | the date, the warning icon and the caption under the text; no button |
| A failed reply       | as before: the warning icon and the retry button                     |

## Cross-cutting requirements

### Locales

The caption comes from the label `rtKit.chatStatusUndelivered`; the kit ships the English text, the
application gives its own.

### SEO

Not applicable.

### Mobile layout

The caption stays on the line of the date and wraps inside the bubble on a narrow screen.

### Several objects

Not applicable.

## Decisions

- **A value of the status, not a flag of the reply.** The argument: the request named it a value
  next to the four, and one field keeps one truth. The price: every place that walks the status
  values gets one more.

## Open questions

- None.

## History of changes

- 2026-10-23 — created by the work about the undelivered status of a chat reply, task RT-2938.
