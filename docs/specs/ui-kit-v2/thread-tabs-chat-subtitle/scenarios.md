# Scenarios — the tabs of the conversation list and the line under the chat title

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1060 — the tabs template stands under the list header and above the rows

Given the conversation list has a tabs template
When the list is drawn
Then the tabs strip holds the template, stands after the header and before the rows

Covered: `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts`.

### SC-UKV-1061 — a list without the tabs template has no tabs strip

Given the conversation list has no tabs template
When the list is drawn
Then there is no tabs strip, the rows follow the header

Covered: `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts`.

### SC-UKV-1062 — the subtitle stands under the title in one column

Given the correspondence header has a sign, a title and a subtitle
When the correspondence is drawn
Then the subtitle stands right after the title in one column, and the column follows the sign

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-1063 — a header without the subtitle is drawn as before

Given the correspondence header has a title and no subtitle
When the correspondence is drawn
Then the header holds the title, and the subtitle line is hidden

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.
