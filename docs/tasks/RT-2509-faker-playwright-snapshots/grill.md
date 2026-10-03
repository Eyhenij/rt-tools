# Grill

## The owner request

> обнови npm пакеты

The majors of that request were moved into the list RT-2081. Its last movable item is two packages
that change the showcase frames: `@faker-js/faker` and `@playwright/test`. RT-2509 takes them
after RT-2507.

## What the tree already has

- `@faker-js/faker` 10.5.0 and `@playwright/test` 1.62.1 in the root manifest; 10.6.0 is from
  2026-08-14, 1.63.0 from 2026-09-04.
- faker is called only by the first kit's showcase: its storybook preview and the stories of the
  table and the dynamic selectors.
- `pnpm-workspace.yaml` holds the showcase runner on Playwright 1.62.1, with the reason: 1.63 draws
  the textarea resize grip differently, and seven second-kit frames diverge.
- NestJS 12 from the same list is blocked: `@nx/nest` 23.2.1, and 23.3.0-beta.9 as well, declare
  `@nestjs/core >=10.0.0 <12.0.0`.

## What the rules already say

- ADR 0003, items 2 and 11: the first kit is not edited at all, its showcase included, and its 85
  reference frames are the sample for the before-and-after comparison.
- `dependencies`: an exact number; the upper bound comes from peer ranges.
- `testing`: references are updated by a separate call and read by eye.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: faker stays on 10.5.0. It feeds only the first kit's showcase, and
  a re-take of its frames would replace the sample ADR 0003 keeps for the comparison. Rejected:
  raising faker together with a re-take — it breaks item 11 of an accepted decision.
- Question closed by assumption: Playwright goes to 1.63.0 together with the runner's line, and the
  second-kit frames it changes are re-taken and read by eye.

## What is left unclear

- Nothing.
