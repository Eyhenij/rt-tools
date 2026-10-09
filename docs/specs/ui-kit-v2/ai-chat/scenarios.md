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
Then the question stands in a bubble with «You» and the answer as markdown text

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
