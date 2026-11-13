# Scenarios — a deleted reply of one's own in the messenger look

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1235 — the placeholder of a deleted reply of one's own is not white in the messenger look

Given the chat is drawn in the messenger look and a reply of one's own carries the flag `deleted`
When the styles of the thread are read
Then the rule that paints a reply of one's own white does not match a deleted reply

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-messenger-styles.spec.ts`.

### SC-UKV-1236 — a deleted reply of one's own keeps both modifiers on its bubble

Given a reply of one's own carries the flag `deleted`
When the thread is drawn
Then the bubble carries the modifiers `own` and `deleted`, and the placeholder carries `deleted`

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.
