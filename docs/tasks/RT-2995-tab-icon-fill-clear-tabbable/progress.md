# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The showcase
- **Done:** stage 1 — the frames `7327:531` and `7327:1317` approved; stage 2 — `iconFill` and
  `badgePosition` on `rtTab`, `components.formControl.clearTabbable`, four crosses on
  `clearTabIndex()`, specs `rt-tabs-icon-badge.spec.ts` (6) and `rt-clear-tabbable.spec.ts` (4).
  The whole kit run: 282 files green before the last two tests were fixed; both rerun green.
  The multiselect: frame `7330:2735` approved, the cross goes as a neighbouring button with
  `clearTabbable` (SC-UKV-1084), `rt-clear-tabbable.spec.ts` now 7 green, the multiselect spec 25.
- **Next step:** 3.1 is begun — `Playground` of the tab takes `iconFill` and `badgePosition`. Next:
  a part `iconBadge` in `tabs/stories/component/test-tabs-matrix.component.ts` and a story of it in
  `tabs-matrix.stories.ts`, five strips as on the frame `7327:531`, laid by `app-story-row` with an
  items list like the part `iconOnly` (no bare stacking class: the showcase has none). Icons by
  Material glyphs that are not kit names — `grade`, `label`, `sell`: a kit name in the base preset
  does not fill, so the frame's `star`/`star-fill` pair is drawn by glyphs. Then the fields and the
  multiselect with the cross by Tab from the kit setting, the measurement against the three frames
  by `tools/kit-match.mjs`, and «одобряете?» on the showcase. The showcase on 6007 is the owner's:
  work with the running one.
- **Uncommitted:** nothing after the last commit.
- **Waiting for the owner:** no
- **Main is red apart from this work, task RT-2996:** typecheck of the chat spec (4 errors),
  `check:tokens-styles` 12 divergences in the messenger styles, `check:tokens-graph` 5 fallbacks in
  `rt-tabs.component.scss`. This branch touches that file, so its push waits for RT-2996 or goes
  with it.
- **PR:** not open yet

## Steps

- [x] 1.1 Draw the Figma frame: a tab strip with a filled and an outlined icon, and the four fields with the cross in focus.
- [x] 1.2 Show the frame to the owner and write the approval into `approvals.md`.
- [x] 2.1 Add `iconFill` to `rtTab` and pass it to the tab icon as `fill`.
- [x] 2.2 Add the node `formControl` with `clearTabbable` to the kit settings and read it in the shared base.
- [x] 2.3 Bind the cross of the autocomplete, the number field, the date picker and the date range to `clearTabIndex()`.
- [x] 2.4 Write the tests of SC-UKV-1080, SC-UKV-1081 and SC-UKV-1082.
- [>] 3.1 Add the stories: a tab with `iconFill`, the fields with the cross by Tab from the kit setting.
- [ ] 3.2 Measure the showcase against the frame and show both to the owner; write the approval.
- [ ] 4.1 Merge the agreement into `tab-additions` and `field-label-icon-actions`, bring the Overview pages and `CONTEXT.md` up to date.
- [ ] 4.2 Run the push set, take the folder apart, open the PR.

## Decisions along the way

- **The badge over the tab icon joins this task.** The owner answered «В RT-2995». It widens the
  steps without new ones: 1.1 draws a tab with the badge over its icon too, 2.1 adds
  `badgePosition` next to `iconFill`, 2.4 writes SC-UKV-1083 too, 3.1 shows the badge in the
  stories. Affected stages of the plan: 1, 2, 3.
- **The mockup goes into the file Design System V2** named by the owner. Affected stage: 1.
- **The fill reaches a kit name only under the material preset.** `rt-icon` draws a kit name in
  the base preset with one drawing; the agreement says so now. Affected stage: 2.
- **The overlay badge is anchored by its right edge 6 px past the icon and filled with the primary
  action colour.** Anchored at the icon corner, a two-digit count covered the title start. Affected
  stages: 1, 2.
- **The multiselect cross joins this task.** Found in stage 2: a fixed `-1` inside the trigger
  button. The owner answered «1 тоже». It goes as the select's neighbouring button, SC-UKV-1084,
  with a frame of its own approved before the code. Added steps, marked «m»: 1.m frame and
  approval, 2.m code and test. Affected stages: 1, 2.
- **The commit signature stays rt-tools-dev.** The owner: «2 не важно».
- **The Figma tab examples are detached copies of the Tab component with an icon added.** The Tab
  component has no icon slot; the frame shows the look, the component is not changed. Affected
  stage: 1.
- **The branch commits are signed by rt-tools-dev.** The tree guard refuses any other signature;
  the first commit was re-signed before any push. Affected stage: none.

## Sessions

### 2026-10-29

- Task RT-2995 created outside an epic, branch from main, card in progress.
- The application sent a third request, a badge over the tab icon; the owner put it into this task.

## Handover of the session

### Work

RT-2995 "Вкладка заливает иконку, крестик очистки доходит по Tab от умолчания кита". Working tree —
`/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools`, branch
`RT-2995-tab-icon-fill-clear-tabbable` (from main, card in progress, not pushed, no PR). Work
outside an epic. The owner's last word: «делай обе задачи» — RT-2995 and RT-2996.

### Where to look

The progress and the plan arrive by the hook. The grill and `approvals.md` lie in the task folder.
RT-2996 has its whole description in the issue: `gh issue view 2996`.

### Done and the next step

Done: stages 1 and 2 with the multiselect; `Playground` of the tab takes the two new inputs.
Next step: RT-2996 first — its branch from `origin/main`, fix the chat spec types, the messenger
styles for `check:tokens-styles`, the five tab token fallbacks for `check:tokens-graph`; then merge
main into this branch and go on with 3.1 as «Next step» above says.

### What to keep in mind

- RT-2996 is not a branch yet; `task:new` already created the issue, its folder was removed —
  `git checkout -b RT-2996-kit2-main-checks-red origin/main` and `npm run task:move -- 2996
in-progress`, then the task folder from the template.
- The assignment row of `rt-tools` in `.claude/rt-kit/assignments.md` names RT-2995 in this branch
  only; for RT-2996 the row is rewritten with the owner's word «делай обе задачи».
- Commits are signed by rt-tools-dev, the owner: «2 не важно».
- The showcase on 6007 is the owner's; nothing was raised by this session.
- Figma file: Design System V2, key `vyV42sJXccfKNG8yFSCpSL`, session frames `7327:531`,
  `7327:1317`, `7330:2735`.
