# Scenarios — the assistant chat

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-750 — a suggestion card sends its text

Given an empty conversation with suggestions
When a card is pressed
Then its text is sent as a question

Covered by the component spec of the organism and the frame `Empty`.

### SC-UKV-751 — a question on the right, an answer on the left

Given a question and an answer
When the feed is drawn
Then the question stands in a bubble with «You» and the answer as its markdown block

Covered by the component spec of the organism and the frame `Answer`.

### SC-UKV-752 — the run line above the answer opens its steps

Given an answer with a run that has steps
When the run line is pressed
Then the steps of that answer open

Covered by the component spec of the organism.

### SC-UKV-753 — the rating appears when the text is written and toggles off

Given an answer still being written
When the text is written and the chosen rating is pressed again
Then the rating appears and the second press reports no rating

Covered by the component spec of the organism and the frame `Answer`.

### SC-UKV-754 — while an answer is written the composer offers Stop

Given an answer being written
When the panel is drawn
Then the composer offers Stop and «New conversation» and the suggestions are off

Covered by the component spec of the organism.

### SC-UKV-755 — a run error with the reference number and «Ask again»

Given a run error with a reference number that can be asked again
When the panel is drawn
Then the message, the reference number with a copy button and «Ask again» stand under the feed

Covered by the component spec of the organism and the frame `RunError`.

### SC-UKV-756 — the conversations in place of the feed and as a column

Given a panel with conversations
When «Conversations» is pressed, or the panel is on full screen
Then the list stands in place of the feed, or as a column beside it; choosing one returns to the feed

Covered by the component spec of the organism and the frames `Threads` and `FullScreen`.

### SC-UKV-757 — the search over conversations marks matches

Given conversations and a search text
When the list is drawn
Then every match in a title is marked, and an empty result says «Nothing found»

Covered by the component spec of the organism.

### SC-UKV-758 — deleting a conversation does not open it

Given the list of conversations
When the delete action of a row is pressed
Then the delete request is reported and the conversation is not chosen

Covered by the component spec of the organism and the spec of the thread list.

### SC-UKV-759 — the consumer's attachments under the answer

Given a template of attachments
When an answer is drawn
Then the template stands under the answer text and receives the message

Covered by the component spec of the organism and the frame `Extra`.

### SC-UKV-760 — the consumer's texts and the kit's defaults

Given a panel without the consumer's texts
When a title and a line under the composer are given, or the line is empty
Then the given texts stand in place of the kit's, and an empty line hides it

Covered by the component spec of the organism.

### SC-UKV-761 — focus follows the person

Given a panel with conversations
When the list of conversations is opened and a conversation is chosen
Then focus stands on «Back to conversation», then in the composer

Covered by the component spec of the organism.

### SC-UKV-775 — the thread list draws a preview row per icon

Given an empty thread list
When no icons are given, or four icons are given
Then three rows with people stand with the middle one shifted, or four rows with the given icons stand with every second one shifted

Covered by the spec of the thread list.

### SC-UKV-776 — the empty list of conversations shows the assistant's marks

Given a panel with an empty list of conversations
When no icons are given, or the consumer gives its own
Then the preview rows show the spark, the bot and the spark, or the consumer's icons

Covered by the component spec of the organism.

### SC-UKV-777 — a written answer copies its text without markdown

Given an answer being written, then written
When «Copy» first in its rating row is pressed
Then the button is absent while the answer is written, the answer text goes into the clipboard without heading, bold and list signs and without the run line and the attachments, and «Copied» with a check stands for two seconds

Covered by the component spec of the organism and the frame `Answer`.

### SC-UKV-778 — a question copies its text, and copying turns off

Given a question and an answer
When «Copy» under the question bubble is pressed, then copying is turned off
Then the question text goes into the clipboard as it is, and with copying off neither button is drawn while the rating stays

Covered by the component spec of the organism and the frame `Answer`.

### SC-UKV-780 — the header icons switch to the material drawings

Given a panel with conversations
When it is drawn by default, and then with the header icons set to `material`
Then by default the header carries no sign and «Close» refers to the kit symbol; with `material` the header carries the sign of the icons alone and not the material preset, and «Close» and «Conversations» refer to the material symbols

Covered by the component spec of the organism and the frame `Answer`.

### SC-UKV-781 — by default the row of a conversation has the delete button

Given the list of conversations and no conversation menu asked for
When the list is drawn
Then every row has the delete button and no «More actions»

Covered by the component spec of the organism.

### SC-UKV-782 — the conversation menu copies the id and deletes

Given the list of conversations with the conversation menu
When «More actions» of a row is pressed, then «Copy ID» or «Delete»
Then the menu holds «Copy ID» and «Delete» in the danger tone, «Copy ID» puts the conversation id into the clipboard, «Delete» reports the delete request without confirmation, neither opens the conversation, and Escape closes the menu and returns focus to «More actions»

Covered by the component spec of the organism; the Playground switch `threadMenu` shows it.

### SC-UKV-863 — the feed and the composer stand as a column in the middle

Given a wide panel on full screen with the conversations as a column
When the consumer caps the width of the feed and the composer
Then the questions, the answers, the composer and the line under it stand in a column of that width in the middle of the conversation, and the feed scrolls at the conversation's edge; without the cap they take the whole conversation as before

Not covered: a test has no layout at all — the column is seen by the showcase frame `ReadingColumn`,
and the frame `FullScreen` shows the conversation without the cap.

### SC-UKV-1073 — a bare address becomes a link

Given an answer with a bare `https://` address followed by a full stop
When the answer is drawn
Then the address is a link to itself, and the full stop after it stays text. A closing bracket without a pair inside the address stays text. An address inside a word or of another scheme stays text

Covered by the spec of the markdown parser.

### SC-UKV-1074 — an underscore inside a word stays a sign

Given an answer with `booking_source_id` and `_important_`
When the answer is drawn
Then `booking_source_id` keeps both underscores and no emphasis, and `_important_` is emphasis

Covered by the spec of the markdown parser.

### SC-UKV-1075 — a long word and an address in an answer wrap

Given a narrow panel and an answer with an address longer than the panel
When the answer is drawn
Then the address wraps inside the panel, and the feed does not scroll sideways

Covered by the styles spec of the markdown text; the showcase frame of the answer shows the look.

### SC-UKV-1076 — a swipe at the edge stays in the chat

Given the chat over a page that scrolls
When the feed or the list of conversations is swiped past its edge
Then the page under the chat stays where it was

Covered by the styles spec of the chat.

### SC-UKV-1077 — the conversation menu is visible on a touch screen

Given the list of conversations on a screen without hover
When the list is drawn
Then every row shows its actions without a touch; with a mouse they appear on hover, focus and an open menu

Covered by the styles spec of the thread list.

### SC-UKV-1078 — the row of actions draws only what the consumer gives

Given the composer without inputs, and then with the model, the effort, the mode, the usage and attachments
When it is drawn and the model, the effort and the mode are pressed
Then without inputs the row holds only Send; with them it holds «+», the three labels and the ring, and each press reports which control it was

Covered by the component spec of the composer.

### SC-UKV-1079 — the usage ring shows the share and the warning

Given the ring at 32, 79, 81 and 100 percent, with and without a hint
When it is drawn
Then the arc covers the share, the screen reader hears the percent, the ring is orange from 80, and only a ring with a hint takes focus

Covered by the component spec of the ring.

### SC-UKV-1047 — the line about mistakes stands under or above the composer

Given the composer with the hint and the position above
When it is drawn, and then the hint becomes an empty line
Then the hint is the first line above the box, and the empty line removes it

Covered by the component spec of the composer.

### SC-UKV-1048 — Enter sends the question

Given the composer with blank text, and then with a question
When Enter, Shift + Enter and Send are pressed
Then blank text is not sent, Shift + Enter sends nothing, Enter and Send give the trimmed question and the field empties

Covered by the component spec of the composer.

### SC-UKV-1049 — Stop while the answer is written

Given the composer sending with and without `stoppable`, and a disabled one
When it is drawn and Stop is pressed
Then with `stoppable` Stop replaces Send and the field is open; without it and when disabled the field is closed

Covered by the component spec of the composer.

### SC-UKV-1050 — the chat passes its controls to the composer

Given the chat with a model, a usage share and the line above the composer
When it is drawn
Then the composer shows the model and the ring, has no hint of its own, and the line stands right above it

Covered by the component spec of the organism.

### SC-UKV-1308 — without hover a row has no hover tint

Given the conversation list is drawn on a screen without hover
When a row is touched
Then its background stays the resting one

Covered by the styles spec of the thread list, and in the admin end-to-end suite by `thread-list-hover.narrow.spec.ts`.

### SC-UKV-1309 — with a mouse a hovered row gets the hover tint

Given the conversation list is drawn on a screen with hover
When the pointer stands over a row
Then the row background is the subtle one

Covered by the styles spec of the thread list, and in the admin end-to-end suite by `thread-list-hover.spec.ts`.

### SC-UKV-1310 — the selected row keeps its background under the pointer

Given a row is selected
When the pointer stands over it or it is touched
Then its background stays the selected one

Covered by the styles spec of the thread list.

### SC-UKV-1311 — on a narrow place the row shadow of the messenger look blurs by 10

Given the conversation list in the messenger look on a place of 768 or narrower
When a row with a sign is drawn
Then the sign shadow blurs by 10 and fits the row inset; wider the shadow is the sign's own

Covered by the styles spec of the thread list and the frame `MessengerPhone`, and in the entry suite by `service-logo-shadow.spec.ts`, which checks that the narrow step reaches an application page.

### SC-UKV-1321 — the copied answer joins the text of its blocks

Given an answer of a markdown block, a notice and a markdown block
When its text is copied
Then the clipboard holds the three texts in their order, one empty line between them, without markdown signs

Covered by the spec of the blocks logic.

### SC-UKV-1322 — a block the kit does not know stays out of the copy

Given an answer with a block of type `chart` between two markdown blocks
When its text is copied
Then the clipboard holds the two markdown texts only, and an answer of unknown blocks alone gives an empty text

Covered by the spec of the blocks logic.

### SC-UKV-1323 — the blocks stand in order, a notice as a plate of its severity

Given an answer with a markdown block and a warning notice
When it is drawn
Then the markdown text stands first with its bold part and the notice under it as `rt-message` of severity `warning`

Covered by the component spec of the blocks and the frame `Blocks`.

### SC-UKV-1324 — a registered renderer draws a block of its type

Given a renderer registered for the type `chart` and an answer with a `chart` block
When it is drawn
Then the renderer receives the block and draws it, and no plate is shown

Covered by the component spec of the blocks.

### SC-UKV-1325 — a block without a renderer shows a plate with its type

Given an answer with a `chart` block and no renderer for it
When it is drawn
Then a dashed plate «The “chart” block is not supported» stands in its place, and the blocks around it are drawn

Covered by the component spec of the blocks and the frame `Blocks`.

### SC-UKV-1326 — a renderer gives the copy text of its block

Given a renderer registered for the type `chart` with a text function, and an answer of a markdown block, a `chart` block and a `table` block whose renderer has none
When the answer text is copied
Then the clipboard holds the markdown text and the text the function gave for the chart, the table stays out, and of two registrations of one type the last is taken

Covered by the spec of the blocks logic and the component spec of the answer.

### SC-UKV-1327 — an answer without text shows no «Copy»

Given a written answer whose only block is a `chart` without a text function
When it is drawn
Then its rating row stands without «Copy», and the rating buttons are in place

Covered by the component spec of the answer.

### SC-UKV-1328 — a notice of a severity `rt-message` does not know is a plate

Given a notice block without a severity, one with the severity `critical` and a renderer registered for `notice`
When it is drawn
Then each stands as the plate with the type `notice`, the renderer is not taken, and a notice of a known severity stays a plate of `rt-message`

Covered by the spec of the blocks logic.
