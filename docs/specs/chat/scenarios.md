# Scenarios — the chat with the visitors

The identifier goes at the start of the test title, followed by a dash. The numbers are issued once
and are never reused. The scenarios of the following tasks of the epic — the reading by the
operator, the stream, the panel, the widget, the notifications — are added by those tasks.

### SC-CH-1 — the creation of a conversation by the key of the site issues the sign of the visitor

Given a live site with the address of the page in its list
When the widget calls the creation of a conversation by the key of the site without a sign
Then the answer carries the identifier of the conversation and the sign of the visitor, and both
lie in the storage

### SC-CH-2 — the second creation with the same sign gives back the live conversation

Given the visitor already has a conversation on this site
When the widget calls the creation again with their sign
Then the same conversation comes back, and a second one is not created

### SC-CH-3 — an unknown key of the site is refused

Given a key that no site has
When the creation of a conversation is called by it
Then the answer is the code `401`, and nothing is created in the storage

### SC-CH-4 — a site that is switched off is refused like an unknown one

Given a site that exists and is switched off
When the creation of a conversation is called by its key
Then the answer is the code `401`, and by the answer the two reasons are not told apart

### SC-CH-5 — the address of the page outside the list is refused

Given a live site whose list of the addresses does not carry the address of the caller
When the creation of a conversation is called from that address
Then the answer is the code `403`

### SC-CH-6 — an empty list of the addresses refuses everything

Given a site whose list of the addresses is empty
When the creation of a conversation is called from any address
Then the answer is the code `403`

### SC-CH-7 — a remark of the visitor is taken into their conversation

Given a conversation of the visitor and their sign
When the sending of a remark with a non-empty text is called
Then the message lies in the storage with the side "the visitor", and the minute of the last
message of the conversation moves to it

### SC-CH-8 — a foreign sign of a visitor does not reach the conversation

Given a conversation of one visitor and the sign of another
When the sending of a remark into that conversation is called by the foreign sign
Then the answer is the code `404`, and the message is not created

### SC-CH-9 — an empty text is refused

Given a conversation of the visitor and their sign
When the sending of a remark with an empty text is called
Then the answer is the code `400`, and the message is not created

### SC-CH-10 — a text longer than the limit is refused, and the limit stands in the answer

Given a conversation of the visitor and their sign
When the sending of a remark longer than the limit of the length is called
Then the answer is the code `400` and carries the limit itself

### SC-CH-11 — the stream from one visitor is held by the limit of the frequency

Given the visitor has sent as many remarks in a row as the limit of the frequency allows
When they send the next one within the same window
Then the answer is the code `429` and carries after how long it may be repeated

### SC-CH-12 — the order of the messages is set by the service, not by the sender

Given two remarks sent one after another, the second carrying an earlier time of its own
When the conversation is read out of the storage
Then the messages stand in the order of the taking in by the service

### SC-CH-13 — the removal of a site takes its conversations away

Given a site with a conversation and messages in it
When the site is removed
Then neither the conversations nor the messages of that site are left in the storage

### SC-CH-14 — the entities of the chat do not touch the tables of the intake

Given the storage of the node with the tables of the intake and of the chat
When the migration of the chat is applied
Then the tables of the cargo, of the accounts and of the rights of the intake stay as they were
