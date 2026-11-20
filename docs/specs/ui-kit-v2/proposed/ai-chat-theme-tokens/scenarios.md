# Scenarios — the look handles of the assistant chat

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
by `pnpm run spec:next-id SC-UKV` as the next free ones and do not change after the merge into the
spec: the titles of the tests refer to them.

What a scenario will be covered by is said under it. A handle default and a pass-down are style
rules: the compiled CSS of the component is asked for them, as the chat already asks it about the
scroll stop. The look with changed handles is shown by the snapshot of the chat story
**Properties**. The scenarios a test is planned for stay red in the spec audit until that test
exists.

### SC-UKV-1582 — the question and the answer take their sizes from the chat

Given a chat with `--rt-ai-chat-question-font-size` and `--rt-ai-chat-answer-font-size` set on its root
When a question and an answer are drawn
Then the question text and the answer text are drawn in those sizes, and the markdown text of the
answer reads its size from `--rt-markdown-text-font-size`

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the font cell.

### SC-UKV-1583 — the chat family reaches the question and the answer

Given a chat with `--rt-ai-chat-font-family` set on its root
When a question and an answer are drawn
Then both are drawn in that family; without it the question keeps the page family and the answer
the kit sans family

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the font cell, and by the default cell.

### SC-UKV-1584 — Send and Stop take the chat primary colour

Given a chat with `--rt-ai-chat-send-bg` and `--rt-ai-chat-send-bg-hover` set on its root
When Send is drawn, hovered, and Stop is drawn while sending
Then both buttons take that fill and that hover fill

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the primary colour cell.

### SC-UKV-1585 — the prompt box in focus takes the chat ring

Given a chat with `--rt-ai-chat-focus-border-color` and `--rt-ai-chat-focus-shadow` set on its root
When the prompt field gets the focus
Then the box draws that border colour and that ring

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the primary colour cell, with the field focused
by its play step.

### SC-UKV-1586 — a chosen rating takes the chat colours

Given a chat with `--rt-ai-chat-rating-active-bg` and `--rt-ai-chat-rating-active-color` set on its root
And an answer rated «liked»
When the answer is drawn
Then the like button draws that fill and that icon colour, and the dislike button keeps its look

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the primary colour cell.

### SC-UKV-1587 — the header draws a divider and keeps its least height

Given a chat with `--rt-ai-chat-header-border-width`, `--rt-ai-chat-header-border-color` and
`--rt-ai-chat-header-min-height` set on its root
When the header is drawn
Then a divider of that width and colour stands under it, the header is no lower than that height,
and its title and actions stay centred across it

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the header cell.

### SC-UKV-1588 — suggestion cards take the chat width and rounding

Given a chat with no messages, suggestions, and `--rt-ai-chat-suggestion-width` and
`--rt-ai-chat-suggestion-radius` set on its root
When the start screen is drawn
Then every card is that wide, stands at the start of the column and takes that rounding

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the suggestion cell.

### SC-UKV-1589 — `questionAuthor` off leaves the author label out

Given a chat with `questionAuthor` set to `false` and a question
When the question is drawn
Then its bubble holds no author label node and starts with the question text

Covered by a test of the chat component: the node `rt-ai-chat__author` is absent.

### SC-UKV-1590 — the author label is drawn by default

Given a chat without the input `questionAuthor` and a question
When the question is drawn
Then its bubble holds the author label «You» above the text, as before

Covered by a test of the chat component: the node `rt-ai-chat__author` holds the kit label.

### SC-UKV-1591 — the panel and the prompt box take two backgrounds

Given a chat with `--rt-ai-chat-bg` and `--rt-ai-chat-prompt-bg` set to two different values on its root
When the chat is drawn
Then the panel takes the first and the prompt box the second; the disabled prompt box keeps its
disabled background

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the background cell.

### SC-UKV-1592 — the row actions take the chat background and rounding

Given a chat with conversations, `threadMenu` on, and `--rt-ai-chat-thread-actions-bg`,
`--rt-ai-chat-thread-actions-bg-active` and `--rt-ai-chat-thread-action-radius` set on its root
When the row actions of an ordinary row and of the active row are shown
Then they take those backgrounds, and the menu button takes that rounding

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the row menu cell, with the actions shown by
its play step.

### SC-UKV-1593 — the row time is not drawn under the shown actions

Given a chat with conversations that have a time, and the row actions background set to transparent
When the row actions of a row are shown
Then the time of that row is not seen through them, and the time of the other rows stays

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the row menu cell.

### SC-UKV-1594 — the parts take their own handles outside the chat

Given a markdown text, a prompt input and a conversation list each used alone, with their own new
handles set
When they are drawn
Then each takes the values of its own handles

Covered by a test of the compiled CSS of each part: every part property reads its own handle.

### SC-UKV-1595 — a chat handle reaches a part that declares its own

Given a chat with a chat handle set on its root, and its part declaring the matching handle of its own
When the part is drawn inside the chat
Then the part takes the value of the chat handle

Covered by a test of the compiled CSS of the chat: the chat sets every part handle from its own.

### SC-UKV-1596 — without the new handles the chat looks as before

Given a chat without any new handle and without the input `questionAuthor`
When it is drawn in the light and in the dark theme
Then it looks as before

Covered by a test of the compiled CSS: every new handle defaults to the value the property took
before. The former snapshots of the chat family match without a re-take.
