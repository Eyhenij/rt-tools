# What it is carried out by — a ready text in the reply field of a correspondence

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The method replaces the draft whole.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:setDraft`; scenario `SC-UKV-1157`
- **A label stands in place of the time.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:dateLabel`; scenario `SC-UKV-1163`
- **An icon stands in place of the status icon, at its size.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:dateIcon`; scenario `SC-UKV-1164`
- **The bar stands above the frame of every reply field.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:rtChatComposerBar`; scenarios `SC-UKV-1165`, `SC-UKV-1166`
- **The draft is read as plain text in all reply fields.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:draftText`, `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:draftText`; scenarios `SC-UKV-1167`, `SC-UKV-1168`
- **The cursor stands in the field after the last character.** — `projects/ui-kit-v2/src/lib/components/ai-prompt-input/rt-ai-prompt-input.component.ts:rtCaretToEnd`; scenario `SC-UKV-1157`
- **The method works in all three reply fields.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:setDraft`, `projects/ui-kit-v2/src/lib/components/ai-prompt-input/rt-ai-prompt-input.component.ts:setDraft`; scenario `SC-UKV-1158`
- **The chosen files stay.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:setDraft`; scenario `SC-UKV-1159`
- **A closed field takes nothing.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:composerDisabled`; scenario `SC-UKV-1160`
- **The method is not typing.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:setDraft`; scenario `SC-UKV-1161`
- **The chosen files of the draft are read by a method of their own.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:draftFiles`; scenarios `SC-UKV-1169`, `SC-UKV-1170`
