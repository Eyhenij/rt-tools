# What it is carried out by — the undelivered status of a chat reply

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The status `undelivered` is a value of the reply status next to `sending`, `sent`, `read` and `failed`.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts:ERtChatMessageStatus`; scenario `SC-UKV-914`
- **An undelivered reply draws a warning icon and a visible caption under its text.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-message-undelivered`, the colour — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.scss:__status-caption`; scenario `SC-UKV-914`
- **An undelivered reply has no retry button.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-message-retry` — the button stands only in the branch of `failed`; scenario `SC-UKV-914`
- **The caption is a label of the kit, and the application overrides it like the other status labels.** — `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts:chatStatusUndelivered`, the key for a screen reader — `projects/ui-kit-v2/src/rich-editor/lib/pipes/rt-chat-status-label.pipe.ts:STATUS_KEYS`; scenario `SC-UKV-915`
