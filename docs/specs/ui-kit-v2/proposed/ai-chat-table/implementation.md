# What it will be carried out by — the table block of the assistant chat

There is no code yet, so no binding of the form `file:symbol` stands here: the agreement is written
before the code, and the places appear with it. Here are only the foreseen places, so that the
merge into the domain spec shows where to look. Every rule of the spec has a foreseen place; none
is left without one.

## Where execution is foreseen

| Rules of the spec                                                   | Where it is foreseen                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `table` is a kit type; a renderer for `table` is not taken          | `OWN_TYPES` and `toBlockViews` in `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts` |
| the block shape, the plate for a broken block                       | the model `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts` and a guard next to `isMarkdownBlock` |
| unknown column type, short and long rows, empty rows                | a pure helper of the core entry next to `projects/ui-kit-v2/src/lib/util/markdown-parse.ts`                  |
| writing a value, the currency fallback, the minus, the colour flag  | a pure cell format helper of the core entry in `projects/ui-kit-v2/src/lib/util/`                            |
| the locale change                                                   | the block component in the ai-chat `blocks` directory, reading the kit label locale                          |
| alignment, widths, side scroll, maximum height, sticky head, total  | the block component styles; the markup taken from the chart data table                                       |
| the look in both themes                                             | the block styles on the kit tokens, the markdown table styles in `projects/ui-kit-v2/src/lib/components/markdown-text` |
| the CSV, its escaping, raw numbers                                  | a pure CSV helper of the core entry in `projects/ui-kit-v2/src/lib/util/`                                    |
| «Copy CSV», «Copied» for two seconds, a refused copy, live status   | the block component over the CDK `Clipboard`, as `rt-ai-chat-copy` does                                      |
| the answer copy as tab-separated lines                              | `blocksToPlainText` in `rt-ai-chat-blocks.logic.ts`, the separator as in `projects/ui-kit-v2/src/lib/util/markdown-plain-text.ts` |
| the markdown divider alignment, fitting a markdown row to the head  | `readTable` in `projects/ui-kit-v2/src/lib/util/markdown-parse.ts` and the table node in `markdown.model.ts` |
| the markdown table detects no type, has no CSV                      | the table template of `rt-markdown-text`                                                                     |
| table semantics, the named scroll box, the button name              | the block component template                                                                                 |
| the kit labels «Copy CSV», «Copied», «Table»                        | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`                                                        |

## What changes in the live spec at the merge

The subdomain `ai-chat` names the kit's own types as `markdown` and `notice` in two rules, in the
terminology of the block and in its decision about heavy blocks; at the merge they name `table`
too. Its out-of-scope line about drawing a table by a registered renderer is edited by the same
commit: a table is no longer the consumer's block.
