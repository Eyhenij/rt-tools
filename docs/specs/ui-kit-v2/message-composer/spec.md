# The message field of the kit

**Status:** in force · **Revision:** 2026-09-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon button, the file card and the rich editor of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-message-composer`: the field a chat message is typed in,
what it draws at rest, in focus, while sending and when disabled, how it grows, where the files
stand and what Enter does.

## Why

The field was a box with a border, a line under the text and a separate row of buttons. The mockup
draws it as a capsule with round buttons inside and gives it the focus of the kit's fields.

## Terminology

- **The capsule** — the rounded box of the field that holds the buttons, the text and the files.
- **The content** — what can be sent: text that is not blank, or picked files.
- **The hint** — the line under the capsule about Enter and Shift + Enter.

### What it is called in the interface

| In the domain | On the screen                                           |
| ------------- | ------------------------------------------------------- |
| The capsule   | the rounded field at the bottom of the chat             |
| The content   | the typed text and the file cards above it              |
| The hint      | «Enter — отправить, Shift + Enter — новая строка» below |

## Rules

- **The composer is a capsule with a round attach button on the left and a round send button on the
  right.** The buttons are the kit's icon buttons of 40px with a full rounding: the paperclip is
  ghost with a muted icon, the arrow is primary. The attach button is there only with `attachments`.

- **The capsule is fully rounded on one row and takes the 20px step when it is taller.** It is taller
  when the text wrapped, when files stand inside or in the formatting mode.

- **The text grows from `minRows` to `maxRows` rows, and the buttons stay at the bottom.** Past
  `maxRows` the field stops growing and the text scrolls inside it.

- **The send button is off while there is no content, and spins while sending.** With content it is
  on and blue; with `sending` it shows the kit's spinner and stays pale and off.

- **At rest the capsule has the fill and the border of the kit's fields; in focus it has the surface,
  the focus border and the ring.** The values are the fields' own, so the composer matches a form
  next to it.

- **A disabled composer is pale and takes nothing.** The placeholder takes the disabled text colour,
  both buttons are pale, the text cannot be typed and nothing is sent.

- **Enter sends, Shift + Enter breaks the line, and the hint says so when `hint` is on.** The hint is
  off by default; it is a kit label and follows the translator.

- **Picked and dropped files stand inside the capsule above the row as small file cards.** Each card
  has a remove button; the files leave with the message and are cleared after it.

- **In the formatting mode the rich editor with its toolbar stands in place of the text.** It lives
  in the same capsule; the send and the attach buttons stay where they are.

## What is out of scope

- The visitor's widget on the site: it is drawn without the kit, and its look is the task RT-2365.
- The text size of 15px from the mockup: the scale has 14 and 16, and the field takes the size of
  the kit's fields.

## Contract

None: the composer is a layout component and serves no procedure.

### Refusal codes

Not applicable: an empty message is not sent; nothing is refused.

## Data

None of its own. The typed text and the picked files live until they are sent or removed.

## Screens and states

| state       | what is drawn                                                 |
| ----------- | ------------------------------------------------------------- |
| empty       | the placeholder, the paperclip, the pale arrow                |
| focus       | the surface, the focus border and the ring, the caret         |
| typing      | the text, the blue arrow                                      |
| multiline   | several rows, the 20px rounding, the buttons at the bottom    |
| sending     | the text, the pale buttons, the spinner in place of the arrow |
| filled      | the text without focus, the blue arrow                        |
| disabled    | the pale placeholder and the pale buttons                     |
| long        | six rows; the field does not grow further                     |
| overflow    | six rows with a scroll, the last rows at the caret            |
| with files  | the file cards inside the capsule above the row               |
| with a hint | the line about Enter under the capsule                        |

## Cross-cutting requirements

### Locales

The placeholder, the hint and the labels of the buttons are kit labels, English in the package and
translated by the consumer's translator.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The capsule keeps its layout on a narrow screen. The text size follows the kit's fields, which take
16px under a finger so the phone does not zoom in.

### Several objects

Not applicable: the composer belongs to no owning entity.

## Decisions

- **The capsule is the composer's own look, not a new component.** The consumers keep the selector
  and the inputs; `hint` is the only new input.
- **The focus is the fields' border and ring.** A composer next to a form does not draw focus in a
  way of its own.

## Open questions

None.

## History of changes

- 2026-09-30 — written by the task RT-2366 of the epic RT-2370, which redraws the message field.
