# The request error of a side panel

**Status:** proposed · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel of the second kit — the box stands inside `rt-aside`
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2424. It merges into the
spec of the second kit by the last commit of the PR, with the scenario numbers it has now.

## Why

A side panel sends a record to the server, and the request fails. The first kit shows that in the
panel itself: a line "Request Error" and a button that copies the error for whoever will look into
it. The panel stays open with what the person typed. The second kit's panel has no such place: an
application moving to it can only close the panel or keep silent.

## Terminology

| Term         | What it is                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| the error    | any value the application got from a failed request and hands to the panel    |
| the box      | the line under the panel header: the label and the copy button                |
| the copy     | the text the button puts into the clipboard: the moment and the error as JSON |
| confirmation | the button's label and icon for one second after the copy                     |

### What it is called in the interface

The box reads "Request Error" and the button "Copy error info", then "Copied" for a second. The
labels come from the kit dictionary; an application in another language gives its own.

## Rules

- **The panel shows the box when the application handed it an error, and hides it without one.**
  `null` and `undefined` mean no error; every other value, an empty string included, shows the box.
- **The box stands between the header and the content and does not scroll with the content.** The
  person scrolled down to the field that failed and still sees the error.
- **The copy holds the moment and the error in the first kit's shape.** The text is
  `Error time: <date>_<time>;Error info: <JSON>`, so whoever read such copies before reads these the
  same way.
- **An error that cannot be written as JSON is copied as text, and the press does not fail.** A
  value with a loop inside it would throw from the serialisation; the copy then holds its string
  form.
- **After the copy the button confirms it for one second and then returns to its label.** A second
  press within that second copies again and restarts the second.
- **The box is also a component of its own, for an application that draws the error elsewhere.**
  Its only input is the error.

## What is out of scope

- The first kit is not edited: its box opens as the sample.
- A text that explains the error to a person is not made: the first kit shows "Request Error"
  whatever arrived, and the task card's promise of a reason is left to the owner's word.
- A second input that switches the box on apart from the error is not ported: the first kit's pair
  of inputs always went together.

## Contract

Not applicable: the surface is one input of `rt-aside` and one kit component, the subdomain serves
no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the box keeps nothing but the confirmation second.

## Screens and states

| State            | What is visible                                                    |
| ---------------- | ------------------------------------------------------------------ |
| no error         | the panel as before, no box                                        |
| error            | a framed line under the header: "Request Error", "Copy error info" |
| a second of copy | the button reads "Copied" with a check icon                        |

## Cross-cutting requirements

### Locales

Two new keys of the kit dictionary, `asideRequestError` and `asideCopyErrorInfo`; the confirmation
takes the existing `uiCopied`. The showcase carries the Russian labels.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The panel is full width on a narrow screen, and the box keeps one row: the label shrinks with an
ellipsis, the button keeps its width.

### Several objects

Every open panel shows its own error: the box belongs to the panel it stands in.

## Decisions

- **The error is one input of `rt-aside`, `requestError`, and not an input of the header.** A panel
  without a header still has a request that can fail.
- **The box is drawn by the kit's own markup, framed as in the first kit, and not by `rt-message`.**
  The message is a coloured banner with an icon; the first kit's box is a thin danger frame with a
  button, and the owner asked for the first kit's look. The box carries no `role="alert"`: that role
  belongs to the message.
- **The button is `rtButton` of the secondary theme and the text appearance, the icon is `rt-icon`.**
  That is the first kit's secondary text button without Material.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written by the grilling of the owner's request.
