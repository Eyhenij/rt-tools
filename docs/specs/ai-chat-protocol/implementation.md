# What it is carried out by — the ai-chat-protocol package

The first column is the rule of the spec next to it verbatim. The second is where it is carried out in the tree.

- **The reducer does not change its input and knows nothing about the transport.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — returns a new state, and the module imports no network code
- **Text arrives in pieces and lands in one message with one `messageId`.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — the `TEXT_MESSAGE_CONTENT` branch
- **A tool call lives in the assistant message named by `parentMessageId`.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — the `TOOL_CALL_START`, `TOOL_CALL_ARGS` and `TOOL_CALL_RESULT` branches
- **The end of a run marks every message stored and records the result and the awaited calls.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — the `RUN_FINISHED` branch; `selectUnsentMessages` picks what the next run sends
- **A run error leaves the question unsent and names the run reference.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — the `RUN_ERROR` branch leaves `isStored` alone
- **A messages snapshot replaces the stored messages and keeps the unsent ones at the end.** — `projects/ai-chat-protocol/src/lib/ai-chat-reducer.ts:applyAiChatEvent` — the `MESSAGES_SNAPSHOT` branch
- **The reader drops events with no type, with missing required fields and unknown ones.** — `projects/ai-chat-protocol/src/lib/ai-chat-reader.ts:readAiChatEvent`
- **One code gives one kind of error.** — `projects/ai-chat-protocol/src/lib/ai-chat-errors.ts:toRunErrorKind` and `toHttpErrorKind`; `isRetryableBeforeStream` decides the retry
- **The package has no SSE frame parsing, no network code and no application names.** — `eslint.config.mjs:no-restricted-imports` — Angular, NestJS and RxJS are refused under `projects/ai-chat-protocol/**`
