# observability — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

Before this work the tree held no server side at all, and the rule was lifted by the list of
drops. It is brought back together with the cargo receiver — the application `apps/message-bus`.
The receiver is growing: it has output, a liveness probe, a single parsing of failures and a
request number, while it has not one failures domain, alerts domain or screen for the owner.
Hence most of the table below is "not carried out", and that is the state of the work, not a
refusal of the article.

The rule as a whole concerns the receiver alone: the published packages in `projects/` write
nothing about themselves — their output belongs to the application that installed them.

## What it is called here

- **In the rule** — Here
- **what the application writes about itself** — the container output: one line per journal call — machine-readable in production, readable outside it
- **the importance step** — the `Logger` level: `log`, `warn`, `error`
- **the source of a line** — the first argument of `Logger` — `Db` on the storage client, `Bootstrap` on the service startup, `Failure` on the parsing of failures, `CargoState` on an edit of the cargo state
- **the request number** — eight hexadecimal characters; it stands in the text of the `500` and `503` refusals and in the journal line about that same refusal
- **the failure store** — not started: failures live in the container output, with the parsed cause in the fields of the line

## Where it lives

- **the storage client lines** — `libs/message-bus-api/persistence/data-access/src/lib/prisma.service.ts`
- **the startup digest** — `apps/message-bus/src/main.ts`
- **the liveness probe** — `apps/message-bus/src/app/health/health.controller.ts`
- **the container output ceiling** — `docker-compose.yml`, the `api` service — three files of ten megabytes
- **the agreement about what the receiver writes** — `docs/specs/message-bus/spec.md`, the section about cargo that did not arrive

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The request number is created once per request and stands in every log line about it.** — `apps/message-bus/src/app/failure.filter.ts:catch` — **narrower** than the article: the number is created per failure, not per request. The receiver has exactly one line about one request — the one written by the parsing of failures — and there is nothing to link while nobody else writes about the request.
- **The request number goes to the caller as a response header and in the failure details.** — `apps/message-bus/src/app/failure.filter.ts:catch` — **narrower** than the article: the number stands in the failure text, and there is no response header with it. The tree prints the text to the owner, and a number that left in a header would not get into the print at all.
- **A number that came from outside is cleaned and shortened, and an empty one is created anew.** — **Not applicable.** A number from outside is not accepted: the receiver has no requests carrying a foreign number.
- **Outside goes the code and a generic error text; the details stay in the logs.** — `apps/message-bus/src/app/failure.filter.ts:messageOf` — an unfamiliar breakage is not retold at all; instead of a retelling the request number is named.
- **A failure on input or rights is written apart from a breakage and without a stack.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:refused` — a failed sign-in is written as a line without a stack and gets no request number.
- **The cause of a failure is parsed in one place.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError` — one parsing for the whole application: it is called both by the parsing of failures and by the storage client.
- **The fields of a log line are always scrubbed, not at the discretion of whoever writes.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact` — it is called by the journal on every record, before the output.
- **At startup the application writes what it came up with.** — `apps/message-bus/src/main.ts:serve` — the port and the cargo weight limit, as fields.
- **The startup digest holds the names of features and their state, but not the values of variables.** — `apps/message-bus/src/main.ts:serve` — the fields hold the port and the weight limit; the storage address and the tokens are not in them.
- **A feature enabled by a pair of keys knows a third state.** — **Not applicable.** The receiver has no features enabled by a pair of keys.
- **The level threshold decides whether a log line appears in the output, but not in the failure store.** — **Not carried out.** There is no threshold and no failure store.
- **A selected log line is saved to the store as a failure.** — **Not carried out.** There is no failure store.
- **The logger hands a failure to the sink and does not see the store.** — **Not carried out.** There is no failure store, and there is nowhere for the receiver to hand a failure from.
- **Log lines of the storage client, the failures domain and the alerts domain do not go to the sink.** — `libs/message-bus-api/persistence/data-access/src/lib/prisma.service.ts:isAlive` — the client's lines go to the output and no further; there is nowhere to select them into.
- **A call to a foreign service goes with an explicit wait limit.** — **Not applicable.** The receiver goes nowhere outward: it takes in rather than sends out.
- **A send outside creates its own line before the call, and the outcome is appended to it after.** — **Not applicable.** The receiver goes nowhere outward: it has not one outgoing request.
- **Recording a failure does not delay the response and does not take the request down.** — **Not carried out.** There is nowhere to record a failure, and nothing to delay the response.
- **The request context is captured at the moment of the logger call, not at the moment of writing.** — **Not carried out.** There is no request context.
- **The owner reads what was recorded in their own section, closed by a separate right.** — **Not carried out.** The receiver's admin panel is the third branch of the task; there are no rights in that branch at all.
- **The store does not grow without limit: once a day the excess and the old are removed.** — **Not carried out.** There is no failure store; the cargo retention period is `Q-17` of the receiver's agreement.
- **The store limit is named in rows, not bytes.** — **Not carried out.** There is no failure store. The container output ceiling is named in bytes at that — but it is output, not a store.
- **The owner learns of a new failure by themselves — by an event journal line and by mail.** — **Not carried out.** The receiver has neither an event journal nor mail; alerts are taken out of the agreement outright.
- **The mail holds nothing that is closed by the right to the failures screen.** — **Not applicable.** The receiver sends no mail: it has none at all.
- **The owner reads the failure rate as a curve above the feed: a bar is a bucket of the chosen period.** — **Not carried out.** The receiver has no screens.
- **The alarm is raised by growth in breakages, not in all failures.** — **Not carried out.** The receiver has no screens and no failure count, and there is nothing to raise an alarm with.
- **A spike is counted over the last closed bucket; the current one is not given to the rule.** — **Not carried out.** The receiver has no buckets and no spike count at all.
- **The rate is analysed by a schedule tick, not by a screen request.** — **Not carried out.** The receiver has no schedule.
- **The owner learns of a spike by a journal line and by mail; a repeat of the mail is held by a fuse.** — **Not carried out.** The receiver has neither an event journal, nor mail, nor the spike count itself.

## What else is worth knowing when reading the code

- **The receiver sends nothing out.** Half the rule speaks of mail, alarms and requests to
  foreign services; the receiver has not one outgoing request — it takes in cargo and answers
  with a code. Hence "not applicable" in the table stands from the arrangement, not from poverty.
- **A failure before the application comes up has nowhere to be recorded.** There is no store at
  that moment yet, and such lines stay only in the container output. On the receiver that is true
  after the startup too: it has no failure journal at all yet.
- **The liveness probe asks the storage, not itself.** A service counts as up when it has carried
  out a task: `SELECT 1` in the storage client is that task.

## What this is checked by

- `pnpm exec nx test message-bus` — the scenarios `SC-MB-17`, `SC-MB-18` and `SC-MB-29`: the
  liveness probe answers without a token, does not name the contents and stays silent when the
  storage is unreachable; `SC-MB-72` — the request number in the refusal and that same number in
  the journal.
- By a live run: `docker compose stop db`, then a request to the liveness probe — it answers with
  a refusal rather than "up", and reading cargo answers with a refusal carrying a request number.
- `pnpm run agent-kit:check` — that this companion is filled in rather than left a draft.
