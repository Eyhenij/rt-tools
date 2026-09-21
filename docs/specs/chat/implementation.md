# The chat with the visitors — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **Everything of the chat lies inside a space, and no operation crosses its boundary.** — `libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts:findLiveSiteByKey`
- **The key of the site names the site and gives no rights besides taking in a remark.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:ChatIntakeController`
- **The operations of the widget are called from the addresses of the list of the site.** — `libs/message-bus-api/chat/util/src/lib/chat-origin.logic.ts:originAllowed`
- **An empty list of the addresses refuses everything.** — `libs/message-bus-api/chat/util/src/lib/chat-origin.logic.ts:originAllowed`
- **The visitor is recognised by a sign the service issues, not by what the page passes.** — `libs/message-bus-api/chat/util/src/lib/chat-visitor.util.ts:issueVisitorToken`
- **A visitor has one live conversation per site.** — `libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts:findConversationByVisitorToken`
- **A remark is taken into the conversation of its visitor only.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:take`
- **The order of the messages is set by the minute of the taking in by the service.** — `libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts:appendVisitorMessage`
- **The stream from one visitor is held by a limit of the frequency.** — `libs/message-bus-api/access/util/src/lib/rate-limit.util.ts:rateVerdict`
- **The text of a message has a limit of the length, and an empty text is refused.** — `libs/message-bus-api/chat/util/src/lib/chat-text.logic.ts:chatTextFault`
- **The service keeps what it promised and nothing besides.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:field`
- **The removal of a site takes its conversations away with it.** — `prisma/schema.prisma:ChatConversation`
- **The tables of the chat stand apart from the tables of the intake.** — `prisma/schema.prisma:ChatSpace`

The names of this tree: the entities of the chat lie in `prisma/schema.prisma` under the names
`ChatSpace`, `ChatSite`, `ChatVisitor`, `ChatConversation` and `ChatMessage`, and the migration that
created them is `prisma/migrations/20260920120000_chat_storage/migration.sql`. The tables are named
`chat_space`, `chat_site`, `chat_visitor`, `chat_conversation` and `chat_message`.

The refusals the service answers with are assembled by
`libs/message-bus-common/src/lib/refusal.ts:refusalBody`, and their codes stand in the same file in
`ERefusal` — seven of them belong to the chat, from `ChatSiteKeyEmpty` to `ChatThrottled`.

The limit of the length and the limit of the frequency are named once, by
`libs/message-bus-api/chat/util/src/lib/chat-limits.ts`, and the counter of the marks behind the
second one is `libs/message-bus-api/access/feature/src/lib/rate-limit.service.ts:RateLimitService` —
the same one the request of a tree for a token is held by.
