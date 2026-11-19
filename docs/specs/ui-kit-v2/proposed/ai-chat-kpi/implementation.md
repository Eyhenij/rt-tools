# What it will be carried out by — the KPI block of the assistant chat

There is no code yet, so no binding of the form `file:symbol` stands here: the agreement is written
before the code, and the place of execution comes with it. Below are only the foreseen places, so
that at the merge it is seen where to look. A new file is named in words: a path that does not
exist yet is not written in backticks.

## Where execution is foreseen

| Rule group                                              | Where it is foreseen                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `kpi` is a kit type, the plate, the copy line           | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts` — `OWN_TYPES`, `toBlockViews`, `blockText` |
| the block and view unions                               | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/` — the chat model                                 |
| a case for the `kpi` kind                               | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.html`           |
| the lenient data function of an item and of the block   | a KPI data file next to `projects/ui-kit-v2/src/lib/util/table-data.ts`                                       |
| writing the value, the short form                       | the same file, on top of `projects/ui-kit-v2/src/lib/util/table-data.ts` — `rtTableCellWriter`                |
| the JSON schema of the block                            | a KPI schema file next to `projects/ui-kit-v2/src/lib/util/table.schema.ts`                                   |
| the grid, the card frame, the four-column threshold     | a `kpi` block directory next to `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/table/`     |
| the compact size, the delta by the locale, the caption  | `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts` and its template and styles       |
| the stories at 328 and 728 in both themes               | the stories of the chat blocks, next to the table block stories                                               |

## What the merge edits besides

- `docs/specs/ui-kit-v2/stat-tile/spec.md` — the rule that puts the sign and the decimal comma by
  hand is rewritten for the kit locale; SC-UKV-1125 in `docs/specs/ui-kit-v2/stat-tile/scenarios.md`
  is rewritten the same way, and the tile unit tests in
  `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.spec.ts` name their locale.
- `docs/specs/ui-kit-v2/ai-chat/spec.md` — the rules on the kit's own types, on the plate and on
  the answer copy name `kpi`.

## Tokens the frame and the compact size take

`--rt-color-border-default` and `--rt-color-bg-surface` are declared in
`projects/ui-kit-v2/src/styles/tokens.light-color.mjs` with their dark values; the steps
`--rt-space-0-5`, `--rt-space-1`, `--rt-space-2`, `--rt-radius-sm` and `--rt-radius-md` in
`projects/ui-kit-v2/src/styles/tokens.scale-metrics.mjs`. 12 is `--rt-space-2` plus `--rt-space-1`,
6 is `--rt-space-1` plus `--rt-space-0-5`, the radius 12 is `--rt-radius-md` plus `--rt-radius-sm`.

## What is not decided yet

Nothing: the field names, the unit and the fraction digits of a delta, and the copy separator are
decided in the spec's decisions, and the plan takes them as written there.
