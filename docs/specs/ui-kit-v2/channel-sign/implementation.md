# What it is carried out by — the sign of a conversation channel

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The sign is one mark of `rt-service-logo` at the size `xs`.** — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.html:row-sign`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-sign`; scenarios `SC-UKV-909`, `SC-UKV-911`
- **A mark of a company is an image by address, a channel without a company is an icon of the kit.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.model.ts:IRtServiceLogo` — the field `sign` of the row and the input `sign` of the correspondence take its `Item`; scenario `SC-UKV-913`
- **A row with a sign draws it first in the row button, before the content of the row template.** — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.html:row-content`, the gap and the centring — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.scss:__row-content`; scenario `SC-UKV-909`
- **A row without a sign is drawn as before.** — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.html:rowContent` — the branch without the sign draws the template with no wrapper; scenario `SC-UKV-910`
- **The header draws the sign before the title when the input is given.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:sign`, the gap is the gap of the left bar — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss:--left`; scenario `SC-UKV-911`
- **The header without the input is drawn as before.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-sign` — the sign stands behind its own condition; scenario `SC-UKV-912`
- **The sign carries the name of the channel for a screen reader.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.html:aria-label`; scenarios `SC-UKV-911`, `SC-UKV-913`
