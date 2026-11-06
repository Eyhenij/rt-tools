# Scenarios — a ready text in the reply field of a correspondence

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1157 — a ready text replaces the draft in the classic field

Given the classic reply field holds a draft
When the consumer calls `setDraft`
Then the field holds the new text, it has focus, and the cursor stands after the last character

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1158 — a ready text stands in the rich composer and in the messenger field

Given a correspondence with the rich composer, and one in the messenger view
When the consumer calls `setDraft`
Then each field holds the new text, has focus and has the cursor after the last character

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1159 — the chosen files stay

Given the reply field holds a chosen file
When the consumer calls `setDraft`
Then the file stays chosen

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1160 — a closed field takes nothing

Given a reply is sending, or no reply is allowed
When the consumer calls `setDraft`
Then the draft stays as it was

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1161 — a ready text is not typing

Given the reply field is empty
When the consumer calls `setDraft`
Then the correspondence sends no typing signal

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.
