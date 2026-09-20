# Scenarios — the panel of the operator

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-36 — the section of the chat is shown to whoever holds its right

Given a signed-in person holding the right of the section
When the admin application is opened
Then the item of the chat stands in the menu

### SC-CH-37 — the section of the chat is hidden from whoever lacks the right

Given a signed-in person without the right of the section
When the admin application is opened
Then there is no item of the chat in the menu, and its address does not open either

### SC-CH-38 — the operator sees the talks of their sites in the list

Given an operator of one site and talks on that site and on a neighbouring one
When the section of the chat is opened
Then only the talks of their site stand in the list

### SC-CH-39 — the list is narrowed by the site and by the state

Given an operator of two sites with a live talk and a closed one
When a site and a state are chosen above the list
Then only the talks of that site in that state are left

### SC-CH-40 — choosing a talk opens its feed

Given a list with talks
When one of them is chosen
Then its messages are shown, oldest first, both sides in one thread

### SC-CH-41 — a sent remark is shown before the answer of the service

Given an open feed and a text in the sending box
When the sending is pressed and the service has not answered yet
Then the remark already stands in the feed, marked as not confirmed

### SC-CH-42 — a refused remark stays in the feed with a mark

Given a sent remark the service refused
When the refusal arrives
Then the remark stays in the feed, marked as refused, and the text is not lost

### SC-CH-43 — a remark of the visitor arrives into the open feed

Given an open feed of a talk
When a remark of the visitor is taken in on it
Then it appears in the feed without a reload of the page

### SC-CH-44 — a person who is an operator of nothing sees an empty list

Given a signed-in person holding the right but an operator of no site
When the section of the chat is opened
Then the list is empty, and the answer is not a refusal

### SC-CH-45 — a closed talk leaves the list of the live ones

Given a live talk in the list and the narrowing by the live state
When the operator closes the talk
Then it is gone from the list, and by the narrowing of the closed ones it is there

### SC-CH-46 — the answer of the operator is written as the side of the operator

Given an operator of a site and a talk on it
When they answer the visitor
Then the message is written with the side of the operator and the minute of the taking in

### SC-CH-47 — an answer into a foreign talk is refused

Given an operator of one site and a talk of a neighbouring one
When they answer into that talk
Then the answer is a refusal about a not-found conversation, and nothing is written

### SC-CH-48 — the answer of the operator reaches the stream of the visitor

Given an open stream of a visitor
When the operator answers their talk
Then the event with that message arrives in the stream
