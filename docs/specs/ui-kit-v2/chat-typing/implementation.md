# What it is carried out by — the sign of typing in a correspondence

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **One stretch of typing gives one «started» and one «stopped».** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.ts:RtChatTypingTracker`; scenario `SC-UKV-579`
- **The stretch is over on an emptied field, on sending and after the pause.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.ts:RT_CHAT_TYPING_PAUSE_MS`, sending — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:onSubmit`; scenarios `SC-UKV-580`, `SC-UKV-581`
- **Typing is caught in both modes of the reply field.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:onReplyInput` — listened on the classic form and on the rich composer; scenario `SC-UKV-582`
- **Choosing a file is not typing.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.ts:typingDraft`; scenario `SC-UKV-582`
- **The text of the typing line is set by the consumer.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:typingText`; scenario `SC-UKV-583`
- **An empty typing line hides the plate.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:shown`; scenario `SC-UKV-583`
- **The typing line does not shift the thread.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.scss:__typing` — the plate is positioned over the thread viewport. **Not checked by a run:** that the thread does not move is seen in the showcase frame, not in a spec
- **The typing line is announced politely by a screen reader.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:aria-live`; scenario `SC-UKV-583`
- **A destroyed correspondence sends nothing.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.ts:DestroyRef`; scenario `SC-UKV-584`
