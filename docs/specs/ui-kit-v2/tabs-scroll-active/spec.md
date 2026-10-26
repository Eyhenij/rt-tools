# The tab strip scrolled to the selected tab

**Status:** in force · **Revision:** 24 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tabs of the second kit — the behaviour lives inside `rt-tabs`
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-2940 together with the code.

## Why

A screen with tabs opens by its address straight on the needed tab, and the tab comes in by the
`activeId` input. On a narrow screen the strip stood at its start, the selected tab lay past the
right edge, and a person did not see where they were. The strip scrolled only on a click. The
application cannot fix this: the strip and its scroll live inside `rt-tabs`.

## Terminology

| Term              | What it is                                                            |
| ----------------- | --------------------------------------------------------------------- |
| the strip         | the horizontal row of tab buttons that scrolls when it does not fit   |
| an arrow          | the scroll button over the left or right edge of the strip            |
| an outside change | a new value of `activeId`, or a new set of tabs, not a click or a key |

### What it is called in the interface

A person sees the row of tabs; the selected one is underlined.

## Rules

- **After the first render the strip is scrolled to the selected tab.**
- **An outside change of the selected tab scrolls the strip to the new one.**
- **A click or a key scrolls the strip once.** The scroll runs from the selection, and the render
  after it does not scroll again.
- **The first scroll goes at once, a later one moves as a click does.** An opened page does not
  ride to its tab; a change on an open page moves the strip with the motion of `animationDuration`.
- **The selected tab is seen whole.** With the arrows over the strip, a tab that is not at the end
  of the strip is scrolled past the width of the arrow that stays over it. With `scrollArrows`
  `inline` the arrows stand beside the strip, and the tab goes up to the edge.
- **The arrows are recomputed after every such scroll.**
- **A tab already seen whole does not move the strip.**

## What is out of scope

- The vertical direction: it has no arrows, and its column is scrolled by the page.

## Contract

Not applicable: the behaviour adds no inputs or outputs.

### Refusal codes

Not applicable.

## Data

Not applicable: the behaviour keeps nothing.

## Screens and states

| State                                          | What is visible                                     |
| ---------------------------------------------- | --------------------------------------------------- |
| opened with `activeId` on the last tab         | the strip scrolled to its end, the left arrow shown |
| `activeId` changed to a tab past the left edge | the strip scrolled back, the tab clear of the arrow |
| the selected tab fits in the strip             | the strip stays where it was                        |

## Cross-cutting requirements

### Locales

Not applicable: the behaviour adds no labels.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

This is the case the subdomain is written for: at 375 and 768 the strip does not fit, and the
selected tab is scrolled into it.

### Several objects

Every strip scrolls apart.

## Decisions

- **The initial scroll runs in `afterNextRender`, a later one in an after-render effect.** Both
  remember the tab they scrolled to, so the effect skips a tab the click already scrolled to.
- **The arrow width goes into `rtTabsIntoViewTarget` as an argument.** The target stays a pure
  function checked by a call, and a click and an outside change get the same target.

## Open questions

None.

## History of changes

- 24 October 2026 — written together with the code by task RT-2940 from the application's request.
