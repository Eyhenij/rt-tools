# Scenarios — the notifications of the chat

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-62 — a remark of the visitor goes out to the address of the site

Given a site with an address of the call and a secret
When a remark of the visitor is taken into a conversation of that site
Then the service calls that address with the event of a remark, and the call names the site, the
conversation and the message

### SC-CH-63 — a site without an address of the call gets no calls

Given a site whose address of the call is empty
When a remark of the visitor is taken in
Then the remark stands in the conversation, and no call goes out at all

### SC-CH-64 — a call is signed by the secret of the site

Given two sites with different secrets
When a remark is taken into a conversation of each
Then the signature of each call is computed by the secret of its own site, and the signatures differ

### SC-CH-65 — the closing of a conversation goes out as its own event

Given an open conversation of a site with an address of the call
When the operator closes it
Then the call goes out with the event of a closing, and it names that conversation

### SC-CH-66 — the answer of the operator goes nowhere

Given an open conversation of a site with an address of the call
When the operator answers the visitor
Then no call goes out: the application learns of the answer from the panel it was written in

### SC-CH-67 — the call does not hold back the answer to the visitor

Given a site whose address of the call does not answer
When the visitor sends a remark
Then the widget gets the answer about the taken remark all the same, and the call lives its own life

### SC-CH-68 — a conversation left without an answer wakes the operator

Given a conversation whose last remark is of the visitor and older than the agreed time of the site
When the service looks over the conversations
Then the call goes out with the event of an unanswered talk, and it names the minutes without an
answer

### SC-CH-69 — the same conversation wakes the operator once

Given a conversation that has already woken the operator and has had no answer since
When the service looks over the conversations again
Then no second call goes out about it

### SC-CH-70 — an answer of the operator returns the waking to the conversation

Given a conversation that woke the operator, and the operator answered it
When the visitor writes again and the agreed time passes
Then the call about an unanswered talk goes out anew

### SC-CH-71 — a site with the agreed time of zero wakes nobody

Given a site whose agreed time is zero and a conversation nobody answered for a day
When the service looks over the conversations
Then no call about an unanswered talk goes out

### SC-CH-72 — a conversation inside the hours of answer of the site does not count as late

Given a site with the hours of answer named and a conversation whose remark came before they started
When the service looks over the conversations
Then the conversation wakes nobody until the hours of answer have begun

### SC-CH-73 — a refused call is repeated, and the record names the outcome

Given a site whose address answers with a refusal
When an event of that site goes out
Then the call is repeated up to the limit named by the service, and the record of the sending holds
the number of attempts and how the last one ended
