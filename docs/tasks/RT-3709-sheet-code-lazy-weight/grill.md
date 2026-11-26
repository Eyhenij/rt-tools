# Grill

Work begun from no cargo: the task came out of RT-3706, the repair of the epic RT-3530 after the merge
of the main branch; the kit weight check stayed red there.

## The owner request

> продолжай работу над основным эпиком

> В этой же задаче

The second is the owner's choice to the question «Как уменьшать вес?» with the option «В этой же задаче —
RT-3706 расширяется: я ищу, что из кода шторок можно вынести в ленивую загрузку, и показываю вам план».
The plan of RT-3706 is not edited after its commit, so the work goes into this task of the chain, from the
tip of RT-3706.

## What the tree already has

- `pnpm run check:kit-weight -- --print` on the epic with the main branch merged in: the start set 218731
  bytes, gzip 53502, against the threshold 185800 and 46632 (`tools/kit-weight-threshold.json`). Grown:
  bottom-sheet 7167 → 24268, the new part radio-button 8825, select 35426 → 38920, popover 9673 → 12365.
- The check bundles the start parts with esbuild with `splitting: true`: a chunk reached only by `import()`
  does not count (`tools/check-kit-weight.mjs:92-97`).
- The sample of a lazy kit piece: the code of the popover sheet loads at the first opening —
  `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts:53-75`, `rtPreloadPopoverSheet()`
  for the specs (RT-3645); the confirm dialog of a menu item — the same way (RT-3646).
- The question screen of a sheet lives in `rt-bottom-sheet.component.html:58-92` and its styles
  `rt-bottom-sheet.component.scss:180-` (`__confirm*`); 11 specs open it.
- `rt-select.component.ts:35` imports `RtRadioButtonComponent` only for the cards of the phone sheet
  (`rt-select.component.html:167-169`, inside `@if (cards())`).

## What the rules already say

- `kit-approval`: a kit file edited without a change of look goes by the owner's word that nothing visible
  changed; the plan names every kit file the check counts.
- `reuse-first`: a lazy piece is built the way the kit already builds one.
- `testing`: a spec is fixed so that it checks the same behaviour.

**Tasks of the grill:** 1

## Questions and answers

**Как уменьшать вес?**
В этой же задаче

## Decisions

- **The question screen moves into a component of its own, loaded at the first question, with a preload
  for the specs** — the same way as the popover sheet. Rejected: `@defer` in the template of the sheet —
  a second way of laziness in the kit, and its specs would wait differently from the sheet specs.
- **The radio button of the select cards is drawn by `@defer` that prefetches on idle** — one radio per row
  cannot be created imperatively without a second template of the row. Rejected: dropping the kit radio
  from the cards — a change of look the owner approved otherwise.
- **The threshold is lowered by `--write` to the measured weight only after the measurement.** A remainder
  above 185800 goes to the owner with its numbers.

## What is left unclear

- How much each move cuts is known only after the measurement; the plan names an upper bound.
