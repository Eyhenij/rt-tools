# Scenarios — the translation of a chat reply

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1237 — the translation caption stands in the time line before the time

Given a reply carries the translation caption «Translated» and the time «12:58»
When the thread is drawn
Then the time line of the reply reads «Translated · 12:58»

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1238 — a reply without a caption keeps its time line and has no button

Given a reply carries neither the translation caption nor the flag of the translation button
When the thread is drawn
Then the time line holds only the time, and the reply has no translation button

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1239 — a press on the translation button reports the reply

Given a reply carries the flag of the translation button
When a person presses the button under the text of the reply
Then the chat reports this reply by the output `showTranslation`, and the text of the reply stays

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1240 — the button on a filled bubble of one's own takes the colour of the text on the fill

Given the chat is drawn in the messenger look
When the styles of the translation button are read
Then the button of one's own reply takes the colour of the text on the fill and is underlined

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1248 — a loading translation locks the translation button

Given a reply carries the flag of the translation button and the flag of loading
When a person presses the translation button
Then the button is disabled, shows a spinner, and the chat reports nothing

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1249 — a failed translation shows the error line above the button

Given a reply carries the flag of the translation button and an error text
When a person presses the translation button
Then the error text stands right above the button, and the chat reports the reply again

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.

### SC-UKV-1250 — without an error and loading the line and the spinner are hidden

Given a reply carries only the flag of the translation button
When the thread is drawn and the styles are read
Then the error line is empty and hidden, and the spinner shows only while loading

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-translation.spec.ts`.
