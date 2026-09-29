# The image cropper

**Status:** in force · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the design of the kit — the colours, the ring of the focus and the dimming come from its
appointments; the labels of the kit — the names of the handles and the refusal are its keys; a boolean
input and the bare attribute — `disabled` and `round` take the bare attribute as truth
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-2397 of epic RT-2353 before the code.

## Why

The image uploader of the first kit crops with a third-party package, and the second kit may carry
none: the uploader moving to the second kit (RT-1881) has nothing to crop with. The owner, 29
September 2026: «начнем с аплоадера но нужно запилить свой кропер». The cropper is a family of its
own, so an application crops an avatar or a cover without the uploader too.

It repeats what the first kit's uploader does with its cropper — a free frame over the image fitted
into the field, the result as a file of the chosen format and quality — and adds what the owner took
on top: a fixed ratio and a round mask for an avatar.

## Terminology

| Term           | What it is                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| the source     | the file the caller gives; its own pixels, turned the way its EXIF data says  |
| the field      | the box of the component; the source is fitted into it whole and centred      |
| the frame      | the rectangle that is cut out; it lives in the pixels of the source           |
| a handle       | one of eight grips of the frame — four corners and four sides                 |
| the ratio      | width to height the frame keeps; none means the frame is free                 |
| the round look | the frame is shown as a circle; it keeps the ratio one to one                 |
| the result     | the file cut out of the source by the frame, in the chosen format and quality |

### What it is called in the interface

| In the agreement | On the screen                                                               |
| ---------------- | --------------------------------------------------------------------------- |
| the frame        | a bright rectangle over the dimmed image, with a thin rim                   |
| a handle         | a small square on a corner or in the middle of a side of the frame          |
| the round look   | the bright area is a circle inside the frame; the handles stay on the frame |
| loading          | the kit's spinner in the middle of the field                                |
| refusal          | a short text in the middle of the field: the image could not be read        |
| unavailable      | the frame and its handles are dimmed and take neither the pointer nor keys  |

## Rules

- **The source is fitted into the field whole, keeping its proportions, and centred.** No part of
  the image is cut off by the field, and none is stretched.
- **The source is read the way its EXIF data turns it.** A photo taken by a phone held upright lies
  upright in the field and in the result.
- **The frame starts as the largest one the ratio allows, centred on the source.** A free frame
  starts as the whole source.
- **The frame never leaves the source.** A move or a stretch that would carry it out stops at the edge.
- **The frame is never smaller than the least size.** The least size is given in pixels of the source,
  and a stretch that would go below it stops at it.
- **A drag inside the frame moves it; a drag of a handle stretches it from that handle.** The side or
  the corner opposite the handle stays in place.
- **A frame with a ratio keeps it under every stretch.** The ratio is width to height; the round look
  keeps one to one whatever ratio is given.
- **The frame and each handle are reached by the keyboard, and the arrows move or stretch them.** One
  press is one pixel of the field, with Shift ten.
- **The pointer and the finger act the same.** A drag started by either follows it outside the field
  and ends when it is released.
- **The result is given after every finished change of the frame, not during a drag.** One drag is
  one result.
- **The result is a file of the chosen format and quality, cut out in the pixels of the source.**
  Without a chosen format the format of the source is taken, and png when it is none of the three.
- **The round look is a mask on the screen, and the result stays the square the frame cuts.** The
  application rounds the picture where it shows it; a jpeg has nothing to be transparent with.
- **A source that cannot be read gives the refusal and no frame.** The caller is told by an output.
- **An unavailable cropper changes the frame neither by the pointer nor by keys.** It keeps showing
  the frame it had.
- **The handles and the frame name themselves to the assistive means.** The names are the kit's
  labels, in the language of the application.

## What is out of scope

- Scaling by the wheel or a pinch and a turn by 90° — the owner did not take them.
- Choosing a file and the whole uploader — that is `rt-file-drop` and task RT-1881.
- The first kit's uploader and its package — the first kit is not edited.

## Contract

Not applicable: the family calls no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the cropper keeps nothing.

## Screens and states

| State       | What is seen                                               |
| ----------- | ---------------------------------------------------------- |
| no source   | the empty field                                            |
| loading     | the kit's spinner in the middle of the field               |
| refusal     | the refusal text in the middle of the field                |
| ready       | the image fitted into the field, the frame and its handles |
| round       | as ready, the bright area is a circle                      |
| unavailable | as ready, dimmed, taking no pointer and no keys            |

## Cross-cutting requirements

### Locales

The names of the frame, of the eight handles and the refusal text are keys of the kit's labels in
the `rtKit` namespace, in all eight languages of the kit.

### SEO

Not applicable.

### Mobile layout

The field takes the width of its box; a finger drags the frame and the handles the same as the
pointer, and the handles are large enough for a finger where the pointer is coarse.

### Several objects

Not applicable.

## Decisions

- **One gesture moves the frame; the image itself does not move.** Without scaling the image fills
  the field, and moving the image under a fixed frame gives the same cut as moving the frame over
  it. Rejected: a second drag for the image — two gestures for one result.
- **The result of the round look is the square.** Rejected: a png with the corners made
  transparent — the choice of the format would change what the frame cuts.
- **The frame lives in the pixels of the source, not of the field.** The field changes with the
  window, the source does not; a frame in the field's pixels would drift after every resize.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written before the code, the task RT-2397. The accordion
  was merged first and took `SC-UKV-394`…`SC-UKV-405`, so the last four scenarios of the family
  took `SC-UKV-406`…`SC-UKV-409`.
