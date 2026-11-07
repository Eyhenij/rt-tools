# Scenarios — a ready text in the reply field of a correspondence

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1157 — a ready text replaces the draft in the classic field

Given the classic reply field holds a draft
When the consumer calls `setDraft`
Then the field holds the new text, it has focus, and the cursor stands after the last character

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1158 — a ready text stands in the rich composer and in the messenger field

Given a correspondence with the rich composer, and one in the messenger view
When the consumer calls `setDraft`
Then each field holds the new text, has focus and has the cursor after the last character

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1159 — the chosen files stay

Given the reply field holds a chosen file
When the consumer calls `setDraft`
Then the file stays chosen

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1160 — a closed field takes nothing

Given a reply is sending, or no reply is allowed
When the consumer calls `setDraft`
Then the draft stays as it was

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1161 — a ready text is not typing

Given the reply field is empty
When the consumer calls `setDraft`
Then the correspondence sends no typing signal

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1163 — a label stands in place of the time

Given a message with `dateLabel`
When the correspondence draws it
Then the footer shows the label, and a message without it shows the time

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1164 — an icon stands in place of the status icon

Given a message with `dateIcon`
When the correspondence draws it
Then the icon stands at the size of the status icon, and a failed message keeps its own icon

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1165 — the bar stands above every reply field

Given a correspondence with the slot `rtChatComposerBar` and any kind of the field
When a reply is allowed
Then the slot stands above the field, and with no reply allowed it is gone

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1166 — an empty bar takes no place

Given a correspondence with nothing in the slot
When the reply field is drawn
Then the slot has no nodes, and the style hides it

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1167 — the draft is read in every reply field

Given a text in the classic field, the rich composer or the messenger field
When the consumer calls `draftText`
Then the method returns that text without markup

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.

### SC-UKV-1168 — reading leaves the files alone

Given chosen files, or no reply field at all
When the consumer calls `draftText`
Then the files stay and the answer holds the text only

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-reply-field.component.spec.ts`.
