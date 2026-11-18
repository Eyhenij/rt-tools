# The ai-chat-protocol package

**Status:** in force · **Revision:** 17 November 2026 · **Scenario prefix:** `SC-ACP`
**Depends on:** none
**Laws:** `verifiability`, `code-structure`
**Procedures:** none

## Why

The assistant chat runs in two applications on one set of AG-UI events. The `rt-ai-chat` view knows nothing about events. Without a shared layer each application keeps its own run reducer and its own error classes, and the two drift apart. The package holds what both share and what does not depend on the transport.

## Terminology

| Term      | What it is                                                                                 |
| --------- | ------------------------------------------------------------------------------------------ |
| run       | one answer of the assistant to the new messages of a thread, from `RUN_STARTED` to the end |
| event     | one record of the AG-UI stream, brought to the shape of this package                       |
| run state | the messages, the step, the run reference, the result, the awaited calls and the error     |
| stored    | a message the server already keeps; the next run does not send it                          |
| port      | an interface the application implements: one for runs, one for threads                     |

### What it is called in the interface

Not applicable: the package has no screen.

## Rules

- **The reducer does not change its input and knows nothing about the transport.** The state of a run is computed from events only. Otherwise two applications build different conversations from one stream.
- **Text arrives in pieces and lands in one message with one `messageId`.** While the pieces come, the step is cleared.
- **A tool call lives in the assistant message named by `parentMessageId`.** Its arguments are appended piece by piece. The tool result is a separate message with the tool role.
- **The end of a run marks every message stored and records the result and the awaited calls.** The next run sends only the messages that are not stored.
- **A run error leaves the question unsent and names the run reference.** The view shows the reference as the number to quote when asking for help.
- **A messages snapshot replaces the stored messages and keeps the unsent ones at the end.**
- **The reader drops events with no type, with missing required fields and unknown ones.** One broken record does not kill the run.
- **One code gives one kind of error.** Run codes and refusal codes before the stream are two tables. A request before the stream is repeated only after unavailable and busy.
- **The package has no SSE frame parsing, no network code and no application names.** The application supplies the transport through the ports.

### The ports

The ports are interfaces. The application implements them.

| Port                 | Method                                   | Takes, returns                                    |
| -------------------- | ---------------------------------------- | ------------------------------------------------- |
| `IAiChatRunPort`     | `run(request, options?)`                 | new messages, tools, context → a stream of events |
| `IAiChatRunPort`     | `stop(threadId, runId)`                  | stops a run → nothing                             |
| `IAiChatThreadsPort` | `listThreads(cursor, pageSize?)`         | a cursor → a page of threads and the next cursor  |
| `IAiChatThreadsPort` | `getMessages(threadId, pageSize?)`       | a thread → its stored messages                    |
| `IAiChatThreadsPort` | `setFeedback(threadId, messageId, next)` | a rating or `null` → nothing                      |
| `IAiChatThreadsPort` | `markRead(threadId)`                     | a thread → nothing                                |
| `IAiChatThreadsPort` | `archiveThread(threadId)`                | a thread → nothing                                |

### The codes of the assistant service

| Code                                                  | Kind              |
| ----------------------------------------------------- | ----------------- |
| `Error_AiChat_Run_Interrupted`                        | `interrupted`     |
| `Error_AiChat_Run_Superseded`                         | `superseded`      |
| `Error_AiChat_Run_AlreadyRunning` (before the stream) | `already-running` |
| `Error_AiChat_Run_Busy` (before the stream)           | `busy`            |
| `Error_AiChat_Thread_Archived` (before the stream)    | `archived`        |
| `Error_AiChat_Run_NoInput` (before the stream)        | `no-input`        |

## What is out of scope

- The panel view: `rt-ai-chat` in `@rt-tools/ui-kit-v2`.
- The transport, the browser tools and the run controller: the next tasks of the shared layer.

## Contract

Not applicable: the package serves no procedures.

### Refusal codes

Not applicable: the package throws none. The classes of the service codes are in the rules above and in the table under them.

## Data

Not applicable.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

The default error texts are English. The application passes its own texts.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **The package depends on `tslib` only, and the ports use `Promise` and `AsyncIterable`.** Rejected: `@ag-ui/core` and `rxjs`, they bring schemas and a framework into a package that has none.
- **The reader of one event from raw JSON is part of the package.** Rejected: leaving it to the applications, each would write it differently.

## Open questions

- `Q-1` — the error kind for codes of the Connect call stream. The application with that transport maps them to a status and a code itself. A shared table waits until that transport shows live codes.

## History of changes

- 17 November 2026 — the package is created.
