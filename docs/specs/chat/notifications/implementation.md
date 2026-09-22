# The notifications of the chat — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The service calls the address of the site, and there is no second road outward.** — `libs/message-bus-api/chat/feature/src/lib/chat-hook.service.ts:ChatHookService`
- **A site without an address of the call gets none.** — `libs/message-bus-api/chat/util/src/lib/chat-hook.logic.ts:chatHookReady`
- **Three events go outward: a remark of the visitor, the closing of a conversation and a talk left unanswered.** — `libs/message-bus-api/chat/data-access/src/lib/chat-hook.queries.ts:TChatHookKind`
- **Every call is signed by the secret of the site.** — `libs/message-bus-api/chat/util/src/lib/chat-hook.logic.ts:chatHookSignature`
- **The event carries what the taking in already knows and nothing besides.** — `libs/message-bus-api/chat/feature/src/lib/chat-hook.service.ts:IChatHookEvent`
- **The call does not hold back the answer to the visitor.** — `libs/message-bus-api/chat/feature/src/lib/chat-intake.controller.ts:take`
- **A conversation wakes the operator once, not every minute.** — `libs/message-bus-api/chat/data-access/src/lib/chat-hook.queries.ts:markTalkWoken`
- **The agreed time belongs to the site.** — `prisma/schema.prisma:ChatSite`
- **A conversation wakes nobody while the operator answers within the hours of the site.** — `libs/message-bus-api/chat/util/src/lib/chat-wake.logic.ts:chatWakeDue`
- **A refusal of the receiving side is not a refusal of the taking in.** — `libs/message-bus-api/chat/feature/src/lib/chat-wake.service.ts:ChatWakeService`
- **A call is repeated a limited number of times, and the number is named by the service.** — `libs/message-bus-api/chat/util/src/lib/chat-limits.ts:CHAT_HOOK_ATTEMPTS`
- **The outcome of every call is read from its record, not from the success of the sending.** — `libs/message-bus-api/chat/data-access/src/lib/chat-hook.queries.ts:markHookCallFailed`

The names of this tree: the road outward is `ChatHookService` of the `feature` layer of the chat
domain; the pure decisions — whether the site is ready for calls and what the call is signed by —
live in `chat-hook.logic.ts` of the `util` layer, and whether it is time to wake in
`chat-wake.logic.ts` next to it. The record of a sending is the table `chat_hook_call`, and the
queries about it are `chat-hook.queries.ts` of `data-access`.

The three fields of the site — the address, the secret and the agreed time — and the minute of the
last waking on the conversation arrived by the migrations
`prisma/migrations/20260921090000_chat_site_hook_and_answer_within` and
`prisma/migrations/20260921100000_chat_hook_call`.

There is no scheduler in the receiver, and none was started for this: `ChatWakeService` looks over
the conversations itself once a minute while the application is up — `CHAT_WAKE_SWEEP_MS` — and the
timer releases the node, so the shutdown does not wait for it. The minute of the sweep arrives as an
argument, and the specs check the decision by a call rather than by waiting for the agreed time.

The end-to-end suite has an application of the site of its own: the serving of the stand takes the
calls at `/hook-sink` and gives them back by the same address —
`apps/message-bus-admin-e2e/stand/serve-admin.mjs`. The probe verifies the signature the way the
application of a site would: by the secret the seeding knows.
