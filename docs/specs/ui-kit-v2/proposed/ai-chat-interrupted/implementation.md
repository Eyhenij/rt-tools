# Binding — the interrupted answer of the assistant chat

There is no code yet, so there is no binding of the form `file:symbol` here: the agreement is written
before the code, and the place of execution appears together with it. Here are only the foreseen
places, so that the merge into the domain spec shows where to look.

## Where it is foreseen

| Rule                                                        | Where it is foreseen                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| the field `interrupted` of an assistant message             | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts`, `AssistantMessage`           |
| the label and the action under the blocks, streaming hides  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.html`           |
| an empty answer: run line, attachments, label, nothing else | the same template; the blocks are already drawn only when there is one                                        |
| «Copy» and the rating of a partial answer, none for empty   | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.ts`             |
| the copy leaves the label out                               | the same component; the copy text comes from the blocks only                                                  |
| the description id, unique per drawn answer                 | the same component: a counter of the instance, not the message id                                             |
| the output `askAgain` with the id                           | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.ts` and its template          |
| the action disabled while sending                           | a new input `sending` of the answer component, bound in `rt-ai-chat.component.html` from the chat's `sending` |
| the label in the live region of the feed                    | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.html`, the `feed` element     |
| the run error unchanged                                     | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.html`, the `error` row        |
| the label «Answer interrupted»                              | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`, `projects/ui-kit-v2/.storybook/showcase-labels.ru.ts`  |
| the row, hover, focus ring, right to left and the widths    | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.scss`           |
| both showcase answers, the widths, right to left, dark      | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories`                                           |

The scenarios are checked by a spec next to the chat, as `rt-ai-chat.sources.spec.ts` checks the
sources block; the test titles name the numbers from `scenarios.md`.
