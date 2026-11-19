# What it will be carried out by — the link block of the assistant chat

There is no code yet, so no binding of the form `file:symbol` stands here: the agreement is written
before the code, and the place of execution comes with it. Below are only the foreseen places, so
that at the merge it is seen where to look. A new file is named in words: a path that does not
exist yet is not written in backticks.

## Where execution is foreseen

| Rule group                                       | Where it is foreseen                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `link` is a kit type, the plate, the copy line   | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts` — `OWN_TYPES`, `toBlockViews`, `blockText` |
| the block, the view and the event types          | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts`                                                          |
| a case for the `link` kind                       | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.html`                                      |
| the lenient data function of the block           | a link data file next to `projects/ui-kit-v2/src/lib/util/kpi-data.ts`                                                                   |
| the JSON schema of the block                     | a link schema file next to `projects/ui-kit-v2/src/lib/util/kpi.schema.ts`                                                               |
| the card, the status, the buttons, the layout    | a `link` block directory next to `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/kpi/`                                 |
| the event from the blocks to the answer          | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component.ts` and the answer component                |
| the `linkOpen` output of the chat                | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.ts`                                                       |
| the labels of the status and the buttons         | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts` and `projects/ui-kit-v2/.storybook/showcase-labels.ru.ts`                           |
| the gap of the tag `sm`                          | `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss`                                                                        |
| the stories of every state at 328, 386 and 640   | the stories of the chat blocks, next to the KPI block stories                                                                            |

## What the merge edits besides

- `docs/specs/ui-kit-v2/tag/spec.md` and its scenarios — the gap of the size `sm`.
- `docs/specs/ui-kit-v2/ai-chat/spec.md` — the rules on the kit's own types, on the plate, on the
  outputs and on the answer copy name `link`; the outputs table of the chat overview names
  `linkOpen`.

## Tokens the card takes

`--rt-color-border-default`, `--rt-color-bg-surface`, `--rt-color-bg-surface-subtle` and
`--rt-color-state-error-text` are declared in `projects/ui-kit-v2/src/styles/tokens.light-color.mjs`
with their dark values; the steps `--rt-space-1`, `--rt-space-2`, `--rt-radius-sm` and
`--rt-radius-md` in `projects/ui-kit-v2/src/styles/tokens.scale-metrics.mjs`.

## What is not decided yet

Nothing: the field names, the default state, the copy separator and the label languages are decided
in the spec's decisions, and the plan takes them as written there.
