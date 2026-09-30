# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — The narrow screen as a live menu; stage 3 done ahead of it by the owner's word
- **Done:** stage 1 — seventeen live stories on the first kit's data; stage 3 — favourites without Material and their eleven stories, 11 frames looked at and taken
- **Next step:** show the owner the favourites pairs, then compare the narrow layout with the first kit's Mobile by measurement
- **Uncommitted:** nothing
- **Waiting for the owner:** no; every port is shown before a push — «я просил каждый перенесенный из первого кита модуль показывать мне перед отправкой в пр!!!»
- **PR:** not open yet

## Steps

- [x] 1.1 Carry the first kit's menu data into the second kit's story data with kit icons
- [x] 1.2 Make Playground a full-height live menu like the first kit's Default
- [x] 1.3 Add a story per first-kit menu state
- [x] 1.4 Look at every pair of frames, kit one next to kit two
- [>] 2.1 Compare the second kit's narrow layout with the first kit's Mobile by measurement
- [ ] 2.2 Close what differs in the component
- [ ] 2.3 Show the narrow menu live at phone width in its own stories
- [x] 3.1 Port the favorites logic and its spec
- [x] 3.2 Port the favorites block into the menu without Material
- [x] 3.3 Add the favorites stories after the first kit's eleven
- [x] 3.4 Write the scenarios and their tests
- [ ] 4.1 Declare `[data-rt-scheme]` over the brand ramp in the kit's styles, the material preset too
- [ ] 4.2 Add a scheme switch to the showcase toolbar
- [ ] 4.3 Show the menu under a scheme in a story
- [ ] 5.1 Bring the spec, scenarios, overview and context of the menu up to what was done
- [ ] 5.2 Take the new frames after looking at them
- [ ] 5.3 Run the whole check set
- [ ] 5.4 Show the owner the pairs of links before any push

## Decisions along the way

- **The colour scheme is declared over the brand ramp.** The second kit's accent derives from
  `--rt-brand-*`, so a scheme block overriding that ramp repaints the menu the way the first kit's
  `[data-rt-scheme]` does. Affected stage of the plan: 4.

- **Under the material preset only the cog is filled.** The other icons of the first kit's data
  have no filled pair in the kit's set, so they stay outlined; the first kit draws them all filled.
  Named to the owner, not closed here. Affected stage of the plan: 1.

- **A side menu icon outside the kit's set gets the technique of RT-2412.** The owner asked how
  such icons reach the menu and pointed at the ticket. Today `rt-side-menu` hands `item.icon`
  straight to `rt-icon`: a Material name from the first kit's data draws nothing and says nothing.
  `rt-menu-item` already solved this under RT-2412 — a Material name through
  `rt-icon-material-map.ts`, an own icon by a template, a dev-mode warning for a name without a
  pair. The side menu takes the same three, with the same pure functions, rather than a technique
  of its own. Affected stage of the plan: 3, next to the favorites, whose rows carry icons too.

- **Stage 3 went before stage 2 by the owner's word.** «почему нет сторис во втором ките с
  избранным разделом??????» — the favourites were ported at once, the narrow comparison waits. The
  owner also said the side menu port had to be one task: «сайд меню перенос это должна была быть
  одна задача!!!» — the favourites stay in RT-2440, no task of their own. Affected stage: 2 and 3.

- **The second kit's snapshot harness learned a real hover, `snapshot.hover`.** The first kit's
  «…Hover» favourites stories are shot under the pointer; a focus set by a story step did not live
  to the frame. The parameter hovers the named nodes after the window is fitted, right before the
  shot. Affected stage: 3.

## Sessions

### 2026-09-30

- Task RT-2440 created from the owner's remarks on #2421; the branch taken from the epic branch.
- Frames compared: the first kit's menu is live and full height with eleven sections, the second
  kit's stories are small static boxes with three placeholder sections.
- Stage 1: the story data `side-menu-story-data.ts`, the live wrapper and its phone twin, 17
  stories, the matrices on the same data; `visual-gate side-menu` — 25 of 25 passed after retaking.
- Stumbled on: the wrapper's styles did not reach its host under emulated encapsulation, so the
  frame grew to 916 instead of 720; a `render` with `component` is ignored by the showcase.

### 2026-09-30 (continued)

- Stage 3: the favourites logic and 17 tests, the settings service, the block `rt-side-menu-favorites`
  on CDK drag and kit buttons, the star and «убрать» in the row, labels in English and Russian,
  scenarios SC-UKV-467…471, the Overview; 11 favourites frames taken, 713 of 713 frames of the kit
  match.
- Stumbled on: a `:not(:hover, :has(...))` width rule was not recomputed by the browser on hover —
  replaced by a plain rule that gives the width back.
