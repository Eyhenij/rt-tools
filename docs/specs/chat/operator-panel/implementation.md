# The panel of the operator — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The section is closed by the right of its menu item, and the address of the section is closed by the same right.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`
- **What is seen inside the section is decided by the record of the operator, not by the right.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:operatorSites`
- **A person who holds the right but is an operator of nothing sees an empty list, not a refusal.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:conversationsPage`
- **The list is the conversations of the sites of the operator, the freshest talk first.** — `libs/message-bus-admin/chat/data-access/src/lib/chat-talks.store.ts:read`
- **The list is narrowed by the site and by the state of a talk.** — `libs/message-bus-admin/chat/api/src/lib/chat.api.service.ts:talks`
- **The feed of one conversation is read by pages, oldest first, and both sides stand in one thread.** — `libs/message-bus-admin/chat/data-access/src/lib/chat-feed.store.ts:read`
- **The screen is assembled from the ready-made of the kit.** — `libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts:AdminChatPanelComponent`
- **The answer of the operator is written by an operation of its own, closed by the entry of a person.** — `libs/message-bus-api/chat/feature/src/lib/chat-read.controller.ts:answer`
- **A sent remark is shown in the feed at once, before the service has answered about it.** — `libs/message-bus-admin/chat/data-access/src/lib/chat-feed.store.ts:send`
- **A remark the service refused is marked in the feed and is not taken out of it.** — `libs/message-bus-admin/chat/util/src/lib/chat-send.logic.ts:chatSendAnswered`
- **An answer into a conversation of a foreign site is refused as a not-found conversation.** — `libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts:conversationOfSites`
- **A remark of the visitor arrives into the open feed without a reload.** — `libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts:#listen`

The names of this tree: the section is the area `libs/message-bus-admin/chat` of the admin
application of the receiver, laid out by the layers the other areas keep — `util` for the models and
the pure logic, `api` for the calls of the operations, `data-access` for the two stores, `ui` for the
row of the list, the message of the feed and the two narrowings, `feature/panel` for the screen and
`shell` for its route.

The row of the list is `AdminChatTalkComponent`, the message of the feed `AdminChatMessageComponent`,
and the sent remark lives in the state of `ChatFeedStore` until the answer of the service: its three
states are `EChatSendState` in the `util` layer. The answer of the operator goes by
`POST /api/chat/conversations/:id/messages` and is written by `appendOperatorMessage`; the event
about it leaves by `ChatSubscribersService` of the receiver, and the open screen takes it from
`GET /api/chat/conversations/stream`.

The right of the section is `chat:read` of the closed set `libs/message-bus-common/src/lib/rights.ts`;
the role of the owner gets it by the migration `prisma/migrations/20260920190000_grant_chat_read`.
