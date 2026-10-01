# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Texts, frames, showing; stages 1–4 done
- **Done:** stage 1 — live stories on the first kit's data; stage 2 — the phone menu matches the first kit's Mobile by measurement; stage 3 — favourites on the new `rt-expansion-panel`, with their preset pair; stage 4 — `[data-rt-scheme]` by the mixin `rt-color-scheme`, a scheme toolbar, the `Scheme` story
- **Next step:** 5.1 — bring the texts up: the tokens subdomain spec and the theming Overview must name `rt-color-scheme` and `data-rt-scheme`; the side menu spec and scenarios must name favourites, the panel folders and the phone column; then 5.2–5.4
- **Uncommitted:** nothing
- **Waiting for the owner:** no; every port is shown before a push — «я просил каждый перенесенный из первого кита модуль показывать мне перед отправкой в пр!!!»
- **PR:** not open yet

## Steps

- [x] 1.1 Carry the first kit's menu data into the second kit's story data with kit icons
- [x] 1.2 Make Playground a full-height live menu like the first kit's Default
- [x] 1.3 Add a story per first-kit menu state
- [x] 1.4 Look at every pair of frames, kit one next to kit two
- [x] 2.1 Compare the second kit's narrow layout with the first kit's Mobile by measurement
- [x] 2.2 Close what differs in the component
- [x] 2.3 Show the narrow menu live at phone width in its own stories
- [x] 3.1 Port the favorites logic and its spec
- [x] 3.2 Port the favorites block into the menu without Material
- [x] 3.3 Add the favorites stories after the first kit's eleven
- [x] 3.4 Write the scenarios and their tests
- [x] 4.1 Declare `[data-rt-scheme]` over the brand ramp in the kit's styles, the material preset too
- [x] 4.2 Add a scheme switch to the showcase toolbar
- [x] 4.3 Show the menu under a scheme in a story
- [>] 5.1 Bring the spec, scenarios, overview and context of the menu up to what was done
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

- **The folders and the favourites block stand on a new `rt-expansion-panel`.** The owner asked
  what plays the first kit's Material expansion panels and chose «Завести rt-expansion-panel
  (Recommended)»: a kit primitive of its own — a header button, a chevron column that can be hidden,
  an animated opening, `aria-expanded` with a labelled region — which the submenu folders and the
  favourites block move onto and other places of the kit may take. The primitive is created by the
  owner's word, as `reuse-first` demands. Affected stage: 3.

- **The second kit's snapshot harness learned the story's own window, `snapshot.viewport`.** The
  first kit shoots its Mobile stories in a 360 by 780 window; the second shot every story at 1280
  and faked the narrow screen by substituting the breakpoints service. Now the phone stories name
  the window, the kit finds the narrow screen by itself, and the showcase gets the same window in
  its viewport toolbar. Affected stage: 2.

- **A scheme answers on the root only, and the default menu stands in `Presets`, not in the same
  frame.** A step referred to by an assignment is resolved where the assignment is declared — on the
  root — so a scheme on an inner node would keep the old accent. The done sign wants «the menu under a
  scheme next to the default one»: the `Scheme` story and the `Presets` story stand side by side in
  the list. A Material theme of an application still wins in the material set: its
  `--mat-sys-primary` stands before the step. Affected stage: 4.

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

### 30 September 2026 — the expansion panel

- Done: `rt-expansion-panel` in the second kit — header button, hideable chevron, two-way
  `expanded`, a lazy body template, motion of the height by CSS; spec SC-UKV-472…478, seven
  tests; Overview, CONTEXT, six matrix frames looked at and taken. The submenu folders and the
  favourites block stand on it; three menu frames retaken from scratch match the old ones to the
  pixel, 47 menu frames pass, 2170 kit tests pass.
- Stumbled on: a collapsed card shrank to its content in a centred story cell — the host got
  `width: 100%`, as the accordion has. The panel writes its own state, so the favourites block
  keeps its expanded state in a linked signal: a collapse during search stays local and returns to
  the saved choice when the search ends.
- Then: the favourites got their preset pair — a `Favorites` story in the menu matrix, three
  cells (open, collapsed with the count, long titles) seeded with three rows so the divider shows.
  The live full-page favourites stories stay unpaired, the reason written at them and in the
  Overview. The Overview lost two stale lines: favourites «not ported yet» and the lock icon.

### 30 September 2026 — the narrow screen

- Done: the phone stories are shot in a 360 by 780 window, like the first kit's. Measured on the
  raster of both Mobile active menu frames: the column is 240 wide, the active pill spans 8–231,
  the icon starts at 24, the label at 56, the section arrow is an arrow as in the first kit; the
  header divider stands at 64, the first row at 118, the active row at 586, the footer divider at
  679 and «Logout» at 745 — all equal. The header and footer of the story wrapper moved by 8 and 4
  pixels to get there, which retook 27 live frames; each looked at and confirmed by a second run.
- Stumbled on: the narrow column grew to its longest label — a flex item's automatic minimum is its
  content; zeroed.

### 1 October 2026 — the colour scheme

- Done: `projects/ui-kit-v2/src/styles/_color-scheme.scss` — the mixin `rt-color-scheme($name,
$ramp)` emits `:root[data-rt-scheme]` with the brand ramp and the material blue step; the showcase
  declares a teal scheme with it, the toolbar «Схема» writes the attribute, the `Scheme` story shows
  the menu teal in both sets. 2170 kit tests, lint, token build and cascade layer checks pass.
- Not done: no test compiles the mixin yet, and no text names it — both belong to 5.1.

## Handover of the session

### Work

Work: RT-2440 «Боковое меню второго кита как в первом». Working tree —
/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools, branch RT-2440-kit2-side-menu-like-kit1
(taken from the epic branch RT-2353-one-kit-part-2, in progress). PR: not open.

The progress and the plan arrive at session start through the hook. The grill lies in the task
folder and is read when the reason for a decision is unclear.

Done: stages 1–4 of the plan, all committed locally, nothing pushed — the last work commit is
c6744d6e5. Next step: stage 5 — 5.1 texts (see «Next step» above), 5.2 frames, 5.3
`pnpm run check:all`, 5.4 links to the owner.

What to keep in mind in this session:

- nothing is pushed and no PR is opened until the owner says «отправляй» / «открывай»; every port
  from the first kit is shown to them first, the reply leads with :6007 links and the :6006
  counterpart;
- the pinned browser profile is not set up on this machine, so Chrome is not driven; frames are
  looked at through `node tools/visual-gate.mjs ui-kit-v2 --update '<path sample>'`, and measured on
  the raster with a pixel script kept in the scratchpad, not in the tree;
- in update mode a frame within the threshold is not rewritten — delete the reference first to
  retake;
- the showcases run as background tasks on 6006 and 6007; colima is up — stop it after the frames
  are done, the local database goes down with it;
- `rt-color-scheme` has no compile test yet; the tokens spec and the theming page get an article and
  a scenario for it in 5.1;
- the favourites, the expansion panel and the phone menu were shown to the owner; the scheme was not
  yet.

### Epic RT-2353 — «Один кит, часть 2»

| #   | Task                                                         | State       |
| --- | ------------------------------------------------------------ | ----------- |
| …   | earlier ports of the epic                                    | merged      |
| …   | **RT-2440 — the side menu of the second kit like the first** | in progress |
