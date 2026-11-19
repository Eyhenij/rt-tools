---
name: rt-tools-storybook
kind: rule
law: verifiability
description: This tree's rule about the showcase: the TestRt*Component wrapper, story typing, environment decorators, controls, the state-coverage contract. Take it when creating or editing any story or showcase page. The pattern is rt-tools-storybook-story.
---

# Storybook

Rule under the law `docs/constitution/verifiability.md`. Cold part: `pitfalls.md` — the whole text,
every section and article with its reasons, what `preview.ts` gives, the gotchas.

## How the law applies here

- **A story targets the wrapper, not the kit's component.**
- **Covered is every input axis at every value at once.** Axes cross only where they affect one
  another; an axis that cannot be shown is declared with a reason; an empty collection is no
  coverage.
- **The arg-driven page is `Playground`, or the family names why not.**
- **A component is counted apart from its family; one shown in a neighbour's story is named.**
- **A styling preset wraps the matrix as a pair of halves, never an axis.** Every story it touches
  gets the pair; halves wrap by content width; a one-instance showing asks for its half's width; a
  showing with no pair says why.
- **A component that does not give its width collapses in a half; its cell gets a width by name.**
- **A component sized by its parent gets a box of the showing, its surface too.** Re-measure the
  cell width when the component learns to shrink.
- **A window-pinned component needs a containing-block box; a window-tall one a clipping box.**
- **The grid is drawn by the shared showing harness.**
- **A provider the component needs stands in `preview.ts`; one screen's demo state is a story
  decorator.**
- **A template-level story shows a whole screen, outside the coverage contract.**
- **A link between showcase pages dies with a section rename; a link to an unmigrated family is not
  written.**

## Levels and the contract

- **The level follows what the component is made of; a child part stands in its parent's group.**
  Overlay or records: organism; other kit inside: molecule; none: atom. The title starts with the
  level, and a rename renames its snapshot references.
- **A foundation story lives by the harness, outside the contract.**
- **A wrapper overriding the component's own property breaks encapsulation.**

## Names and techniques

- Each component: `Overview` (MDX), `Playground` (or why not, on Overview), a story per axis,
  `States`, `Themes`.
- Links come from the showcase's helper; demo data is invented; `.storybook/` edits pass
  `build-storybook:ui-kit-v2`; `play` awaits `document.fonts.ready`; a narrow-only node's state
  is shown by a narrow-from-start wrapper.

## Patterns

- `rt-tools-storybook-story` — a ready-made story.
