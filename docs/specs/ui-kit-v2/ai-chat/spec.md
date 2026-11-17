# The assistant chat

**Status:** in force · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** the run status, the value with a copy button, the prompt suggestion, the AI prompt input with the usage ring, the thread list and the markdown text of the kit
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
- **The answer** — a message of the assistant: the run line, the blocks, the attachments, the rating.
- **The block** — one part of an answer: markdown text, a notice, or a part of another type the
  consumer draws with a renderer of its own.
- **The renderer** — a component the consumer registers for a block type the kit does not draw.
- **The run** — the progress of one answer: running, done, stopped, failed, with optional steps.
- **The attachments** — what the application draws under the answer blocks: a chart, a table.
- **The conversation** — a thread of questions and answers the person can return to.
- **The run error** — the answer broke off: the message, the reference number, whether to ask again.

### What it is called in the interface

| In the domain              | On the screen                                           |
| -------------------------- | ------------------------------------------------------- |
| The question               | the bubble on the right with «You»                      |
| The answer                 | the blocks on the left with the run line above them     |
| A block without a renderer | a dashed plate «The “chart” block is not supported»     |
| The rating                 | the buttons «Good answer» and «Bad answer»              |
| Copying a message          | the button «Copy», «Copied» after the press             |
| The conversations          | the button and the page «Conversations»                 |
| A new conversation         | the button «New conversation»                           |
| The reference number       | «Reference» with the id on a plate and «Copy reference» |
| Ask again                  | the button «Ask again» under the error                  |
| The suggestions            | the cards with ready questions on the empty screen      |
| The conversation menu      | the button «More actions» with «Copy ID» and «Delete»   |

## Rules

- **An empty conversation shows the greeting and the suggestion cards, and a pressed card sends its text.**

- **A question stands on the right in a bubble with «You», an answer on the left as its blocks.**

- **The blocks of an answer stand in their order: a markdown block as text, a notice as `rt-message` of its severity.**

- **A block of a type the kit does not draw is drawn by the renderer the consumer registered for that type.**

- **A block with no renderer shows a plate with its type name, and the blocks around it stay in place.**

- **A markdown block without text and a notice without a severity `rt-message` knows are shown as the plate too, and a renderer registered for `markdown` or `notice` is not taken.**

- **A screen reader announces a notice in an answer politely, as a status, not as an alert.**

- **The run line stands above the answer blocks, and its steps open for one answer at a time.**

- **The rating appears once the answer has a block and is no longer written, and pressing the chosen rating again removes it.**

- **A written answer has «Copy» first in its rating row, and the press copies the visible text of its blocks without markdown signs or unknown blocks and shows «Copied» for two seconds.**

- **A block drawn by a renderer goes into the copy by the text function registered with it; without one it stays out.**

- **A written answer whose blocks give no text shows no «Copy», and its rating stays.**

- **A question has «Copy» in a row under its bubble at the bubble's side, it copies the question text, and the consumer can turn both copy buttons off.**

- **The header icons draw the material drawings when the consumer asks, and the rest of the panel keeps its look.**

- **While an answer is written, the composer offers Stop, and the suggestions and «New conversation» are off.**

- **A run error shows the message, the reference number with a copy button, and «Ask again» only when the answer can be asked again.**

- **The feed follows the last answer while the person stays at the bottom, and stops when they scroll up.**

- **In a narrow panel the conversations open in place of the feed, on full screen they stand as a column on the left, and choosing one returns to the feed.**

- **The consumer can cap the width of the feed and the composer; they then stand as a column in the middle of the conversation, and the feed scrolls at the conversation's edge.**

- **The search over conversations marks every match, and an empty result says «Nothing found» instead of «No conversations yet».**

- **Deleting a conversation is an action of its row and does not open the conversation.**

- **The consumer can put «More actions» in the row in place of the delete button: its menu holds «Copy ID», which puts the conversation id into the clipboard, and «Delete», which reports the delete request without asking for confirmation; neither opens the conversation.**

- **Focus follows the person: the open list of conversations puts it on «Back to conversation», and choosing a conversation, a new conversation, Stop and the return to the feed put it into the composer.**

- **The empty list of conversations draws preview rows with the assistant's marks, and the consumer sets its own icons.**

- **The attachments of an answer come from the consumer's template, which receives the message.**

- **A bare `http://` or `https://` address in an answer becomes a link, and the punctuation after it stays text.**

- **An underscore inside a word stays a sign: only an underscore at a word's edge marks emphasis.**

- **The feed is no wider than the panel: a long word and an address in an answer wrap.**

- **A swipe that reaches the edge of the feed or of the list of conversations stays in the chat.**

- **On a touch screen the row actions of a conversation are always visible; with a mouse they appear on hover, focus and an open menu.**

- **The hover tint of a conversation row exists only where a pointer hovers; on a touch screen a tapped row keeps its resting background.**

- **The selected conversation row keeps its own background under the pointer too.**

- **On a narrow place the shadow of the channel sign in a messenger row blurs by 10 and fits the row inset; wider it is the sign's own.**

- **The composer of the assistant is one box: the text on top, the row of actions inside at the bottom with «+» on the left and the model, the effort, the mode, the usage ring and Send on the right; every item of the row is drawn only when the consumer gives it.**

- **The usage ring shows the spent share of the limit, turns orange from eighty percent and shows the consumer's hint with the share and the reset date on hover and focus.**

- **The line «AI can make mistakes» stands as its own line under the composer or above it, and never inside the row of actions; an empty line removes it.**

- **Enter sends the question and empties the composer, Shift + Enter wraps the line, and an empty or blank field sends nothing.**

- **While an answer that can be stopped is written, Stop stands in place of Send and the field stays open; without it sending closes the field.**

- **The chat passes the model, the effort, the mode and the usage to its composer, and puts the line under the composer above it when the consumer asks.**

- **The title, the placeholder, the empty-screen texts and the line under the composer come from the consumer, and the kit's English text stands in when one is not given.**

## What is out of scope

- The protocol of the model: the panel gets ready state, it does not read a stream of events.
- Asking for confirmation before deleting a conversation: the panel reports the request, the
  application decides.
- Drawing a chart, a table and other heavy blocks inside the rich-editor entry: their renderers are
  registered by the consumer, so a heavy dependency stays out of the entry.

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
| writing       | the answer blocks growing under the running run line       |
| answered      | the blocks, the done run line, «Copy» and the rating       |
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
- **The attachments come as a template.** The kit draws the answer blocks; what stands under them
  is the application's, and the kit does not know it. A part of the answer itself goes as a block
  with a registered renderer, not through this template.
- **Heavy blocks are drawn by registered renderers, not by a switch inside the kit.** A chart
  imported by the rich-editor entry would make its library a dependency of every consumer of the
  editor. The type of a block is an open union: the kit knows `markdown` and `notice`, the rest
  arrive by the renderer token.
- **All renderers are registered at one level, usually the root of the application.** Angular does
  not join a multi provider list across injectors: a registration in a route or a component hides
  those of the root in its subtree. Merging the levels is left until a consumer needs it.
- **A block without a renderer is shown, not skipped.** A skipped block hides a forgotten
  registration from the developer; the plate names the type.
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
- 2026-10-09 — the task RT-2722: the header icons by the material drawings without the material preset.
- 2026-10-09 — the task RT-2729: the conversation menu «More actions» with «Copy ID» and «Delete» in
  place of the delete button.
- 2026-10-28 — the task RT-2961 of the epic RT-2958: a bare address in an answer becomes a link, an
  underscore inside a word stays a sign.
- 2026-10-28 — the task RT-2959 of the epic RT-2958: a long word and an address in an answer wrap.
- 2026-10-28 — the task RT-2960 of the epic RT-2958: a swipe at the edge of the feed and of the list of conversations stays in the chat.
- 2026-10-28 — the task RT-2962 of the epic RT-2958: the row actions of a conversation are visible on a touch screen.
- 2026-10-28 — the task RT-2964 of the epic RT-2958: the composer of the assistant with the row of actions and the usage ring.
- 2026-11-15 — the task RT-3348: on a phone the row sign shadow is narrower and a tap leaves no hover tint.
- 2026-11-15 — the task RT-3334 of the epic RT-3346: the answer is a list of blocks — markdown and notice drawn by the kit, other types by registered renderers, a plate for a type without one.
- 2026-11-17 — the task RT-3334 after review: a renderer gives the copy text of its block, an answer without text shows no «Copy», a notice of an unknown severity is a plate.
- 2026-11-17 — the task RT-3361 of the epic RT-3346: a notice in an answer is announced as a status, not as an alert.
