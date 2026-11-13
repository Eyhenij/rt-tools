# The translation of a chat reply

**Status:** in force · **Revision:** 2026-11-12 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The subdomain names how a reply of the chat shows that it is translated and how a person asks for
the translation back.

## Why

An application translates the replies of a thread into the language of the reader. The reader has
to see which reply is translated and which is shown as written. After a look at the original the
reader needs a way back to the translation.

## Terminology

| Term                    | What it is                                                             |
| ----------------------- | ---------------------------------------------------------------------- |
| The translation caption | a short text of the application that stands before the time of a reply |
| The translation button  | the button under the text of a reply that is shown as written          |

### What it is called in the interface

| In the spec             | On the screen                                                       |
| ----------------------- | ------------------------------------------------------------------- |
| The translation caption | «Translated», «Original», «Not translated» — the application's text |
| The translation button  | «Show translation»                                                  |

## Rules

- **The translation caption stands in the time line of a reply, before the time.** The caption and the time read as one line, with a middle dot between them.
- **A reply without a translation caption keeps its time line as it was.** The field is optional, and a thread that knows nothing of translation does not change.
- **The translation button stands under the text of a reply the application marked.** The kit does not decide which reply is shown as written.
- **A press on the translation button reports the reply and changes nothing in the thread.** The text of the reply belongs to the application.
- **On the filled bubble of one's own reply the translation button takes the colour of the text on the fill and is underlined.** The action colour is the fill itself there.
- **While the translation loads, the translation button shows a spinner and takes no press.** The application sets the flag, and a second press would ask for the same translation twice.
- **A failed translation shows the error text of the application as a line above the translation button.** The button stays and asks for the translation again.
- **A reply without an error and without loading shows neither the error line nor the spinner.** The error line holds no place while it is empty.

## What is out of scope

- **The translation itself.** The kit holds neither languages nor texts of a translation.
- **The menu item «Show original».** The application puts it into the menu of a reply by the slot `rtChatMessageActions`.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                              | What is visible                                  |
| ---------------------------------- | ------------------------------------------------ |
| A translated reply                 | the caption and the time in one line             |
| A reply shown as written           | the caption, the time and the translation button |
| The translation loads              | a spinner before the muted translation button    |
| The translation failed             | the error line above the translation button      |
| A reply of one's own sent as it is | the caption of the application and the time      |
| A reply without a caption          | as before                                        |

## Cross-cutting requirements

### Locales

The text of the button comes from the label `rtKit.chatShowTranslation`. The caption is the
application's text.

### SEO

Not applicable.

### Mobile layout

The same as on a wide screen.

### Several objects

Not applicable.

## Decisions

- **The caption is a field of its own, not a part of `dateLabel`.** The argument: the time keeps the format of the kit, and the application gives only the word. The price: one more field of a reply.
- **The button is a flag of a reply and an output of the chat, not a template slot.** The argument: every application needs the same button in the same place. The price: the text of the button is a label of the kit.

## Open questions

- None.

## History of changes

- 2026-11-12 — created by the task RT-3179.
- 2026-11-12 — the loading and the error of a translation added by the owner's remark on the showcase.
