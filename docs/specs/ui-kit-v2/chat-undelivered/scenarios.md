# Scenarios — the undelivered status of a chat reply

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-914 — an undelivered reply draws the icon and the caption without a retry button

Given a reply of one's own carries the status `undelivered`
When the correspondence is drawn
Then the footer of the reply holds the warning icon and the caption, and no retry button

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-915 — the undelivered status is read by its own label

Given the status `undelivered`
When the label of the status is asked
Then the key `rtKit.chatStatusUndelivered` comes back

Covered: `projects/ui-kit-v2/src/rich-editor/lib/pipes/rt-chat-status-label.pipe.spec.ts`.
