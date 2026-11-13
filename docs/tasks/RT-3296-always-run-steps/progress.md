# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — closing
- **Done:** stages 1–3, the spec, the scenarios and the table recorded anew. On this branch the
  selection runs `check-archive-age` (it counts days) and `tools/tests/run.sh` (not traced by the
  plan) of the ten; the other eight do not run.
- **Next step:** 4.3 — the push set on this branch
- **Uncommitted:** the code, the tests, the spec and the table — one commit before the set
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The tracer writes the parent pid next to its record
- [x] 1.2 A spawn whose child left a record is read through the child, not named untraced
- [x] 1.3 A native binary started by a traced node child counts as reading the files its parent passed
- [x] 2.1 `git log` and `git diff` with `-- <path>` read that path as a walk
- [x] 2.2 `git diff --name-only` of the change reads the files of the change the step then opens
- [x] 3.1 `bash <file>` and `bash -c` with `. <file>` read those files and the files they source
- [x] 3.2 `npm view` and `npm pack` read the registry, not the tree
- [x] 4.1 The spec of the push gate names the three new readings, with scenarios and tests
- [x] 4.2 The table is recorded anew on a green tree
- [>] 4.3 The push set runs green on this branch

## Decisions along the way

- **A start is linked to its child by a mark in the environment, not by the parent pid.** A shell
  between `node` and `npm` hides the pid; the environment passes through it. Stage 1.
- **A walk is the listing of one directory.** `agent-kit:check` ran on any change because `pnpm`
  lists the root on start, and every walk was read as the whole tree under it. A directory is now
  deep only when every directory of the tree under it was walked. A new directory under a listed
  one still reaches the step: a new migration directory starts `check-schema-drift`. Stage 1.
- **A copy and a loaded module are reads.** The package build copies its resources; with the root
  walk gone, an edit of a rule did not start `agent-kit:check` until `copyFile` was recorded. A
  plugin of the builder loaded by `require` is seen through the module hooks. Stage 1.
- **The process table is no file of the tree.** `pnpm` starts `ps` on start. Stage 1.
- **A step declares its filter of the change by the same function it filters by.**
  `check-kit-approval` exports `pushReadsChange`, `check-archive-age` exports `PUSH_EVERY_CHANGE`.
  A list written apart from the code would drift from it. Stage 2.
- **`npm view` and `npm pack` needed no rule of their own.** Once the start mark follows `npm`,
  its record shows it reads no file of the tree. Stage 3.
- **A shell is recorded by a `DEBUG` trap, not by a trace stream.** The machine's bash is 3.2 and
  has no descriptor for the trace; the trap writes to a file and leaves the step's streams alone.
  A redirection on a loop stands on no command the trap sees: a shell file that reads by `<` makes
  the step unseen. Stage 3.
