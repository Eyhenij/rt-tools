# Scenarios — the sign of typing in a correspondence

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-579 — one stretch of typing gives one «started»

Given the reply field is empty
When the person types several characters in a row
Then the correspondence sends «started» once, not per character

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.spec.ts`.

### SC-UKV-580 — the pause ends the stretch

Given the person typed and stopped
When 3 seconds pass without input
Then the correspondence sends «stopped» once, and the next input starts a new stretch

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.spec.ts`.

### SC-UKV-581 — an emptied field and sending end the stretch

Given a stretch of typing is going
When the person erases the text or sends the reply
Then the correspondence sends «stopped» at once, and nothing more after the pause

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.spec.ts`,
`projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-582 — typing is caught in both modes, a file is not typing

Given the reply field in the classic mode or the rich composer
When the person types in it, or chooses a file
Then typing sends «started», and choosing a file sends nothing

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.spec.ts`,
`projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-583 — the typing line shows and hides by its text

Given the consumer passes the typing line
When the text is not empty, and then becomes empty
Then the plate with the text stands over the bottom of the thread, and then it is gone; the live
region stays in the markup

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-584 — a destroyed correspondence sends nothing

Given a stretch of typing is going
When the correspondence is destroyed before the pause ends
Then no «stopped» is sent after the destruction

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-typing.logic.spec.ts`.
