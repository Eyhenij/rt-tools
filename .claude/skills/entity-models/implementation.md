# entity-models — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

The admin panel has three record models — an incident review, a proposal and a month record —
and all three are declared as a namespace with two levels: the list row and the whole record.
The model of the signed-in person stands apart: it is no entity — it can have neither a list,
nor editing, nor levels.

The contract here is not protobuf. The receiver is Nest controllers over HTTP, there is not one
`.proto` in the tree, and there is no generated contract side either: what both sides read alike
is declared by hand in the shared lib `libs/message-bus-common`. Because of that the article
about the alias of a generated type reads here differently from how it is written, and the
divergence is written down as a line.

## What it is called here

- **In the rule** — Here
- **`Api` — an alias of a type from `@<scope>/common/proto`** — a type from `@rt/message-bus-common` — declared by hand, there is no generator
- **`State`, `Draft`, `Short`** — `State` and `Short` on all three cargo records; `Draft` on none — cargo is not edited
- **`I<Entity>`** — `IPostmortem`, `IProposal`, `IMonthRecord` — a namespace with levels; the signed-in person is outside them
- **a mapper inheriting `BaseMapper`** — the same: `BaseMapper<M>` from `@rt-tools/utils`
- **`this.typeCast`** — `TypeCastHelper` — the `typeCast` field of `BaseMapper` itself
- **the page, order and filter types** — there are two editions of them here: `@rt-tools/utils` for the kit and `@rt/message-bus-common` for the contract

## Where it lives

- **the mapper base** — `projects/utils/src/lib/helpers/base.mapper.ts`
- **the type cast** — `projects/utils/src/lib/helpers/type-cast.helper.ts`
- **the selection types for the kit** — `projects/utils/src/lib/interfaces/list.interface.ts`
- **the contract page types** — `libs/message-bus-common/src/lib/page.ts`
- **the cargo shape** — `projects/agent-kit/src/lib/cargo.ts` — declared by the sending side
- **what the receiver adds of its own** — `libs/message-bus-common/src/lib/cargo.ts`
- **the model of the signed-in person** — `libs/message-bus-admin/auth/util/src/lib/session.model.ts`
- **the cargo record models** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts`, `.../proposals/util/src/lib/proposal.model.ts`, `.../summaries/util/src/lib/month-record.model.ts`
- **the cargo record mappers** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.mapper.ts`, `.../proposals/util/src/lib/proposal.mapper.ts`, `.../summaries/util/src/lib/month-record.mapper.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **An entity has two sides, and both lie in the namespace `I<Entity>`.** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts:IPostmortem` — `Api` and `State` on each of the two levels. The signed-in person is outside the rule: `libs/message-bus-admin/auth/util/src/lib/session.model.ts:IAdminSession` — one side, the receiver gives the name and the admin panel shows that same name.
- **The contract side is not written by hand — it is declared as an alias.** — Here it is otherwise: there is no contract generator, and the contract side is written by hand — `libs/message-bus-common/src/lib/page.ts:IPage`. It cannot diverge silently: the declaration is one for both sides, and the receiver and the admin panel read that same file, not a copy of their own.
- **A mapper inheriting `BaseMapper` stands between the sides, and screens read only `State`.** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.mapper.ts:PostmortemMapper` — a pair of mappers per record, the list row and the whole record apart; the screen sees only `State`, and time in it is already a date, not a string.
- **Empty is expressed by an empty string or zero, not by a missing field.** — `libs/message-bus-common/src/lib/page.ts:pageAsked` — parsing the selection substitutes a default instead of leaving the field empty. In `IPageAsked` the only field with `null` is the tree trait, and `null` there means "not narrowed", not "no value".
- **A cast goes through `this.typeCast`, not through `??`.** — `libs/message-bus-admin/summaries/util/src/lib/month-record.mapper.ts:MonthRecordMapper` — the fields of the month record are cast by the `typeCast` field of the base (`projects/utils/src/lib/helpers/type-cast.helper.ts:TypeCastHelper`). There is no check for this in the tree, it is held by reading.
- **The page, order and filter types are taken from `@rt-tools/utils`.** — There are two editions of them here, and both are lawful: `projects/utils/src/lib/interfaces/list.interface.ts:IPageModel` — what the kit's page switcher reads; `libs/message-bus-common/src/lib/page.ts:TPageDirection` — the receiver's contract. A third one may not be started: translating between these two is exactly the mapper's work.

## What else is worth knowing when reading the code

- The cargo shape is declared in the published package (`projects/agent-kit/src/lib/cargo.ts`),
  not in the shared lib: the package goes to the registry, and an import of an internal lib
  would ride into its type descriptions and break the installation. The receiver takes the shape
  from there directly and does not substitute it by a re-export.
- `getAsType` accepts no default: a value outside the set it writes to the console and returns
  as the string `'unknown'`. A string field with a closed set of values is checked against the
  set explicitly.
- The admin panel model and the receiver model are different, even when the fields match. A type
  shared by the two sides would mean the admin panel drags in the storage fields.

## What this is checked by

- `pnpm exec nx test @rt-tools/utils` — the specs of the mapper base and of the type cast.
- `pnpm exec nx test message-bus-common` — the specs of parsing the selection and of the cargo
  shape: that is exactly the contract side, declared by hand.
- `pnpm exec nx test message-bus-admin-postmortems-util` and the two next to it — the mapper
  specs: time, levels and the fact that contract fields never reach the screen.
- The rule gate demands this rule on the admin panel models and mappers and on the shared
  models — a branch in `.claude/rt-kit/gate-map.sh`.
