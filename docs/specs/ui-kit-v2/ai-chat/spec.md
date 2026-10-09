# The assistant chat

**Status:** in force · **Revision:** 2026-10-09 · **Scenario prefix:** `SC-UKV`
**Depends on:** the run status, the value with a copy button, the prompt suggestion, the message composer, the thread list and the markdown text of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-ai-chat`: the panel of an AI assistant that an application
connects as one component and feeds with ready state.

## Why

An application that talks to a model draws the panel itself today: the header, the feed of
questions and answers, the run line, the rating, the error with a reference number, the list of
conversations. Every application repeats the same screen, and every copy drifts from the kit.

## Terminology

- **The question** — a message the person sent.
- **The answer** — a message of the assistant: the run line, the text, the attachments, the rating.
- **The run** — the progress of one answer: running, done, stopped, failed, with optional steps.
- **The attachments** — what the application draws under the answer text: a chart, a table.
- **The conversation** — a thread of questions and answers the person can return to.
- **The run error** — the answer broke off: the message, the reference number, whether to ask again.

### What it is called in the interface

| In the domain        | On the screen                                           |
| -------------------- | ------------------------------------------------------- |
| The question         | the bubble on the right with «You»                      |
| The answer           | the text on the left with the run line above it         |
| The rating           | the buttons «Good answer» and «Bad answer»              |
| Copying a message    | the button «Copy», «Copied» after the press             |
| The conversations    | the button and the page «Conversations»                 |
| A new conversation   | the button «New conversation»                           |
| The reference number | «Reference» with the id on a plate and «Copy reference» |
| Ask again            | the button «Ask again» under the error                  |
| The suggestions      | the cards with ready questions on the empty screen      |

## Rules

- **An empty conversation shows the greeting and the suggestion cards, and a pressed card sends its text.**

- **A question stands on the right in a bubble with «You», an answer on the left as markdown text.**

- **The run line stands above the answer text, and its steps open for one answer at a time.**

- **The rating appears once the answer text is written, and pressing the chosen rating again removes it.**

- **A written answer has «Copy» first in its rating row, and the press puts the answer text as the reader sees it, without markdown signs, into the clipboard and shows «Copied» for two seconds.**

- **A question has «Copy» in a row under its bubble at the bubble's side, it copies the question text, and the consumer can turn both copy buttons off.**

- **While an answer is written, the composer offers Stop, and the suggestions and «New conversation» are off.**

- **A run error shows the message, the reference number with a copy button, and «Ask again» only when the answer can be asked again.**

- **The feed follows the last answer while the person stays at the bottom, and stops when they scroll up.**

- **In a narrow panel the conversations open in place of the feed, on full screen they stand as a column on the left, and choosing one returns to the feed.**

- **The search over conversations marks every match, and an empty result says «Nothing found» instead of «No conversations yet».**

- **Deleting a conversation is an action of its row and does not open the conversation.**

- **Focus follows the person: the open list of conversations puts it on «Back to conversation», and choosing a conversation, a new conversation, Stop and the return to the feed put it into the composer.**

- **The empty list of conversations draws preview rows with the assistant's marks, and the consumer sets its own icons.**

- **The attachments of an answer come from the consumer's template, which receives the message.**

- **The title, the placeholder, the empty-screen texts and the line under the composer come from the consumer, and the kit's English text stands in when one is not given.**

## What is out of scope

- The protocol of the model: the panel gets ready state, it does not read a stream of events.
- Asking for confirmation before deleting a conversation: the panel reports the request, the
  application decides.
- Charts: the panel does not know what the attachments are.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own. The messages, the conversations and the error come in through inputs; the actions
leave through outputs.

## Screens and states

| state         | what is drawn                                              |
| ------------- | ---------------------------------------------------------- |
| empty         | the greeting, the suggestion cards, the composer           |
| loading       | a spinner until the first message arrives                  |
| thinking      | the question, the running run line, the composer with Stop |
| writing       | the answer text growing under the running run line         |
| answered      | the text, the done run line, «Copy» and the rating         |
| run error     | the error message, the reference number, «Ask again»       |
| conversations | the search and the list in place of the feed               |
| full screen   | the conversations as a column, the feed beside them        |

## Cross-cutting requirements

### Locales

Every text the kit draws is a kit label, English in the package and translated by the consumer's
translator. The texts of the messages, the conversations and the error come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The panel takes the width and the height it is given; the full-screen column needs a wide screen,
and the consumer decides when to offer it.

### Several objects

Not applicable.

## Decisions

- **The organism lives in the rich-editor entry.** It holds the message composer, which pulls the
  rich editor library; the main entry does not import it.
- **The attachments come as a template.** The kit draws the answer text; charts and other
  attachments are the application's, and the kit does not know them.
- **The protocol stays in the application.** The kit gets a list of messages with a run state, not
  events of a model.
- **Deleting is a row action of the thread list.** A nested button inside the row button is not
  allowed, and it would take the click that opens the conversation.

## Open questions

None.

## History of changes

- 2026-10-08 — written by the task RT-2654 of the epic RT-2649, which brings the assistant chat
  into the kit.
- 2026-10-09 — the task RT-2714: the preview rows of the empty list of conversations take their
  icons from an input, the assistant's marks by default.
- 2026-10-09 — the task RT-2720: «Copy» under a question and first in the rating row of an answer;
  the answer is copied as plain text, without markdown signs.
