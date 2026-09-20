# Scenarios — the stream of the events

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-28 — a remark of a visitor reaches the stream of their conversation

Given an open stream of a visitor
When their remark is taken in
Then the event with that message arrives in the stream, and the text in it is the whole message

### SC-CH-29 — a foreign conversation does not reach the stream of a visitor

Given an open stream of one visitor and a remark in the conversation of another
When that remark is taken in
Then nothing arrives in the stream of the first

### SC-CH-30 — the stream of a visitor with an unknown sign is refused

Given a sign that was issued to nobody
When the stream is asked for by it
Then the answer is the code `404`, and no subscription is created

### SC-CH-31 — the stream of an operator carries the events of their sites

Given an open stream of an operator of one site
When a remark is taken in on that site and on a neighbouring one
Then only the event of their site arrives in the stream

### SC-CH-32 — a signed-in person who is not an operator gets a stream with no events

Given a signed-in person who is an operator of nothing
When a remark is taken in on any site
Then their stream stays open and empty, and the answer is not a refusal

### SC-CH-33 — while there are no events the service sends a heartbeat

Given an open stream and no messages
When the time of the heartbeat passes
Then the heartbeat arrives in the stream, and the connection stays open

### SC-CH-34 — a closed stream stops receiving events

Given a stream that the screen has closed
When a remark is taken in
Then the service does not write into the closed stream, and the subscriber is not kept

### SC-CH-35 — what was missed is asked for by the minute of the last message

Given a screen that has the messages up to a minute, and messages that arrived after it
When it asks for what was missed by that minute
Then the messages after that minute come back, and the ones before it do not
