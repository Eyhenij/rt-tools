# The rollout of the chat — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

Three rules of the road have two places named. The real one is the config of the proxy, but a name of
a file without an extension the check of the anchors does not recognise at all and counts such a line
an empty binding; named second is the same config by the line it gets into the image of the road by.

- **The chat lives inside the receiver, and no second application is started on the node.** — `libs/message-bus-api/chat/feature/src/lib/chat.module.ts:ChatModule`
- **The file of the widget rides in the image of the road, not in the image of the receiver.** — `deploy/message-bus-web.Dockerfile:chat-widget`
- **The name of the chat points at the same node and the same proxy.** — `deploy/Caddyfile:encode`, into the image it is put by `deploy/message-bus-web.Dockerfile:Caddyfile`
- **The browser of a foreign page asks the service for permission, and the service answers by the list of the addresses of the site.** — `libs/message-bus-api/chat/feature/src/lib/chat-cors.middleware.ts:ChatCorsMiddleware`
- **An address that is not in the list gets no permission.** — `libs/message-bus-api/chat/util/src/lib/chat-origin.logic.ts:chatCorsHeaders`
- **The asking beforehand is answered by the same list as the call itself.** — `libs/message-bus-api/chat/util/src/lib/chat-origin.logic.ts:CHAT_CORS_METHODS`
- **The permission is given by the receiver, not by the proxy.** — `libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts:liveSiteOrigins`
- **The file of the widget is given to any page.** — `deploy/Caddyfile:file_server`, into the image it is put by `deploy/message-bus-web.Dockerfile:widget.js`
- **The chat is rolled out by the same step of the pipeline as the receiver.** — `.github/workflows/deploy.yml:dockerfile`
- **The dumps carry the tables of the chat from the first migration.** — `deploy/dump.sh:pg_dump`
- **The description of the start next to the receiver names the chat.** — `docs/PROD.md:Чат` — the section of the same name

The names of this tree: the permission for the browser of a foreign page is `ChatCorsMiddleware` of
the `feature` layer of the chat, and the decision itself is `chatCorsHeaders` of the `util` layer —
a pure function, checked by a call. It stands on the paths of the open operations by name, and the
reading by the operator, closed by the entry of a person, is not among them.

The key of the site takes no part in the permission, and it cannot: the asking beforehand the browser
sends without a body, and the key of the taking in of a remark lies exactly in the body. The
permission is therefore answered to an address standing in the list of at least one live site —
`liveSiteOrigins` — and the pair "the key and the address" is brought together by the operation
itself: `chat-intake.controller.ts:#site`. A foreign pair gets a refusal, and the page reads that
refusal, the permission having already been given to it.

The end-to-end suite raises a page of an address of its own: the serving of the stand opens a second
port and gives out one page on it — `apps/message-bus-admin-e2e/stand/foreign-page.html`. For the
browser that address and the address of the service are different ones, and the probe of the widget
on it is the only place where the whole road is checked: the widget of that page found, on the first
run, that the address of the service was being taken from the page rather than from the script.

The image of the road is not raised by the end-to-end suite at all — it takes the builds themselves.
The file of the widget inside the image is checked by building it and one command in it; both stand
in the record of the closed work of RT-2184.
