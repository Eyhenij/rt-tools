# Scenarios — the ai-chat-protocol package

The numbers were issued as the next free ones of the prefix and do not change: the titles of the tests refer to them.

### SC-ACP-1 — a plain answer: the pieces of text land in one message and the result is recorded

Given a recorded stream of a plain answer
When it is replayed through the reader and the reducer
Then the pieces of text land in one message, the message and the question are stored, the result is succeeded

### SC-ACP-2 — a server tool: the call, its arguments and its result lie in their places

Given a recorded stream with a server tool
When it is replayed
Then the call lies in the assistant message with its arguments joined, and its result is a message with the tool role

### SC-ACP-3 — a browser tool: the run waits for answers and the awaited calls are named

Given a recorded stream that ends awaiting a browser tool
When it is replayed
Then the result is awaiting the tools and the awaited call ids are named

### SC-ACP-4 — a run error: the question stays unsent and the run reference is named

Given a recorded stream that ends with a run error
When it is replayed
Then the question stays unsent, the kind is a failed run and the run reference is named

### SC-ACP-5 — a cut stream: the run closes with the interrupted code and the error says so

Given a stream the service cut with the interrupted code, and a stream that just stops
When each is replayed
Then the first gives the interrupted kind with the default text, the second leaves the run running with no error

### SC-ACP-6 — the step shows before the first text and the text clears it

Given a step started before any text
When a text event arrives, or the step finishes
Then the step shows until then and is cleared by either

### SC-ACP-7 — only the messages that are not stored go into the next run

Given a finished run and a new question
When the messages for the next run are picked
Then only the question not yet stored is picked

### SC-ACP-8 — a messages snapshot replaces the stored messages and keeps the unsent ones

Given a messages snapshot while an unsent question stands in the list
When the snapshot is applied
Then the stored messages are replaced by the snapshot, messages with an unknown role are dropped and the unsent question stays last

### SC-ACP-9 — a refusal before the stream gives its own kind; only unavailable and busy are retried

Given refusals before the stream: 401, 403, 409 and service codes for busy, archived and no input
When each is classified
Then each gives its own kind, and only unavailable and busy are retried

### SC-ACP-10 — the reader accepts recorded events and drops broken and unknown ones

Given recorded events, broken records and records of a type the package does not read
When each is read
Then the recorded events all become events, the others give nothing
