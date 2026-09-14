# Grill

Epic RT-2097, task 2 of 4. The owner's request and answers stand in the record of RT-2098 in the
archive and in the epic plan; here — what this task adds.

## The owner request

> рализуй модуль аналитики полностью без остновок и вопросок, все примеры я тебе дал, работай автономно врежиме ночной работы

## What the tree already has

- **The agreement of the receiving side** — `docs/specs/message-bus/proposed/rule-usage-stats/`: the intake rules, the contract `POST /api/intake/observations`, the row of the storage, the caps, the keeping term, scenarios `SC-MB-337`…`SC-MB-342` for this task.
- **The form of the cargo** — `IObservationsCargo` in `projects/agent-kit/src/lib/cargo.ts`, read by the intake through `@rt-tools/agent-kit/cargo`.
- **The sample of an intake operation** — `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.ts`: `@TreeOperation()`, `cargoFault` over the head of the cargo, the write in the data-access lib, the answer with a status code; its spec with a hand-written storage double.
- **The head check of every cargo** — `cargoFault` and `faultyCargoItems` in `libs/message-bus-common/src/lib/cargo-fault.ts`.
- **The storage** — `prisma/schema.prisma`, migrations in `prisma/migrations/<stamp>_<name>/migration.sql` written by the pattern `git-workflow-migration`; `npm run check:schema` in the push gate.
- **The weight limit** — `apps/message-bus/src/app/cargo-limit.ts`, a setting with a default; the failure filter names it in the `413` answer and lists the cargo kinds in the `404` answer — `CARGO_KINDS` there gains `observations`.
- **The journal** — `Logger` of the framework with fields as an object, `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts`; a startup service sample — `libs/message-bus-api/accounts/feature/src/lib/account-startup.service.ts`.
- **No scheduler in the tree.** No dependency of the kind and no periodic work anywhere in the intake.

## What the rules already say

- `testing` — a decision that depends on the current moment takes the moment as a parameter; a procedure is checked with a hand-written storage double.
- `deploy-flow` / `git-workflow-migration` — the migration file is written by `migrate diff` on a one-off container, never by `migrate dev`.
- `entity-models`, `lib-imports` — the api lib is split `api / data-access / feature / util`; the imports go by the layers.

## Questions and answers

None asked: the session is autonomous, and the owner's answers on the design lie in the agreement.

## Decisions

- **The nightly cleaning is a service with a timer of the framework's runtime, without a scheduler dependency.** The moment of the next run is computed by a pure function of "now" and checked by a call; the service arms one timer per run and re-arms after it. Nobody to ask: autonomous session. Cost of a mistake: replacing the service body by a scheduler decorator once the owner names a dependency — one file.
- **The caps: five thousand lines per cargo, two hundred bytes per text field.** A run window of three days on a busy tree gives hundreds of lines, not thousands; a resource name is a file name. Both are settings with a default, next to the weight limit. Cost of a mistake: two numbers.
- **The cleaning runs at 03:10 by the clock of the intake, in universal time.** Any hour would do; a fixed one keeps the journal readable. Cost of a mistake: one number.
- **The rows are stored in a table `observation` with the day as text `YYYY-MM-DD` and the time as a timestamp.** The day is the key of the replacement and the file name of the tree; the time is what the reading may order by. Cost of a mistake: a migration.

## What is left unclear

- Whether the sender should print the number of replaced days and rows from the intake answer. The sender prints "принято" for an answer without a month; the answer carries the numbers already, and the print is a line of the package to add when asked.
