# What it is carried out by — a deleted reply of one's own in the messenger look

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The placeholder of a deleted reply of one's own is muted and italic, the same as of a deleted reply of the other side.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-messenger.scss:rt-chat__message--deleted` — the white colour goes only to a reply of one's own that is not deleted; scenarios `SC-UKV-1235`, `SC-UKV-1236`
- **The date and the status sign of a deleted reply of one's own take the colours of a reply without a fill.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-messenger.scss:rt-chat__message--deleted` — the same selector guards the date and the status sign; scenario `SC-UKV-1235`
- **A deleted reply in the messenger look casts no shadow.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-messenger.scss:rt-chat__message--deleted`; scenario `SC-UKV-1235`
