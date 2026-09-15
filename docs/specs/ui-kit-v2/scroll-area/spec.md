# The scroll area and the sign of what is left below

**Status:** in force · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon family and the tooltip family of the kit, and the label set of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

## Why

A panel whose content outgrows its height is cut by its own edge. Where a footer stands under that
edge — a total, a pair of buttons, a separator — the cut looks deliberate: the last visible row ends
against a clean line, and the reader takes it for the end of the list. The rows below it are lost
without a single sign that they exist.

The area gives the consumer three places — a header that stays, a body that scrolls, a footer that
stays — and, where the consumer asks for it, a sign over the join of the body and the footer saying
that something is left below.

The family is carried over from the first kit, where it is `rtui-scrollable`. It is written anew on
the kit's own primitives; the first kit's directory is read as a sample and is not edited.

## Terminology

- **Part** — one of the three places of the area: the header, the body, the footer. The consumer
  declares a part by putting its template directive inside the area.
- **The sign of what is left below** — the fade strip with the «down» icon over the join of the body
  and the footer. It stands only while the body has content under its lower edge.
- **The lift of the strip** — how high the strip's lower edge stands above the lower edge of the
  area. It equals the footer's height without the footer's own top padding.

### What it is called in the interface

The person behind the screen sees no parts and no templates. They see a panel with a heading on top,
a list in the middle and a line of totals at the bottom — and, while the list has more, a softly
fading edge with a small arrow they can press to jump to the end.

## Rules

- **A part whose template is not declared is not drawn.** An empty header is a strip of padding
  above the list, an empty footer a strip below it. Drawn anyway, they take height from the body,
  which is the only part the reader came for.

- **The body scrolls, the header and the footer stay.** Scrolling the whole area would carry the
  heading and the totals off the screen, and the reader would lose what the rows are about exactly
  when the list is long enough for it to matter.

- **The sign appears before the first movement of a hand.** A scroll event arrives only after
  someone scrolls; a list that does not fit is already not fitting at the first paint. Tied to the
  event alone, the sign would appear to whoever had guessed to scroll and stay silent for whoever
  needs it. The area watches the size of the body and of the footer instead.

- **The sign is switched off by default and is asked for by an input.** Dozens of screens draw the
  area, and a sign standing unconditionally would shift the look of every one of them.

- **The sign goes away when the body is scrolled to the bottom, with a whole point of slack.** A
  fractional row height leaves a remainder at which the scroll is already at the very bottom and the
  difference is still above zero: without the slack the sign would hang for good.

- **The strip reaches the content of the footer, not the edge of the body.** The consumer draws the
  separator as the footer's first row, and a strip that stopped at the body's edge would leave a
  band of clean background between itself and that separator. The lift is taken by measurement: the
  footer's top padding is written by the consumer in any of four forms, and there is nothing to
  subtract it with in the styles. Without a footer the strip stands at the very bottom.

- **A press on the icon carries the body to the very bottom and does not reach the content under
  it.** Under the icon lies a live row, and a press aimed at the hint would otherwise open somebody
  else's screen.

- **The strip does not catch the pointer and the icon does.** The strip lies over the join of a live
  list, and catching the pointer it would swallow presses aimed at the rows; the icon has to catch
  its own, otherwise the hint cannot be read or pressed.

- **The label of the icon comes from the label set of the kit.** In the first kit it is written into
  the class in English because that kit has no label set; this kit has eight languages, and a string
  in the class would be the one place that stays untranslated.

## What is out of scope

- The look of the scrollbar itself at the body: that is the subdomain `scrollbar`.
- What the consumer puts into the parts: the area declares three places and reads no content.
- The height of the area: it takes it from its own host, and the consumer sizes that.

## Contract

None: the area is a layout component and serves no procedure. The parts are declared by three
content directives, and the area reads them as content children.

### Refusal codes

Not applicable: an area with no parts declared at all is a lawful empty state, and the area refuses
nothing.

## Data

None of its own. The content of every part belongs to the consumer, and the area stores nothing
between visits.

## Screens and states

| state                                    | what is drawn                                               |
| ---------------------------------------- | ----------------------------------------------------------- |
| three parts declared, content fits       | header, body, footer; no strip                              |
| three parts declared, content left below | the same, and the strip with the icon over the join         |
| the sign is not asked for                | header, body, footer; no strip whatever is left below       |
| body alone declared                      | one scrolling part; the strip, if asked, at the very bottom |
| the body is scrolled to the bottom       | header, body, footer; no strip                              |

## Cross-cutting requirements

### Locales

The area draws one piece of text of its own — the label of the icon — and it comes from the label
set of the kit, in all eight languages.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The area takes its size from its host at every width, and the rules hold unchanged: the strip stands
over the same join, and its lift is measured the same way.

### Several objects

Not applicable: the area belongs to no owning entity.

## Decisions

- **The family is called `rt-scroll-area`, not `rt-scrollable`.** The kit already has the subdomain
  `scrollbar` about the look of the scrollbar itself. Two neighbouring names about different things
  read as one.

- **The fade is painted with the colour of the theme, not carried into transparency.** Transparent
  is black with zero opacity, and on the dark theme such a gradient goes through dirt. The start of
  the gradient is the same colour with zero opacity, so the transition stays clean in both themes,
  and a consumer who repainted the area gets their colour for free.

- **The icon sits on a ground of its own.** Without it the icon lies over dissolving content and
  reads as part of it: in a frame it cannot be told from a half-erased row.

## Open questions

None.

## History of changes

- 2026-09-15 — written by the task RT-1878, which carries the family over from the first kit.
