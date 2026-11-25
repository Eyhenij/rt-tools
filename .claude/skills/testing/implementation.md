# testing — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The tree publishes libraries and holds nine projects under `apps/`, seven applications and two end-to-end suites: the cargo receiver and
its admin panel, the chat pieces and the entry example among them. It has two end-to-end suites on Playwright: the admin panel's, `apps/message-bus-admin-e2e`,
with its own stand of production builds and its own database, and the entry example's,
`apps/auth-example-e2e`, on the auth stand. Everything else is checked by a call —
components, services, pure functions and the receiver's handlers — and the visible state of the
kit is shown by the showcase.

There are two spec runners here, and the boundary between them goes by directory: the published
packages in `projects/` have Jest, the application and the receiver's internal libs have Vitest.
They diverged not by taste: the packages stand on the frontend framework and its preset, while
the server side does not know it at all.

## What it is called here

- **In the rule** — Here
- **a spec runner** — Jest with `jest-preset-angular` on the packages; Vitest on the receiver and its libs; Playwright on the suite
- **a spec file** — `*.spec.ts` next to the source
- **a fixture builder** — `createRtFixture(...)` from the kit's spec harness
- **the list of a component's behaviours** — `CONTEXT.md` next to a kit component — the sections "Главное, что нужно знать" and "Края"
- **the mark of what is not covered** — a line `Not covered: <reason>` in a `scenarios.md`, the older `Не покрыто:` still read; partial coverage is the line `Coverage: partial — <what is missing>`
- **the type check of the specs** — the target `typecheck`: `tsc --noEmit` over `tsconfig.spec.json`; at the receiver's libs it is inferred by `tools/nx-plugins/spec-typecheck.cjs` for every project with a Vitest config and a spec settings file

## Where it lives

- **the zoneless stand startup** — `projects/ui-kit-v2/src/test-setup.ts`
- **the kit's spec harness** — `projects/ui-kit-v2/src/testing/rt-kit-testing.ts`
- **the text editor double** — `projects/ui-kit-v2/src/testing/quill-mock.ts`
- **a sample component spec** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`
- **a sample service spec** — `projects/store/src/lib/base-store.service.spec.ts`
- **a sample pure-function spec** — `projects/utils/src/lib/functions/transform-string-input/transform-string-input.spec.ts`
- **the mapping of package paths for Jest** — `projects/ui-kit-v2/jest.config.ts`
- **the admin panel's end-to-end suite** — `apps/message-bus-admin-e2e/` — the stand in `stand/`, the specs in `src/`, the README next to them
- **the entry example's end-to-end suite** — `apps/auth-example-e2e/` — the specs in `src/`
- **the subjects of paths and the suites they raise** — `.claude/rt-kit/project.sh` — `rt_push_touched` and `rt_push_checks`
- **the specs of the admin panel's suite a push runs** — `.claude/rt-kit/project-heavy.sh:rt_admin_e2e_step`. A branch whose receiver code reaches only named sections runs their specs. Any other receiver path, the stand, the step's browser script and a second-kit edit run the whole suite. Scenarios: `tools/tests/push-heavy-subjects.test.sh`
- **the saved real data of the package suites** — `projects/agent-kit/tests/fixtures/real-record/` and `projects/agent-kit/tests/fixtures/real-host/`. The first is a cut of a conversation record made by `projects/agent-kit/tests/real-data/cut-record.mjs`. The second holds hosting answers recorded by `real-data/record-host.sh` and replayed by `real-data/replay-gh.mjs`. A reader without a run on a directory whose name begins with fixtures/real- is refused by `projects/agent-kit/tests/hooks-kind.test.sh`
- **the end-to-end coverage guard at opening a PR** — `.claude/hooks/e2e-coverage-guard.sh`, its scenarios in `tools/tests/e2e-coverage-guard.test.sh`. The run ahead asks it before the set by `.claude/rt-kit/project.sh:RT_PUSH_READY_HOOKS`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A test title starts with its scenario id and a dash.** — **Not checked by anything.** Numbered scenarios exist for every domain under `docs/specs/` except `core` and `store`, which hold only proposals, but `tools/spec-common.mjs:SCENARIO_REFERENCE` finds an id on any line of a spec file: its place in the title and the dash nobody judges. Also: `tools/check-specs.mjs:hasTest` — a scenario with no test and no mark is refused; the branch above it refuses a mark next to an existing test, and `tools/spec-common.mjs:UNCOVERED` refuses an empty reason. The marks stand in the `scenarios.md` files. Also: `tools/spec-scenarios.mjs:promisesScreen` — a scenario that promises a screen and is covered only by a unit test is refused without the partial mark; the digest lists partial coverage as debt. Also: `tools/check-specs.mjs:references` — the test refers to an id that no `scenarios.md` carries, and the audit refuses.
- **An exchange counts as read on both sides.** — `tools/cargo-pull.mjs:main` — the reading side of the cargo: the send and the mark answered with success, while there was nothing to take what lay in the intake with, and over two hundred records stood as new. Also: `tools/cargo-mark.mjs:treeSlug` — the mark takes the tree trait from the package by the same function the send computes it with; its own copy took the last word of the address against the whole address, and not one record ever got marked. Also: `apps/message-bus/src/app/failure.filter.spec.ts:SC-MB-408` — the refusal code is checked where every answer is assembled. The tests next to the operations stayed green while the code reached no answer.
- **A decision moves into a pure function, checked by a call.** — `projects/utils/src/lib/functions/deep-equal/deep-equal.ts:areArraysEqual` — a folder per function, the spec next to the source; the component stays a thin wrapper while it has no branching of its own. Two deep-comparison functions share one module: apart they are an import cycle. Also: **Not checked by anything.** A date in a fixture is indistinguishable to a machine from a date in the code under test: both are a literal. It is held by both moments being taken the same way, and by reading red that arrived without an edit Also: **Not checked by anything.** A clock call inside a function is indistinguishable to a machine from a call that arrived as a parameter: both are a reference to the same name. Held by reading.
- **A Connect procedure is called with a hand-written database double, and by the end-to-end suite.** — `libs/message-bus-api/trees/feature/src/lib/enroll.controller.spec.ts:PrismaDouble` — the double is written by hand in every receiver spec: the filtering, the sorting and the creation of rows it does itself. Also: **Not checked by anything.** An example is `apps/message-bus-admin-e2e/src/metrics-intake.spec.ts:send`: a spec calls the receiver directly by `request.post`, past the screen; so do the chat and quality specs. The search for a procedure's tests goes over the suite too.
- **A "Then" naming a person and what they see is closed end to end.** — `tools/spec-scenarios.mjs:promisesScreen` — reads the person in "Then", and `tools/check-specs.mjs` refuses such a scenario covered only by a unit test. Which specs count as end-to-end is set by the key `e2eRoots` in `.claude/rt-kit/checks.json`: both suites, the admin panel's and the entry example's. Also: `tools/spec-scenarios.mjs:environmentSwitches` — a spec switched by a variable is found, and its scenarios that promise a screen are refused without the partial mark. A switched-off test of a scenario that names no person still counts as covered — **not checked by anything**. Neither end-to-end suite has such a switch today.
- **The seed creates what a screen needs, nothing a guest takes for real.** — `apps/message-bus-admin-e2e/stand/seed.mjs:seed` — three trees named «Стенд первый» and on by the count, the reviews name a case of the suite, the proposals an edit of the suite. The chat seed creates the site settings a screen opens with — greeting, hours, time zone, hook address and a hook secret made by the stand; no keys of real services.
- **A build or pipeline edit is checked from scratch; its PR waits for its run.** — `.claude/hooks/git-guard-delivery-merge.sh:rt_delivery_merge_run` — a merge on a red or unfinished run at the tip is refused. **Not checked by anything** is the build from scratch: a guard sees the push, not whether the build ran past the cache. `.github/workflows/ci.yml` runs only on PRs into `main`.
- **A new check goes into the push gate or the pipeline; a laid-out one arrives with its place.** — `.claude/rt-kit/project.sh:rt_push_checks` — the line of the gate suite, and the step "E2E admin" in `.github/workflows/ci.yml`; the link between them is audited by `tools/check-push-gate.mjs`. Also: `.claude/rt-kit/project.sh:rt_push_checks` — the gate suite, and `package.json` — the command name: a laid-out check stands in both, otherwise it is learned of by a new file in the list of what was laid out.
- **A test that irreversibly changes stand data is off by default.** — Not applicable: the suite has a stand of its own, and a disposable one — `apps/message-bus-admin-e2e/stand/seed.mjs:seed` cleans the database before every run, and there is nothing in it to spoil. The suite touches no foreign stand: its ports and its database are its own.
- **Tests needing nginx run only with `BASE_URL` set.** — Not applicable: the tree's proxy is Caddy (`deploy/Caddyfile`), not nginx, and no end-to-end stand runs it. The admin panel's production build and the receiver are brought to one address by the suite's own serving, `apps/message-bus-admin-e2e/stand/serve-admin.mjs`.
- **A linter rule against an accepted technique is off in the config, not bypassed per test.** — `eslint.config.mjs:playwright` — the Playwright plugin's rule against skipped tests is off for the admin panel's suite, with the reason in a comment next to it. A few specs of the packages carry pointed switches for rules forbidden for good reason (`max-lines`, template rules).
- **A broken guard lets the action through; one that did not recognise the call is silent too.** — `.claude/hooks/turn-exit-guard.sh:verdict` — with no engine, a failed engine or one past its limit the turn is allowed, and the journal says so. Every guard behaves so, but `cargo-mark-guard.sh` and `git-guard-draft-ready.sh` lack the `FAIL-OPEN` line in their header. Also: **Not checked by anything.** Every guard has its own call sign (`.claude/hooks/git-guard-*.sh`, `.claude/hooks/browser-guard-*.sh`), and from outside an unrecognised command is indistinguishable from a sound pass: it leaves no trace. Held by the article and by the PR review; the miss has already happened in the tree — the command was called by its full path, while the sign accepted only the bare name.
- **A known list is named and explains itself.** — **Not checked by anything.** `tools/rt-kit-checks.config.mjs:parseAllowlist` demands a reason and a task per entry, but not the first field with the check's name; only `tools/boolean-inputs-allowlist.json` carries one. Also: `tools/rt-kit-checks.config.mjs:parseAllowlist` — the sides of the list are read apart, and the debt is given to the check separately from the accepted. Also: `tools/rt-kit-checks.config.mjs:parseAllowlist` — an entry without a reason or without a number ends the parsing with a refusal naming the file and the entry itself. Also: `tools/check-file-size.mjs:gone` — an entry about a file that is no longer in the tree is named by a separate digest line; the lists of the admin texts, the cascade layer, the tokens, the boolean inputs and the preset stories refuse a dead entry too Also: `tools/check-admin-texts.mjs:dead` — an accepted place nothing answers to refuses the check. It costs the same as a new word past the dictionary. Also: Not checked by anything and will not be: a known list is data, and an accepted line is indistinguishable to a machine from a silenced one — both have a name, a key and a reason. Held by this article and by the PR review; in the tree such lists are kept by `tools/check-file-size.mjs` and the checks next to it, and a growing list is visible in the diff. Two checks still offer the list in their refusal — `tools/check-boolean-inputs.mjs` and `tools/check-preset-stories.mjs`: their texts diverge from the article.
- **An absence test is green even on the wrong target.** — **Not checked by anything.** The assertion "this is absent" is true with a typo in the query too: a machine has nothing to check against whether the search looked in the right place. Held by reading. Also: `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.spec.ts:ключНиОткуда` — the key is made up on the spot. Before it the cases held `columnTree`, and the filled English set turned them red. Also: **Not checked by anything.** The trap next to it, about a parser tested on output the tool printed, stands in `pitfalls.md`: a machine cannot tell a recorded output from a made-up one, and the fixture is read.
- **A count over run output means nothing until the run reached that step.** — **Not checked by anything.** There is nothing to bind such a count to. It is written anew each time and by a different command. Held by this article and by the paired positive check it prescribes.
- **A test title promises more than its body checks, unseen by the audit.** — **Not checked by anything.** The audit knows the scenario number in the title and does not read the body: the promise and the check diverge silently.
- **Red has an assigned action; a second rerun is not it.** — `.claude/hooks/rerun-guard.sh:seen` — a rerun call is refused until the journal of that same pipeline step has been read within the same turn.
- **A command's success is re-read by a separate request; a service is up when a request passed.** — **Not checked by anything.** That a call happened is visible to a machine; that the result was read after it is not. In the tree that came out as a miss: `npm run task:new` printed the task number twice and never brought it to the board, and this was read by hand. Also: **Not checked by anything.** A port is asked by a command, but whether a request went through the service is known only by whoever sent it: the end-to-end suite raises the stand itself and falls on the very first request, while sorting out the port answers only "who is listening".
- **Snapshot references lie by the test, update by a separate call, are read by eye.** — `apps/message-bus-admin-e2e/src/support/shot.ts:expectScreen` — the snapshot is taken by that wrapper, the references lie in the `__snapshots__` directory next to the suite. The update goes by the argument `--update-snapshots`; **not checked by anything** is that the updated frame was looked at by eye. Also: `tools/shot-browser.mjs:SHOT_ARGS` — the four arguments to the browser stand where the browser is launched, inside the image: the connection does not carry them, the browser is already up by then. The language needs a variable of its own next to them — `SHOT_LOCALE`: the image holds `LC_ALL=C.UTF-8`, and it beats the argument, so the date field drew the American order under a named `--lang=ru-RU`. **Not checked by anything** is that they are named at all: without them a frame matches about three runs out of four. Also: `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — what drifts is cured in the stand seeding (`moments`), and it judges itself as its last step: a time value that landed on the run day or later, and a record's month diverging from its own run time, end the stand startup with a refusal in words. **Not checked by anything** is the width of a node under a mask itself: the frame matches or it does not, and why is read by comparing pixel by pixel. Also: `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the query matches the month key against the time of that same record (`"month" <> to_char("ranAt", 'YYYY-MM')`): a derivative computed before the times were edited names itself. The other derivatives — the deadline, the freshness sign — are **not checked by anything**: each needs a query of its own, and it is started together with the column. Also: `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the stand startup ends with a refusal in words before the first frame is taken. **Not checked by anything** is the completeness of the set of judged columns: a column is put on screen by one line of markup, and the query for it is written by whoever remembered the seeding.
- **A test file is edited by the edit tool.** — **Not checked by anything.** The wording guard judges only `.md`; for a spec path the rules gate judges the whole command body (`.claude/rt-kit/gate-map.sh`), which refuses nothing about the tool.

## What else is worth knowing when reading the code

- The stand is zoneless, and an unknown element or property in it is a refusal. A missing import
  fails the spec instead of drawing emptiness; a redraw is moved explicitly.
- Inputs are set by `componentRef.setInput(...)` — assigning to a field does not work, the inputs
  are reactive.
- Assertions go by the drawn block classes and by real directive instances
  (`By.directive(...)`): that is how it is proved that the modifier really applied.
- The substitutions in the kit's specs that nobody would think of: the text editor does not come
  up in an environment without a browser and is replaced by a double; the translation loader must
  return an empty dictionary; there is nothing to measure the window width with in that
  environment, and the breakpoints service is substituted; content in an overlay appears only
  after `ApplicationRef.tick()`; the double's output is declared as an object rather than by a
  call of `output()`. All of them with ready-made code in the rule `ui-component-tests`, the file
  `spec.md`.
- `passWithNoTests` is on: a green target does not mean the spec ran — the number of tests is read
  from the report.
- The states that never happen on a seeded stand — a service refusal, an expired wait, emptiness
  altogether and an answer that caught up with its list late — the end-to-end suite shows by
  substituting the receiver's answer with browser means: the receiver is one for the whole run,
  and one put out for the sake of a single state would leave the other specs without data.
- The suite's main trap is not time but order: the address changes on a click at once, while the
  rows arrive in the receiver's answer. The wait is not by a countdown but by the change of the
  list itself; the ready-made waits lie in `apps/message-bus-admin-e2e/src/support/admin.ts`.

## What this is checked by

- `pnpm test` — all packages; `pnpm exec nx test @rt-tools/<package> --testFile=<path>` — one file.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the admin panel's end-to-end suite; it raises the
  stand itself, the database container and the identity server included, and needs Docker running.
- `pnpm exec nx affected -t typecheck` — the types of the specs. Neither Jest nor Vitest checks
  them, and the linter here does not look at types: a spec object with a renamed field stays green
  in `test` until this target. A lib created later gets the target by the same two signs, without
  a line in its project file: `pnpm exec nx show projects --with-target typecheck` lists it.
  Bare `tsc -p <lib>/tsconfig.spec.json` is not the same check: the spec settings inherit the
  build's `rootDir`, and a lib importing a neighbour falls on TS6059 before any type is read. The
  target passes `--rootDir .` (`tools/nx-plugins/spec-typecheck.cjs`); one lib is checked by
  `pnpm exec nx run <lib>:typecheck`.
- `pnpm exec nx run @rt-tools/ui-kit-v2:verify` — the audit of the input tables against the
  components.
- The pipeline runs `nx affected -t lint typecheck test build` against the main branch
  (`.github/workflows/ci.yml`): a spec green only on its own machine stops the PR.
