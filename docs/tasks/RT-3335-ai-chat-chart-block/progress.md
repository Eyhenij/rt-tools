# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Closing
- **Done:** branch `RT-3335-ai-chat-chart-block` taken from `RT-2750-rt-chart` (a chain: PR #3386
  of RT-2750 is open into the epic branch); the task is in progress and assigned; the grill holds
  the exploration and the decisions; the body of #3335 is rewritten away from echarts; the
  agreement `docs/specs/ui-kit-v2/proposed/ai-chat-chart/` holds 17 rules and SC-UKV-1341…1359,
  its 15 open questions closed by assumption
- **Next step:** 5.3 — the roles review, then the push gate, the folder taken apart, the push and
  the PR into `RT-2750-rt-chart`.
  The branch RT-2750 below waits for main to fix the hook test SC-AK-569 broken by #3387.
- **Uncommitted:** no
- **Waiting for the owner:** no; the mockup and the plan are approved: «Одобряю макет и план RT-3335»
- **PR:** not open yet; the chain base is PR #3386

## Steps

- [x] 1.1 Draw the block in the kit Figma file: title row, the ten kinds, pending, invalid, empty, full
- [x] 1.2 Measure the frames and ask the owner to approve the mockup through the parent session
- [x] 2.1 Create the entry `ai-chat-chart` and its barrel
- [x] 2.2 Write the spec types, the exported JSON schema and the hand-written check
- [x] 2.3 Write the mapping of the ten kinds onto `IRtChart` with the formats
- [x] 2.4 Add `ajv` 8.20.0, already in the lockfile, as an exact dev dependency for the schema test
- [x] 2.5 Cover the check, the schema and the mapping with unit tests by scenario id
- [x] 3.1 Write the block component: title row, subtitle, axis names, notice, placeholder, empty state
- [x] 3.2 Add full screen through the kit dialog and the PNG download
- [x] 3.3 Add the provider with the `toText` factory and the kit labels in eight languages
- [x] 3.4 Cover the block with component tests by scenario id
- [x] 4.1 Write the stories: one per kind, pending, invalid, empty, both themes, narrow feed, and an
- [x] 4.2 Take the snapshot references and match the showcase with the mockup
- [x] 4.3 Ask the owner to approve the showcase through the parent session
- [x] 5.1 Merge the agreement into the ai-chat subdomain spec and fix the scenario index
- [x] 5.2 Bring the README and the CONTEXT of the chat up to date
- [>] 5.3 Run the push gate

## Decisions along the way

- **`product-strategist` findings went into the agreement.** Negative bars are accepted by `bar`
  too; a hierarchy path ending on a node keeps its value there, so the schema never accepts a shape
  the block refuses; the spec may arrive parsed; the end-of-call sign is out of scope and became a
  finding of the epic. Affected stage of the plan: none yet, the plan is not written.
- **`spec-critic` findings 2 and 3 are decided without new drawing in `rt-chart`.** A zero bar is
  not drawn, and the zero stands in the hint and the copy; the axis names stand above and under the
  chart, not at the axes. The task keeps `rt-chart` as it is. Affected stage of the plan: none yet.

- **The mockup was redrawn on the owner's remark «почему блоки с графиками прижаты к левому краю
  … где макеты для широких экранов».** The chart drawing copied from the RT-2750 frame kept its
  328 px width; its parts now stretch with the block. Frames at 360, 420 and 760, the dark theme
  and full screen; measured: zero gap at the right edge in every block, the chat header subtitle
  cut instead of running 42 px under the icons. Affected stage of the plan: 1.

- **The kit labels of the block live in English in the package and in Russian in the showcase.**
  Step 3.3 says eight languages, but the kit carries one dictionary, `rt-kit-labels.en.ts`, and the
  Russian set of the showcase; the other languages come from the application's translator. Affected
  stage of the plan: 3.
- **The pending block shows only the placeholder, without the title row of the mockup.** The spec
  is not parsed while the call streams, so there is no title to draw, and the rule says the
  placeholder stands whatever the spec string holds. Affected stage of the plan: 4 — the showcase
  shows the placeholder alone.
- **The plot is a component of its own, shared by the block and the full-screen dialog.** The
  y-label, `rt-chart` and the x-label are drawn once; the label thinning is counted from its width.
  The PNG is saved by a six-line helper of the entry: the PDF viewer's helper is not exported and
  handles byte arrays the chart does not need. Affected stage of the plan: 3.
- **The `Not covered` marks of the agreement are removed when it merges into the ai-chat spec.**
  33 of 37 scenarios are covered by 44 tests now; 1355, 1369 and 1376 wait for the snapshots of
  stage 4, and 1372 is the isolation grep over the build. Affected stage of the plan: 5.
- **`rt-chart` caps a bar by the width of its column.** The 60-categories frame showed bars of the
  fixed width 16 covering each other and running past the right edge. The bar now takes the
  smaller of its designed width and its column; the scenario SC-UKV-1382 joins the agreement with a
  scene test, and the whole kit matched its references after the edit. Affected stage of the plan: 4.
- **The 12 px lines of the block take `line-height: 15px`, as the labels of `rt-chart` do.** No
  kit step gives 15, and the font metrics gave 14.5. The mockup copy had the gap between the plot
  and the legend at 8, while the approved `rt-chart` mockup and its code have 12: the copy drifted,
  so the mockup was fixed — the plot and the legend stand in a `chart` frame with a gap of 12.
  Match: 22 of 22 numbers on the 386 block. Affected stage of the plan: 4.
- **The agreement became the subdomain `ai-chat-chart`, not a part of the `ai-chat` spec.** Step
  5.1 says "into the ai-chat spec", but the two together are 508 lines against the limit of 500;
  the kit keeps its subdomains side by side, so the block got its own row in both indexes. The
  scenario SC-UKV-1382 is about `rt-chart` and moved to the chart subdomain with a rule of its own.
  Affected stage of the plan: 5.
- **The showcase got the story `Edges`.** Three scenarios promised frames the stories did not
  draw: six long series, nine sectors in the dark theme and a 120-character title in a narrow
  feed. Affected stage of the plan: 4.
- **The roles review before the PR.** `product-strategist`: the point of the task is met, the
  milestone G waits for RT-3336…3342 and the release; SC-UKV-1372 stood on a manual search, so a
  spec now reads the imports of both neighbouring entries. `goal-critic`: «full screen» is the kit
  dialog of the size `lg`, not the whole window; the approved mockup draws it 900 wide and the owner
  approved the showcase with that frame, so it is named in the PR body as a narrowing, not changed.
  Affected stage of the plan: 5.
- **The docs checker reads the components of the `ai-chat-chart` entry too.** It knew only the
  editor entry, so the overview page of the block had no table check. Affected stage of the plan: 4.

## Sessions

### 2026-11-18

- Branch taken, task #3335 moved to work and assigned to the machine account.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3335-ai-chat-chart-block

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — Showcase
- **Next step:** 4.1 — the stories of the block: one per kind, pending, invalid, empty, both themes, narrow feed.
- **PR:** not open yet; the chain base is PR #3386

The progress in full — `docs/tasks/RT-3335-ai-chat-chart-block/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/proposed/ai-chat-chart/scenarios.md
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/block/rt-ai-chat-chart.component.html
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/block/rt-ai-chat-chart.component.scss
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/dialog/rt-ai-chat-chart-dialog.component.html
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/dialog/rt-ai-chat-chart-dialog.component.scss
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/dialog/rt-ai-chat-chart-dialog.component.ts
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/plot/rt-ai-chat-chart-plot.component.scss
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.scene.spec.ts
 M tools/verify-ui-kit-v2-docs.cjs
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--answer.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--full-screen.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--kinds.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--presets.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--states.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--themes.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatchart--widths.png
?? projects/ui-kit-v2/src/ai-chat-chart/lib/components/block/stories/
```

### Commits over the main branch

```
66f6d567e feat(rt:ui-kit-v2): блок графика в ответе ассистента
1879e5aff test(rt:ui-kit-v2): проверка, схема и перевод спецификации графика по сценариям
7094274a1 chore(rt:ui-kit-v2): ajv 8.20.0 для теста схемы графика
88dd1aca3 feat(rt:ui-kit-v2): спецификация графика переводится в данные rt-chart
80a417cc3 feat(rt:ui-kit-v2): проверка спецификации графика и её JSON-схема
d321f59f8 Merge branch 'RT-2750-rt-chart' into RT-3335-ai-chat-chart-block
aa3cbd0fa Merge remote-tracking branch 'origin/main' into RT-2750-rt-chart
6e04209a2 feat(rt:ui-kit-v2): вход ai-chat-chart с моделью спецификации графика
fe92619a6 docs(rt:ui-kit-v2): план и макет RT-3335 одобрены владельцем
303b84094 docs(rt:ui-kit-v2): находка о красных тестах хуков в main
4a8b44771 Merge remote-tracking branch 'origin/main' into RT-2750-rt-chart
d9c4a85f3 docs(rt:ui-kit-v2): договорённость RT-3335 по замечаниям критика
a4a2557ab docs(rt:ui-kit-v2): следующий шаг RT-3335 после починки main
1e9c4e926 docs(rt:ui-kit-v2): решения по замечаниям ролей в прогрессе RT-3335
6363d2f8b docs(rt:ui-kit-v2): находки RT-3335 о протоколе чата
9d240fe50 docs(rt:ui-kit-v2): договорённость RT-3335 по замечаниям о вехе эпика
725ba5048 docs(rt:ui-kit-v2): договорённость RT-3335 записана, критика идёт
ef231fc3e docs(rt:ui-kit-v2): договорённость о блоке графика в ответе чата
fada9db2e docs(rt:ui-kit-v2): разбор RT-3335 закрыт допущениями
f5c3fa184 docs(rt:ui-kit-v2): первые находки разбора RT-3335
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
