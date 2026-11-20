# The sources block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-20 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the outputs of the chat, the answer
copy), the expansion panel of the kit (the collapsible header and body), the link block of the chat
(the output with the message id, the icon name check), the section of a composed answer (where a
block stands)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The `sources` block of an answer of `rt-ai-chat`: a collapsed list titled «Sources» with the count
of sources, and the output of the chat that carries a press on a source. It is written by task
RT-3340 and stands as a subdomain of its own next to `ai-chat-link`. The mockup is not drawn yet.

## Why

The assistant writes numbers into an answer, and the reader does not see where they came from: which
report, which page, which period and which filters. The kit gets a `sources` block: a list under the
answer, collapsed by default, with the title of each source, a detail line and an icon of the kind
of source. The kit does not open a source: a press leaves the chat as an event, and the application
opens it.

## Terminology

- **The sources block** — a block of an answer with the type `sources`: one list of sources.
- **A source** — one element of `items`: a title, an optional detail, an optional icon, an optional
  address.
- **The detail** — the text under the title that narrows the source: a page, a period, filters.
- **The address** — the `url` of a source, which the application opens; the kit trims it and passes
  it on without reading it.
- **A pressable source** — a source that has an address.
- **The source open event** — what the chat emits on a press of a source: the message, the address
  and the title.

### What it is called in the interface

| In the domain   | On the screen                                                      |
| --------------- | ------------------------------------------------------------------ |
| The header      | a line «Sources» with the count of sources and an arrow at the end |
| The list        | the rows under the header, shown after the header is opened        |
| A source        | a row: the icon, the title, the detail under it                    |
| A pressable row | the same row as a button                                           |

## Rules

### The block and its data

- **`sources` is a type the kit draws itself, next to `markdown`, `notice`, `table`, `kpi` and `link`; an application gets it without registering anything, and a renderer registered for `sources` is not taken.**

- **A sources block has `items`, a list; a source has `title` and the optional `detail`, `icon` and `url`.**

- **A source whose `title` is not a string, or is empty after trimming, is dropped; a block whose `items` is not a list, or holds no source after the dropping, is shown as the plate with its type name.** The plate is the one a KPI block without a card gets.

- **The title, the detail and the address are trimmed; the list draws, the event carries and the copy writes the trimmed text.** A `detail` or a `url` that is not a string, or is empty after trimming, is absent.

- **An `icon` that is not a non-empty string, or a name the kit icon set does not hold, is the kit icon `file`; the name is compared as given, without trimming or a change of case.** The model writes the name, so the block checks it against the kit set and never asks for a drawing by a foreign name.

- **The count in the header is the count of sources left after the dropping.**

- **The kit exports the JSON schema of the sources block (JSON Schema 2020-12), so that an application gives it to the model as the parameters of a tool.** It requires `items` and `title` of each source, a title with a visible character, and names the optional `detail`, `icon` and `url`. It is one of the schemas the section schema holds as its own, next to the schema of the link block.

- **A block the schema accepts is drawn with every source in it.** The block is more lenient than the schema: what the schema refuses is still drawn by the rules above.

### The list

- **The list is built on `rt-expansion-panel`: the header is its header, the list is its body.** The kit adds no second copy of the technique.

- **The list is collapsed at the first draw.** A long list does not push the start of the answer out of view.

- **A press, Enter or Space on the header expands a collapsed list and collapses an expanded one.** The header is the button of the panel, so the keyboard needs nothing of its own.

- **The kit keeps the opened or closed state in the panel and gives it to nobody.** It belongs to the position of the block in its answer: a redraw that keeps the position keeps the state, also when `items` grows during a stream. A new message id starts collapsed.

- **Equal sources are not merged: the count and the rows follow `items` as left after the dropping.** The expanded list is as long as the sources are; the kit sets no limit and no scroll.

- **The header holds the label «Sources» and the count of sources.**

### The sources

- **A source with an address is drawn as a button; a source without one is drawn as plain text and is not pressable.** A press on a plain source does nothing and emits nothing.

- **A press on a pressable source makes `rt-ai-chat` emit `sourceOpen` with the message id, the address and the title.** The event travels block → blocks → answer → chat, as `linkOpen` does, and the chat adds the message id. The press is an ordinary click; Enter and Space on the focused button give it.

- **The chat emits `sourceOpen` synchronously, inside the press handler.** An application may open a new tab from it, and a browser allows that only while the click is running.

- **The chat emits `sourceOpen` on every press, whether the answer is still being written or not; the kit does not merge repeated presses and does not change the block.**

- **The kit does not read the scheme of an address.** The application checks it before it opens the source.

- **The kit does not open a source.** The application does, by the event.

### Layout

- **The block takes the width of the answer and never widens the feed.**

- **The title and the detail are cut: a long title and a long detail end with an ellipsis, and the whole text stays in the markup.** A screen reader gets the whole text.

- **Under `dir="rtl"` the row and the arrow mirror; the icons are drawn as they are.**

- **The sizes, the colours, the spaces and the line counts are set by the mockup.** The rules of these values are added after the owner approves the mockup.

### Copying

- **The answer copy gives a sources block as a header line and one line per source.** The header line is the label «Sources», a tab and the count of sources.

- **A source line is the title, the detail and the address, separated by a tab; an absent detail or address is an empty field.**

- **The copy does not depend on whether the list is opened.** A sources block in a section of a composed answer is copied by the same lines.

- **A tab or a line break inside a text becomes a space.**

### Accessibility

- **The body of the panel is the region of the list, named by its header as the panel does; the kit adds no second group around it.** The accessible name of the header button is «Sources» and the count, as drawn.

- **The rows are the items of a list: a pressable row is a button inside its item, a plain row is text inside it.** A reader hears the list and the number of its items.

- **The icon of a source is hidden from a screen reader.**

- **A pressable source is a button named by its title, and its detail is the description of the button.** A plain row reads the title and the detail as text.

- **Nothing interactive stands inside the header button, and a pressable row is one button over the whole row.** The count is plain text, written in plain digits, and the icon and the detail are parts of the button.

- **A press on a source leaves the focus on that source, and the focus stays on the header after the list collapses.** Only the pressable rows take the Tab key, in their order.

- **The label «Sources» is a kit label.**

### Composed answers

- **A section of a composed answer may hold a sources block.** It is drawn there by the same rules as in a plain answer, and its press names the message of the answer.

## What is out of scope

- Opening a source: the application does it by the event.
- Finding or ranking sources, grouping them by kind, a preview of a source, a field in the protocol
  that marks the end of a tool call.
- A reference index by which the text of the answer points at a source.
- The set of icon names the model uses: the kit gives its names, and a foreign one gets `file`.
- Translations of the label beyond the kit English set and the showcase Russian set: an application
  gives its own, as for every kit label.

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block and keeps no data of its own. Of a block, as the
consumer gives it:

- `type` — `sources`;
- `items` — the list of sources;
- of a source: `title` — the name of the source, such as «Отчёт «Продажи»»; `detail` — the page, the
  period, the filters; `icon` — the name of a kit icon, `file` when absent or unknown; `url` — the
  address the application opens.

The source open event is `{ messageId, url, title }`.

## Screens and states

| state                | what is drawn                                       |
| -------------------- | --------------------------------------------------- |
| one source           | the header with the count 1, collapsed              |
| five sources         | the header with the count 5, collapsed              |
| expanded             | the header with the arrow turned, the rows under it |
| pressable source     | the row as a button with a hover and a focus ring   |
| plain source         | the row as text                                     |
| no detail            | the title alone in the row                          |
| unknown icon         | the icon `file`                                     |
| long title or detail | the text cut by an ellipsis                         |
| right to left        | the row and the arrow mirrored                      |
| dark theme           | the same rows in the dark palette                   |
| invalid              | the plate with the type name                        |

The drawn values of every row wait for the mockup.

## Cross-cutting requirements

### Locales

The label «Sources» is a kit label: English in the kit set, Russian in the showcase set, any other
from the application. The title and the detail come from the consumer as given.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow panel is the mobile width of the chat: a long title and detail are cut by an ellipsis
inside the block, and the block does not widen the feed. The values wait for the mockup.

### Several objects

Several sources blocks in one answer each keep their own opened state, and each press names its own
address and its own message.

## Decisions

- **The block follows the link block and `rt-expansion-panel`** — both stand in the tree; the grill
  read both whole.
- **The fields are `items`, `title`, `detail`, `icon`, `url`** — an address makes a source
  pressable. A field `kind` with a table of icons was rejected: it closes the set of kinds, and the
  model needs freedom. The name of an icon is checked against the kit set, with `file` as the
  fallback.
- **The list is collapsed at the first draw and the kit keeps no state outside** — a block with ten
  sources would otherwise push the start of the answer out of view. Closed by assumption in the grill.
- **The event leaves by the output `sourceOpen` of `rt-ai-chat`** — as `linkOpen` does; the chat is
  the one place an application listens to. Synchronous, so that a new tab may be opened from it.
- **The copy header line is the label, a tab and the count** — the grill names «a header line» and
  does not give its shape; the tab keeps it a table row like the lines under it. Closed by
  assumption; the owner may ask for the line as drawn at the review.
- **The panel region stays the one landmark of the list** — a second group around it would read as
  two landmarks for one list; the spec-critic named this.
- **The state of the list belongs to the position of the block** — the blocks of an answer are
  tracked by position, and the kit does not guard against a block inserted above.
- **The labels are English in the kit and Russian in the showcase** — as for the link block.
- **The mockup comes before the code** — the rule of a visible kit edit; the owner approves the
  mockup and the showcase.

## Open questions

- **Q-2.** The set of icon names the model uses for the kinds of source is not closed: the kit gives
  `chart-bar`, `table`, `file`, `file-pdf`, `database`, `folder`, `book`, `link`, and a foreign name
  gets `file`. Does the owner want a longer set added to the kit?
- **Q-3.** The visual values wait for the mockup in Figma, which is not drawn.

## History of changes

- 2026-11-20 — the agreement written for RT-3340 from the grill; the mockup is not drawn.
