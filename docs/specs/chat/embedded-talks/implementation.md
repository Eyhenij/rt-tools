# The embedded page of the talks — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. The
entry, the operations behind it and the page the person sees are carried out. What is left to the
task RT-2314 is the installation into a foreign admin and the sample of a signing server.

- **The consumer decides who to let in, and the service checks only the signature.** — `libs/message-bus-api/chat/feature/src/lib/chat-embedded.controller.ts:entry` — it takes the key of the site, the minute and the signature. It answers with the sign of the page, and no account of the service takes part in it.
- **The signature is made on the server of the consumer, never in the page.** — `apps/chat-talks-page/src/app/talks-entry.service.ts:start` — the page asks the one who embedded it for a signature. It never makes one. The sample of such a server is written by RT-2314.
- **The signature carries the minute and lives by it.** — `libs/message-bus-api/chat/util/src/lib/chat-entry.logic.ts:chatEntryMinuteFits` — the minute goes into the signature itself and is allowed a spread in both directions. Outside it the entry is refused.
- **The sign of the page is given for a time and is asked for anew.** — `apps/chat-talks-page/src/app/talks-entry.service.ts:refused` — an expired sign is refused by a code of its own. On that code the page asks for a new signature, and the person types nothing.
- **The sign of the page opens one site.** — `libs/message-bus-api/chat/feature/src/lib/chat-embedded.controller.ts:#site` — every operation reads the site out of the sign and is given that site alone. A talk of a neighbouring site answers as not found.
- **The page shows the same as the panel of the operator, for one site.** — `apps/chat-talks-page/src/app/talks-app.ts:TalksApp` — the list and the chat of the kit, the same ones the panel is drawn by.
- **The page carries no choice of a site.** — `apps/chat-talks-page/src/app/talks-api.service.ts:talks` — the request of the list carries the sign alone. The site is named by the sign, and the page has no selector.
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

## The language of the page is one today

The spec asks for the labels in every set of the kit vocabulary. The page carries one set — the
Russian one, and it lies in `apps/chat-talks-page/src/app/talks-words.ts`. The kit itself ships one
set, the English one; a label the page does not word falls back to it.

That is a debt, not a decision. It is paid when a consumer of another language comes: the words of
the page move into the vocabulary of the kit, and the set is chosen by the language of the admin.
Until then a consumer who does not read Russian sees two languages at once.
