---
name: observability
kind: rule
law: observability
description: Rule under the observability law. Load when editing the logger, the request context, the failures and alerts domain, when adding a new log line and when deciding what the owner learns about a failure. Pattern observability-record.
---
<!-- rt-kit v0.41.1 · rules/observability.needs-app.md · e1dd364f8a6c · правится надстройкой, не здесь -->

# Observability — how it works here

Rule under the law `docs/constitution/observability.md`. Cold part: `pitfalls.md`; paths: `implementation.md`.

| In the law | Here
| --- | ---
| what the application writes about itself | application logs: one line per logger call, in machine form
| the step of importance | the level: from debugging details to a failure that took the process down
| the request number | the request id, also the response header
| the marker by which all failures of one request are found | the same request number — it stands in every log line
| failure details | the parsed cause: class, text, protocol code, code and details from the storage, a trimmed stack
| the generic error text going outside | an internal error without details
| scrubbing secrets | replacing values by field name
| a failure in the store | what the failures domain saved: a failure group and its occurrences
| what the application came up with | the startup digest: one log line with the version, the port, the storage address and the lists of features — enabled, disabled and broken

## How the law applies here

- **The request number is created once per request and stands in every log line about it.**
- **The request number goes to the caller as a response header and in the failure details.** Expose it cross-origin.
- **A number that came from outside is cleaned and shortened, and an empty one is created anew.**
- **Outside goes the code and a generic error text; the details stay in the logs.**
- **A failure on input or rights is written apart from a breakage and without a stack.** A level below breakage.
- **The cause of a failure is parsed in one place.**
- **A field added to the answer of a refusal is added where the answer is assembled, not where the refusal is thrown.**
- **The fields of a log line are always scrubbed, not at the discretion of whoever writes.** A foreign-body key is checked against the key lists.
- **At startup the application writes what it came up with.**
- **The startup digest holds the names of features and their state, but not the values of variables.**
- **A feature enabled by a pair of keys knows a third state.** One half filled — broken.
- **The level threshold decides whether a log line appears in the output, but not in the failure store.**
- **A selected log line is saved to the store as a failure.** Failure level up; lower by a declared list.
- **The logger hands a failure to the sink and does not see the store.**
- **Log lines of the storage client, the failures domain and the alerts domain do not go to the sink.** Cut by source, not by moment.
- **A call to a foreign service goes with an explicit wait limit.**
- **A send outside creates its own line before the call, and the outcome is appended to it after.** Made where the store is seen; also the lock.
- **Recording a failure does not delay the response and does not take the request down.** A full queue drops the new one and counts.
- **The request context is captured at the moment of the logger call, not at the moment of writing.**
- **The owner reads what was recorded in their own section, closed by a separate right.**
- **The store does not grow without limit: once a day the excess and the old are removed.**
- **The store limit is named in rows, not bytes.**
- **The owner learns of a new failure by themselves — by an event journal line and by mail.** On a new group or one silent a day.
- **The mail holds nothing that is closed by the right to the failures screen.**
- **The owner reads the failure rate as a curve above the feed: a bar is a bucket of the chosen period.**
- **The alarm is raised by growth in breakages, not in all failures.**
- **A spike is counted over the last closed bucket; the current one is not given to the rule.**
- **The rate is analysed by a schedule tick, not by a screen request.**
- **The owner learns of a spike by a journal line and by mail; a repeat of the mail is held by a fuse.** One feed line per incident; a lasting breakage mails next day too; fuse keyed by subject.

By hand, unchecked: a lower-level name joins the selected list; an environment-read feature
joins the digest, or is in no list; the level. A failure before startup stays in container output.
Serialising a log line must not throw. An unwrapped stream's failure never reaches the logs.

## Patterns

- `observability-record` — a new log line.
