# Plan

**Task:** RT-3709 · **Branch:** RT-3709-sheet-code-lazy-weight
**Behaviour:** unchanged — владелец: «В этой же задаче» на вопрос «Как уменьшать вес?»; вид и поведение шторок те же, меняется только то, когда приходит код экрана вопроса и радиокнопки карточек

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** after the merge of the main branch the kit set an application takes at start weighs 218731 bytes
  against the threshold 185800; the epic RT-3530 cannot be pushed.
- **This task reaches:** an application that opens no sheet question and no phone select does not load
  their code at start; the start set gets lighter, the sheets look and act as before.
- **Sign:** `pnpm run check:kit-weight -- --print` prints the set lower than 218731; the kit suite and the
  showcase snapshots of the sheets stay green.
- **Milestone G of the epic:** all edits of the epic are merged into the main branch and ready for a kit
  release.
- **Metric:** нет: рост стартового набора кита на 32931 байт после слияния главной в эпик

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.component.ts:RtBottomSheetConfirmComponent` — draws the question screen of a sheet from its labels and reports the answer; shows the class alone. `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts:rtLoadSheetConfirm` — loads the code of the question screen once by `import()`, calls before it arrives share one promise; shows `rtLoadSheetConfirm` and `rtPreloadSheetConfirm`. `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:RtBottomSheetComponent` — creates the question screen in its place when the question is shown. `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:RtSelectComponent` — draws the radio of a card in a deferred block of its template |
| Dependencies | the sheet imports the loader; the loader imports the question component only by `import()`; the question component imports the core directives and the model of the sheet and never the sheet; the select imports the radio as before, used only inside `@defer` |
| Coupling | `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts` outgoing 11 → 12; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` outgoing 0 → 1; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.component.ts` outgoing 0 → 4; `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts` outgoing 13 → 13; cycles none; imports past the entry none |
| Patterns | Virtual Proxy — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts:rtLoadSheetConfirm`; the question screen is needed by few sheets and weighs every start; dropped: `@defer` in the template of the sheet — a second way of laziness next to the popover sheet. Deferred view — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:RtSelectComponent`; one radio per row has no imperative place; dropped: cards without the kit radio — a change of look |
| Terms | no new word: «шторка», «вопрос шторки» and «карточка выбора» stand in the glossary |
| Input | no input: the question screen takes the same labels from the sheet as now, the select the same options. SC-UKV-1757, SC-UKV-1761, `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`; SC-UKV-1795, `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts` |
| Bounds | the public entry of `@rt-tools/ui-kit-v2/bottom-sheet` keeps its symbols and adds `rtPreloadSheetConfirm`; the anchors `bottom-sheet-confirm*` and the focus on the apply row stay; the look of the question and the cards does not change by a pixel |
| Priority | the start weight over the first answer time: the question code arrives by the time a person presses «×» with unsaved edits — it is fetched on the first open of a sheet with `unsaved` |
| Budget | `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts` plus 30; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.component.ts` up to 90 lines; `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts` up to 40 lines; `projects/ui-kit-v2/src/lib/components/select/rt-select.component.html` plus 6; new code files: 4; new dependencies: 0 |

## Task footprint

| What              | Where                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Specs (правится)  | `docs/specs/ui-kit-v2/sheet-header-cards/`                            |
| Code (правится)   | `projects/ui-kit-v2/src/lib/components/bottom-sheet/`                 |
| Code (правится)   | `projects/ui-kit-v2/src/lib/components/select/`                       |
| Code (правится)   | `projects/ui-kit-v2/src/lib/components/`                              |
| Code              | `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts`, `tools/check-kit-weight.mjs` |
| Rules             | `.claude/skills/kit-approval/`, `.claude/skills/reuse-first/`, `.claude/skills/testing/` |

## What counts as done

- The code of the question screen of a sheet is not in the start set; the specs that open a question wait
  for its code the way the sheet specs wait for the popover sheet.
- The radio of a select card is not in the start set; the cards look the same once the sheet is open.
- The kit suite is green, and the start set is lighter than 218731 bytes by the measurement.

## Stages

### 1. The question screen arrives at the first question

- **Steps:**
    1. Move the question screen of the sheet into its own component, loaded at the first question, with a preload for the specs
       Check: `test -f projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.loader.ts && cd projects/ui-kit-v2 && pnpm exec jest --maxWorkers=2 src/lib/components/bottom-sheet src/lib/components/aside src/lib/components/date-picker src/lib/components/date-range src/lib/components/dynamic-selector src/lib/components/toolbar src/lib/components/page-header src/lib/components/container` → exit 0
- **Readiness sign:** every spec that opens a question passes.
- **Verified by:** the check of step 1.1 — exit 0.

### 2. The radio of the cards arrives with the cards

- **Steps:**
    1. Draw the radio of a select card in a deferred block that prefetches on idle
       Check: `grep -q '@defer' projects/ui-kit-v2/src/lib/components/select/rt-select.component.html && cd projects/ui-kit-v2 && pnpm exec jest --maxWorkers=2 src/lib/components/select src/lib/components/multiselect src/lib/components/table src/lib/components/dynamic-selector src/lib/components/autocomplete src/lib/components/radius` → exit 0
- **Readiness sign:** every spec of the cards passes.
- **Verified by:** the check of step 2.1 — exit 0.

### 3. The weight is measured

- **Steps:**
    1. Measure the start set
       Check: `set -o pipefail; pnpm run check:kit-weight -- --print 2>&1 | awk '/итого/{print $2}'` → <= 212000
    2. Run the whole kit suite
       Check: `test -f projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-confirm.component.ts && pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --skip-nx-cache` → exit 0
- **Readiness sign:** the set is lighter by at least 6700 bytes, the kit suite is green.
- **Verified by:** the checks of steps 3.1 and 3.2.

## What this work does not do

- The threshold of the weight is not rewritten here: the measured remainder above 185800 goes to the
  owner with its numbers, and the threshold takes the owner's word.
- The second screen and the keyboard lift of the sheet stay at start: they are logic of the sheet itself,
  not a screen, and moving them needs a design of its own.
