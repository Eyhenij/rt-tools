# Grill

## The owner request

> Взять обе по очереди

The answer to the question whether to take the two tasks left over from the rules proposals:
RT-2448 first, then RT-2447. The task body: the themes pair of the second showcase stands on a
fixed 18rem track, and a component wider than half the page is cut or slides onto the neighbour
while the frame stays green.

## What the tree already has

- `projects/ui-kit-v2/src/showcase/story-themes.component.scss` — the panes are a grid of
  `repeat(auto-fit, minmax(18rem, 1fr))`.
- `projects/ui-kit-v2/src/showcase/story-presets.component.scss` — the pair of presets already
  wraps by the width of its content: a flex row, `flex: 1 1 18rem`, `min-inline-size: min-content`.
- 93 files of the showcase use the themes pair.

## What the rules already say

- `rt-tools-storybook`: the halves wrap by the width of their own content, not by a threshold in a
  length unit; the Gotchas name the fixed track of the themes pair as an open miss.
- `ui-component-tests`: a reference is taken after the frame is looked at, re-taken one at a time,
  and confirmed by a second raising.

## Questions and answers

No questions: the task names the miss and the rule names the technique.

## Decisions

- **The themes pair takes the technique of the presets pair.** One technique for both pairs.
  Rejected: a wider track — it moves the threshold, it does not remove it.
- **A pair asked to fill keeps shrinking below its content.** A list in a half holds its table by
  its own scroll; a minimum by content would push the half to the table's width.
