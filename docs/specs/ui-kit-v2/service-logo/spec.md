# The logo of a service

**Status:** in force · **Revision:** 2026-10-20 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the kit — a mark without an image of its own is drawn by it
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-service-logo`: a row of one or several marks of outside
services, each centred in a light round plate with a soft shadow. The numbers are the numbers of
the design-system atom «Service Logo».

## Why

A screen that lists services the application works with — payment methods, connected
integrations — shows each one by its mark. Without a part of the kit every screen draws its own
circle with its own size and shadow, and the marks of one list stop lining up. A method that is
served by several companies at once (a card accepted under several networks) needs the marks laid
over one another in one row.

## Terminology

- **The mark** — the picture of one service: an image the application gives by address, or an
  icon of the kit.
- **The plate** — the round light circle the mark stands centred in.
- **The step** — the distance from the left edge of one plate to the left edge of the next one in
  a row of several marks.
- **The label** — the name of the service the mark stands for; it is what a screen reader says.

### What it is called in the interface

| In the domain | On the screen                                              |
| ------------- | ---------------------------------------------------------- |
| The mark      | the logo of a service inside the circle                    |
| The plate     | the light circle with a shadow under the logo              |
| The row       | several circles laid over one another, the last one on top |

## Rules

- **Each mark stands centred in a round opaque plate with a soft shadow.** The plate is fully
  round, its fill is the light grey of the atom, its shadow is centred and has the colour of near
  black at 15%.

- **The size takes three values, and each one carries the numbers of the atom.** `sm` — plate 40,
  mark 20 high, step 24, shadow blur 24; `md` — plate 64, mark 32, step 40, blur 40; `lg` —
  plate 96, mark 48, step 60, blur 56. Without a size the part draws `md`.

- **An image mark fits its box and keeps its proportions.** The box of the mark is wider than high
  (27.5×20, 44×32, 66×48); the image is contained in it whole and centred, never stretched or cut.

- **Several marks overlap with the step, and a later mark lies on top of the earlier one.** All
  plates of a row are the same; the row is as wide as one plate plus the step for every mark after
  the first.

- **A mark without an image is an icon of the kit in the same plate.** It is drawn at the height of
  the mark and takes the place an image would take. It stays dark in both themes, because the
  plate stays light.

- **Each mark carries its label for a screen reader.** The row reads as the list of labels, one per
  mark, in the order the marks were given.

- **The kit ships no marks of outside companies.** The application gives each image by address;
  the kit draws only the plate, the row and the icons of its own.

## What is out of scope

- The mark of the application itself: that is `rt-logo`.
- A limit on the number of marks. The atom draws up to three; the part draws any number with the
  same step, and the consumer decides where to stop.
- A press on a mark: the part is a picture, not a control.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own. A mark is given as an item of the input `logos`: either an image address with a
label, or a kit icon name with a label.

## Screens and states

| state         | what is drawn                                            |
| ------------- | -------------------------------------------------------- |
| one mark      | one plate with the mark centred                          |
| several marks | plates overlapping by the step, each later one on top    |
| an icon mark  | the kit icon at the height of the mark in the same plate |

## Cross-cutting requirements

### Locales

The part has no text of its own. The labels come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The part keeps its size on any screen: the size is chosen by the consumer, not by the width.

### Several objects

Not applicable.

## Decisions

- **The numbers are taken from the atom, not picked by eye.** The owner approved the atom «Service
  Logo» with its three sizes.
- **The plate stays light in the dark theme.** Marks of outside companies are drawn for a light
  ground; a plate repainted dark would leave dark marks unreadable.
- **One part for images and icons.** The plate and the row are the same; a second part for icons
  would repeat them.

## Open questions

None.

## History of changes

- 2026-10-20 — written by the task RT-2899.
