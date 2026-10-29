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

### SC-UKV-1064 — a long title holds one line and shows itself in the hint

Given the correspondence header has a title longer than its place
When the correspondence is drawn
Then the title stays on one line cut by the ellipsis, and its hint holds the whole title

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.
Coverage: partial — the test reads the title styles and the hint; one line is measured on the consumer screen at widths 375 to 1440.

### SC-UKV-1066 — the day label names today and yesterday in words, earlier days by date

Given a thread with messages of yesterday and of today
When the day labels are computed
Then only the first message of each day carries a label: «today» and «yesterday» in the language
of the thread, an earlier day by its date, and the year only for past years

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat-days.logic.spec.ts`.

### SC-UKV-1067 — the messenger look of the correspondence

Given the correspondence is drawn with the `messenger` input
When the thread and the reply field are drawn
Then a day label stands above the first message of the day, the author line is hidden, the own
bubble takes the action colour, and the reply field is the kit one-line field with a row of
buttons under it, the attach button first

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts`.
Coverage: partial — the test reads the markup and the styles; the look is measured on the consumer screen.
