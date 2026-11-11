# A ready text in the reply field of a correspondence

**Status:** in force · **Revision:** 2026-11-07 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names how a consumer puts a ready text into the reply field of a correspondence.

## Why

A consumer that offers ready answers has no way to put one into the reply field: the field lives
inside the component and is closed from outside. The person then copies the text by hand or
retypes it.

## Terminology

| Term           | What it is                                                   |
| -------------- | ------------------------------------------------------------ |
| The draft      | the text in the reply field that is not sent yet             |
| A closed field | no reply is allowed, or the thread loads, refreshes or sends |

### What it is called in the interface

The method has no words on the screen: the person sees the text appear in the field.

## Rules

- **The method replaces the draft whole.** What stood in the field is gone, and the new text stands
  in its place.
- **The cursor stands in the field after the last character.** The person goes on typing right away.
- **The method works in all three reply fields.** They are the classic field, the rich composer
  and the messenger field.
- **The chosen files stay.** The method touches the text only.
- **A closed field takes nothing.** The method does nothing there, and the draft stays as it was.
- **The method is not typing.** The correspondence sends no typing signal for it.
- **A label stands in place of the time.** Day labels still count from `createdAt`.
- **An icon stands in place of the status icon, at its size.** The icons of a failed and of an
  undelivered message stay: they warn of an error.
- **The bar stands above the frame of every reply field.** An empty bar takes no place, and there is
  no bar without a field.
- **The draft is read as plain text in all reply fields.** Files stay out of it, and with no field
  the answer is an empty string.
- **The chosen files of the draft are read by a method of their own.** The text stays as it is, and
  with no field or no file the answer is an empty list.

## What is out of scope

- Where the ready text comes from: the consumer decides what to offer and how.
- Sending the text: the person sends it the usual way.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the
server.

### Refusal codes

Not applicable.

## Data

Not applicable: the method writes into the reply field, nothing is stored.

## Screens and states

| State               | What is visible                                                |
| ------------------- | -------------------------------------------------------------- |
| The field is open   | the new text in the field, the cursor after the last character |
| The field is closed | the field as before                                            |

The story `QuickReplies` of the correspondence page shows the method on a whole screen.

## Cross-cutting requirements

### Locales

The text arrives from the consumer: the kit does not translate it.

### SEO

Not applicable.

### Mobile layout

Not applicable: the method does not change the look of the field.

### Several objects

Not applicable.

## Decisions

- **The method works in the messenger field too.** The argument: without the third field the method
  would silently do nothing in the messenger view. The price: one more branch in the component.
- **A closed field is read from the state that closes the field for typing.** The argument: loading
  and refreshing close the field the same way sending does. The price: none, the state exists.

## Open questions

- None.

## History of changes

- 2026-11-06 — created by the work about the method `setDraft`.
- 2026-11-07 — the task RT-3159 adds the method `draftFiles`.

## Scenarios

The scenarios are in `scenarios.md`, what carries the rules out is in `implementation.md`.
