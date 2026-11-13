# The remove button and the place of the buttons of the image uploader

**Status:** in force · **Revision:** 13 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the image uploader, the icon button and the labels of the second kit
**Laws:** `frontend-application`, `verifiability`, `mockups`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-3286 from the mockup the
owner accepted on 13 November 2026.

## Why

A picture put into the uploader by mistake cannot be taken away: a press on it only chooses another
file. An application that shows every uploaded photo with the uploader needs a button that asks to
remove the photo, and it needs to choose where the buttons over the picture stand.

## Terminology

| Term                | What it is                                                             |
| ------------------- | ---------------------------------------------------------------------- |
| the remove button   | the cross over the picture that asks the application to remove it      |
| the download button | the button over the picture that saves the image                       |
| the buttons         | the remove button and the download button together, in one row         |
| the corner          | the corner of the picture the buttons stand at                         |
| the look            | whether the buttons reach past the picture's corner or stand inside it |

### What it is called in the interface

A person sees a cross over the picture and, next to it, a download arrow. The cross reads «Удалить»
to a screen reader — the kit's label `uiRemove`, in the language of the application.

## Rules

- **The remove button is drawn only when its input is on and the uploader holds a picture.**
- **A press on the remove button tells the application and changes nothing in the uploader.**
- **An unavailable uploader shows no remove button.**
- **The remove button is hidden until the pointer is over the preview or the focus is inside it, and is always shown on a touch screen.**
- **The remove button takes its label from the labels of the kit.**
- **The visibility input shows both buttons always or hides both until the pointer or the focus, and changes nothing without it.**
- **The buttons stand at the corner the uploader's input names, the top right one without it.**
- **The buttons reach past the picture's corner, and stand inside the picture when the look input says so.**
- **The remove button stands at the corner itself, and the download button next to it.**
- **The remove button shares the size, the shape, the backing and the blur of the download button.**
- **Without the new inputs the uploader draws as before.**

## What is out of scope

- Removing the file and any request to a server: the application does both on the event.
- Clearing the picture inside the uploader: the application takes its address away itself.
- A confirmation before the removal: the application asks it, if it needs one.

## Contract

Not applicable: the surface is inputs and an output of a kit component.

### Refusal codes

Not applicable.

## Data

Not applicable: the component keeps nothing.

## Screens and states

| State                         | What is visible                                           |
| ----------------------------- | --------------------------------------------------------- |
| the picture, the pointer away | the picture; the download button if it is on; no cross    |
| the pointer over the preview  | the cross at the corner, the download button next to it   |
| the focus on the cross        | the cross with the kit's focus ring                       |
| a touch screen                | the cross is always there                                 |
| the visibility «always»       | the cross and the download button, with no pointer needed |
| the visibility «hover»        | no buttons until the pointer or the focus; both after it  |
| the look «inside»             | the buttons stand inside the picture, 8 px from its edges |
| an unavailable uploader       | the picture and the download button, no cross             |

## Cross-cutting requirements

### Locales

The cross takes the label `uiRemove`, which the kit already carries in its eight languages; no new
key is added.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

A touch screen has no pointer to hover with, so the cross is always shown there.

### Several objects

Every uploader holds its own inputs; a corner or a look set on one uploader does not reach another.

## Decisions

- **The uploader does not clear its picture on the press.** The application may refuse the removal
  or ask first; a picture that vanished before the answer would lie about the outcome.
- **The visibility is one input for both buttons, and its default is neither of the two named looks.**
  Without it the cross waits for the pointer and the download button is always there, as it was
  before the input; a default of «always» or «hover» would move an uploader nobody touched.
- **The corner and the look move the download button too.** Two buttons at two corners would need
  two more inputs, and the mockup draws them as one row.
- **The download button becomes a child of the row of buttons.** Its class and its look stay; a
  consumer's rule written for that class still reaches it.
- **The backing of the buttons stays the surface at 75 % with a blur.** The mockup of the new states
  draws it so, and the code already did.

## Open questions

None.

## History of changes

- 13 November 2026 — the agreement was written from the accepted mockup by task RT-3286.
- 13 November 2026 — the code is written, and the rules are bound to it in `implementation.md`.
- 13 November 2026 — the visibility input is added by the owner's word after the showcase: the
  buttons are shown always or only under the pointer, and stay as they were without it.
