# The reading by the operator — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The operator is a record of the chat, and their entry is the entry of a person into the receiver.** — `prisma/schema.prisma:ChatOperator`
- **An operation of the reading is closed by the entry of a person, not by the key of the site.** — `libs/message-bus-api/chat/feature/src/lib/chat-read.controller.ts:ChatReadController`
- **A request without an entry is refused as unauthenticated, and an entry that is not an operator of the chat — as a not-found conversation.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:operatorSites`
- **The operator sees the conversations of their sites, and the rest do not reach the answer at all.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:conversationsPage`
- **A site named in the request but not in the set of the operator gives an empty page, not a refusal.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:askedSites`
- **A list is read by pages, and the page is taken by the reading the cargo of the intake is taken by.** — `libs/message-bus-common/src/lib/page.ts:pageAsked`
- **The list of the conversations is ordered by the minute of the last message, the freshest first.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:conversationsPage`
- **The messages of one conversation are read by pages too, oldest first.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:messagesPage`
- **The list of the conversations carries the last message itself, not only its minute.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:IChatConversationListRow`
- **A conversation has two states: live and closed.** — `libs/message-bus-common/src/lib/chat.ts:EChatTalkState`
- **A conversation is created live, and the state is changed by the operator.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:setConversationState`
- **A remark of a visitor into a closed conversation opens it again.** — `libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts:appendVisitorMessage`
- **The state is changed only by an operator of that site.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:conversationOfSites`

The names of this tree: the operator lies in `prisma/schema.prisma` as `ChatOperator`, the sites
they answer for as `ChatOperatorSite`, and the state of a conversation as the set
`ChatConversationState` with a column of the conversation; the migration that added them is
`prisma/migrations/20260920160000_chat_operator_and_state/migration.sql`. The tables are
`chat_operator` and `chat_operator_site`.

The signed-in person is read by `libs/message-bus-api/accounts/util/src/lib/account-context.ts:accountOf`
— the same reading every operation of the receiver closed by an entry works from. The refusal about
a state outside the set is `ChatStateUnknown` in `libs/message-bus-common/src/lib/refusal.ts`.
