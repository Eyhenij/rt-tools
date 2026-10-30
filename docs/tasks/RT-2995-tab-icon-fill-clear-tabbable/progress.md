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
- **Uncommitted:** the part `iconBadge` of the tab matrix and its story `IconBadge`; the icons in it wait for the owner.
- **Waiting for the owner:** how the showcase draws the filled icons of the frame `7327:531`.
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

- **The showcase cannot draw the frame's filled icons as the kit stands.** The second showcase loads no
  Material Symbols font, so a glyph outside the kit list is drawn as its word. A kit name fills only
  in the material preset and only where a material drawing lies: of `star`, `bookmark` and `flag`
  only `star` has one. Affected stage: 3.
- **Main merged, RT-2996 closed as done by #3002.** The owner chose «Закрыть, взять RT-2995».
  Affected stage: none.

## Sessions

### 2026-10-29

- Task RT-2995 created outside an epic, branch from main, card in progress.
- The application sent a third request, a badge over the tab icon; the owner put it into this task.
