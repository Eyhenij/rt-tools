# What it is carried out by — the section block of the assistant chat

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **`section` is a type the kit draws itself, next to `markdown`, `notice`, `table` and `kpi`; an application gets it without registering anything, and a renderer registered for `section` is not taken.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:OWN_TYPES`, `toBlockViews`; `projects/ui-kit-v2/src/lib/util/section-data.ts:RT_SECTION_BLOCK_TYPE`; scenario `SC-UKV-1507`
- **A section has `blocks`, a list of nested blocks, and the optional `title`.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts:SectionBlock`; `projects/ui-kit-v2/src/lib/util/section-data.ts:rtSectionTitle` trims the title and gives `null` for an absent one; scenario `SC-UKV-1517`
- **A nested block is drawn by the rules of the feed.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:leafView` builds the view of a block of the feed and of a block in a cell alike; scenario `SC-UKV-1525`
- **An item of `blocks` that is not an object with a string `type` is dropped; the other blocks stay in their order.** — `projects/ui-kit-v2/src/lib/util/section-data.ts:rtSectionItems`; scenario `SC-UKV-1516`
- **A section inside a section is not drawn: it is shown as the plate with the type name `section`.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:sectionView` builds a cell by `leafView`, which knows no section and finds no renderer for a type of `OWN_TYPES`; scenario `SC-UKV-1515`
- **A section whose `blocks` is not a list, or holds no block left after the rule above, is shown as the plate with its type name.** — `projects/ui-kit-v2/src/lib/util/section-data.ts:rtSectionItems` gives `null`, and `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:sectionView` gives the kind `unsupported`; scenarios `SC-UKV-1516`, `SC-UKV-1525`
- **A nested block may carry `span`: `full` takes the whole row, `column` takes one column.** — `projects/ui-kit-v2/src/lib/util/section-data.ts:ERtSectionSpan`, `rtSectionSpan`; scenario `SC-UKV-1512`
- **Without a `span` the declared type decides, not what is drawn.** — `projects/ui-kit-v2/src/lib/util/section-data.ts:FULL_ROW_TYPES`, read by `rtSectionSpan` with the declared type of the item; scenario `SC-UKV-1511`
- **`span` is read by the section alone: on a block of the feed it has no effect.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:sectionView` is the only caller of `rtSectionSpan`; `leafView` gives a renderer its block as given; scenario `SC-UKV-1512`
- **When the list changes, each cell shows the block now at its place.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.ts:drawn` is computed from the input `cells`; scenario `SC-UKV-1523`
- **The kit exports the JSON schema of the section (JSON Schema 2020-12).** — `projects/ui-kit-v2/src/lib/util/section.schema.ts:RT_AI_CHAT_SECTION_SCHEMA`; scenario `SC-UKV-1519`
- **The kit exports a function that joins the schemas of the nested types into the schema of the section.** — `projects/ui-kit-v2/src/lib/util/section.schema.ts:rtAiChatSectionSchema`, `nestedSchema`, `OWN_SCHEMAS`, `copy`; scenario `SC-UKV-1524`
- **The kit exports the JSON schemas of the `markdown` block and of the `notice` block.** — `projects/ui-kit-v2/src/lib/util/markdown.schema.ts:RT_AI_CHAT_MARKDOWN_SCHEMA`; `projects/ui-kit-v2/src/lib/util/notice.schema.ts:RT_AI_CHAT_NOTICE_SCHEMA`; scenario `SC-UKV-1524`
- **The chart entry exports the JSON schema of the chart block.** — `projects/ui-kit-v2/src/ai-chat-chart/lib/ai-chat-chart.schema.ts:RT_AI_CHAT_CHART_BLOCK_SCHEMA`; scenario `SC-UKV-1524`
- **No item the schema accepts is dropped from the list.** — `projects/ui-kit-v2/src/lib/util/section-data.ts:rtSectionItems` keeps every object with a string `type`, which is what the schema requires of an item; scenario `SC-UKV-1519`
- **The grid follows the width of the section, not the mode of the chat: one column while the section is narrower than 600, two from 600.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__grid` under the container query of `600px`; scenarios `SC-UKV-1510`, `SC-UKV-1508`, `SC-UKV-1509`, `SC-UKV-1527`
- **The section is a named query container of its own, and its grid asks that container by name.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:container`; scenario `SC-UKV-1510`
- **Each nested block stands in a cell the kit draws; the span belongs to the cell.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.html:cellTemplate` is drawn inside the `cell` element; `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__cell`; scenario `SC-UKV-1514`
- **The order of the blocks is the order of the list.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.html:drawn` is walked in its order, and the styles reorder nothing; scenario `SC-UKV-1514`
- **In one column every block takes the whole row, whatever its span.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__cell--full` stands inside the container query alone, so below it no span is read; scenarios `SC-UKV-1510`, `SC-UKV-1526`
- **In two columns the columns are equal, and a block that stands alone in its row keeps the column width; it is not stretched.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:minmax`; scenarios `SC-UKV-1510`, `SC-UKV-1513`
- **The gap of the grid is 16, `--rt-space-md`, between rows and between columns.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:gap`; scenario `SC-UKV-1510`
- **The blocks of one row stand on one top; each keeps its own height.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:align-items`; scenario `SC-UKV-1509`
- **A section stands 16 from the block before it and after it in the feed, not the 8 of the feed.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.scss:__section` adds one more step of the feed before a section and before the block after it; scenario `SC-UKV-1528`
- **A nested block lays out by the width of its cell, as it does by the width of the feed.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__cell` gives the block the width of its column; `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/kpi/rt-ai-chat-kpi.component.scss:container-type`; scenario `SC-UKV-1522`
- **The section never widens the feed: a cell is never wider than its column.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:min-width`, `minmax`; scenario `SC-UKV-1520`
- **Under `dir="rtl"` the columns mirror: the first block of a row stands at the right.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__grid` names no side: the grid fills its columns by the direction of the text; scenario `SC-UKV-1521`
- **The title is 16 SemiBold on a line of 20, in the primary text colour, and stands 12 above the grid.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.scss:__title`; scenarios `SC-UKV-1517`, `SC-UKV-1520`
- **A section without a title draws the grid alone, with no gap above it.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.html:heading` is drawn only for a title, and the gap is the margin of the title; scenarios `SC-UKV-1517`, `SC-UKV-1528`
- **The answer copy gives a section as its trimmed title, an empty line, and then the texts of its nested blocks in their order, each as the feed would copy it, separated by an empty line.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:sectionText`, called by `blockText`; `copyField` turns a line break of the title into a space; scenario `SC-UKV-1518`
- **A nested block without a text adds nothing; a nested section adds nothing, like the plate it is drawn as.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:leafText` gives an empty text for a nested section, and `sectionText` drops the empty texts; scenario `SC-UKV-1518`
- **A section none of whose blocks has a text adds nothing, title included.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:sectionText`; scenario `SC-UKV-1518`
- **A section with a title is a group labelled by its heading through an id unique per section; a section without a title carries no role.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.ts:role`, `labelledBy`, `titleId`; scenario `SC-UKV-1517`
- **The title carries the heading role with the level 3, as the markdown text of an answer marks its headings.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.html:aria-level`; scenario `SC-UKV-1517`
- **The order a screen reader and the keyboard meet the blocks in is the order of the list.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.html:drawn` puts the cells into the document in the order of the list; scenario `SC-UKV-1514`
- **The block has no fixed text of its own and adds no kit label.** — `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/section/rt-ai-chat-section.component.ts:RtAiChatSectionComponent` injects nothing, and its template writes the given title alone. No scenario names this rule.

## How the nested blocks are drawn

The cases of the feed — markdown, notice, table, KPI, a registry block, the plate — live in one
`ng-template` of `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.html`.
The feed draws its blocks by it, and the section gets it as the input `cellTemplate`: the section
component only lays the cells out and imports no block. So a new kit type is added in one place,
and the section and the blocks component do not import each other. A nested block keeps the test
id it has in the feed. The directive of
`projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-block-cell.directive.ts`
gives the template the type of its context and does nothing else.

A nested block that asks an unnamed container query without being a container itself would answer
to the nearest container above it. The section names its container and asks it by name, so such a
query never lands on the section by the section's own doing. A block that lays out by width
declares its own container, as the KPI block does.

## Tokens the section takes

`--rt-space-md` is declared in `projects/ui-kit-v2/src/styles/_semantic.scss`, `--rt-text-md` and
the steps `--rt-space-1` and `--rt-space-2` in `projects/ui-kit-v2/src/styles/_primitives.scss`.
The gap 12 above the grid is `--rt-space-2` plus `--rt-space-1`, as the frame of a KPI card counts
it. The line of 20 under a 16 title is `--rt-text-md` plus `--rt-space-1`: the scale of line
heights has no step of that value.
