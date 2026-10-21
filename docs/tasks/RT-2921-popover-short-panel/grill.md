# Grill

## The owner request

> Задача в кит, делаю сам (Рекомендую)

The answer was given to the question about a defect found in a consumer application: the header
panels in the fit-viewport mode are never lower than 120 points. The «More» panel with two items
is 240×120 while its content needs about 76, and an empty strip stands under the items.

## What the tree already has

- `RtPopoverDirective` in the `fitViewport` mode passes `minHeight: 120` to the overlay config.
- CDK reads that value from the config to decide whether the free space under the trigger is
  enough: `_canFitWithFlexibleDimensions`.
- CDK also writes the same value into the pane style on `attach` and on every `updateSize`, and
  the pane stretches its content to it.
- The header of the second kit opens the «More» panel and the section panels in this mode.

## What the rules already say

- `overflowing-text`: a box is as high as its content unless the design names another height.

## Questions and answers

**Как поступаем с высотой короткой панели?**
Задача в кит, делаю сам (Рекомендую)

## Decisions

- **The threshold stays in the config, and the pane loses its inline minimum height after each
  sizing.** CDK reads the config for the fit decision and does not read the pane style. Rejected:
  dropping the threshold, because a panel would then shrink to a strip where not one item is seen.
- **The test opens a panel in the mode and reads both: the config keeps 120, the pane style is
  empty.**

## What is left unclear

- Nothing.
