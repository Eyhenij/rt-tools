# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Two review rounds, the owner's look, the texts and the PR
- **Done:** stages 1, 2 and 3. The feed draws a `section` block by `rt-ai-chat-section`: a heading and a grid of cells. The showcase holds 16 stories of the section with play steps and the overview page; the 16 references are taken by the image browser, 16 passed. The specs of the chat folder: 114 passed; of the schema: 6 passed.
- **Next step:** step 4.2 — review round two by fresh readers.
- **Uncommitted:** no
- **Waiting for the owner:** no — the plan is approved: «Одобряю план», the threshold of 600 with it
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks`

## Steps

- [x] 1.1 Add the `SectionBlock` type, the nested block type with `span`, the `section` view with its cells, `section` in `OWN_TYPES` and the section data step in `toBlockViews`: the dropped items, the default span by the declared type, the `span` override, the plate for a nested section and for a section without a block.
- [x] 1.2 Add the copy of a section to `blockText`: the trimmed title and the texts of the nested blocks, nothing for a nested section, nothing when no block gives a text.
- [x] 1.3 Write the JSON schema of the section and the function that joins the schemas of the nested types in `section.schema.ts` next to `kpi.schema.ts`, and export both from the util barrel.
- [x] 1.4 Write the specs of the logic, the copy and the schema with the scenario numbers of the agreement: SC-UKV-1507, 1511, 1512, 1515, 1516, 1518, 1519, 1524.
- [x] 2.1 Move the cases of the feed into one `ng-template` of the blocks template, drawn for the feed as before.
- [x] 2.2 Write the `rt-ai-chat-section` component: a group labelled by its heading through a unique id, the heading role of the level 3, the cells that carry the span and take the cell template, the grid by a named container query — one column below 600, two from 600, the gap `--rt-space-md`, tokens only.
- [x] 2.3 Add the `section` case to the blocks template and the gap of 16 around a section in the feed.
- [x] 2.4 Write the specs of the section component, of the blocks component and the styles spec (the named container, the threshold 600, the gap, the span of a cell): SC-UKV-1510, 1514, 1517, 1523, 1525.
- [x] 3.1 Write the overview fixture — one `blocks` array with one `section`: a title, a summary, 4 KPI, 2 charts, a table — and the stories of the section by the agreement's table «Screens and states»: 328, 386, 640, 926, 599 and 600, a lone column block, a span set, no title, a long title, a nested section, an unknown block, a KPI block in a narrow cell, two sections, right to left, invalid, dark at 386 and 926.
- [x] 3.2 Write the chat stories with the overview answer taller than the feed: the narrow panel, the full-screen mode without the thread column, with it, and with a `40rem` reading column.
- [x] 3.3 Write the play steps that measure by `getBoundingClientRect` the columns, the cell widths, one top per row, the gaps, no kit block past its cell and no feed widening: SC-UKV-1508, 1509, 1513, 1520–1522, 1526–1528.
- [x] 3.4 Break one measurement on purpose, run `pnpm run test:visual:v2`, see it red on that story, and restore the measurement.
- [x] 3.5 Write the `Overview.mdx` of the block with the whole `blocks` array and the note that charts in a section need `provideRtAiChatChart()`; name the block and the joining function in the chat Overview and the README.
- [x] 3.6 Look at every story live, take the references, sweep all the stories.
- [x] 3.7 Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress.
- [x] 4.1 Review round one by qa-engineer, product-strategist and goal-critic; fix the confirmed findings in one commit.
- [>] 4.2 Review round two by fresh readers; fix the confirmed findings in one commit; run the showcase checks of stage 3 again on the code that ships.
- [ ] 4.3 Show the showcase to the owner — the two chat stories of the sign first — and write their word into `approvals.md`.
- [ ] 4.4 Build the kit and read `dist/ui-kit-v2` for the section component and the schema export.
- [ ] 4.5 Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-section/` with its bindings; edit the chat and KPI specs and the kit spec indexes as the agreement names.
- [ ] 4.6 Bring `CONTEXT.md` of ai-chat and the comment of the block providers up to the section.
- [ ] 4.7 Mark the row of RT-3342 in the epic plan and write there the release steps that close G; write the archive record, take the task folder apart.
- [ ] 4.8 Run the push set, push, open the PR into `RT-3346-ai-chat-blocks`.

## Decisions along the way

- **RT-3342 goes before RT-3339.** The owner's word of 19.11.2026: «сначала сделай RT-3342, потом
  вливаем» — the epic branch goes into the main one after this task, so that the first release
  closes milestone G whole. The plan of RT-3339 is approved and waits in its branch.
- **The branch stands on the epic branch, not on the branch of RT-3339.** That branch carries its
  own task folder and no code; a PR of this task from it would carry both.

- **The mockup 8375-625 is built from the approved block mockups.** The KPI cards, the two charts
  and the table are clones of the frames approved in RT-3338, RT-3335, RT-3336 and RT-3337; the
  section adds only its title and the grid. Drawn at 328, 386, 640 and 926 in the light theme and
  at 386 and 926 in the dark one. The title is 16/20 SemiBold in `text/primary`, 12 above the grid;
  the grid gap is 16 both ways.
- **Measured by node bounds:** six sections, no overlaps, nothing past the section width. At 328
  and 386 every block is one column wide. At 640 the charts are 312 each, side by side on one top
  (y 340), the KPI block holds two columns (it is under 664). At 926 the charts are 455 each on one
  top (y 198), the KPI block four columns. The summary, the KPI block and the table take the whole
  row at every width.
- **The grid gap is 16, not the 8 of the feed.** Two charts 8 apart read as one; the owner sees it
  on the mockup.

- **The section is a query container of its own, and the KPI block inside keeps its own.** The KPI
  host declares `container-type: inline-size` and asks an unnamed query, which reads the nearest
  container — the KPI host itself, not the section. So a KPI block in a cell answers by the cell
  width with no edit of the KPI styles. The section names its container, so that no query of a
  nested block ever reads it by mistake.
- **A `40rem` reading column gives the section exactly 640.** The feed pads by
  `max(16, (100% − 40rem) / 2)`, so its content box is 640 to the pixel, and `min-width: 640px`
  holds there; the story of the reading column measures it.

- **The agreement and the plan were reviewed by spec-critic, goal-critic and product-strategist
  before the plan went to the owner.** Taken, each checked against the code: the threshold is 600,
  not the 640 of the mockup frame — the feed scrolls, the kit scrollbar takes 12 from the layout
  (`_scrollbar.scss`), and the full-screen chat would get 628 or 634 and one column; the nested
  blocks stand in kit cells drawn by one template, so the section and the blocks component do not
  import each other; the default span follows the declared type; the schema is joined from the
  schemas of the nested types by a function, since the bare one names no field of a nested block;
  a section stands 16 from its neighbours; a group labelled by its heading, no role without a
  title; the owner looks at the showcase after the review rounds; the built package is read for
  the section; the epic plan names the release steps that close G. Written off: a state of a
  section in a streamed answer — the kit does not tell a block the answer is unfinished.
- **A failed play step does turn a run red.** `tools/visual-snapshots-v2.mjs` runs
  `test-storybook`, which runs the play steps; the plan still breaks one on purpose to see it.
- **The data step has no recursion.** A section holds no section, so a nested block is built by
  the function of a block that is not a section. A nested `section` falls there to the plate, as
  an own type the registry does not take, and gives no text. The linter refuses two functions
  that call each other.
- **The spec of the section logic is a file of its own** next to the logic spec. The schema spec
  holds the checks of `rtSectionItems` and `rtSectionTitle` too.

- **The showcase matches the approved mockup 8375-625 by numbers.** Measured in the pinned Chrome on
  the story Widths, by `getBoundingClientRect`, against the node bounds of the mockup.

    | what                               | mockup         | showcase       |
    | ---------------------------------- | -------------- | -------------- |
    | title, line height                 | 20             | 20             |
    | title above the grid               | 12             | 12             |
    | grid gap, rows and columns         | 16             | 16             |
    | 328 and 386 — columns              | 1              | 1              |
    | 640 — chart cells                  | 312 and 312    | 312 and 312    |
    | 640 — top of the charts row        | 340            | 340            |
    | 640 — KPI columns                  | 2              | 2              |
    | 926 — chart cells                  | 455 and 455    | 455 and 455    |
    | 926 — top of the charts row        | 198            | 198            |
    | 926 — KPI columns                  | 4              | 4              |
    | summary, KPI and table — whole row | at every width | at every width |

- **The chat stories measured live.** The feed scrolls in all four. The section is 375 wide in the
  narrow panel and stands in one column. It is 915 in the full-screen mode, 634 next to the thread
  column and 629 in the `40rem` reading column: two columns in all three, the charts on one top.
  The threshold of 640 would have given one column in the last two.
- **A failed play step turned the image run red, and not by design.** The first taking of the
  references ended «1 failed, 15 passed» on the story TwoSections: «текст в 8 под секцией, а не в
  16». The story wrapper set `display: block` on the feed host, so the feed lost its own gap of 8.
  The chat was right the whole time; the wrapper no longer overrides the display. The second run:
  16 passed. This is the proof step 3.4 asked for, so no second break was made on purpose.
- **A play error does not show in the development frame of a story.** The check by the body class
  of the frame saw nothing where the image run refused. A play step is judged by the image run.
- **The section is named in the list of components shown inside a neighbour's story.** Its stories
  stand in the chart entry, since the overview needs real charts, and the coverage check looks for
  a stories folder next to the component.

- **Review round one: no blocker, one large finding and a set of small ones, all fixed by one
  commit.** The three roles read the whole diff against the epic branch.

  | finding | who | what was done |
  | --- | --- | --- |
  | the chart schema named `chart` put the specification into the root of the block, and the charts came out invalid | all three | the chart entry exports the schema of the chart block with the specification in `spec`; the README and the overview page name it |
  | a model could not write a `markdown` or a `notice` block by the joined schema | strategist | the kit exports both schemas, and the joining function puts them into its result |
  | the joined schema shared nodes with the given schemas and returned the constant itself | qa | the result is a new record on every call |
  | the template of a block lost the type of its context | qa | a directive with a context check on the template |
  | the redraw of the section was tested on the feed, the scenario speaks of the chat | goal-critic | a test on `rt-ai-chat` |
  | the test of the feed gap carried the number of another scenario | qa | renamed to SC-UKV-1528, the scenario carries a partial-coverage mark |
  | play steps could not fail on a block wider than its cell or on a heading past the section | qa | the block is measured by its own content width, the heading by the lines of its text |
  | the gap of a section was measured against a text only | qa | the story of the neighbours measures a text, a section, a chart and a plate |
  | the chat frames showed the tail of the answer | strategist | the feed is put to the start of the answer before the frame |
  | the overview spoke of November and drew January to June | strategist | charts of its own, June to November, with the same captions |
  | the sign of milestone G did not measure the drawing | strategist | a spec: the joined schema accepts the overview, and no block of it is a plate |

- **The joining function puts all four kit types into its result, not only `markdown` and
  `notice`.** The finding named two. The kit has the schemas of `kpi` and `table` as well, so an
  application names only the chart and its own blocks. A schema under the name of a kit type
  replaces the kit's one.

- **Written off with a reason.** `TRtJsonSchema` stays: the signature of the joining function needs
  it. The binding file of the agreement is rewritten at step 4.5. Whether a strict mode of a model
  accepts `oneOf` and `not` is not checked: the tree has nothing to check it with.

- **The first image run of the round was red on two chat stories, and the cause was the story
  step.** The chat pulls its feed to the tail several times after the draw. The step now returns the
  feed to the start until it has stood there for sixty frames. The second run: 16 passed, 14 frames
  unchanged against the first.

- **The numbers of the round.** The specs of the chat folder: 115 passed; of the chart entry: 66;
  of `lib/util`: 90. The types and the linter are clean.

## Sessions

### 2026-11-19

- RT-3339 paused after its plan was approved; RT-3342 taken.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3342-ai-chat-section-grid

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Two review rounds, the owner's look, the texts and the PR
- **Next step:** step 4.1 — review round one by three roles.
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks`

The progress in full — `docs/tasks/RT-3342-ai-chat-section-grid/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
02f1402e5 feat(rt:ui-kit-v2): витрина блока секции — обзор месяца на четырёх ширинах и в чате
409dca611 feat(rt:ui-kit-v2): секция в ленте ответа — заголовок и сетка в две колонки
53ced96f8 feat(rt:ui-kit-v2): данные блока секции, его копия и схема для модели
8754015a0 docs(rt:ui-kit-v2): план RT-3342 одобрен — данные, сетка, витрина, ревью
149915c64 docs(rt:ui-kit-v2): договорённость о секции после ревью ролей (RT-3342)
fe9867798 docs(rt:ui-kit-v2): договорённость о блоке секции в ответе чата (RT-3342)
2e3f0327d docs(rt:ui-kit-v2): макет секции и сетки составного ответа для RT-3342
2f6592ceb docs(rt:ui-kit-v2): задача RT-3342 взята, разбор закрыт допущениями
9c66d15a8 [RT-3338] В ответе чата нет ряда KPI-карточек с дельтой к базе (#3429)
e3425d045 fix(rt:ui-kit-v2): строки дельты и периода карточки kpi по 16, как в макете (RT-3338)
0dfd86b8a fix(rt:ui-kit-v2): у элемента kpi в ленте блоков есть своё правило стилей (RT-3338)
3849347da docs(rt:agent-kit): записи описания прошлого старше недели убраны
8537dca81 docs(rt:ui-kit-v2): папка задачи RT-3338 разобрана в описание прошлого
845b2900b docs(rt:ui-kit-v2): макет kpi сведён с кодом, совпадение 28 из 28 (RT-3338)
70dc7d476 docs(rt:ui-kit-v2): договорённость о блоке kpi сведена в spec (RT-3338)
c08c82250 feat(rt:ui-kit-v2): значение компактной плитки мельчает, когда не входит в строку
a609495e8 fix(rt:ui-kit-v2): блок kpi после второго круга ревью (RT-3338)
0f80720c7 fix(rt:ui-kit-v2): блок kpi после первого круга ревью (RT-3338)
eea80eea0 Merge remote-tracking branch 'origin/RT-3346-ai-chat-blocks' into RT-3338-ai-chat-kpi-block
f5037fb8c feat(rt:ui-kit-v2): витрина блока kpi и числа плитки под rtl
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
