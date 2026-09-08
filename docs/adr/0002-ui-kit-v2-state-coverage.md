# ADR 0002 — The coverage of the states of `@rt-tools/ui-kit-v2`: the showcase and the checks

- **Status:** Accepted (a plan)
- **Date:** 2026-08-06
- **Area:** `@rt-tools/ui-kit-v2`

## The context

The showcase of the second kit shows 80 files of stories, and in 79 of them there is a single export
`Default`. The exception is one: `Autocomplete`, it has two. The components have no Docs pages at
all — `autodocs` is not switched on, `compodoc` is switched off in `project.json` by both goals of
the showcase.

What that means in practice: to see `outlined` + `warning` + `disabled` one has to open `Button`,
find three controls and set them by hand. A divergence visible only at such a combination is seen by
nobody — neither by the author of the edit nor by the reviewer.

The measurements as of 2026-08-06:

|                                                       |                                       |
| ----------------------------------------------------- | ------------------------------------- |
| Components and directives                             | 94 in 71 folders                      |
| Files of stories                                      | 80, of them with a single export — 79 |
| Components without stories                            | 14 (`UI-KIT-V2-ISSUES.md` §2.1)       |
| Stories drawing an empty array                        | 10 (`UI-KIT-V2-ISSUES.md` §2.3)       |
| Folders where the specs are fewer than the components | 11                                    |
| Specs in all                                          | 81                                    |
| Per-component `CONTEXT.md`                            | 72 + an index                         |

Apart from that: `CONTEXT.md` holds the contract of the behaviour ("the cross does not close the
tag", "the content is drawn by the directive itself"), but does not leave for the published package
— `ng-package.json` copies only `src/styles`, `src/assets` and `*.scss`. The consumer of the package
can read this contract nowhere.

A foreign showcase was taken as the sample: a page of an overview per component plus a set of
stories by the axes of the states. The moving of its form runs into four things we do not have: RTL
is supported by not a single selector (only logical properties), of the add-ons only `addon-docs` is
plugged in, the interactive states are styled in 27 SCSS files of 86, and 13 components open through
CDK Overlay and do not lie down into a static grid.

## The decisions

| #   | The decision                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Two layers, not one.** A page of an overview in MDX (the appointment, when to apply, the tables of the axes, the accessibility, the look) plus separate stories-matrices by the axes of the states.                                                                                                                                                                                                                                                               |
| 2   | **The table of the API is written by hand in MDX.** `compodoc` is rejected: it slows down the start of the showcase by the generation of `documentation.json` and draws the table by its own look, not by the needed one. The price of the decision is 72 copies of what is already written in the code; from a divergence it is held by the check `tools/verify-ui-kit-v2-docs.cjs`, which reconciles the names of the inputs in MDX with `input()` in the source. |
| 3   | **"All the states" = every axis whole plus the meaningful crossings.** Only the axes that visibly act on one another are multiplied. The full Cartesian product is rejected: at `Button` that is 1296 cells, at `Table` with 15 inputs — tens of thousands.                                                                                                                                                                                                         |
| 4   | **The interactive states are shown, not described.** `storybook-addon-pseudo-states` is put in (it demands a patch lifting of `storybook` to `^10.5.6`). Without it `hover`, `focus-visible` and `active` are never to be seen by the eyes.                                                                                                                                                                                                                         |
| 5   | **The grid is drawn by a common harness, not by 72 copies of the markup.** `projects/ui-kit-v2/src/showcase/` is created, added to the `exclude` of the build of the library next to `src/testing/**`.                                                                                                                                                                                                                                                              |
| 6   | **The overlays are laid out in two.** The presentational filling (the header of a dialog, an item of a menu, a toast, a panel) is put into a matrix as an ordinary component; the overlay itself is opened by a story with a `play` function pressing the trigger at the mounting. A native `click` — no new dependencies are needed.                                                                                                                               |
| 7   | **The dark theme does not double the volume.** The matrices are drawn in the current theme of the toggle; every component gets one story `Themes`, where the light one and the dark one stand side by side. It is possible because the dark one is declared by a mixin and is laid over any selector, not only over `:root`.                                                                                                                                        |
| 8   | **`CONTEXT.md` leaves for the package.** The contract of the behaviour is obliged to reach the consumer: the showcase has it not, and it is now cut out of the package. Together with that the link to the spec at the end of every file is removed — the package has no specs, and the link there hangs.                                                                                                                                                           |
| 9   | **The work goes by waves over the kinds of the components**, not by the alphabet and not in one go: atoms → form ones → overlays → composite → the remainder.                                                                                                                                                                                                                                                                                                       |
| 10  | **The requirements are written in three layers.** The law — by an override over `verifiability.md`; the rules — in `rt-tools-storybook` and `testing`, which `skill-gate.sh` gives out; the decision and its price — here.                                                                                                                                                                                                                                          |

## What this changes

**The volume.** About 430 exports of stories and 72 pages of MDX over the present 80 files.

**What will have to be fixed along the way** — otherwise the volume will multiply the existing
defects:

- `tsconfig.lib.json` excludes not `**/stories/**` but only `*.stories.ts`. The wrappers do not leave
  for the package only because the graph from `public-api.ts` does not reach them
  (`UI-KIT-V2-ISSUES.md` §2.7). With the growth of the number of the wrappers an accidental export
  becomes a matter of time.
- `nx lint @rt-tools/ui-kit-v2` gives 80 warnings `rt/require-host-bem-block`, all on the
  demonstration wrappers (§2.6). Every new wrapper adds one more; a real eighty-first one will drown.
- `skill-gate.sh` does not know the mask `*.mdx`. Seventy-two new pages would be edited without the
  giving out of the rule of the showcase.
- 10 stories draw an empty array (§2.3). A matrix without data will not help a component that needs a
  set of data — the sets will have to be created before the matrices.
- `agent-kit:check` falls: all six laws fell behind the package. The override is written after
  `agent-kit:sync`, otherwise it merges with an outdated base.

**What this does not give.** A matrix shows that a state was drawn, but not that it was drawn right:
the law `verifiability.md` demands a measurement, not a look. A comparison of the snapshots is not
created here — the question is taken out below.

## Open questions

- **Q-1 — by what it is checked that a matrix is complete.** Today "all the values of the axis are
  shown" stands on the attentiveness of the author: an axis forgotten in a matrix looks the same as
  an axis that has one value. The decision will change whether a check reading the type of the input
  appears for this.
- **Q-2 — whether a comparison of the snapshots is needed.** A matrix catches a divergence only when
  it is looked at. The decision will change whether an automatic comparison appears and what to count
  as its reference.
- **Q-3 — what to do with RTL.** The kit is written on logical properties, but there is not a single
  `[dir=]` in it, and what will happen in a right-side writing is checked by nothing.
