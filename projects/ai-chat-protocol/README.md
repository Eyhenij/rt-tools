# @rt-tools/ai-chat-protocol

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The part of the assistant chat that does not depend on a view or a transport: the AG-UI events, the
reducer that turns them into a conversation, the two ports an application implements and the error
classes. No framework: the package depends on `tslib` and ships CommonJS and ESM. The view is
`rt-ai-chat` in `@rt-tools/ui-kit-v2`; it reads the state this package computes.

There is no SSE frame parsing and no network code here. The application cuts its stream into records
and brings each to an event with `readAiChatEvent`, or builds the events itself.

## Run state

```ts
import { AI_CHAT_INITIAL_RUN, applyAiChatEvent, readAiChatEvent, selectUnsentMessages } from '@rt-tools/ai-chat-protocol';

let state = { ...AI_CHAT_INITIAL_RUN, status: EAiChatRunStatus.RUNNING };

for await (const event of port.run(request)) {
    state = applyAiChatEvent(state, event);
}

selectUnsentMessages(state.messages); // what the next run sends
```

`applyAiChatEvent` is the only place the state changes. It never mutates its input. The end of a run
marks every message stored; a run error leaves the question unsent and names the run reference.

## Events

`TAiChatEvent` covers the start, the end and the error of a run, a step, a message in pieces, a tool
call with its arguments and result, a messages snapshot and a custom event. A custom event whose
`value` carries a string `referenceId` sets the run reference. `readAiChatEvent(raw)` brings one
parsed AG-UI record to an event and returns `null` for a broken or unknown one.

## Ports

- `IAiChatRunPort` — `run(request, options?)` yields the events of an answer, `stop(threadId, runId)`.
- `IAiChatThreadsPort` — threads by cursor, messages, rating, read mark and archive.

The request carries the new messages, the tools and the context.

## Run controller

`createAiChatRunController({ port, createId, registry?, contextProviders?, onState? })` runs the
dialogue over `IAiChatRunPort`:

- `send(threadId, content)` adds the user message and runs. A request that gets no event is sent
  again (`maxAttempts`, `retryDelayMs`); once an event has arrived the request is never sent again.
- `stop()` cuts the stream of the going run and calls `IAiChatRunPort.stop`.
- When a run ends with `awaitingFrontendTools`, the controller runs the pending calls through the
  registry and starts the next run with their answers, up to `maxToolRounds` times. Without a
  registry the run ends as it is.

`createAiChatToolRegistry()` keeps the browser tools by name: `register(tool)` returns a function
that removes the tool, `definitions()` goes into the request. A failing or unknown tool gives an
error answer instead of a throw. A context provider is a function that returns the facts the
application knows now; it is read before every run.

## Errors

`toRunErrorKind(code)` classifies the code of a `RUN_ERROR`. `toHttpErrorKind(status, code)`
classifies a refusal before the stream, and `isRetryableBeforeStream(kind)` says whether to repeat
the request. `createAiChatError` builds the error with the default English text; an application
passes its own texts as the last argument.
