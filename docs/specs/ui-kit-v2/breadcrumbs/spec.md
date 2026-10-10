# The breadcrumbs

**Status:** in force · **Revision:** 10 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon button, the menu and the tooltip of the kit; the breakpoints service
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-breadcrumbs`, written by task RT-2552 of the epic RT-2542,
which moves the applications' shared parts into the kit.

## Why

Two applications that install the second kit draw the path to the open page on their own. One shows
the parent as a link, the current section and a back button. The other shows the chain of ancestors
and the page title under it. Each writes and fixes its own copy; the kit has no breadcrumbs.

## Terminology

- **A crumb** — one step of the path: a label and, for an ancestor, a link.
- **The chain** — the crumbs from the top of the path to the open page, in that order.
- **The current crumb** — the last crumb of the chain: the open page itself.
- **An ancestor** — any crumb before the current one.
- **The fold** — the ancestors between the first and the last one, hidden behind a menu button.

### What it is called in the interface

| In the domain     | On the screen                                          |
| ----------------- | ------------------------------------------------------ |
| An ancestor       | a muted link, a separator after it                     |
| The current crumb | the page name in the text colour, or the page heading  |
| The back button   | an arrow left of the chain                             |
| The fold          | the «…» button between the first and the last ancestor |

## Rules

- **The chain comes as an input; the ancestors are links and the current crumb is text.** The
  current crumb carries `aria-current="page"`, and a separator stands between neighbours.
- **The host is a navigation landmark named by the kit's label.**
- **The back button is drawn only on request and only when the chain has an ancestor.** It leads to
  the last ancestor, and its name says where it leads.
- **In the heading look the current crumb is the page heading on a row of its own.** What the page
  projects into the component stands in the same row, after the heading.
- **On a narrow screen a chain of three ancestors and more folds its middle into a menu.** The
  first and the last ancestor stay links, and the menu lists the folded ones as links in order.
- **The separator is an input, and its default is the slash.**
- **A long chain does not push the page sideways.** It scrolls inside its own row, and the row
  stands at its end, so the open page stays in sight. A current crumb wider than the row alone is
  cut and shows its full label in a tooltip.
- **A long current crumb gives way to its ancestors while they fit next to its threshold.** When
  the ancestors fit next to the current crumb cut to `--rt-breadcrumbs-current-min`, or to its whole
  label if that is shorter, the crumb shrinks with an ellipsis and the row does not scroll, so the
  section stays in sight.

## What is out of scope

- Building the chain from the router: the application knows its routes and the names of its
  records, and passes the chain itself.
- The application's own page bars: the side-menu burger and the docked header of one application.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the chain lives in the application.

## Screens and states

| state             | what is drawn                                                              |
| ----------------- | -------------------------------------------------------------------------- |
| one crumb         | the current crumb alone                                                    |
| a chain           | the ancestors as links, separators, the current crumb                      |
| with back         | the arrow before the chain                                                 |
| heading look      | the ancestors on the first row, the heading and the projection on the next |
| narrow, long      | the first ancestor, «…», the last ancestor, the current crumb              |
| long current text | the text cut with an ellipsis, the tooltip on hover                        |

## Cross-cutting requirements

### Locales

The landmark name, the back button name and the fold button name are kit labels, English in the
package and translated by the consumer's translator. The crumb labels come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow screen folds the middle of a long chain; the sign comes from the kit's breakpoints
service.

### Several objects

Not applicable.

## Decisions

- **One component covers both applications.** The two differ by the length of the chain and by how
  the current crumb is drawn, so the look is an input rather than a second component.
- **The chain is an input, not a router service.** The second application builds it from the route
  snapshot, but the name of an open record arrives with the server's answer and is known only to the
  page.
- **The fold is a menu, not a scrolled row.** On a narrow screen a scrolled row hides the top of the
  path without a sign; the menu keeps every ancestor one press away.

## Open questions

None.

## History of changes

- 8 October 2026 — written by the task RT-2552 of the epic RT-2542.
- 10 October 2026 — after a comparison with the application, a long current crumb gives way to its
  section, and the material links take the theme's secondary text.
