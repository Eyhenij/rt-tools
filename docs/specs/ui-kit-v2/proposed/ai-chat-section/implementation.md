# What it will be carried out by — the section block of the assistant chat

There is no code yet, so no binding of the form `file:symbol` stands here: the agreement is written
before the code, and the place of execution comes with it. Below are only the foreseen places, so
that at the merge it is seen where to look. A new file is named in words: a path that does not
exist yet is not written in backticks.

## Where execution is foreseen

| Rule group                                            | Where it is foreseen                                                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `section` is a kit type, the plate, the copy          | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts` — `OWN_TYPES`, `toBlockViews`, `blockText` |
| the nested views, the dropped items, the span         | the same file — a section data step that builds the views of the nested blocks once, without a second level                              |
| the block and view unions                             | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts`                                                          |
| a case for the `section` kind, drawing nested views   | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.html`                                      |
| the title, the grid, the threshold 600, the gap       | a `section` block directory next to `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/kpi/`                              |
| the JSON schema of the section and the joining function | a section schema file next to `projects/ui-kit-v2/src/lib/util/kpi.schema.ts`                                                          |
| the gap of 16 around a section in the feed            | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.scss`                                      |
| the stories of the overview at 328, 386, 640 and 926  | the stories of the chart entry, next to `projects/ui-kit-v2/src/ai-chat-chart/lib/components/block/stories/`: they need real charts      |

## How the nested blocks are drawn

The cases of the feed — markdown, notice, table, KPI, a registry block, the plate — live in one
`ng-template` of the blocks template. The feed draws its blocks by it, and the section gets it as
the template of a cell: the section component only lays the cells out and imports no block. So a
new kit type is added in one place, and the section and the blocks component do not import each
other. A nested block keeps the test id it has in the feed.

A nested block that asks an unnamed container query without being a container itself would answer
to the nearest container above it. The section names its container and asks it by name, so such a
query never lands on the section by the section's own doing; a block that lays out by width
declares its own container, as the KPI block does.

## What the merge edits besides

- `docs/specs/ui-kit-v2/ai-chat/spec.md` — the terminology line that lists the block types and the
  rules on the kit's own types, on the plate and on the answer copy name `section`.
- `docs/specs/ui-kit-v2/ai-chat-kpi/spec.md` — its out-of-scope lines that send the title and the
  grid to RT-3342 name the section block.
- `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/CONTEXT.md`,
  `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/Overview.mdx` and
  `projects/ui-kit-v2/README.md` — the list of the kit's own types and of the exported schemas.
- `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.providers.ts`
  — its comment names only `markdown` and `notice` as the kit's own types.

## Tokens the section takes

`--rt-space-md` and `--rt-text-md` are declared in `projects/ui-kit-v2/src/styles/_semantic.scss`
and `projects/ui-kit-v2/src/styles/_primitives.scss`; the gap 12 above the grid is `--rt-space-2`
plus `--rt-space-1`, as the frame of a KPI card counts it. The line of 20 under a 16 title is the
ratio 1.25, written as a number: the scale of line heights has no step of that value.

## What is not decided yet

Nothing: the threshold, the default span, the gap and the one level of nesting are decided in the
spec's decisions, and the plan takes them as written there.
