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
places, so the application sets its look on the chat element and never names an internal class.

## Terminology

| Term            | What it is                                                                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a handle        | a public custom property `--rt-<block>-<what>` the kit reads in place of a fixed value                                                                                                                                              |
| a chat handle   | a handle `--rt-ai-chat-*`, declared with its default on the chat element and so taken from it only, not from an ancestor. `--rt-ai-chat-font-family` and the two rating handles are the exception: consumer handles with no default |
| a part          | a kit component the chat draws inside itself: the prompt input, the markdown text, the list, the answer                                                                                                                             |
| a part handle   | a handle a part declares on its own block with today's value and reads with no fallback in place                                                                                                                                    |
| a pass-down     | a declaration in a rule of the chat on the block of a part inside it that sets a part handle from a chat handle                                                                                                                     |
| the row actions | the overlay at the end of a conversation row that holds its menu button or its delete button                                                                                                                                        |
| the row time    | the time of a conversation row of the chat; the unread badge next to it is not part of it                                                                                                                                           |

Terms of the chat — the feed, the question, the answer, the rating, the header, the thread column —
are declared by `docs/specs/ui-kit-v2/ai-chat/` and are not declared again here.

### What it is called in the interface

A person sees the same chat; the handles are invisible to them. The author label is the muted line
«You» above the text of a question.

## Rules

### The card items

| Card item                                  | Set by                                                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. the feed font, answer and question size | `--rt-ai-chat-font-family`, `--rt-ai-chat-question-font-size`, `--rt-ai-chat-answer-font-size`                                                                                                         |
| 2. the primary colour                      | `--rt-ai-chat-send-bg`, `--rt-ai-chat-send-bg-hover`, `--rt-ai-chat-focus-border-color`, `--rt-ai-chat-focus-shadow`, `--rt-ai-chat-rating-active-bg`, `--rt-ai-chat-rating-active-color`              |
| 3. the header height and divider           | `--rt-ai-chat-header-height`, `--rt-ai-chat-header-border-width`, `--rt-ai-chat-header-border-color`                                                                                                   |
| 4. the search width                        | nothing new: the search already fills the head of the list, with no cap                                                                                                                                |
| 5. the suggestion cards                    | `--rt-ai-chat-suggestion-width`, `--rt-ai-chat-suggestion-radius`                                                                                                                                      |
| 6. the author label                        | the input `questionAuthor`                                                                                                                                                                             |
| 7. the panel and prompt backgrounds        | `--rt-ai-chat-bg`, `--rt-ai-chat-prompt-bg`                                                                                                                                                            |
| 8. the row menu button                     | `--rt-ai-chat-thread-actions-bg`, `--rt-ai-chat-thread-actions-bg-active`, `--rt-ai-chat-thread-action-radius`, `--rt-ai-chat-thread-actions-padding-inline`, `--rt-ai-chat-thread-time-under-actions` |

### The chat handles and their defaults

| Handle                                       | Default                                | What it sets                                      |
| -------------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `--rt-ai-chat-font-family`                   | not declared                           | the family of the question and the answer text    |
| `--rt-ai-chat-question-font-size`            | `var(--rt-text-sm)`                    | the size of the question text                     |
| `--rt-ai-chat-answer-font-size`              | `var(--rt-text-xs)`                    | the size of the answer text                       |
| `--rt-ai-chat-send-bg`                       | `var(--rt-color-action-primary)`       | the fill of Send and Stop                         |
| `--rt-ai-chat-send-bg-hover`                 | `var(--rt-color-action-primary-hover)` | the hover fill of Send and Stop                   |
| `--rt-ai-chat-focus-border-color`            | `var(--rt-input-color-border-focus)`   | the border of the prompt box in focus             |
| `--rt-ai-chat-focus-shadow`                  | `var(--rt-input-focus-shadow)`         | the focus ring of the prompt box                  |
| `--rt-ai-chat-rating-active-bg`              | not declared                           | the fill of the chosen rating button              |
| `--rt-ai-chat-rating-active-color`           | not declared                           | the icon colour of the chosen rating button       |
| `--rt-ai-chat-header-height`                 | `auto`                                 | the full height of the header and the column head |
| `--rt-ai-chat-header-border-width`           | `0`                                    | the divider under the header and the column head  |
| `--rt-ai-chat-header-border-color`           | `var(--rt-color-border-default)`       | the colour of that divider                        |
| `--rt-ai-chat-suggestion-width`              | `100%`                                 | the width of a suggestion card                    |
| `--rt-ai-chat-suggestion-radius`             | `var(--rt-radius-lg)`                  | the rounding of a suggestion card                 |
| `--rt-ai-chat-bg`                            | `var(--rt-color-bg-surface)`           | the panel background                              |
| `--rt-ai-chat-prompt-bg`                     | `var(--rt-color-bg-surface)`           | the prompt box background                         |
| `--rt-ai-chat-thread-actions-bg`             | `var(--rt-color-bg-subtle)`            | the row actions background                        |
| `--rt-ai-chat-thread-actions-bg-active`      | `var(--rt-color-state-info-bg)`        | the row actions background on the active row      |
| `--rt-ai-chat-thread-action-radius`          | `var(--rt-radius-md)`                  | the rounding of a row action button               |
| `--rt-ai-chat-thread-actions-padding-inline` | `var(--rt-space-2) var(--rt-space-4)`  | the inline padding of the row actions             |
| `--rt-ai-chat-thread-time-under-actions`     | `visible`                              | the row time while the row actions are shown      |

### The part handles and their defaults

| Part                 | Handle                                        | Declared on the part block             |
| -------------------- | --------------------------------------------- | -------------------------------------- |
| `rt-markdown-text`   | `--rt-markdown-text-font-family`              | `var(--rt-font-family-sans)`           |
| `rt-markdown-text`   | `--rt-markdown-text-font-size`                | `var(--rt-text-xs)`                    |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-bg`                     | `var(--rt-color-bg-surface)`           |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-send-bg`                | `var(--rt-color-action-primary)`       |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-send-bg-hover`          | `var(--rt-color-action-primary-hover)` |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-focus-border-color`     | `var(--rt-input-color-border-focus)`   |
| `rt-ai-prompt-input` | `--rt-ai-prompt-input-focus-shadow`           | `var(--rt-input-focus-shadow)`         |
| `rt-thread-list`     | `--rt-thread-list-row-actions-bg`             | `var(--rt-color-bg-subtle)`            |
| `rt-thread-list`     | `--rt-thread-list-row-actions-bg-active`      | `var(--rt-color-state-info-bg)`        |
| `rt-thread-list`     | `--rt-thread-list-row-action-radius`          | `var(--rt-radius-md)`                  |
| `rt-thread-list`     | `--rt-thread-list-row-actions-padding-inline` | `var(--rt-space-2) var(--rt-space-4)`  |
| `rt-thread-list`     | `--rt-thread-list-under-actions-visibility`   | `visible`                              |

The suggestion card keeps its existing radius handle as it is, declared on its template root. The
chat sets that handle on the same node inside its suggestions, so the card itself does not change.

The answer of the chat reads `--rt-ai-chat-rating-active-bg` and `--rt-ai-chat-rating-active-color`
with the fallback in place as well. The fallbacks are the fill and the colour the icon button takes
itself, at rest and under the pointer, so a value the application sets on the button reaches the
chosen rating as before.

### The cascade

- **The chat declares every chat handle except the font family and the two rating handles on its own element, with the default above.**
- **Each part declares its part handles on its own block with today's value and reads them with no fallback in place.**
- **The chat sets every part handle by a rule on the block of the part inside it, from the matching chat handle.**

### Font

- **The question text takes its size from `--rt-ai-chat-question-font-size`.**
- **The answer text takes its size from `--rt-ai-chat-answer-font-size` through `--rt-markdown-text-font-size`.**
- **The markdown text takes its family and size from `--rt-markdown-text-font-family` and `--rt-markdown-text-font-size`.**
- **A set `--rt-ai-chat-font-family` gives its family to the whole feed, the answer text and its blocks included; unset, the feed inherits the page family and the answer text keeps the kit sans family.**
- **The headings of an answer keep their own sizes, and its code keeps the mono family and its own size, whatever the chat font handles are.**

### Primary colour

- **Send and Stop take their resting fill from `--rt-ai-prompt-input-send-bg` and their hover fill from `--rt-ai-prompt-input-send-bg-hover`, and no other button of the prompt input does.**
- **An `--rt-icon-button-bg` or `--rt-icon-button-bg-hover` set by an ancestor still beats the Send and Stop fills, as today.**
- **A disabled Send draws a share of its resting fill, as a disabled primary icon button does.**
- **The prompt box takes its background from `--rt-ai-prompt-input-bg`, and in focus its border colour and ring from `--rt-ai-prompt-input-focus-border-color` and `--rt-ai-prompt-input-focus-shadow`.**
- **A disabled prompt box keeps its disabled background whatever `--rt-ai-prompt-input-bg` is.**
- **A chosen rating button takes its fill and icon colour from `--rt-ai-chat-rating-active-bg` and `--rt-ai-chat-rating-active-color`, and keeps them under the pointer.**

### Header

- **The header is `--rt-ai-chat-header-height` high in full, its padding and divider included.**
- **The header draws a divider under it, `--rt-ai-chat-header-border-width` wide in `--rt-ai-chat-header-border-color`, and the default width 0 draws none.**
- **The head of the thread column takes the same height and divider as the header, so the two tops stand on one line.**
- **The content of the header and of the column head stays centred across a taller head.**

### Suggestion cards

- **A suggestion card on the start screen is `--rt-ai-chat-suggestion-width` wide and is never wider than its column.**
- **A suggestion card narrower than its column stands at the start of it.**
- **A suggestion card takes its rounding from `--rt-ai-chat-suggestion-radius`.**

### Author label

- **The chat input `questionAuthor` draws the author label in the question bubble; it defaults to `true`, and `false` leaves the label node out of the page.**

### Backgrounds

- **The chat panel takes its background from `--rt-ai-chat-bg` and the prompt box from `--rt-ai-chat-prompt-bg`, each set apart from the other.**

### Row actions

- **The row actions take their background from `--rt-thread-list-row-actions-bg`, and on the active row from `--rt-thread-list-row-actions-bg-active`.**
- **The row actions take their inline padding from `--rt-thread-list-row-actions-padding-inline`.**
- **A button of the row actions, the menu button and the delete button alike, takes its rounding from `--rt-thread-list-row-action-radius`, unless the button sets its own by its `radius` input.**
- **While the row actions of a row are shown, an element of that row marked `rtThreadListUnderActions` takes its visibility from `--rt-thread-list-under-actions-visibility` and keeps its place.**
- **The chat marks its row time `rtThreadListUnderActions` and sets the visibility from `--rt-ai-chat-thread-time-under-actions`.**

### Search

- **The search of the conversation list inside the chat fills the head of the list up to the filter button, with no width cap.**

### All of them

- **Without the new handles the chat draws as before.**
- **Without the input `questionAuthor` the question bubble draws as before.**
- **The showcase sets the handles as an application does: a rule on the `rt-ai-chat` element, with no selector of an internal class of the chat or its parts.**
- **The kit README names the type sizes, the header height and the suggestion width of the chat as an exception to the line that keeps type size and dimensions on scale steps.**
- **The chat overview lists every new chat handle and the input `questionAuthor`, and the overview of each part lists its new part handles.**

## What is out of scope

- Handles for parts the card does not name: the prompt field text, the header title, the bubble
  of a question, the blocks of an answer other than its markdown text.
- The icon colour of Send and Stop.
- A theme preset of the chat.
- A width handle for the search of the conversation list.

## Contract

Not applicable: the surface is handles and an input of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing. The input `questionAuthor` is a `boolean` read from
the template, with the boolean attribute transform the other flag inputs of the chat have.

## Screens and states

Three stories of the chat family, each setting its handles by a rule on the `rt-ai-chat` element.

| Story                        | Cell            | What is visible                                                                                                                         |
| ---------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Properties**               | default         | the chat with no handle set and `questionAuthor` on, as today                                                                           |
| **Properties**               | font            | the question and the answer in another family and sizes; headings and code as before                                                    |
| **Properties**               | header          | a header and a thread column head of one taller height, with a divider under both                                                       |
| **Properties**               | suggestions     | the start screen with narrower cards of another rounding, and a narrow chat where the cards take the column width                       |
| **Properties**               | author          | a question bubble without «You»                                                                                                         |
| **Properties**               | backgrounds     | the panel and the prompt box in two different backgrounds                                                                               |
| **Properties · focus**       | focus and hover | the prompt box in focus with another ring, Send under the pointer in another fill, a chosen like in another fill and colour             |
| **Properties · row actions** | menu            | rows with `threadMenu` on and the actions shown: another background and padding, a square menu button, the row time hidden in its place |
| **Properties · row actions** | delete          | rows with `threadMenu` off and the actions shown: the delete button with the same rounding and background                               |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words; `questionAuthor` hides the existing kit label «You».

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The handles act the same at every width. On a coarse pointer the row actions are always shown, so
an application that sets `--rt-ai-chat-thread-time-under-actions` to `hidden` hides the row time of
every row with actions on a touch screen.

### Several objects

Every chat holds its own handles and its own `questionAuthor`; two chats on one page differ by the
rules the application sets on each chat element.

## Decisions

- **Item 4 is already done by the tree**: the search of the conversation list fills its head up to
  the filter button and has no 400px cap. No handle is added for it; a scenario holds it.
- **Each part declares its handles on its own block, and the chat sets them by a rule on the block
  of the part inside it.** This is the technique the kit README gives an application for any block
  property. The tokens graph check forbids a fallback in place at a name the kit declares, so the
  first version, where parts read with a fallback and the chat declared their handles, did not pass
  it. The chat rule is stronger than the part declaration, and an application rule outside the kit
  layer on the part block wins over both.
- **The font family and the two rating handles are consumer handles**, listed with the others in
  the theming page: the kit declares none of them, and the fallback in place works until the
  application sets one. The showcase stories set them as an application does, and the tokens graph
  check does not count a story declaration as the kit's.
- **The chat handles are declared on the chat element, as the existing eight are**: the default
  stands where the application overrides it, and a value set on an ancestor does not leak in.
  The font family is the exception: it has no default, so a family set on an ancestor reaches it.
  So are the two rating handles: a declared default would stand between the chosen rating and the
  fill and colour the application sets on the icon button.
- **The author label is hidden by an input, not by a handle**: a handle hides a node from the eye
  only, and a screen reader would still read «You».
- **The input is named `questionAuthor`**, a noun naming the drawn part, as `threadMenu` is;
  `copyable` and `closable` name an ability, and the label has none.
- **The font family has no declared default**: today the question inherits the page family and the
  answer sets the kit sans family, and one declared value would change one of them.
- **The font family reaches the whole feed, not the question and answer text alone**: the card asks
  for the font of the feed, and a family on two text nodes left the author label, the time, the
  answer status and the answer blocks in another family. The headings and the code of an answer
  keep their own type.
- **The hiding under the actions takes the time only**: the card asks for the menu button in the
  place of the time, and the unread badge hidden with it vanished for good on a touch screen,
  where the actions are always shown. The time hidden on request leaves the accessible name of the
  row too; the application that sets `hidden` chooses that.
- **The rating handles are not declared on the chat**: a declared default replaced the fill and the
  colour the application sets on the icon button.
- **The primary colour is six handles, not one**: the three places use three different values
  today, and one value would change two of them.
- **Send and Stop take the colour through the variant fill of the icon button**, so a public
  `--rt-icon-button-bg` set by an ancestor wins as before, and a button the application puts into
  the end slot of the prompt input does not take it.
- **The header height is the full height**, padding and divider included: the application measures
  the head it aligns with as a whole.
- **The row time under the actions is an opt-in, not a default change**: today the actions
  background covers the time, and the visibility handle stays `visible` until the application sets
  `hidden`. The mark belongs to the conversation list, since it knows when the actions are shown;
  the chat only marks its own row time.
- **The README exception is named by this task**: the sizes here are the ones the application
  overrides today.

## Open questions

None.

## History of changes

- 2026-11-20 — the agreement was written from the task card by task RT-3344.
- 2026-11-20 — revised: parts read handles with the fallback in place, the header height became
  the full height, the row time under the actions became an opt-in, three showcase stories.
- 2026-11-21 — after review round one: each part declares its handles on its block and the chat
  sets them by a rule on that block; the font family and the rating handles are consumer handles; the font family reaches the whole feed, the hiding under the
  actions takes the time only and the handle is renamed `--rt-ai-chat-thread-time-under-actions`,
  the rating handles have no default on the chat, the button radius in the row actions yields to
  the button `radius` input.
