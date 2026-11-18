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

### SC-ACP-11 — without a registry the answer of the browser is not awaited

Given a run that ends awaiting a browser tool and a controller made without a registry
When a message is sent
Then one request goes with no tools and no context, and the result stays awaiting the tools

### SC-ACP-12 — the context providers are read before the run

Given two context providers, one answering at once and one by a promise
When a message is sent
Then the request carries the items of both in the order of the providers

### SC-ACP-13 — the request is repeated until the first event, then the run goes on

Given a port that fails twice before any event and then answers
When a message is sent
Then the request is sent three times with the wait between them and the run ends without error

### SC-ACP-14 — a request that never gets an event ends with the error, after the last attempt

Given a port that fails every time and a limit of two attempts
When a message is sent
Then the request is sent twice, and the run ends idle with the unavailable kind

### SC-ACP-15 — a refusal that repeating cannot cure is not repeated

Given a port that fails with the access-denied kind
When a message is sent
Then the request is sent once and the error has that kind

### SC-ACP-16 — an unknown kind of the failure counts as unavailable

Given a port that fails with a kind the package does not know
When a message is sent
Then the failure is repeated up to the limit and ends with the unavailable kind

### SC-ACP-17 — a stream cut after the first event is interrupted and never sent again

Given a stream that fails after its first events
When a message is sent
Then the request is sent once and the run ends idle with the interrupted kind

### SC-ACP-18 — a stream that ends without the finish is interrupted

Given a stream that ends after its first event with no finish and no error
When a message is sent
Then the run ends idle with the interrupted kind

### SC-ACP-19 — stop cuts the going run and tells the port which run it was

Given a run that has started and waits for more events
When stop is called
Then the stream is cut, the port is told the thread and the run id of the service, and the run ends idle with no error

### SC-ACP-20 — stop before the stream started names the run the controller made

Given a run whose stream gave no event yet
When stop is called
Then the port is told the run id the controller made, and a quiet cut gives no error

### SC-ACP-21 — stop with no run going does nothing, and a second send while a run goes changes nothing

Given no run, then a run that goes
When stop is called with no run, and then a second message is sent while the run goes
Then the first call does nothing, and the second adds no message and no request

### SC-ACP-22 — a run that asks the browser again and again ends with the error after the limit of rounds

Given a port that ends every run awaiting a browser tool and a limit of two rounds
When a message is sent
Then three requests go and the run ends with the failed-run kind

### SC-ACP-23 — a run that ends with an error does not wait for the browser

Given a run that names a browser call and then ends with a run error
When a message is sent
Then one request goes and the error of the run stays

### SC-ACP-24 — a run waits for the browser answer, then the next run starts with it

Given a recorded browser tool stream, then a recorded plain answer, and a registry holding the tool
When a message is sent
Then the tool runs with the parsed arguments, the second request carries its answer as a message with the tool role, and the run ends succeeded

### SC-ACP-30 — a tool is registered by its name, run with parsed arguments and removed by the returned function

Given a registry and a tool registered in it
When its definition is listed, it is run and then removed
Then the definition is listed, the answer is the tool's result and the list is empty after the removal

### SC-ACP-31 — empty arguments reach the tool as an empty object

Given a call with empty arguments
When it is run
Then the tool gets an empty object

### SC-ACP-32 — a second tool of the same name replaces the first, and the first remover leaves the second alone

Given two tools of one name registered one after another
When the remover of the first is called and the name is run
Then the second tool answers

### SC-ACP-33 — an unknown tool and a failing one become an error answer instead of a throw

Given an unknown name, a tool that rejects with an error, one that rejects with a plain value and a call with broken arguments
When each is run
Then each gives an answer with an error text and nothing is thrown
