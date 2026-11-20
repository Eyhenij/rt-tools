# The look handles of the assistant chat

**Status:** proposed · **Revision:** 2026-11-20 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat, the prompt input, the markdown text, the conversation list,
the suggestion card and the icon button of the second kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A product agreement written before the code by task RT-3344. It merges into the second kit's spec
as a subdomain of its own next to `ai-chat`, with the scenario numbers unchanged.

## Why

An application fits the look of `rt-ai-chat` to its own by overriding internal classes of the kit:
the feed font, the primary colour, the header, the suggestion cards, the author label, the
backgrounds and the row menu of a conversation. Every layout edit of the kit breaks those
overrides without warning. The chat gets public handles `--rt-ai-chat-*` and one input for these
places, so the application sets its look on the chat root and never names an internal class.

## Terminology

| Term          | What it is                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------ |
| a handle      | a public custom property `--rt-<block>-<what>` the kit reads in place of a fixed value           |
| the chat root | the host `rt-ai-chat`; the application sets the chat handles on it by a rule of its own          |
| a part        | a kit component the chat draws inside itself: the prompt input, the markdown text, the list      |
| a pass-down   | a declaration of the chat that sets a part's own handle from a chat handle                       |
| the row actions | the overlay at the end of a conversation row that holds its menu button or its delete button   |

Terms of the chat — the feed, the question, the answer, the rating, the header — are declared by
`docs/specs/ui-kit-v2/ai-chat/` and are not declared again here.

### What it is called in the interface

A person sees the same chat; the handles are invisible to them. The author label is the muted line
«You» above the text of a question.

## Rules

### The card items

| Card item                              | Set by                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1. the feed font, answer and question size | `--rt-ai-chat-font-family`, `--rt-ai-chat-question-font-size`, `--rt-ai-chat-answer-font-size`         |
| 2. the primary colour                  | `--rt-ai-chat-send-bg`, `--rt-ai-chat-send-bg-hover`, `--rt-ai-chat-focus-border-color`, `--rt-ai-chat-focus-shadow`, `--rt-ai-chat-rating-active-bg`, `--rt-ai-chat-rating-active-color` |
| 3. the header height and divider       | `--rt-ai-chat-header-min-height`, `--rt-ai-chat-header-border-width`, `--rt-ai-chat-header-border-color` |
| 4. the search width                    | nothing new: the search already fills the head of the list, with no cap                                   |
| 5. the suggestion cards                | `--rt-ai-chat-suggestion-width`, `--rt-ai-chat-suggestion-radius`                                         |
| 6. the author label                    | the input `questionAuthor`                                                                                 |
| 7. the panel and prompt backgrounds    | `--rt-ai-chat-bg`, `--rt-ai-chat-prompt-bg`                                                               |
| 8. the row menu button                 | `--rt-ai-chat-thread-actions-bg`, `--rt-ai-chat-thread-actions-bg-active`, `--rt-ai-chat-thread-action-radius` |

### The handles and their defaults

| Handle                                 | Default                                   | What it sets                                     |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `--rt-ai-chat-font-family`             | not declared                              | the family of the question and of the answer     |
| `--rt-ai-chat-question-font-size`      | `var(--rt-text-sm)`                       | the size of the question text                    |
| `--rt-ai-chat-answer-font-size`        | `var(--rt-text-xs)`                       | the size of the answer text                      |
| `--rt-ai-chat-send-bg`                 | `var(--rt-color-action-primary)`          | the fill of Send and Stop                        |
| `--rt-ai-chat-send-bg-hover`           | `var(--rt-color-action-primary-hover)`    | the hover fill of Send and Stop                  |
| `--rt-ai-chat-focus-border-color`      | `var(--rt-input-color-border-focus)`      | the border of the prompt box in focus            |
| `--rt-ai-chat-focus-shadow`            | `var(--rt-input-focus-shadow)`            | the focus ring of the prompt box                 |
| `--rt-ai-chat-rating-active-bg`        | `var(--rt-icon-button-color-bg-hover)`    | the fill of the chosen rating button             |
| `--rt-ai-chat-rating-active-color`     | `var(--rt-color-text-primary)`            | the icon colour of the chosen rating button      |
| `--rt-ai-chat-header-min-height`       | `auto`                                    | the least height of the header                   |
| `--rt-ai-chat-header-border-width`     | `0`                                       | the divider under the header                     |
| `--rt-ai-chat-header-border-color`     | `var(--rt-color-border-default)`          | the colour of that divider                       |
| `--rt-ai-chat-suggestion-width`        | `100%`                                    | the width of a suggestion card                   |
| `--rt-ai-chat-suggestion-radius`       | `var(--rt-radius-lg)`                     | the rounding of a suggestion card                |
| `--rt-ai-chat-bg`                      | `var(--rt-color-bg-surface)`              | the panel background                             |
| `--rt-ai-chat-prompt-bg`               | `var(--rt-color-bg-surface)`              | the prompt box background                        |
| `--rt-ai-chat-thread-actions-bg`       | `var(--rt-color-bg-subtle)`               | the row actions background                       |
| `--rt-ai-chat-thread-actions-bg-active` | `var(--rt-color-state-info-bg)`          | the row actions background on the active row     |
| `--rt-ai-chat-thread-action-radius`    | `var(--rt-radius-md)`                     | the rounding of a row action button              |

The parts get handles of their own, with the same defaults:

| Part                 | Handle                                    | Default                                |
| -------------------- | ----------------------------------------- | -------------------------------------- |
| `rt-markdown-text`   | `--rt-markdown-text-font-family`          | `var(--rt-font-family-sans)`           |
| `rt-markdown-text`   | `--rt-markdown-text-font-size`            | `var(--rt-text-xs)`                    |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-bg`                 | `var(--rt-color-bg-surface)`           |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-send-bg`            | `var(--rt-color-action-primary)`       |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-send-bg-hover`      | `var(--rt-color-action-primary-hover)` |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-focus-border-color` | `var(--rt-input-color-border-focus)`   |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-focus-shadow`       | `var(--rt-input-focus-shadow)`         |
| `rt-thread-list`     | `--rt-thread-list-row-actions-bg`         | `var(--rt-color-bg-subtle)`            |
| `rt-thread-list`     | `--rt-thread-list-row-actions-bg-active`  | `var(--rt-color-state-info-bg)`        |
| `rt-thread-list`     | `--rt-thread-list-row-action-radius`      | `var(--rt-radius-md)`                  |

### Font

- **The question text takes its size from `--rt-ai-chat-question-font-size`.**
- **The answer text takes its size from `--rt-ai-chat-answer-font-size`, which the chat passes down to the markdown text.**
- **The markdown text takes its family and size from `--rt-markdown-text-font-family` and `--rt-markdown-text-font-size`.**
- **A set `--rt-ai-chat-font-family` gives its family to the question and to the answer; unset, the question inherits the page family and the answer keeps the kit sans family.**

### Primary colour

- **Send and Stop take their fill and hover fill from `--rt-ai-chat-send-bg` and `--rt-ai-chat-send-bg-hover`.**
- **The prompt box in focus takes its border colour and ring from `--rt-ai-chat-focus-border-color` and `--rt-ai-chat-focus-shadow`.**
- **The prompt input reads its box background, its Send and Stop fills and its focus border and ring from its own `--rt-ai-prompt-input-*` handles.**
- **A chosen rating button takes its fill and icon colour from `--rt-ai-chat-rating-active-bg` and `--rt-ai-chat-rating-active-color`.**

### Header

- **The header draws a divider under it, `--rt-ai-chat-header-border-width` wide in `--rt-ai-chat-header-border-color`, and the default width 0 draws none.**
- **The header is never lower than `--rt-ai-chat-header-min-height`, and its content stays centred across a taller header.**

### Suggestion cards

- **A suggestion card on the start screen is `--rt-ai-chat-suggestion-width` wide and stands at the start of the column when narrower than it.**
- **A suggestion card takes its rounding from `--rt-ai-chat-suggestion-radius`.**

### Author label

- **The chat input `questionAuthor` draws the author label in the question bubble; it defaults to `true`, and `false` leaves the label node out of the page.**

### Backgrounds

- **The chat panel takes its background from `--rt-ai-chat-bg` and the prompt box from `--rt-ai-chat-prompt-bg`, each set apart from the other.**

### Row menu

- **The row actions take their background from `--rt-ai-chat-thread-actions-bg`, and on the active row from `--rt-ai-chat-thread-actions-bg-active`.**
- **A button of the row actions takes its rounding from `--rt-ai-chat-thread-action-radius`.**
- **The conversation list reads the row actions backgrounds and the action rounding from its own `--rt-thread-list-*` handles.**
- **While the row actions are shown, the time of that row is not drawn under them.**

### All of them

- **A chat handle set on the chat root reaches its part, though the part declares a handle of its own.**
- **Without the new handles the chat draws as before.**
- **Without the input `questionAuthor` the question bubble draws as before.**
- **The kit README names the type sizes, the header height and the suggestion width of the chat as an exception to the line that keeps type size and dimensions on scale steps.**
- **The chat overview lists every new chat handle and the input `questionAuthor`, and the overview of each part lists its new handles.**

## What is out of scope

- Handles for parts the card does not name: the prompt field text, the header title, the bubble
  of a question, the blocks of an answer other than its text.
- A theme preset of the chat.
- The search width of the conversation list: done by the tree already.
- The colour and the size of the menu button icon of a row.

## Contract

Not applicable: the surface is handles and an input of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing. The input `questionAuthor` is a `boolean` read from
the template, with the boolean attribute transform the other flag inputs of the chat have.

## Screens and states

| State                                | What is visible                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| the default cell                     | the chat with no handle set and `questionAuthor` on, as today                |
| the font cell                        | the question and the answer in another family and sizes                      |
| the primary colour cell              | Send in another fill, the prompt box in focus with another ring, a chosen like in another fill and colour |
| the header cell                      | a taller header with a divider under it                                      |
| the suggestion cell                  | the start screen with narrower cards of another rounding                     |
| the author cell                      | a question bubble without «You»                                              |
| the background cell                  | the panel and the prompt box in two different backgrounds                    |
| the row menu cell                    | a row with its actions shown: no background, a square button in place of the time |

The cells stand in one story of the chat family, **Properties**; each item cell changes only the
handles of its own card item.

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words; `questionAuthor` hides the existing kit label «You».

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The handles act the same at every width. On a coarse pointer the row actions are always shown, so
the time of a row with a menu is never drawn under them.

### Several objects

Every chat holds its own handles and its own `questionAuthor`; two chats on one page differ by the
rules the application sets on each root.

## Decisions

- **Item 4 is already done by the tree**: the search of the conversation list fills its head up to
  the filter button and has no 400px cap. No handle is added for it.
- **The handles live on the component that draws the part, and the chat passes its own down.**
  An application that uses a part alone sets the part's handle; inside the chat it sets the chat
  handle, and the pass-down wins over a part handle set inside the chat.
- **The author label is hidden by an input, not by a handle**: a handle hides a node from the eye
  only, and a screen reader would still read «You».
- **The input is named `questionAuthor`**, a noun naming the drawn part, as `threadMenu` is;
  `copyable` and `closable` name an ability, and the label has none.
- **The font family has no declared default**: today the question inherits the page family and the
  answer sets the kit sans family, and one declared value would change one of them.
- **The primary colour is six handles, not one**: the three places use three different values
  today, and one value would change two of them.
- **The row time is hidden under the shown row actions**, not left to the background: with the
  background set to none the time would read through the button.
- **The README exception is named by this task**, as the scroll area and the action bar have
  handles for paddings and font size: the sizes here are the ones the application overrides today.

## Open questions

- `Q-1` — today a row time wider than the row actions shows its start to the left of their
  background; hiding the time under the shown actions removes that start. The work goes with the
  assumption that this changes no reference snapshot, since snapshots are taken with the actions
  hidden; a snapshot that shows them is named to the owner before the code is accepted.

## History of changes

- 2026-11-20 — the agreement was written from the task card by task RT-3344.
