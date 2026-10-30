# The sign of a conversation channel

**Status:** in force · **Revision:** 2026-10-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** `service-logo` — the sign is drawn by it at the size `xs`
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names how a row of the conversation list and the header of a correspondence show the
channel the conversation goes by: a site, Telegram, WhatsApp, LINE.

## Why

An application that gathers conversations from several channels shows the channel next to each
conversation, so that the person knows where the reply goes. The row of the list holds a title, a
subtitle, the time and a tag; the header of the correspondence holds a title and buttons. There is
no place for a sign in either, and each consumer would put its own circle into its own row template,
with its own size and gap.

## Terminology

| Term          | What it is                                                                        |
| ------------- | --------------------------------------------------------------------------------- |
| The sign      | one mark of `rt-service-logo` at the size `xs`: a circle 32 with a mark 16 inside |
| The channel   | the way a conversation goes: a site, a messenger                                  |
| The row sign  | the sign at the left edge of a row of the conversation list                       |
| The head sign | the sign to the left of the title in the header of the correspondence             |

### What it is called in the interface

| In the spec   | On the screen                                                      |
| ------------- | ------------------------------------------------------------------ |
| The row sign  | the light circle with the logo of a messenger at the left of a row |
| The head sign | the same circle before the title of the open conversation          |

## Rules

- **The sign is one mark of `rt-service-logo` at the size `xs`.** The row and the header draw no
  circle of their own: the plate, the shadow and the mark come from the part of the kit.
- **A mark of a company is an image by address, a channel without a company is an icon of the
  kit.** The kit ships no marks of outside companies; a site is the icon `globe` in the same
  circle.
- **A row with a sign draws it first in the row button, before the content of the row template.**
  The gap to the text is the gap of the row; the sign stands centred by the height of the row.
- **A row without a sign is drawn as before.** The field is optional, and a list where no row has
  it does not change by a pixel.
- **The header draws the sign before the title when the input is given.** The gap between the sign
  and the title is `--rt-space-2`.
- **The header without the input is drawn as before.**
- **The sign carries the name of the channel for a screen reader.** The label of the mark is what
  is read; the sign is not a control and takes no focus.

## What is out of scope

- **Which channel a conversation goes by.** That is the application's data.
- **The marks of outside companies.** The application gives each image by address.
- **The sign anywhere else in the kit.** Cards and other lists are separate work.

## Contract

Not applicable: the subdomain describes the surface of components, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: the sign is an input of the components, nothing is stored.

## Screens and states

| State                   | What is visible                                                  |
| ----------------------- | ---------------------------------------------------------------- |
| A row without a sign    | the row as before                                                |
| A row with a sign       | the circle at the left edge, the title and subtitle to its right |
| A header without a sign | the title and the buttons as before                              |
| A header with a sign    | the circle, then the title, the buttons at the right             |

## Cross-cutting requirements

### Locales

The label of the sign arrives from the consumer: the kit does not translate it.

### SEO

Not applicable.

### Mobile layout

The sign keeps its size on a narrow screen; the title and the subtitle are cut by the ellipsis as
before.

### Several objects

Not applicable.

## Decisions

- **The size `xs` is a size of `rt-service-logo`, not a size of the row.** The argument: the circle
  of 32 with the mark of 16 is the same atom with the same rules, and Figma holds it as `Size=xs`
  of «Service Logo». The price: the part gets a fourth size and a fourth shadow token.
- **The row sign is a field of the row, not a template slot.** The argument: every consumer would
  repeat the same markup in a slot; a field is drawn by the shell and reaches consumers with their
  own row template too. The price: the shell decides the place of the sign.

## Open questions

- None.

## History of changes

- 2026-10-23 — created by the work about the sign of a conversation channel, task RT-2936.
