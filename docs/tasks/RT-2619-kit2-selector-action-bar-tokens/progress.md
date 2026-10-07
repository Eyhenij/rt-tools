# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 7 of 7 — all stages done (stages 6 and 7 were appended by the owner)
- **Done:** stages 1–4 and 6, step 7.1; texts, specs and stories brought up; the browser check of the
  popup, the bar and the icon with measurements. The first full snapshot run moved only the three
  touched story files (12 frames), 206 suites matched; the 12 frames are re-taken and read by eye.
- **Next step:** the merge of main, the folder taken apart and the PR. The second full snapshot run
  matched 780 of 780 frames in 209 suites; the kit builds; lint, types, styles and 2523 tests green.
- **Uncommitted:** everything after e98351e33.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Remove `display: block` from the popup search
- [x] 1.2 Add inputs invitationButtonIcon, invitationButtonAppearance, clearIcon, searchAppearance, emptyResultsText
- [x] 1.3 Add the popup and list properties of items 8–24 and the empty-state property of item 25
- [x] 2.1 Draw trash-x and add it to the name union
- [x] 2.2 Pair delete_forever with trash-x in the Material map
- [x] 3.1 Add inputs invitationButtonIcon, invitationButtonAppearance, clearIcon, fieldAppearance
- [x] 4.1 Turn the bar and holder properties into consumer handles with defaults
- [x] 4.2 Add the seven new bar properties
- [x] 4.3 Add glyph to the action and closeIcon to the bar and holder
- [x] 4.4 List the handles in tokens-handles.json and Theming.mdx
- [x] 5.1 Update Overview.mdx, CONTEXT.md and the two domain specs
- [x] 5.2 Add the new inputs to the stories and take the touched snapshots anew
- [x] 5.3 Check the popup and the bar in the browser on :6007
- [x] 5.4 Run lint, types, tests, the styles linter and the build of the kit
- [x] 6.1 Add the glyphStrategy input on the instance
- [x] 6.2 Put the glyph axes weight, grade and opsz into font-variation-settings
- [x] 6.3 Add the colours primary and disabled and turn every colour into a handle
- [x] 6.4 Take the size steps from handles and add 3xl and 4xl
- [x] 7.1 Read the popup properties from any ancestor with the defaults under `-default`
- [x] 7.2 Re-take the touched snapshots and confirm no other frame moved

## Decisions along the way

- **The add button colour is a consumer handle, its weight, indent, row padding and reset colour are
  declared on the list.** The add button is projected by two hosts with different looks — secondary
  on the selector, primary on the input — so one declared default would repaint one of them.
  Affected stage: 1.
- **The empty-state title colour got a property of its own.** Item 19 needs something to set, and the
  empty state painted its title by a step in place. Affected stage: 1.
- **The close button size goes through the icon button's own step, not `--rt-icon-button-size`.**
  That name is the application's handle; declared by the kit it made the icon button's fallback a
  refusal of the token graph. Affected stage: 4.
- **A Material font glyph without a kit pair keeps its step size.** `rt-icon` writes the glyph size
  as an inline style; the bar sizes the icon box by min and max, as the empty state does. Named in
  the PR. Affected stage: 4.
- **The fetch script rewrites every Material drawing unformatted; only the new trash-x pair is
  kept.** The rest differ from the tree by formatting alone. Affected stage: 2.

- **The plan got a sixth stage appended, not rewritten.** The owner added the rt-icon list to this
  task after the plan was written; the step check matches the plan and the progress line by line,
  so the new steps stand in both. The five written stages are untouched. Affected stage: 6.
- **The empty result of the popup lost `display: block` too.** It broke the empty state's centred
  stack the same way the search lost its layout: the icon stood at 90 against the block's centre at
  201; after the edit both are 201. Affected stage: 5.
- **The ancestor wrapper in the bar story is `display: contents`.** As a box it took the width of
  its content and the bar stopped wrapping inside the 30rem cell; without a box the cell gives the
  bar its width and the ancestor properties still inherit. Affected stage: 5.

- **`size()` of the icon keeps the step or the pixels, and the CSS length is a computed of its
  own.** A CSS string in the public input broke the kit's specs reading it as a number; the step is
  the meaningful value to a reader. Eighteen expectations of neighbouring specs moved from pixels
  to the step property; two data-table specs took `pets` as the unpaired name, since
  `delete_forever` now has the pair `trash-x`. Affected stage: 6.
- **The optical size of the ligature defaults to the icon side** — see the grill. Affected stage: 6.

## Sessions

### 2026-10-07

- Task RT-2619 created, branch from main, the copy's assignment row brought back to RT-2542 with a
  line on this work outside it.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2619-kit2-selector-action-bar-tokens

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Texts, stories and checks
- **Next step:** update Overview.mdx, CONTEXT.md and the two domain specs.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2619-kit2-selector-action-bar-tokens/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/action-bar/implementation.md
 M docs/specs/ui-kit-v2/action-bar/scenarios.md
 M docs/specs/ui-kit-v2/action-bar/spec.md
 M docs/specs/ui-kit-v2/dynamic-selectors/implementation.md
 M docs/specs/ui-kit-v2/dynamic-selectors/scenarios.md
 M docs/specs/ui-kit-v2/dynamic-selectors/spec.md
 M docs/tasks/RT-2619-kit2-selector-action-bar-tokens/progress.md
 M projects/ui-kit-v2/docs/Theming.mdx
 M projects/ui-kit-v2/src/lib/components/action-bar/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/action-bar/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.html
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.scss
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.ts
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.html
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.ts
 M projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.model.ts
 M projects/ui-kit-v2/src/lib/components/action-bar/stories/action-bar-matrix.stories.ts
```

### Commits over the main branch

```
e98351e33 docs(rt:ui-kit-v2): задача RT-2619 взята — разбор и план
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
