# The link block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-19 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the outputs of the chat, the answer
copy), the tag of the kit (the status), the button of the kit (the two actions)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The agreement of task RT-3339: the `link` block of an answer of `rt-ai-chat`, a card of a page of
the application with the outcome of opening it, and the new output of the chat that carries a press
of its buttons. The approved mockup is the frame 8339-452 of the second kit file. The rules of the
block merge into a subdomain of their own next to `ai-chat-kpi`; the rules under «The tag» merge
into `docs/specs/ui-kit-v2/tag/`. At the merge the rules of `docs/specs/ui-kit-v2/ai-chat/spec.md`
on the kit's own types, on the plate, on the outputs and on the answer copy name `link`.

## Why

The assistant opens a page of the application by a tool call and writes about it in text. The
reader does not see whether the page opened and cannot open it again or in a new tab. The kit gets
a `link` block: a card with the page title, its menu section and an icon, a status of the opening
and two buttons. The kit does not navigate: a press leaves the chat as an event, and the
application opens the page.

## Terminology

- **The link block** — a block of an answer with the type `link`: one card of one page.
- **The address** — the `url` of the block, the page the application opens; the kit trims it and
  passes it on without reading it.
- **The state** — the outcome of opening the page: `pending`, `opened` or `failed`. The application
  writes it into the block: the protocol does not mark the end of a tool call.
- **The reason** — the text of a `failed` block that says why the page did not open.
- **The open event** — what the chat emits on a press of a card button: the message, the address and
  whether a new tab is asked for.

### What it is called in the interface

| In the domain | On the screen                                                           |
| ------------- | ----------------------------------------------------------------------- |
| The card      | a framed card: the icon, the title, the section, the status, buttons    |
| The status    | a small tag under the section: «Открывается», «Открыта», «Не открылась» |
| The reason    | a line under the status in the error text colour                        |
| The actions   | the buttons «Открыть» and «В новой вкладке»                             |

## Rules

### The block and its data

- **`link` is a type the kit draws itself, next to `markdown`, `notice`, `table` and `kpi`; an application gets it without registering anything, and a renderer registered for `link` is not taken.**

- **A link block has `title` and `url`, and the optional `section`, `icon`, `state` and `reason`.**

- **A link block whose `title` or `url` is not a string, or is empty after trimming, is shown as the plate with its type name, like a KPI block without a card.**

- **The title, the section, the reason and the address are trimmed; the card draws, the event carries and the copy writes the trimmed text.**

- **A malformed optional part is absent, not refused.** A `section` or a `reason` that is not a non-empty string is absent. An `icon` that is not a non-empty string, or a name the kit set does not hold, is the kit icon `link`. The model writes the name, so the card checks it against the kit set and never asks for a drawing by a foreign name.

- **A card whose `state` is not `pending`, `opened` or `failed`, or is absent, draws no status and keeps both buttons enabled.** The model writes the block and the application writes the state: a block nobody gave a state does not claim an outcome.

- **A `reason` is drawn only in the `failed` state; a `failed` block without a reason draws no reason line.** The task card says «`failed` с причиной»; a missing reason is the application's miss, and the card still shows the failure rather than the plate.

- **A new answer with the same block holding another state redraws the same card: a card that came as `pending` and was replaced by `opened` shows the new status.**

- **The kit exports the JSON schema of the link block (JSON Schema 2020-12), so that an application gives it to the model as the parameters of a tool.** It holds what the model writes: it requires `title` and `url` and names the optional `section` and `icon`. `state` and `reason` are not in it: the application adds them after the call.

- **A block the schema accepts is drawn as a card with nothing dropped.** The block is more lenient than the schema: what the schema refuses is still drawn by the rules above.

### The actions

- **The card has two buttons: «Open» opens the page in place, «Open in new tab» opens it in a new tab.** The kit draws no `href` and does not navigate.

- **A press of «Open» makes `rt-ai-chat` emit `linkOpen` with the message id, the address and `newTab: false`; a press of «Open in new tab» emits the same with `newTab: true`.** The event travels block → blocks → answer → chat, as the feedback of an answer does, and the chat adds the message id. A press with a modifier key is an ordinary press.

- **The chat emits `linkOpen` synchronously, inside the press handler.** An application opens a new tab from it, and a browser allows that only while the click is still running.

- **In the `pending` state both buttons are drawn disabled, are `aria-disabled="true"`, keep the keyboard focus and emit nothing on a press; in the other states both are enabled.** A focused button that turns `pending` after a press keeps its focus: a `disabled` button would drop it to the page. A `failed` card keeps its buttons so that the reader can try again.

- **The buttons follow the state alone, whether the answer is still being written or not.**

- **The kit does not change the state on a press.** The application writes the next state into the block, if it wants to show one.

- **The chat emits `linkOpen` on every enabled press; the kit does not merge repeated presses.**

### The status

- **The status is an `rt-tag` of the size `sm`, solid, with an icon before its label.** `pending` is neutral with the `spinner` icon, `opened` is success with `check`, `failed` is danger with `exclamation-circle`.

- **The `pending` spinner turns, as `rt-icon` turns it, and under reduced motion it turns slowly.** The kit slows every turning icon there instead of stopping it: a stopped spinner reads as a plain icon.

- **The status labels are kit labels: «Opening», «Opened» and «Failed to open» by default.**

- **A change of the state of a drawn card is announced by the polite region of the feed, naming the card: «<title>: Opened», «<title>: Failed to open. <reason>».** The card adds no live region of its own, since the feed already is one. The first draw of a card announces no state.

### Layout

- **The card takes the width of the answer and never widens the feed.**

- **The card frame takes kit tokens only.** The border is 1 px of `--rt-color-border-default`, the background `--rt-color-bg-surface`, the padding 12, the radius 12 and the gap between the row and the buttons 12, as the frame of a KPI card. The dark theme takes the same tokens in the dark set.

- **The row has the icon box on the start side and the text column next to it, 12 apart.** The icon box is 36 by 36 with the radius 8 on `--rt-color-bg-surface-subtle`, stands at the top of the text column and holds the icon 20 in the muted text colour.

- **The title is 14/17 SemiBold in the primary text colour, the section 12/16 Regular muted, the reason 12/16 Regular in `--rt-color-state-error-text`.**

- **The title and the section stand 2 apart; the status stands 6 under them, and the reason 6 under the status, in the text column.** At the right of the title the status wrapped the title to two lines at 328.

- **The title takes at most two lines and ends with an ellipsis; the section takes one line with an ellipsis.** The whole texts stay in the markup and reach a screen reader.

- **The two buttons are of the size `sm` and the theme `primary`, 8 apart, under the row of the card: «Open» is outlined, «Open in new tab» is a text button with the `external-link` icon.** They stand in one row on one top; when they do not fit one row, «Open in new tab» wraps under «Open», and no label goes past the card.

- **Under `dir="rtl"` the row and the buttons mirror; the icons are drawn as they are.**

- **In the dark theme the danger status reads at 2.94 : 1 and the reason line at 3.16 : 1, below the 4.5 : 1 of AA.** The kit has one danger value for both themes; this is known in the epic findings and is fixed by a task of the dark status colours, not here.

### The tag

- **The gap between all parts of a tag of the size `sm` — the icon, the label, the end icon and the cross — is 4, `--rt-space-1`, the same as the size `md`.** The approved mockup draws 4, and the owner set in RT-3338 that the kit is fitted to the mockup. The padding and the type size keep their steps; the gap of `sm` equals that of `md`. This changes every small tag with an icon or a cross in the kit.

- **The tag can turn its start icon.** The option is off by default and passes on to the start icon the turning of `rt-icon`.

### Copying

- **The answer copy gives a link block as one line: the title, the section and the address, separated by a tab; an absent section is an empty field.**

- **The status and the reason are not copied: they describe the minute of the opening, not the page.**

- **A tab or a line break inside a text becomes a space.**

### Accessibility

- **The card is a group named by its title, so that the two buttons of several cards are told apart.**

- **The icon of the card is hidden from a screen reader.**

- **The labels «Open» and «Open in new tab» are kit labels.**

## What is out of scope

- Navigation itself and a tool of the protocol that opens a page: the application does both.
- Telling the kit the outcome of a call by the protocol: the application writes `state`.
- A preview of the page, a breadcrumb drawn as links, a copy-the-address button.
- The dark-theme contrast of the danger colour: a task of the dark status colours.
- The section and the grid of a composed answer (RT-3342) and the sources block (RT-3340).
- Translations of the new labels beyond the kit's English set and the showcase Russian set: an
  application gives its own, as for every kit label.

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block and keeps no data of its own. Of a block, as
the consumer gives it:

- `type` — `link`;
- `title` — the page title;
- `url` — the address the application opens;
- `section` — the menu section, a ready text such as «Отчёты · Продажи»;
- `icon` — the name of a kit icon, `link` when absent;
- `state` — `pending`, `opened` or `failed`, written by the application; no status when absent;
- `reason` — the text of a `failed` card, written by the application.

The open event is `{ messageId, url, newTab }`.

## Screens and states

| state             | what is drawn                                                     |
| ----------------- | ----------------------------------------------------------------- |
| pending           | the neutral status with a turning spinner, both buttons disabled  |
| opened            | the success status with a check, both buttons enabled             |
| failed            | the danger status, the reason line under it, both buttons enabled |
| failed, no reason | the danger status without a reason line                           |
| no state          | no status, both buttons enabled                                   |
| long title        | the title on two lines with an ellipsis, the section on one line  |
| no section        | the title and the status, no section line                         |
| narrow 328, 386   | the four cards of the mockup                                      |
| full screen 640   | the same cards in the reading column                              |
| dark theme        | the cards at 328 in the dark palette                              |
| right to left     | the row and the buttons mirrored                                  |
| invalid           | the plate with the type name                                      |

## Cross-cutting requirements

### Locales

The status labels and the button labels are kit labels: English in the kit set, Russian in the
showcase set, any other from the application. The title, the section and the reason come from the
consumer as given.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow panel is the mobile width of the chat: at 328 both buttons stand in one row, and a long
title and section are cut by an ellipsis inside the card.

### Several objects

Several link blocks in one answer each draw their own card, and each press names its own address
and its own message.

## Decisions

- **The state comes in the block** — the protocol has no outcome of a tool call; closed by
  assumption in the grill.
- **No state draws no status** — the grill assumed «opened» for a missing state; spec-critic showed
  that a block the model wrote without a state would then claim an opening nobody made.
- **The schema leaves out `state` and `reason`** — they are tool parameters the model would fill,
  and only the application knows the outcome.
- **The event leaves by an output of `rt-ai-chat`** — the chat is the one place an application
  listens to; a block drawn inside it has no outputs of its own. Closed by assumption.
- **`pending` buttons are `aria-disabled`, not `disabled`** — the keyboard focus stays on the
  pressed button while the application opens the page.
- **`failed` keeps its buttons enabled** — the approved mockup draws them enabled, and the reader
  may try again.
- **The status under the section, not at the right of the title** — the mockup, after the title
  wrapped at 328.
- **The card frame is drawn by the block, not by `rt-card`** — `rt-card` draws a shadow instead of
  a 1 px border, the padding `--rt-space-lg` and the radius `--rt-radius-xl`, while the mockup
  draws a border, 12 and 12, as the KPI card frame does. The parts inside are kit atoms: `rt-tag`,
  `rtButton`, `rt-icon`.
- **The tag `sm` gap of 4 is a kit change** — the owner's remark on the mockup: «добавь отступ …
  между иконками и текстом»; the kit is fitted, the block does not override the gap.
- **The turning spinner is a tag option** — the tag draws its icon still, and the mockup's
  `pending` is an opening in progress.
- **The copy line is tab-separated and leaves out the status** — the separator of the table and the
  KPI blocks; the status is the minute, not the page. Closed by assumption.
- **The new labels are English in the kit and Russian in the showcase** — the grill assumed eight
  languages, but the kit carries only its English set and the showcase its Russian one; every other
  language is given by the application.
- **The icon is a kit icon name with `link` by default** — the task card names an icon, and the
  mockup draws `chart-bar` from the data. Closed by assumption.

## Open questions

None: the six questions of the draft are closed by assumption in the grill, and the mockup is
approved.

## History of changes

- 2026-11-19 — the agreement written for RT-3339 from the grill and the approved mockup 8339-452.
- 2026-11-19 — the review by spec-critic and goal-critic: no status without a state, the schema
  without the outcome, `aria-disabled` and kept focus, the synchronous event, the turning spinner,
  the announcement through the feed, the numbers of the row, the wrapping buttons, the dark
  contrast, the `sm` gap for all parts, the reason not to take `rt-card`.
