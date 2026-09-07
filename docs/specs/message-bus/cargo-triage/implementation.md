# Where this is carried out — the working order of the sorting out of the cargo

The key of the link is the text of the rule itself. A rule that has no place in the code stands here as
a line about what holds it instead: the order is carried out by an agent, and half the requirements of
this subdomain are held by text, not by a machine.

## The rules and their places

- **The cargo is read by the admin application of the intake, not by the work queue.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo and by the command of the digest of the proposals
- **The sorting out starts with what is not sorted out.** — `libs/message-bus-common/src/lib/cargo-page.ts:cargoPageAsked`
- **What is already sorted out is asked of the intake, it is not recalled.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo
- **To take a report into work means to create a task by it.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo
- **The task and the mark go by one turn.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo
- **One edit — one task, however many records of the cargo called it up.** — **Not carried out by a machine:** the same requirement stands in the rule of the delivery
- **A record no work will be done by is not moved into "in progress".** — **Not carried out by a machine:** there is no state of a refusal — the open question `Q-CT-1`
- **"Ready" is put when the edit is merged into the main branch.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo
- **With the transition into "ready" goes the way of the fix.** — `tools/cargo-mark.mjs:itemsOf`
- **The way of the fix is written in the words of the edit, not as a retelling of the analysis.** — **Not carried out by a machine:** the meaning of a text is judged by nothing
- **"Released" is put by whoever publishes the edition, and by the same movement as the publication.** — **Not carried out by a machine:** the release goes by the pipeline, and the mark by the hand of whoever publishes
- **The version of the release is the one the release was named by that carried the fix.** — `tools/cargo-mark.mjs:mark`
- **Between "ready" and "released" stands the edition of the package.** — The set of the states: `projects/agent-kit/src/lib/cargo.ts:CARGO_STATES`
- **The mark is put by a command of the package, not by the hand of a person in the admin application.** — `tools/cargo-mark.mjs:main`
- **The records of the whole sorting out go by one bundle.** — `tools/cargo-mark.mjs:itemsOf`
- **The answer of the command is read, it is not implied.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo
- **A refused row is taken apart, it is not repeated by the same call.** — **Not carried out by a machine:** it is held by the rule of the sorting out of the cargo

## What the uncheckable is closed by

Eleven rules out of seventeen are not held by a machine, and that is a trait of the subject, not an
unfinished piece: the order is carried out by an agent who is left with no memory between sessions.
They are held by two texts — the rule of the sorting out of the cargo in the set of the resources and
the pattern at it with the ready calls — and by what is done being visible in the intake itself: a
record whose edit is merged while the state is the former one names the missed step itself.
