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
| negative grouped bars, a zero kept                      | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts` draws bars from zero |
| the parse and the check, the notice, the placeholder    | a hand-written check of the new entry; the notice and the placeholder are kit labels in `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts` |
| the title, the subtitle, the axis names                 | the template of the block in the new entry                                           |
| the formats                                             | functions over `Intl.NumberFormat` passed as `IRtChart.TFormat`                      |
| the legend clear of the axis                            | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts:legendOf`         |
| the series colours                                      | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.scene.ts:rtChartSlot`          |
| full screen                                             | `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:open`             |
| the PNG by the title                                    | `projects/ui-kit-v2/src/lib/components/chart/rt-chart.png.ts:rtChartToPng`, and a file download in the new entry |
| the exported schema                                     | a value exported by the new entry                                                    |
| the copy as text                                        | the `toText` of the registration, read by `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts:blocksToPlainText` |

## What is not decided yet

No rule here is left without an expected place. The open questions of the spec decide the
behaviour inside those places — the limits, the histogram bins, the formats, the PNG contents and
the copy layout — not where it is carried out.
