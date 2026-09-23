# The embedded page of the talks — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. The
entry and the operations behind it are carried out. What the person sees is written by the tasks
RT-2313 and RT-2314, and those rules carry the verdict "Not carried out" with the number of the task.

- **The consumer decides who to let in, and the service checks only the signature.** — `libs/message-bus-api/chat/feature/src/lib/chat-embedded.controller.ts:entry` — it takes the key of the site, the minute and the signature. It answers with the sign of the page, and no account of the service takes part in it.
- **The signature is made on the server of the consumer, never in the page.** — **Not carried out.** The sample of such a server is written by the task RT-2314 together with the page of the stand.
- **The signature carries the minute and lives by it.** — `libs/message-bus-api/chat/util/src/lib/chat-entry.logic.ts:chatEntryMinuteFits` — the minute goes into the signature itself and is allowed a spread in both directions. Outside it the entry is refused.
- **The sign of the page is given for a time and is asked for anew.** — `libs/message-bus-api/chat/util/src/lib/chat-entry.logic.ts:chatEntrySignExpired` — the sign carries its own last minute, and an expired one is refused by a code of its own. Asking for a new one without the person is written by the task RT-2313.
- **The sign of the page opens one site.** — `libs/message-bus-api/chat/feature/src/lib/chat-embedded.controller.ts:#site` — every operation reads the site out of the sign and is given that site alone. A talk of a neighbouring site answers as not found.
- **The page shows the same as the panel of the operator, for one site.** — **Not carried out.** The page itself is written by the task RT-2313 on the ready-made pieces of the kit.
- **The page carries no choice of a site.** — **Not carried out.** The page is written by the task RT-2313, and the site comes to it with the key it was embedded with.
- **An answer from the embedded page is a remark of the operator.** — `libs/message-bus-api/chat/feature/src/lib/chat-talk.service.ts:answer` — the panel and the page write through one service, so the thread and the order of the messages are one.

## What it is called here

The secret of the site is the field `hookSecret` beside the site in the store of the chat. The
service signs its outward calls with it, and a second secret is not created: that one already lies
on the server of the consumer and is kept there for the same purpose. The sign of the page is a
short-lived token of the service, not the session cookie of the intake. It travels in the field
`sign` — in the query of the reads, in the body of the writes, the same way the token of the visitor
travels. The ready-made pieces are the list `rt-thread-list` and the chat `rt-chat` of the second
kit — the very ones the panel of the operator is drawn by. The page itself is a build of its own
beside the widget of the visitor, and the widget is the sample of such a build.

## What is not checked here

Nothing checks that the consumer keeps its secret on the server: the service sees a signature and
cannot tell where it was made. The requirement lives in the text of the installation handed to the
consumer, and the sample page of the stand signs on its own side.

The address of the page is asked only when it is named. The header is set by the browser and a page
cannot forge it, while a call without the header came from a server of the consumer. Nothing tells
that case from a call made by a tool.
