# What it is carried out by — the chart block of the assistant chat

The block is not written yet, so no line here holds a `file:symbol` binding: the agreement comes
before the code. Below are the places the work is expected to touch, so that the merge into the
assistant chat subdomain shows where to look.

## Where it is expected

| Rule                                                    | Where it is expected                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| its own entry, no d3 in the editor, no editor in charts | a new entry `ai-chat-chart` of the kit next to `projects/ui-kit-v2/chart/ng-package.json` |
| one provider of the entry                               | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.providers.ts:provideRtAiChatBlock`, called by the new entry |
| the ten kinds by the mapping                            | the mapping of the new entry onto `projects/ui-kit-v2/src/lib/components/chart/rt-chart.model.ts:IRtChart` |
| negative grouped bars, a zero kept                      | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts` draws bars from zero and skips a bar of zero height; the hint and the copy carry the zero |
| the `x` types, the category order, the histogram        | the hand-written check and the mapping of the new entry                              |
| the parse and the check, the notice, the placeholder    | a hand-written check of the new entry; the notice and the placeholder are kit labels in `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts` |
| the empty state                                         | the block decides it before `rt-chart`: `projects/ui-kit-v2/src/lib/components/chart/rt-chart.empty.ts:rtChartIsEmpty` counts a zero sector or leaf as a value |
| the title row, the subtitle, the axis names             | the template of the block in the new entry                                           |
| the formats and their digits                            | functions over `Intl.NumberFormat` passed as `IRtChart.TFormat`                      |
| the formats follow the kit locale                       | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.providers.ts:RT_KIT_LOCALE`; the provider of the entry builds `toText` in a factory that reads it at copy time |
| the category labels do not overlap                      | the category axis of `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts`; whether it thins the labels already is not checked |
| the legend clear of the axis                            | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts:legendOf`         |
| the series colours, the sectors and tree groups         | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.scene.ts:rtChartSlot`          |
| full screen, focus return                               | `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:open`             |
| the PNG by the title, disabled before the drawing       | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.png.ts:rtChartToPng`, and a file download in the new entry |
| the accessible name                                     | the input `label` of `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts`; the label «Chart» in `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts` |
| the exported schema, the leaves the schema cannot count | a value exported by the new entry; the count of distinct leaves in its check        |
| the copy as text                                        | the `toText` of the registration, read by `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:blocksToPlainText` |

## What is not decided yet

No rule here is left without an expected place. The questions closed by assumption decide the
behaviour inside those places — the limits by Q-2, the histogram bins by Q-4, the formats by Q-9
and Q-10, the PNG contents by Q-11, the file name by Q-12 and the copy layout by Q-13 — not where
it is carried out.
