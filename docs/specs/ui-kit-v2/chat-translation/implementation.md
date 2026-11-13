# What it is carried out by — the translation of a chat reply

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The translation caption stands in the time line of a reply, before the time.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-message-translation`; scenario `SC-UKV-1237`
- **A reply without a translation caption keeps its time line as it was.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts:translationLabel` — the field is optional; scenario `SC-UKV-1238`
- **The translation button stands under the text of a reply the application marked.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts:canShowTranslation`; scenarios `SC-UKV-1238`, `SC-UKV-1239`
- **A press on the translation button reports the reply and changes nothing in the thread.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:showTranslation`; scenario `SC-UKV-1239`
- **On the filled bubble of one's own reply the translation button takes the colour of the text on the fill and is underlined.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.scss:rt-chat__message-translate`; scenario `SC-UKV-1240`
- **While the translation loads, the translation button shows a spinner and takes no press.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts:translationLoading`; scenario `SC-UKV-1248`
- **A failed translation shows the error text of the application as a line above the translation button.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts:translationError`; scenario `SC-UKV-1249`
- **A reply without an error and without loading shows neither the error line nor the spinner.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.scss:rt-chat__message-translate-error`; scenario `SC-UKV-1250`
