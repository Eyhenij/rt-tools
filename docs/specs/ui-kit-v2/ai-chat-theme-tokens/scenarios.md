# Scenarios — the look handles of the assistant chat

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
by `pnpm run spec:next-id SC-UKV` as the next free ones and do not change after the merge into the
spec: the titles of the tests refer to them.

What a scenario is covered by is said under it. A handle default, a part declaration and a
pass-down are style rules: the compiled CSS of the component is asked for them, as the chat already
asks it about the scroll stop. Hover and focus in the stories are set by the pseudo-state
parameters of the showcase, not by play steps. The look with changed handles is shown by the
snapshots of the stories **Properties**, **Properties · focus** and **Properties · row actions**.

### SC-UKV-1582 — the question and the answer take their sizes from the chat

Given a chat with `--rt-ai-chat-question-font-size` and `--rt-ai-chat-answer-font-size` set on its element
When a question and an answer are drawn
Then the question text and the answer text are drawn in those sizes

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the font cell.

### SC-UKV-1583 — the chat family reaches the whole feed

Given a chat with `--rt-ai-chat-font-family` set on its element
When a question and an answer are drawn
Then the feed is drawn in that family, the question text, the author label, the time, the answer
status and the answer text included; without it the feed keeps the page family and the answer text
the kit sans family

Covered by a test of the compiled CSS: the feed reads the handle with no fallback, and the markdown
text takes it by the pass-down. The look is shown by the snapshot of the story **Properties**, the
font cell and the default cell.

### SC-UKV-1584 — Send and Stop take the chat primary colour

Given a chat with `--rt-ai-chat-send-bg` and `--rt-ai-chat-send-bg-hover` set on its element
When Send is drawn, hovered and disabled, and Stop is drawn while sending
Then both take that fill and that hover fill, the disabled Send draws a share of that fill, and an
`--rt-icon-button-bg` set on an ancestor still beats them

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties · focus**, with Send and Stop hovered by its pseudo-state parameter.

### SC-UKV-1585 — the prompt box in focus takes the chat ring

Given a chat with `--rt-ai-chat-focus-border-color` and `--rt-ai-chat-focus-shadow` set on its element
When the prompt field gets the focus
Then the box draws that border colour and that ring

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties · focus**, with the field focused by its pseudo-state parameter.

### SC-UKV-1586 — a chosen rating takes the chat colours, also under the pointer

Given a chat with `--rt-ai-chat-rating-active-bg` and `--rt-ai-chat-rating-active-color` set on its element
And an answer rated «liked»
When the answer is drawn and the pointer rests on the like button
Then the like button draws that fill and that icon colour, at rest and under the pointer, and the
dislike button keeps its look

Covered by a test of the compiled CSS of the answer: the chosen button reads both handles with the
fill and the colour of the icon button as the fallback, at rest and under the pointer, and the chat
declares no default for them. The look is shown by the snapshot of
the story **Properties · focus**.

### SC-UKV-1587 — the header and the column head take one height and divider

Given a chat with the thread column, and `--rt-ai-chat-header-height`,
`--rt-ai-chat-header-border-width` and `--rt-ai-chat-header-border-color` set on its element
When the header and the column head are drawn
Then each is that high in full with its divider included, a divider of that width and colour
stands under each, their content stays centred, and the two tops stand on one line

Covered by a test of the compiled CSS: the header and the column head read the same three handles.
The snapshot of the story **Properties**, the header cell, shows the header; the column head is
drawn only in the full screen, and its height is measured there in the running showcase.

### SC-UKV-1588 — suggestion cards take the chat width and rounding, never wider than the column

Given a chat with no messages, suggestions, and `--rt-ai-chat-suggestion-width` and
`--rt-ai-chat-suggestion-radius` set on its element
When the start screen is drawn in a wide and in a narrow chat
Then in the wide chat every card is that wide and stands at the start of the column, in the narrow
chat the cards take the column width, and every card takes that rounding

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

Given a chat with `--rt-ai-chat-bg` and `--rt-ai-chat-prompt-bg` set to two different values on its element
When the chat is drawn
Then the panel takes the first and the prompt box the second

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties**, the background cell.

### SC-UKV-1592 — the row actions take the chat background, padding and rounding

Given a chat with conversations, `--rt-ai-chat-thread-actions-bg`, `--rt-ai-chat-thread-actions-bg-active`,
`--rt-ai-chat-thread-actions-padding-inline` and `--rt-ai-chat-thread-action-radius` set on its element
When the row actions of an ordinary row and of the active row are shown, with `threadMenu` on and off
Then they take those backgrounds and that padding, and the menu button and the delete button take
that rounding, unless a button sets its own by its `radius` input

Covered by a test of the compiled CSS of the conversation list: the rounding rule is weaker than the
`radius` input of the button. The look is shown by the snapshot of the story
**Properties · row actions**, with one row hovered by its pseudo-state parameter.

### SC-UKV-1593 — the row time under the shown actions is hidden only on request

Given a chat with conversations that have a time and an unread count
When the row actions of a row are shown without `--rt-ai-chat-thread-time-under-actions` set
Then the row time stays as today, covered by the actions background
And when the handle is `hidden`, the row time of that row is not seen and keeps its place, while
its unread badge and the row time of the other rows stay
And on a touch screen, where the actions of every row are always shown, the handle `hidden` hides
the time of every row

Not covered: a test has no layout, and this is a style rule. It is shown by the snapshot of the
story **Properties · row actions**: the row with the unread badge is hovered, its time is hidden in
the cell with the handle while its badge stays, and the time of the other rows stays. The touch case
is not in a frame: the showcase does not emulate a screen without a pointer. The rule that sets the
visibility stands outside the hover media query.

### SC-UKV-1594 — the parts take their own handles outside the chat

Given a markdown text, a prompt input and a conversation list each used alone, with their part
handles set
When they are drawn, and the prompt input is drawn `disabled`
Then each takes the values of its own handles, and the disabled prompt box keeps its disabled
background whatever `--rt-ai-prompt-input-bg` is

Covered by a test of the compiled CSS of each part: the part declares its handles on its block
with today's value, every property reads them with no fallback, and the disabled box sets its own
background.

### SC-UKV-1595 — a chat handle reaches its part

Given a chat with chat handles set on its element
When its parts are drawn inside it
Then each part takes the value of the matching chat handle

Covered by a test of the compiled CSS: the chat sets every part handle from its chat handle by a
rule on the block of the part, and declares no part handle on its own element. The computed value at each part is measured in the running
showcase.

### SC-UKV-1596 — without the new handles the chat looks as before

Given a chat without any new handle and without the input `questionAuthor`
When it is drawn in the light and in the dark theme
Then it looks as before

Covered by a test of the compiled CSS: every chat handle defaults and every part handle falls back
to the value the property took before. The former snapshots of the chat family match without a
re-take.

### SC-UKV-1597 — the showcase sets the handles without an internal selector

Given the stories **Properties**, **Properties · focus** and **Properties · row actions**
When their own CSS is read
Then every handle is set by a rule on the `rt-ai-chat` element, and no selector names
`.rt-ai-chat__`, `.rt-thread-list__`, `.rt-ai-prompt-input__` or `.rt-markdown-text`

Covered by a test that reads the CSS of those stories. The rules lie in the kit layer, as every
story's styles must, and win by the cell attribute; an application rule outside the layers wins
without one.

### SC-UKV-1598 — the search fills the head of the list inside the chat

Given a chat with its conversation list open
When the head of the list is drawn
Then the search fills it up to the filter button, with no width cap

Covered by a test of the compiled CSS: the search grows and declares no `max-inline-size`. The
search width against the head is measured in the running showcase.

### SC-UKV-1599 — the headings and code of an answer keep their own type

Given a chat with `--rt-ai-chat-font-family` and `--rt-ai-chat-answer-font-size` set on its element
And an answer with a heading, inline code and a code block
When the answer is drawn
Then the heading keeps its own size, and the code keeps the mono family and its own size

Covered by a test of the compiled CSS of the markdown text: its headings and code do not read the
part handles of the family and the size.
