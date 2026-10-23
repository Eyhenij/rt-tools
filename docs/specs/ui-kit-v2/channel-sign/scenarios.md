# Scenarios — the sign of a conversation channel

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-909 — a row with a sign draws it first in the row button

Given a row of the conversation list carries a sign
When the list is drawn
Then the row button holds the sign at the size `xs` before the content of the row template

Covered: `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts`.

### SC-UKV-910 — a row without a sign draws no sign

Given a row of the conversation list carries no sign
When the list is drawn
Then the row button holds only the content of the row template

Covered: `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts`.

### SC-UKV-911 — the header with a sign draws it before the title

Given the correspondence has a header and the sign input is given
When the correspondence is drawn
Then the header holds the sign at the size `xs`, and the title stands after it

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-912 — the header without a sign draws only the title

Given the correspondence has a header and the sign input is not given
When the correspondence is drawn
Then the header holds the title and no sign

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-913 — the sign is read by the name of the channel

Given a row carries a sign with the label «Telegram»
When a screen reader reaches the sign
Then it reads «Telegram», and the sign takes no focus of its own

Covered: `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts`.
