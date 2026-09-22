# The stream of the events — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The stream carries the events of the messages, and the messages themselves are written by the operations of the taking in.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:take`
- **An event carries the message whole, not a sign that something has changed.** — `libs/message-bus-api/chat/api/src/lib/chat.events.ts:IChatMessageEvent`
- **While there are no events the service sends a heartbeat.** — `libs/message-bus-api/chat/feature/src/lib/chat-subscribers.service.ts:stream`
- **The stream of a visitor is closed by their sign, and it carries the events of their conversation alone.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:stream`
- **The stream of an operator is closed by their entry, and it carries the events of the sites they answer for.** — `libs/message-bus-api/chat/feature/src/lib/chat-read.controller.ts:stream`
- **A person who is not an operator of the chat gets an open stream with no events.** — `libs/message-bus-api/chat/util/src/lib/chat-stream.logic.ts:eventReaches`
- **A broken stream is restored by the screen, and the service does not keep it.** — `libs/message-bus-api/chat/feature/src/lib/chat-subscribers.service.ts:ChatSubscribersService`
- **What was missed is asked for by the minute of the last message the screen has, not by the count of the events.** — `libs/message-bus-api/chat/util/src/lib/chat-missed.logic.ts:missedSince`
- **The reading of what was missed is the reading that already exists, not a second one of its own.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:messagesPage`

The names of this tree: an event is `IChatMessageEvent` in the `api` layer of the domain, a frame of
the stream is `IChatFrame`, and the subscribers live in `ChatSubscribersService` — a provider of the
chat module, one for both streams. The heartbeat interval is `CHAT_BEAT_MS` in the `util` layer and
arrives as an argument of `stream`, so the specs check it by a call rather than by waiting half a
minute.

The stream of the operator stands among the operations of their reading, at
`GET /api/chat/conversations/stream`: it is closed by the same entry and answers for the same set of
the sites. The stream of the visitor stands among the operations of the taking in, at
`GET /api/chat/stream`. What was missed is asked for by the parameter `since` of
`GET /api/chat/conversations/:id/messages`.
