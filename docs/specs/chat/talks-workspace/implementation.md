# The workspace of the talks — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The talks are laid out by the workspace of the kit, not by a grid of the screen's own.** — `libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts:AdminChatPanelComponent` — the screen takes `rt-workspace` of the second kit. The grid that stood in the layout layer of the admin is gone.
- **The three columns are the list, the feed and the details, in this order.** — `apps/chat-talks-page/src/app/talks-app.ts:TalksApp` — the page places the same three slots in the same order.
- **Each screen remembers its widths under a key of its own.** — `apps/chat-talks-page/src/app/talks-app.ts:WORKSPACE_STORAGE_KEY` — the page names `talks-page-workspace`. The panel names `admin-chat-workspace` by a constant of its own.
- **With no talk chosen the feed says so itself, and the details stay empty.** — `libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts:feedUnchosen` — the hint of the feed. The details take a title only with a chosen talk.
- **An action over a talk stands in the details, not in the feed.** — `libs/message-bus-admin/chat/util/src/lib/chat-workspace.logic.ts:chatTalkActions` — one action by the state of the talk. The feed of both screens carries no button of the state.
- **The state of a talk is shown by a mark in the row, and by a property in the details.** — `libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.ts:AdminChatTalkComponent` — the row draws the state by the tag of the kit. The same state stands among the properties.
- **The properties of a talk are the ones the reading already answers.** — `libs/message-bus-admin/chat/util/src/lib/chat-workspace.logic.ts:chatTalkDetailRows` — the site, the state and the minute of the last remark. All three come in the answer of the list.
- **The title of the feed is the last remark of the talk.** — `libs/message-bus-admin/chat/util/src/lib/chat-workspace.logic.ts:chatTalkTitle` — a talk with no remarks is titled by a word of the screen.
- **The row, the properties, the title and the actions are written once and taken by both screens.** — `libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.ts:AdminChatTalkComponent` — the row lies in the ui library of the chat, the rest in its util library.
- **The shared parts know nothing about the screen they are shown on.** — `libs/message-bus-admin/chat/util/src/lib/chat-workspace.logic.ts:IChatTalkWords` — the words and the language arrive as an argument. The panel gives them from the vocabulary of the admin, the page from its own set.
- **The operations of reading and writing stay as they are.** — `libs/message-bus-admin/chat/data-access/src/lib/chat-talks.store.ts:ChatTalksStore` — the list, the feed, the answer and the change of the state are called as before.
- **The narrowing by the site and by the state stays in the list of the panel.** — `libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts:site` — both selectors stand in the slot of the list, above its rows.
- **The embedded page carries no choice of a site.** — `apps/chat-talks-page/src/app/talks-api.service.ts:talks` — the request of the list carries the sign alone, and the site is named by the sign.

## What it is called here

The ready-made pieces are `rt-workspace`, `rt-workspace-details`, `rt-thread-list`, `rt-chat` and
`rt-tag` of the second kit. The row of the list is the component `admin-chat-talk`; the properties,
the title and the actions are the functions of `chat-workspace.logic.ts` beside it. The widths of
the columns lie in the storage of the browser under the key the screen passes to the workspace.

## What is not checked here

Nothing checks that the two screens are assembled alike. They take the same parts, and the order of
the slots is written twice — in the markup of each. A divergence is seen by the frames of the two
screens, and by nothing before them.

Nothing checks that a property of the details is filled on every talk. The reading answers all three
of them, and a talk with no remarks shows the minute of its creation.
