# Grill

## The owner request

> RT-2972 сейчас, потом RT-2965 (Recommended)

Said 2026-10-28 in answer to the question: the push of RT-2965 is refused by the snapshot check of
the second kit — after #2963 (RT-2957) 21 references lag behind the outlined «Отмена» button, and 6
more have no story; how to proceed. Options: «RT-2972 сейчас, потом RT-2965 (Recommended)»,
«Переснять в ветке RT-2965», «Ждать сессию RT-2957».

## What the tree already has

- `node tools/visual-gate.mjs ui-kit-v2` on fresh main: 21 snapshots failed in 7 suites, 6
  references without a story — `organisms-aside-aside--*--w768.png`.
- The diff frames lie in `projects/ui-kit-v2/.storybook/__snapshots__/__diff_output__/`: the aside
  footer, the unsaved dialog, the aside, the confirm dialog, the confirm popover, the data list
  settings and the list page — every one is a footer or a confirm with the «Отмена» button.
- RT-2957 made that button outlined by the approved mockups; its PR CI skipped the visual steps
  after the E2E admin step failed.
- Pattern `ui-component-tests-visual`: a pointed re-take goes by
  `node tools/visual-gate.mjs ui-kit-v2 --update '<path sample>'`; an orphan list is read after the
  divergences are cured — the `w768` frames are second-width frames a fallen first frame never
  reached.

## Questions and answers

Question closed by assumption: behaviour does not change — only references are re-taken.

Question closed by assumption: no law or rule edit.

Question closed by assumption: one task.

Question closed by assumption: not part of the task — the failed E2E admin step of #2963.

Question closed by assumption: closed when the snapshot check of the second kit shows 0 failed and
no orphan references.

Question closed by assumption: sample — the re-take commit `82247c53c`.

## Decisions

- **The orphan references are not deleted up front** — they are second-width frames of the failed
  aside stories and are expected to come back after the re-take. Rejected: deleting them on sight.
