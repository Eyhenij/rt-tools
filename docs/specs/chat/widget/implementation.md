# The widget of the visitor — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The widget is put in by one script, and the page names the site by its key.** — `apps/chat-widget/src/main.ts:WIDGET_TAG`
- **The widget draws itself in a shadow tree of its own.** — `apps/chat-widget/src/lib/chat-widget.element.ts:ChatWidgetElement`
- **The widget carries no kit of the tree.** — `eslint/boundaries/domains/chat-widget.config.mjs:chatWidgetBoundaries`
- **A page whose address is not in the list of the site gets no chat.** — `libs/message-bus-api/chat/util/src/lib/chat-origin.logic.ts:originAllowed`
- **Before the first remark the widget shows the greeting of the site and the hours of answer.** — `apps/chat-widget/src/lib/chat-widget.api.ts:askSiteLook`
- **The conversation is created by the first remark, not by the opening of the widget.** — `apps/chat-widget/src/lib/chat-widget.api.ts:startTalk`
- **A returning visitor opens the widget on the list of their talks.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#home` — the sign is kept under `widgetStorageKey`
- **A new talk is started by the button under the list.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#fresh` — the first remark goes with the mark `fresh` from `#say`
- **A talk opened from the list goes back to it by the arrow of the head.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#back`
- **An answer is unread until the visitor opens its talk, and the mark lives in the browser.** — `apps/chat-widget/src/lib/chat-widget.logic.ts:widgetUnread` — the minutes lie under `widgetSeenKey`, written by `#markSeen`. Scenario `SC-CH-110`
- **Both sides stand in one thread, oldest first.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:mine`
- **An answer of the operator arrives in the open widget without a reload.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#listen`
- **Outside the hours of answer the remark is taken in all the same, and the widget says when the answer comes.** — `libs/message-bus-api/chat/util/src/lib/chat-hours.logic.ts:chatAnswersAt`
- **On a narrow screen the widget takes the whole screen, on a wide one it stands in the corner.** — `apps/chat-widget/src/lib/chat-widget.styles.ts:WIDGET_STYLES`
- **The widget is folded into a bubble and unfolded by a press.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#bubble`
- **A remark of any length keeps the thread within its width.** — `apps/chat-widget/src/lib/chat-widget.styles.ts:WIDGET_STYLES`
- **The folded widget is a round button with an icon, and the open one is a window of 380 px with a head of the accent colour.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#bubble` — the head is drawn by `titleHead` of `chat-widget.view.ts`, the sizes and colours stand in `WIDGET_STYLES`. Scenario `SC-CH-99`
- **A row of the list names the operator, the last remark, its time, the unread dot and the closed mark.** — `apps/chat-widget/src/lib/chat-widget.view.ts:talksList` — the day by `widgetDayText`. Scenario `SC-CH-107`
- **The head of a talk names the operator who answered last.** — `apps/chat-widget/src/lib/chat-widget.view.ts:talkHead` — the name by `widgetLastAuthor`, the circle by `widgetInitials`. Scenario `SC-CH-111`
- **The bubble of an answer names the first word of the operator's name.** — `apps/chat-widget/src/lib/chat-widget.view.ts:remarks` — the word by `widgetFirstName`. Scenario `SC-CH-111`
- **The remarks of the two sides are bubbles on the two sides of the thread.** — `apps/chat-widget/src/lib/chat-widget.logic.ts:widgetTimeText` — the time of a bubble; the side is the attribute the styles place it by. Scenario `SC-CH-100`
- **Before the first remark the greeting and the hours stand in one card; outside the hours a talk gets a note above the thread.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#feed` — the card before the first remark, the note by the word of the hours. Scenario `SC-CH-101`
- **The field is a capsule, and in focus it draws the ring of the fields of the tree.** — `apps/chat-widget/src/lib/chat-widget.styles.ts:WIDGET_STYLES` — the ring under `:focus-within` of the capsule, the pale button under `:placeholder-shown`. Scenario `SC-CH-102`
- **The limit of the length is named by the service and arrives in the answer of the refusal.** — `apps/chat-widget/src/lib/chat-widget.api.ts:WidgetRefusal`
- **A remark without text is not sent at all.** — `apps/chat-widget/src/lib/chat-widget.logic.ts:widgetSendable`
- **A refused remark stays in the field.** — `apps/chat-widget/src/lib/chat-widget.element.ts:#say`

The names of this tree: the widget is the application `apps/chat-widget` — an Nx application of its
own with the tag `scope:chat-widget-app`, built by Vite into one file `dist/apps/chat-widget/widget.js`.
It sees one lib of the tree, `libs/message-bus-common`, and the boundaries hold that: the shape of
the answers is shared with the service, the components are not.

The element of the page is `rt-chat-widget`; the whole of it — the bubble, the panel, the thread and
the field — is drawn by `ChatWidgetElement` in a shadow tree, and the styles live next to it as a
string. The pure decisions are taken out into `chat-widget.logic.ts`: the key of the storage, the
address of the service, whether a remark may go and the word about the hours of answer.

The two operations this work added are `GET /api/chat/site` and `GET /api/chat/messages` of
`ChatIntakeController`; both are open and closed by the key of the site and by the list of the
addresses. The site of a request is found by the address of the page — the header `Origin`, and where
the browser sends none, the address of the referring page.

The greeting and the hours of answer lie on the record of the site: the migration
`prisma/migrations/20260920210000_chat_site_greeting_and_hours` added them. Whether the operator
answers at this minute is decided by the service — `chatAnswersAt` counts the minute of the day in
the time zone of the site, and the widget only words what it got.

The stand of the end-to-end suite raises the page of a consumer with the widget on it —
`apps/message-bus-admin-e2e/stand/widget-page.html` — and seeds three sites: the live one, the one
whose hours of answer are over and the one whose list of addresses does not know that page.
