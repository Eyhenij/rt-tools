# cargo-triage — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

The rule speaks by technique and names the paths shared by the workshop's trees — they need no
rewriting here. Only what the package cannot know goes here: how things are named in this
repository exactly, and in which of its files every article of the rule is carried out.

This tree both sends cargo and takes it in: the receiver with its admin panel live here too. So
every article has two addresses — the one where the sending side stands and the one where the
receiving side stands — and both lie in one repository.

## What it is called here

- **In the rule** — Here
- **the intake** — the cargo receiver, the application `message-bus`; the address is declared by the key `intake`
- **the intake's admin panel** — the application `message-bus-admin`, the sections «Разборы» and «Предложения»
- **the mark command** — `npm run cargo:mark` — the tree's own command: it is called by whoever sorts out the cargo
- **the read command** — `npm run cargo:pull` — it signs in as a service pair and prints the record keys
- **the close command** — `npm run cargo:close` — the edition's publisher closes a neighbour's records by it
- **the service account's pair** — two lines in `~/.config/message-bus-cargo-account`; the path is the key `account`
- **new, in work, done, released** — the `--state` arguments: `new`, `in_work`, `fixed`, `released`
- **an incident analysis** — a record in the intake; its key is the name of the file it travelled by. No analyses lie on the tree's disk: a draft is written into a directory outside the history and is removed together with the send
- **a proposal** — a file in `.claude/rt-kit/proposals/`; the record's key is the text's sign

## Where it lives

- **The mark command** — `projects/agent-kit/src/bin/agent-kit.ts`
- **The build of the mark package** — `tools/cargo-mark.mjs`
- **The read command** — `tools/cargo-pull.mjs`
- **The close command** — `tools/cargo-close.mjs`
- **The account sign-in** — `libs/message-bus-api/accounts/feature/`
- **The set of states** — `projects/agent-kit/src/lib/cargo.ts`
- **The state-editing operation** — `libs/message-bus-api/cargo-state/`
- **The admin panel's cargo sections** — `libs/message-bus-admin/postmortems/`, `libs/message-bus-admin/proposals/`
- **The agreement about the states** — `docs/specs/message-bus/cargo-state/`
- **The agreement about closing by the publisher** — `docs/specs/message-bus/publisher-cargo-close/`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

Eight articles out of twenty are not held by a machine, and the line next to them says so
outright. That is a property of the subject: the cargo is sorted out by an agent, and it has no
sign of "read and decided".

- **The cargo is taken from the intake by a command, not by eye in the admin panel.** — `tools/cargo-pull.mjs:pull`
- **Cargo is not created in the work queue.** — **Not checked by anything.** There is no mechanism of its own, and the work queue does not refuse cargo
- **Cargo standing in the queue from former times is not judged as a task.** — `projects/agent-kit/assets/checks/check-board.github.mjs:CARGO_LABELS` — the audit sifts records by the labels from the key `board.cargoLabels` of the tree's settings and names the number sifted out
- **Sorting out starts with what is not sorted out.** — `libs/message-bus-common/src/lib/cargo-page.ts:cargoPageAsked` — the filter by state
- **What is already sorted out is asked of the intake rather than recalled.** — `tools/cargo-pull.mjs:query` — the filter by state travels as a query string
- **To take a report into work means to create a task for it.** — **Not checked by anything.** The cargo mark guard reads the link "task — record" from the grill of the request. It judges handing over the work rather than taking it. "In work" cannot be set on a foreign record: closing by the publisher accepts only "done" and "released". Scenario SC-MB-282
- **The task and the mark go in one turn.** — `.claude/hooks/cargo-mark-guard.sh:verdict` — a turn that handed over the work on a cargo record is not let out without a mark in that same turn. A dry run does not count as a mark. Scenarios SC-MB-281, SC-MB-283
- **One edit — one task, however many cargo records called for it.** — **Not checked by anything.** The same requirement stands as an article of the rule `git-workflow`
- **"Done" is set when the edit is merged into the main branch.** — `.claude/hooks/cargo-mark-guard.sh:verdict` — what is judged is handing over the work rather than the merge itself. The merge is pressed by a person at the host, where there are no guards, so the mark is demanded one step earlier. Scenario SC-MB-281
- **The move to "done" goes by the work state `влито`, not by the executor's memory.** — **Not checked.** The step stands as text in the pattern `task-flow-archive`, as a subsection with a ready-made call. Carrying the step out is invisible to a machine
- **The fix travels with the move to "done".** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **A neighbouring tree's record is closed by the edition's publisher, not by its sender.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.ts:CargoCloseController` — the operation under a person's sign-in; the command is `tools/cargo-close.mjs:close`, the order of the moves is `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseMove`
- **"Released" is set by whoever publishes the edition, and by the same motion as the publication.** — **Not checked by anything.** The release goes by the pipeline, and the mark by the publisher's hand
- **Between "done" and "released" stands an edition.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_STATES` — the set keeps the two states apart
- **Both sides of the sorting out go by commands, and they are closed differently.** — `tools/cargo-pull.mjs:login`, `tools/cargo-mark.mjs:main`
- **The service account's pair lies outside the repository.** — `tools/cargo-pull.mjs:accountOf`
- **A key is written down in full and travels into the description of the past together with the grill of the request.** — **Not checked.** The line stands in the task folder's sample `docs/tasks/_template/grill.md`. That the executor carried it out is invisible to a machine
- **The mark's key is taken from that same read rather than computed from a file on the disk.** — `tools/cargo-pull.mjs:KINDS`
- **The records of a whole sorting out travel in one batch.** — `tools/cargo-mark.mjs:itemsOf`
- **The command's answer is read, not assumed.** — **Not checked by anything.** The answer is printed, and whether it was read nothing judges
- **The release version is named by one number, without the package name.** — **Not checked by anything.** The intake holds the version's length and leaves the form to the tree. Each has its own, and a shared ban would refuse a neighbour's records. It is held by a sample in the pattern `cargo-triage-mark`, which is where the string is taken from
- **Sorting out the cargo and gathering the proposals are two different steps.** — **Not checked by anything.** The gathering command refers to this rule and does not repeat the order

## What else is worth knowing when reading the code

- **Here both sides are at once.** The tree sends its cargo into its own receiver, and that same
  tree sorts it out. Hence the temptation to look at the state by a query to the storage — that
  must not be done: a query shows a column rather than a list narrowed by a filter, and the sorting
  out goes over everything again. There is something to ask with: the read command has the same
  filter as the admin panel.
- **The tree's sign is computed from the address of its remote ref rather than taken from the
  intake.** Cargo lying in the database from a tree with a different sign is not marked by one's
  own token: the intake answers "the tree sign in the cargo belongs to another tree". On a local
  database that is an everyday thing — it lives longer than the addresses that wrote into it.
- **The command is called from its own build, not from the registry.** Under the name `agent-kit`
  in the registry lies a foreign package, and `npx agent-kit` ends with a refusal "not found".
  Before the call the package is built — the same way the layout commands in `package.json` do it.
- **An incident analysis's key is the file name, and it is also the record's name in the intake.**
  A renamed file arrives as a second record, and the former one stays in "new" forever.
- **The order of release versions is computed by the receiver, not by the storage.** The column is
  a string, and in the admin panel's list the versions stand as part numbers — that is the work of
  the task about the column and the filter by version.

## What this is checked by

- `pnpm run agent-kit:check` — the layout audit: the rule and the pattern lie in the tree and match
  the package's set.
- `npm run check:specs` — the agreement's scenarios against the test titles; the uncovered ones
  carry a reason.
- `.claude/hooks/cargo-mark-guard.sh` — the turn-exit guard: a turn that handed over the work on a
  cargo record does not end without moving its state. The scenarios are the suite
  `projects/agent-kit/tests/cargo-mark-guard.test.sh`.
- The rest of the order is checked by nothing: seven articles out of twenty are held by text. A
  skipped step is visible in the intake itself — by a record whose edit is merged while the state
  is as before.
