# Scenarios — the reading by the operator

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-15 — the operator sees the conversations of their sites

Given an operator of one site and conversations on that site and on a neighbouring one
When they call the list of the conversations without a filter
Then only the conversations of their site are in the page, and the whole count counts them alone

### SC-CH-16 — a request without an entry is refused

Given nobody signed in
When the list of the conversations is called
Then the answer is the code `401`

### SC-CH-17 — a signed-in person who is not an operator gets no conversations

Given a person signed into the receiver who is not an operator of the chat
When they call the list of the conversations
Then the page is empty and the whole count is zero

### SC-CH-18 — a foreign site in the filter gives an empty page, not a refusal

Given an operator of one site and a request filtered by a site that is not theirs
When they call the list of the conversations
Then the page is empty, and the answer is not a refusal

### SC-CH-19 — the list is ordered by the minute of the last message, the freshest first

Given three conversations whose last messages came at different minutes
When the operator calls the list
Then the rows stand from the freshest to the oldest

### SC-CH-20 — the list is read by pages

Given more conversations than the size of the page asked for
When the operator asks for the second page
Then the rows of the second page follow the first without a repeat, and the whole count is that of all of them

### SC-CH-21 — a row of the list carries the last message itself

Given a conversation with two messages
When the operator calls the list
Then the row carries the text of the last message and the minute of its taking in

### SC-CH-22 — the messages of a conversation are read by pages, oldest first

Given a conversation with more messages than the size of the page
When the operator asks for the first page of the messages
Then the oldest messages are there, in the order of the taking in

### SC-CH-23 — the messages of a foreign conversation are not given out

Given an operator of one site and a conversation of a neighbouring one
When they ask for the messages of that conversation
Then the answer is the code `404`

### SC-CH-24 — the operator closes a conversation

Given a live conversation of their site
When the operator changes its state to closed
Then the conversation stands closed, and it leaves the list filtered by the live ones

### SC-CH-25 — a state outside the set is refused

Given a live conversation of their site
When the operator sends a state that is not one of the two words
Then the answer is the code `400`, and the state of the conversation does not change

### SC-CH-26 — a remark of the visitor opens a closed conversation again

Given a conversation closed by the operator
When the visitor sends a remark into it
Then the conversation stands live again, and it is in the list filtered by the live ones

### SC-CH-27 — the state of a foreign conversation is not changed

Given an operator of one site and a conversation of a neighbouring one
When they change its state
Then the answer is the code `404`, and the state of the conversation does not change
