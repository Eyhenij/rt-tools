# Grill

## The owner request

> найди тикет с обрезкой лейблов в селекторе

> сегодня смотри тикет заводился точную формулировку не помню

> rt-select возмоджно другие компоненты в маленьком размере точно а может и в другие обрезает снизу лейбл

> бери в работу

No such ticket existed in the queue, on the board or in the owner's other repositories; task
RT-2526 was created from the owner's description and taken by «бери в работу».

## What the tree already has

- The field line height `--rt-input-line-height` is `var(--rt-leading-none)`, that is `1`; its
  source is `projects/ui-kit-v2/src/styles/tokens.light-forms.mjs`, built into the styling layer.
- `rt-select__label` has `overflow: hidden` with an ellipsis, inside a trigger with that line height.
  Montserrat descends about a quarter of the size below the baseline, past a line box of `1em`.
- The field heights come from `min-height` (`--rt-control-height-*`: 32, 40 px …) with a zero
  vertical padding, not from the line box, so a taller line box fits inside them.
- The same line height is read by the input, the number input, the autocomplete, the multiselect,
  the date picker and the date range; the list filter cell reassigns it.
- The pinned browser profile of this machine is not set: `.claude/rt-kit/browser-device-id` is
  missing, so the driver is not used. Showcase frames are the tree's other way to see it.

## Questions and answers

**The ticket did not exist — RT-2526 was created. Take it?**
бери в работу

## Decisions

- **The fix goes into the field line height, not into each component.** One assignment answers for
  every field that reads it. Rejected: dropping `overflow: hidden` — the ellipsis needs it.
- **The field heights do not change.** They are set by `min-height`; the frames confirm it.
- **The check is a story with descender text in every field at every size, drawn enlarged.** The
  pinned browser profile is not set, and an enlarged frame shows a clipped tail plainly.
- **Components outside the fields are fixed only where the new story or a frame shows the clip.**

## What is left unclear

- Nothing.
